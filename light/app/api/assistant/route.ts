// app/api/assistant/route.ts
// ASSISTANT IA : réponse en streaming du mentor entrepreneurial (Google Gemini)
// Flux NDJSON renvoyé au navigateur, un objet JSON par ligne :
//   { type: "thread", threadId, title }   conversation créée ou reprise
//   { type: "status", value: "search" }   l'assistant fait une recherche web
//   { type: "text", delta }               morceau de réponse
//   { type: "done", messageId, sources }  fin de la réponse (sources web citées)
//   { type: "error", message }            erreur lisible par l'étudiant
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ASSISTANT_SYSTEM_PROMPT } from '@/lib/assistant/prompt';
import { buildProjectDossier } from '@/lib/assistant/context';
import { ASSISTANT_DAILY_LIMIT, ASSISTANT_MAX_MESSAGE_LENGTH } from '@/lib/assistant/limits';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Modèle Gemini, modifiable sans toucher au code (variable GEMINI_MODEL).
// Si le modèle demandé n'existe plus, on bascule sur l'alias qui suit toujours le dernier « Flash ».
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-flash-latest';
const MAX_HISTORY = 30; // messages précédents renvoyés au modèle
// Recherche Google intégrée à Gemini (sources citées) ; GEMINI_WEB_SEARCH=false pour la couper
const WEB_SEARCH = process.env.GEMINI_WEB_SEARCH !== 'false';
const BLOCKED_REASONS = ['SAFETY', 'PROHIBITED_CONTENT', 'BLOCKLIST', 'RECITATION', 'SPII'];

const json = (status: number, body: object) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

// Erreur de l'API Gemini, avec son code HTTP pour choisir le bon message (0 : clé absente)
class GeminiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

const isKeyError = (error: GeminiError) => /api[_ ]?key/i.test(error.message);

// Traduit les erreurs en messages compréhensibles par l'étudiant
function errorMessage(error: unknown) {
    if (error instanceof GeminiError) {
        if (error.status === 0) return "L'assistant n'est pas encore configuré : la clé GEMINI_API_KEY est absente du serveur.";
        if ((error.status === 400 && isKeyError(error)) || error.status === 401 || error.status === 403) {
            return "L'assistant n'est pas correctement configuré (clé API Gemini invalide ou refusée). Prévenez l'administrateur de la plateforme.";
        }
        if (error.status === 429) {
            return "L'assistant a atteint sa limite d'utilisation gratuite pour le moment. Réessayez dans une minute, ou demain si la limite du jour est atteinte.";
        }
        return "Le service d'intelligence artificielle est momentanément indisponible. Réessayez dans quelques instants.";
    }
    if (error instanceof TypeError) {
        return "Impossible de joindre le service d'intelligence artificielle. Vérifiez la connexion du serveur et réessayez.";
    }
    return 'Une erreur inattendue est survenue. Réessayez.';
}

type GeminiContent = { role: 'user' | 'model'; parts: { text: string }[] };
type GeminiChunk = {
    candidates?: {
        content?: { parts?: { text?: string; thought?: boolean }[] };
        finishReason?: string;
        groundingMetadata?: { webSearchQueries?: string[]; groundingChunks?: { web?: { uri?: string; title?: string } }[] };
    }[];
    promptFeedback?: { blockReason?: string };
};

