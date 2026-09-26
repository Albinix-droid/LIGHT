// app/encadrant/StepDataView.tsx
// LECTURE SEULE DU CONTENU D'UNE ÉTAPE (ce que l'étudiant a soumis)

import type { StageSlug } from "@/lib/parcours";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Data = Record<string, any>;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");
const arr = (v: unknown): Data[] => (Array.isArray(v) ? v : []);
const strings = (v: unknown) => arr(v).map((x) => (typeof x === "string" ? x : "")).filter(Boolean);

// Sécurité : seuls les liens http(s) et les images en data URL sont rendus
const safeUrl = (v: unknown) => (/^https?:\/\//i.test(str(v)) ? str(v) : "");
const safeImage = (v: unknown) => (typeof v === "string" && v.startsWith("data:image/") ? v : "");

const LABELS: Record<string, string> = {
  todo: "À faire", "in-progress": "En cours", review: "En test", done: "Terminé",
  passed: "Réussi", failed: "Échec", open: "Ouvert", resolved: "Résolu", closed: "Fermé",
  low: "Basse", medium: "Moyenne", high: "Haute", critical: "Critique",
  planned: "Planifié", live: "En production", "post-launch": "Post-lancement",
  investor: "Investisseur", partner: "Partenaire", client: "Client",
};
const label = (v: unknown) => LABELS[str(v)] ?? str(v);

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "18px" }}>
      <h4 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "#D4AF37", margin: "0 0 10px" }}>
        {title}
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>{children}</div>
    </section>
  );
}

function Field({ name, value }: { name: string; value: unknown }) {
  const text = str(value);
  if (!text) return null;
  return (
    <div>
      <p style={{ fontSize: "12px", color: "rgba(200,215,235,0.45)", margin: "0 0 3px" }}>{name}</p>
      <p style={{ fontSize: "14px", color: "#E8EDF5", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{text}</p>
    </div>
  );
}

function LinkField({ name, value }: { name: string; value: unknown }) {
  const url = safeUrl(value);
  const text = str(value);
  if (!text) return null;
  return (
    <div>
      <p style={{ fontSize: "12px", color: "rgba(200,215,235,0.45)", margin: "0 0 3px" }}>{name}</p>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "14px", color: "#A5B4FC", wordBreak: "break-all" }}>{text}</a>
      ) : (
        <p style={{ fontSize: "14px", color: "#E8EDF5", margin: 0, wordBreak: "break-all" }}>{text}</p>
      )}
    </div>
  );
}

