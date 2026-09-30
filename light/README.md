# LIGHT — Plateforme d'accompagnement de projets étudiants

Next.js 16 (App Router) · Prisma 7 + PostgreSQL (Supabase) · Supabase Auth & Storage · Claude (assistant IA).

## Développement local

```bash
cp .env.example .env.local   # puis remplir les valeurs
npm install
npm run dev                  # http://localhost:3000
```

| Script | Rôle |
| --- | --- |
| `npm run build` | Génère le client Prisma puis construit l'application |
| `npm run db:migrate` | Applique les migrations en attente (`prisma migrate deploy`) |
| `npm run db:status` | État des migrations |
| `npm run role -- email@exemple.com ENCADRANT` | Change le rôle d'un compte |
| `npm run identifiant -- ADMIN MATRICULE Prénom Nom [email]` | Crée les identifiants école (matricule + code) d'un encadrant ou administrateur |

### Encadrants et administrateurs

Ces rôles ne sont jamais attribués à l'inscription. La personne choisit « Encadrant » ou « Administration », puis confirme
son compte sur `/confirmation` avec le matricule et le code confidentiel remis par l'école (usage unique, bloqué 30 min
après 5 essais incorrects). Les identifiants se créent dans `/admin/identifiants` ; pour le **tout premier administrateur**,
utilisez `npm run identifiant` : le code s'affiche une seule fois dans le terminal.

## Déploiement sur Vercel

### 1. Importer le projet

1. Sur [vercel.com/new](https://vercel.com/new), importez le dépôt GitHub.
2. **Root Directory : `light`** (l'application est dans ce sous-dossier). Laissez le reste par défaut : `vercel.json` fixe l'installation (`npm ci`), le build (`npm run build`) et la région.
3. Node.js : 22.x (fixé par `engines` dans package.json).

### 2. Variables d'environnement

Project Settings → Environment Variables, pour **Production** et **Preview**. Toutes sont décrites dans [.env.example](.env.example).

| Variable | Valeur |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique (anon / publishable) |
| `SUPABASE_URL` | URL du projet Supabase |
| `SUPABASE_SECRET_KEY` | Clé secrète (service_role) : pièces jointes de la messagerie |
| `DATABASE_URL` | Pooler Supabase en **mode transaction, port 6543**, avec `?pgbouncer=true` |
| `DIRECT_URL` | Pooler en mode session (port 5432) : migrations uniquement |
| `ANTHROPIC_API_KEY` | Clé API Anthropic : assistant IA |

> Sur Vercel, `DATABASE_URL` doit utiliser le **port 6543** (mode transaction). Le mode session (5432) ouvre une connexion par instance de fonction et sature vite le pooler.

Les variables `NEXT_PUBLIC_*` sont intégrées au build : après les avoir modifiées, redéployez.

### 3. Supabase Auth

Authentication → URL Configuration :

- **Site URL** : `https://<votre-domaine>.vercel.app` (ou votre domaine personnalisé)
- **Redirect URLs** : ajoutez `https://<votre-domaine>.vercel.app/**` et, pour les prévisualisations, `https://*-<votre-équipe>.vercel.app/**`

Sans cela, les liens de confirmation d'inscription et de réinitialisation du mot de passe renvoient vers `localhost`.

### 4. Base de données

Les migrations ne sont **pas** exécutées pendant le build Vercel, pour éviter qu'un déploiement de prévisualisation modifie la base de production. Avant de déployer une version qui ajoute une migration :

```bash
npm run db:migrate    # utilise DIRECT_URL, ou DATABASE_URL à défaut
```

### 5. Région

`vercel.json` place les fonctions à Londres (`lhr1`), au plus près de la base Supabase (`eu-west-2`). Si la base change de région, adaptez `regions`.

### Limites à connaître

- Requêtes limitées à **4,5 Mo** par Vercel : les maquettes de l'étape Conception doivent rester sous cette taille. Les pièces jointes de la messagerie, elles, vont directement dans Supabase Storage (jusqu'à 20 Mo).
- L'assistant IA peut répondre pendant 5 minutes (`maxDuration = 300`), ce qui demande Fluid Compute (activé par défaut sur les nouveaux projets).
- Le bucket de stockage `messagerie` est créé automatiquement au premier envoi de fichier.