// Ouvre le flux de réponse Gemini (Server-Sent Events)
async function openGeminiStream(model: string, body: object, signal: AbortSignal) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new GeminiError(0, 'GEMINI_API_KEY manquante');
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`,
        { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body), signal },
    );
    if (!response.ok || !response.body) {
        const detail = await response.text().catch(() => '');
        throw new GeminiError(response.status, detail.slice(0, 500));
    }
    return response.body;
}

// Lit le flux SSE et renvoie chaque objet JSON reçu
async function* readChunks(body: ReadableStream<Uint8Array>): AsyncGenerator<GeminiChunk> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let index;
        while ((index = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, index).trim();
            buffer = buffer.slice(index + 1);
            if (!line.startsWith('data:')) continue;
            const data = line.slice(5).trim();
            if (data) yield JSON.parse(data) as GeminiChunk;
        }
    }
}

export async function POST(request: Request) {
    const user = await getCurrentUser();
    if (!user) return json(401, { error: 'Session expirée. Veuillez vous reconnecter.' });

    const body = (await request.json().catch(() => null)) as { message?: unknown; threadId?: unknown; projectId?: unknown } | null;
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    if (!message) return json(400, { error: 'Votre message est vide.' });
    if (message.length > ASSISTANT_MAX_MESSAGE_LENGTH) {
        return json(400, { error: `Votre message dépasse ${ASSISTANT_MAX_MESSAGE_LENGTH} caractères.` });
    }

    // Quota quotidien : chaque étudiant dispose d'un nombre de messages par 24 h (le quota gratuit Gemini est partagé)
    const used = await prisma.assistantMessage.count({
        where: { role: 'USER', createdAt: { gte: new Date(Date.now() - 86_400_000) }, thread: { userId: user.id } },
    });
    if (used >= ASSISTANT_DAILY_LIMIT) {
        return json(429, { error: `Vous avez utilisé vos ${ASSISTANT_DAILY_LIMIT} messages des dernières 24 heures. Revenez un peu plus tard.` });
    }

    // Conversation : reprise (si elle appartient à l'utilisateur) ou création
    let thread;
    if (typeof body?.threadId === 'string' && body.threadId) {
        thread = await prisma.assistantThread.findFirst({ where: { id: body.threadId, userId: user.id } });
        if (!thread) return json(404, { error: 'Conversation introuvable.' });
    } else {
        let projectId: string | null = null;
        if (typeof body?.projectId === 'string' && body.projectId) {
            const project = await prisma.project.findFirst({
                where: { id: body.projectId, OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }] },
                select: { id: true },
            });
            if (!project) return json(404, { error: 'Projet introuvable.' });
            projectId = project.id;
        }
        const title = message.length > 60 ? `${message.slice(0, 57).trimEnd()}…` : message;
        thread = await prisma.assistantThread.create({ data: { userId: user.id, projectId, title } });
    }

    await prisma.assistantMessage.create({ data: { threadId: thread.id, role: 'USER', content: message } });
    await prisma.assistantThread.update({ where: { id: thread.id }, data: { updatedAt: new Date() } });

    // Historique (le plus récent en dernier), qui doit commencer par un message de l'étudiant
    const history = (
        await prisma.assistantMessage.findMany({ where: { threadId: thread.id }, orderBy: { createdAt: 'desc' }, take: MAX_HISTORY })
    ).reverse();
    while (history.length && history[0].role !== 'USER') history.shift();
    const contents: GeminiContent[] = history.map((m) => ({
        role: m.role === 'USER' ? 'user' : 'model',
        parts: [{ text: m.content }],
    }));

    // Dossier du projet, recalculé à chaque message pour refléter l'état actuel des étapes
    const dossier = thread.projectId ? await buildProjectDossier(thread.projectId, user.id) : null;
    const today = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeZone: 'Africa/Douala' }).format(new Date());
    const context = `Date du jour : ${today}.\nÉtudiant : ${user.firstName} ${user.lastName}.\n\n${
        dossier ? `<dossier_projet>\n${dossier}\n</dossier_projet>` : "Aucun projet n'est sélectionné pour cette conversation."
    }`;
    const requestBody = (withSearch: boolean) => ({
        systemInstruction: { parts: [{ text: ASSISTANT_SYSTEM_PROMPT }, { text: context }] },
        contents,
        ...(withSearch ? { tools: [{ google_search: {} }] } : {}),
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
    });

    const encoder = new TextEncoder();
    const threadId = thread.id;
    const threadTitle = thread.title;

    const stream = new ReadableStream({
        async start(controller) {
            const send = (event: object) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
            send({ type: 'thread', threadId, title: threadTitle });

            let text = '';
            const sources = new Map<string, string>();

            try {
                // Ouverture du flux : sans recherche web si l'outil est refusé, puis sur l'alias « Flash » si le modèle est introuvable
                let response: ReadableStream<Uint8Array> | null = null;
                const attempts: [string, boolean][] = [[MODEL, WEB_SEARCH], [MODEL, false], [FALLBACK_MODEL, false]];
                for (const [model, withSearch] of attempts) {
                    try {
                        response = await openGeminiStream(model, requestBody(withSearch), request.signal);
                        break;
                    } catch (error) {
                        const retry = error instanceof GeminiError && (error.status === 404 || (error.status === 400 && withSearch && !isKeyError(error)));
                        if (!retry) throw error;
                    }
                }
                if (!response) throw new GeminiError(404, 'Aucun modèle Gemini disponible');

                let searching = false;
                let blocked = false;
                for await (const chunk of readChunks(response)) {
                    if (chunk.promptFeedback?.blockReason) blocked = true;
                    const candidate = chunk.candidates?.[0];
                    if (!candidate) continue;
                    const grounding = candidate.groundingMetadata;
                    if (grounding?.webSearchQueries?.length && !searching) {
                        searching = true;
                        send({ type: 'status', value: 'search' });
                    }
                    for (const source of grounding?.groundingChunks ?? []) {
                        if (source.web?.uri) sources.set(source.web.uri, source.web.title || source.web.uri);
                    }
                    for (const part of candidate.content?.parts ?? []) {
                        if (part.text && !part.thought) {
                            text += part.text;
                            send({ type: 'text', delta: part.text });
                        }
                    }
                    if (candidate.finishReason && BLOCKED_REASONS.includes(candidate.finishReason)) blocked = true;
                }
                if (blocked) {
                    const notice = "\n\nJe ne peux pas répondre à cette demande. Reformulez-la en lien avec votre projet entrepreneurial.";
                    text += notice;
                    send({ type: 'text', delta: notice });
                }
            } catch (error) {
                if (!request.signal.aborted) {
                    console.error('Assistant IA :', error);
                    send({ type: 'error', message: errorMessage(error) });
                }
            }

            // La réponse (même partielle, si l'étudiant l'a interrompue) est conservée dans l'historique
            let messageId: string | null = null;
            if (text.trim()) {
                const sourceList = [...sources].map(([url, title]) => ({ url, title }));
                const saved = await prisma.assistantMessage.create({
                    data: { threadId, role: 'ASSISTANT', content: text, sources: sourceList.length ? sourceList : undefined },
                });
                messageId = saved.id;
                await prisma.assistantThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } });
            }
            if (!request.signal.aborted) {
                send({ type: 'done', messageId, sources: [...sources].map(([url, title]) => ({ url, title })) });
            }
            controller.close();
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'application/x-ndjson; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'X-Accel-Buffering': 'no',
        },
    });
}