function Tags({ name, items, color = "#F5D76E" }: { name: string; items: string[]; color?: string }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p style={{ fontSize: "12px", color: "rgba(200,215,235,0.45)", margin: "0 0 6px" }}>{name}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {items.map((t, i) => (
          <span key={i} className="enc-badge" style={{ background: "rgba(255,255,255,0.05)", color, border: "1px solid rgba(180,200,230,0.1)", fontWeight: 500 }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function Rows({ name, rows }: { name: string; rows: { main: string; meta?: string }[] }) {
  if (rows.length === 0) return null;
  return (
    <div>
      <p style={{ fontSize: "12px", color: "rgba(200,215,235,0.45)", margin: "0 0 6px" }}>{name}</p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
        {rows.map((r, i) => (
          <li key={i} style={{ padding: "9px 12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(180,200,230,0.06)" }}>
            <span style={{ fontSize: "13px", color: "#E8EDF5" }}>{r.main}</span>
            {r.meta && <span style={{ fontSize: "12px", color: "rgba(200,215,235,0.45)", marginLeft: "8px" }}>{r.meta}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Notes({ items }: { items: unknown[] }) {
  // Les notes sont des chaînes (conception…) ou des objets { content } (idéalisation)
  const notes = items.map((n) => (typeof n === "string" ? n : str((n as Data)?.content))).filter(Boolean);
  return <Tags name="Notes de travail" items={notes} color="rgba(232,237,245,0.8)" />;
}

export default function StepDataView({ slug, data }: { slug: StageSlug; data: unknown }) {
  const d: Data = data && typeof data === "object" ? (data as Data) : {};

  switch (slug) {
    case "idealisation":
      return (
        <>
          <Section title="L'idée">
            <Field name="Nom du projet" value={d.title} />
            <Field name="Description" value={d.description} />
          </Section>
          <Section title="Problème & solution">
            <Field name="Problème identifié" value={d.problem} />
            <Field name="Solution proposée" value={d.solution} />
          </Section>
          <Section title="Marché & modèle">
            <Field name="Clients cibles" value={d.targetAudience} />
            <Field name="Valeur ajoutée" value={d.valueProposition} />
            <Field name="Modèle de revenus" value={d.revenueModel} />
            <Notes items={arr(d.brainstorming)} />
          </Section>
        </>
      );

    case "conception": {
      const wireframes = arr(d.ux?.wireframes).map(safeImage).filter(Boolean);
      return (
        <>
          <Section title="Spécifications fonctionnelles">
            <Field name="Objectifs" value={d.functional?.objectives} />
            <Tags name="Fonctionnalités principales" items={strings(d.functional?.features)} />
            <Tags name="Cas d'usage" items={strings(d.functional?.useCases)} />
          </Section>
          <Section title="Architecture technique">
            <Tags
              name="Choix techniques"
              items={[
                d.architecture?.frontend && `Frontend : ${d.architecture.frontend}`,
                d.architecture?.backend && `Backend : ${d.architecture.backend}`,
                d.architecture?.database && `Base de données : ${d.architecture.database}`,
                d.architecture?.hosting && `Hébergement : ${d.architecture.hosting}`,
              ].filter(Boolean) as string[]}
              color="#A5B4FC"
            />
            <Tags name="API et services externes" items={strings(d.architecture?.apis)} color="#A5B4FC" />
          </Section>
          <Section title="Maquettes & UX">
            {wireframes.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px" }}>
                {wireframes.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt={`Maquette ${i + 1}`} style={{ width: "100%", borderRadius: "10px", border: "1px solid rgba(180,200,230,0.1)" }} />
                ))}
              </div>
            )}
            <Field name="Parcours utilisateur" value={d.ux?.userJourney} />
            <Field name="Palette de couleurs" value={d.ux?.colors} />
            <Field name="Typographie" value={d.ux?.typography} />
          </Section>
          <Section title="Planification">
            <Rows name="Jalons" rows={arr(d.planning?.milestones).map((m) => ({ main: str(m.name), meta: str(m.date) }))} />
            <Tags name="Ressources" items={strings(d.planning?.resources)} />
            <Tags name="Risques" items={strings(d.planning?.risks)} color="#F0928B" />
            <Tags name="Contraintes" items={strings(d.planning?.constraints)} color="#F5B544" />
            <Notes items={arr(d.brainstorming)} />
          </Section>
        </>
      );
    }

    case "developpement":
      return (
        <>
          <Section title="Code & documentation">
            <LinkField name="Dépôt" value={d.repoUrl} />
            <LinkField name="Documentation technique" value={d.docsUrl} />
            <LinkField name="Documentation API" value={d.apiDocsUrl} />
            <Tags name="Branches" items={arr(d.branches).map((b) => str(b.name)).filter(Boolean)} color="#A5B4FC" />
          </Section>
          <Section title="Tâches techniques">
            <Rows
              name={`${arr(d.tasks).filter((t) => t.status === "done").length}/${arr(d.tasks).length} terminées`}
              rows={arr(d.tasks).map((t) => ({
                main: str(t.title),
                meta: [label(t.status), label(t.priority), str(t.assignee)].filter(Boolean).join(" · "),
              }))}
            />
          </Section>
          <Section title="Qualité & déploiement">
            <Field name="Couverture des tests" value={d.testCoverage ? `${d.testCoverage} %` : ""} />
            <Rows name="Environnements" rows={arr(d.deployments).map((dep) => ({ main: str(dep.environment), meta: str(dep.url) }))} />
            <Notes items={arr(d.brainstorming)} />
          </Section>
        </>
      );

    case "tests":
      return (
        <>
          <Section title="Tests fonctionnels">
            <Rows
              name={`${arr(d.testCases).filter((t) => t.status === "passed").length}/${arr(d.testCases).length} réussis`}
              rows={arr(d.testCases).map((t) => ({
                main: str(t.title),
                meta: [label(t.status), t.expectedResult && `attendu : ${str(t.expectedResult)}`].filter(Boolean).join(" · "),
              }))}
            />
          </Section>
          <Section title="Retours utilisateurs">
            <Rows name="Testeurs" rows={arr(d.userTests).map((u) => ({ main: `${str(u.userName)} — ${"★".repeat(Number(u.rating) || 0)}`, meta: str(u.feedback) }))} />
          </Section>
          <Section title="Bugs">
            <Rows name="Suivi des bugs" rows={arr(d.bugs).map((b) => ({ main: str(b.title), meta: [label(b.priority), label(b.status)].filter(Boolean).join(" · ") }))} />
          </Section>
          <Section title="Indicateurs de qualité">
            <Tags
              name="Scores"
              items={[
                `Couverture : ${Number(d.testCoverage) || 0} %`,
                `Performance : ${Number(d.performanceScore) || 0} %`,
                `Accessibilité : ${Number(d.accessibilityScore) || 0} %`,
                `Sécurité : ${Number(d.securityScore) || 0} %`,
              ]}
              color="#34D399"
            />
            <Notes items={arr(d.brainstorming)} />
          </Section>
        </>
      );

    case "concretisation":
      return (
        <>
          <Section title="Lancement">
            <Field name="Date de lancement" value={d.launch?.date} />
            <Field name="Statut" value={label(d.launch?.status)} />
            <LinkField name="URL du projet" value={d.launch?.url} />
          </Section>
          <Section title="Go-to-market & communication">
            <Field name="Public cible" value={d.goToMarket?.targetAudience} />
            <Tags name="Canaux" items={strings(d.goToMarket?.channels)} />
            <Field name="Plan d'acquisition" value={d.goToMarket?.acquisitionPlan} />
            <Field name="Plan de communication" value={d.communication?.plan} />
            <Tags name="Réseaux sociaux" items={strings(d.communication?.socialNetworks)} color="#A5B4FC" />
          </Section>
          <Section title="Suivi post-lancement">
            <Rows name="Indicateurs clés" rows={arr(d.postLaunch?.kpis).map((k) => ({ main: str(k.name), meta: `${str(k.value)} (objectif : ${str(k.target)})` }))} />
            <Field name="Retours utilisateurs" value={d.postLaunch?.feedback} />
            <Tags name="Prochaines étapes" items={strings(d.postLaunch?.nextSteps)} color="#F5B544" />
          </Section>
          <Section title="Partenaires & documents">
            <Rows name="Partenaires" rows={arr(d.partners).map((p) => ({ main: `${str(p.logo)} ${str(p.name)}`.trim(), meta: [label(p.type), str(p.description)].filter(Boolean).join(" · ") }))} />
            <LinkField name="Business plan" value={d.businessPlanUrl} />
            <LinkField name="Pitch deck" value={d.pitchDeckUrl} />
            <LinkField name="Présentation finale" value={d.presentationUrl} />
            <Notes items={arr(d.brainstorming)} />
          </Section>
        </>
      );
  }
}
