// app/api/assistant/route.ts
// ASSISTANT IA : réponse en streaming du mentor entrepreneurial (Claude)
// Flux NDJSON renvoyé au navigateur, un objet JSON par ligne :
//   { type: "thread", threadId, title }   conversation créée ou reprise
//   { type: "status", value: "search" }   l'assistant fait une recherche web
//   { type: "text", delta }               morceau de réponse
//   { type: "done", messageId, sources }  fin de la réponse (sources web citées)
//   { type: "error", message }            erreur lisible par l'étudiant
import Anthropic from '@anthropic-ai/sdk';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ASSISTANT_SYSTEM_PROMPT } from '@/lib/assistant/prompt';
import { buildProjectDossier } from '@/lib/assistant/context';
import { ASSISTANT_DAILY_LIMIT, ASSISTANT_MAX_MESSAGE_LENGTH } from '@/lib/assistant/limits';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const MODEL = 'claude-opus-5';
const MAX_HISTORY = 30; // messages précédents renvoyés à Claude
const MAX_CONTINUATIONS = 4; // reprises après une pause de la recherche web (pause_turn)

let anthropic: Anthropic | null = null;
function getClient() {
    // Identifiants lus dans l'environnement : ANTHROPIC_API_KEY (ou un profil `ant auth login` en local)
    anthropic ??= new Anthropic();
    return anthropic;
}

const json = (status: number, body: object) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

// Traduit les erreurs de l'API en messages compréhensibles (du plus précis au plus général)
function errorMessage(error: unknown) {
    if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
        return "L'assistant n'est pas correctement configuré (clé API Anthropic invalide). Prévenez l'administrateur de la plateforme.";
    }
    if (error instanceof Anthropic.RateLimitError) {
        return "L'assistant est très sollicité en ce moment. Réessayez dans une minute.";
    }
    if (error instanceof Anthropic.APIConnectionError) {
        return "Impossible de joindre le service d'intelligence artificielle. Vérifiez la connexion du serveur et réessayez.";
    }
    if (error instanceof Anthropic.APIError) {
        return "Le service d'intelligence artificielle est momentanément indisponible. Réessayez dans quelques instants.";
    }
    if (error instanceof Anthropic.AnthropicError) {
        return "L'assistant n'est pas encore configuré : la clé ANTHROPIC_API_KEY est absente du serveur.";
    }
    return 'Une erreur inattendue est survenue. Réessayez.';
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

    // Quota quotidien : l'IA a un coût, chaque étudiant dispose d'un nombre de messages par 24 h
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
    const messages: Anthropic.Beta.BetaMessageParam[] = history.map((m) => ({
        role: m.role === 'USER' ? 'user' : 'assistant',
        content: m.content,
    }));

    // Dossier du projet, recalculé à chaque message pour refléter l'état actuel des étapes
    const dossier = thread.projectId ? await buildProjectDossier(thread.projectId, user.id) : null;
    const today = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeZone: 'Africa/Douala' }).format(new Date());
    const system: Anthropic.Beta.BetaTextBlockParam[] = [
        // Consignes figées en premier : mises en cache d'un message à l'autre
        { type: 'text', text: ASSISTANT_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
        {
            type: 'text',
            text: `Date du jour : ${today}.\nÉtudiant : ${user.firstName} ${user.lastName}.\n\n${
                dossier ? `<dossier_projet>\n${dossier}\n</dossier_projet>` : "Aucun projet n'est sélectionné pour cette conversation."
            }`,
        },
    ];

    const encoder = new TextEncoder();
    const threadId = thread.id;
    const threadTitle = thread.title;

    const stream = new ReadableStream({
        async start(controller) {
            const send = (event: object) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
            send({ type: 'thread', threadId, title: threadTitle });

            let text = '';
            const sources = new Map<string, string>();
            let conversation = messages;

            try {
                for (let turn = 0; turn <= MAX_CONTINUATIONS; turn++) {
                    const response = getClient().beta.messages.stream(
                        {
                            model: MODEL,
                            max_tokens: 64000,
                            thinking: { type: 'adaptive' },
                            // En cas de refus du modèle, l'API relance automatiquement la demande sur le modèle de repli recommandé
                            betas: ['server-side-fallback-2026-07-01'],
                            fallbacks: 'default',
                            cache_control: { type: 'ephemeral' },
                            system,
                            tools: [
                                {
                                    type: 'web_search_20260209',
                                    name: 'web_search',
                                    max_uses: 5,
                                    user_location: { type: 'approximate', country: 'CM', city: 'Yaoundé', timezone: 'Africa/Douala' },
                                },
                            ],
                            messages: conversation,
                        },
                        { signal: request.signal },
                    );

                    for await (const event of response) {
                        if (event.type === 'content_block_start') {
                            const block = event.content_block;
                            if (block.type === 'server_tool_use') send({ type: 'status', value: 'search' });
                            if (block.type === 'web_search_tool_result' && Array.isArray(block.content)) {
                                for (const result of block.content) {
                                    if (result.type === 'web_search_result') sources.set(result.url, result.title);
                                }
                            }
                        } else if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                            text += event.delta.text;
                            send({ type: 'text', delta: event.delta.text });
                        }
                    }

                    const final = await response.finalMessage();
                    if (final.stop_reason === 'refusal') {
                        const notice = "\n\nJe ne peux pas répondre à cette demande. Reformulez-la en lien avec votre projet entrepreneurial.";
                        text += notice;
                        send({ type: 'text', delta: notice });
                        break;
                    }
                    // La recherche web a fait une pause : on relance pour que Claude termine sa réponse
                    if (final.stop_reason === 'pause_turn') {
                        conversation = [...conversation, { role: 'assistant', content: final.content }];
                        continue;
                    }
                    break;
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
