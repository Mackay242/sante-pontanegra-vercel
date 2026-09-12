# Santé Pontanegra

> Plateforme de santé numérique pour Pointe-Noire, République du Congo.
> Version web moderne, déployable sur Vercel.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)
![Prisma](https://img.shields.io/badge/Prisma-6-2d3748)
![Vercel Ready](https://img.shields.io/badge/Vercel-Ready-000)
![Tests](https://img.shields.io/badge/tests-48%20passing-success)

## 🩺 Présentation

**Santé Pontanegra** est une application web de santé destinée aux habitants de
Pointe-Noire (Congo). Elle a été reconstruite à partir d'une application mobile
React Native / Expo, en version Next.js moderne, sécurisée et déployable sur
Vercel.

### Fonctionnalités principales

- **Authentification** sécurisée (JWT, mots de passe hachés bcrypt)
- **4 rôles utilisateur** : USER, NURSE, DOCTOR, ADMIN (avec permissions fines)
- **Dashboard** personnel avec services, urgences, promo
- **Médecin IA** : chat médical 24/7 avec **LLM via z-ai-web-dev-sdk** (ou fallback rule-based)
- **Centres de santé** : liste des hôpitaux, cliniques et CSI de Pointe-Noire
- **Communauté** : publications, likes, commentaires entre utilisateurs
- **Rendez-vous** : prise de RDV dans les centres référencés
- **Dossier médical** : groupe sanguin, allergies, antécédents, traitements
- **Vaccination** : carnet vaccinal numérique avec rappels
- **Suivi grossesse** : semaine par semaine avec conseils
- **Vidéos** de sensibilisation santé
- **Symptômes** : guide de reconnaissance des symptômes courants
- **Médicaments** : guide des médicaments essentiels
- **Alertes** : rappels de RDV, vaccins, consultations
- **Panneau Admin** : gestion des utilisateurs et de leurs rôles
- **Notifications push** navigateur (Web Push API + service worker)
- **Thème clair / sombre** persistant
- **Responsive** : mobile, tablette, ordinateur
- **SEO** : sitemap, robots, OpenGraph, metadata complète

---

## 🏗️ Architecture

```
sante-pontanegra-vercel/
├── prisma/
│   ├── schema.prisma             # Schéma SQLite (dev local)
│   └── schema.postgres.prisma    # Schéma PostgreSQL (production Vercel)
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Pages publiques (login, register)
│   │   ├── (app)/                # Pages authentifiées
│   │   │   ├── dashboard/
│   │   │   ├── medecin/          # Chat IA (LLM-powered)
│   │   │   ├── centres/          # Centres de santé
│   │   │   ├── communaute/       # Communauté
│   │   │   ├── rendezvous/      # RDV
│   │   │   ├── dossier/          # Dossier médical
│   │   │   ├── vaccination/      # Carnet vaccinal
│   │   │   ├── grossesse/        # Suivi grossesse
│   │   │   ├── videos/           # Sensibilisation
│   │   │   ├── symptomes/        # Guide symptômes
│   │   │   ├── medicaments/     # Guide médicaments
│   │   │   ├── pharmacie/        # E-Pharmacie
│   │   │   ├── alertes/          # Rappels
│   │   │   ├── profil/           # Profil utilisateur
│   │   │   ├── parametres/       # Réglages + Push notifications
│   │   │   └── admin/            # Panneau d'administration
│   │   ├── api/                  # Route Handlers (API REST)
│   │   │   ├── auth/             # login, register, logout, me
│   │   │   ├── posts/            # communauté + comments + likes
│   │   │   ├── appointments/     # rendez-vous
│   │   │   ├── dossier/          # dossier médical
│   │   │   ├── chat/             # chat médecin IA (LLM)
│   │   │   ├── vaccinations/     # carnet vaccinal
│   │   │   ├── pregnancies/      # suivi grossesse
│   │   │   ├── push/             # notifications push (Web Push)
│   │   │   └── admin/users/      # gestion utilisateurs (ADMIN)
│   │   ├── layout.tsx            # Layout racine
│   │   ├── page.tsx              # Landing publique
│   │   ├── sitemap.ts            # SEO
│   │   ├── robots.ts             # SEO
│   │   ├── not-found.tsx         # 404
│   │   ├── error.tsx             # Error boundary
│   │   └── globals.css           # Tailwind + thème
│   ├── components/               # Composants réutilisables
│   │   ├── ui/                   # shadcn/ui (48 composants)
│   │   ├── layout/               # Navbar, Footer, AppShell
│   │   ├── shared/               # ServiceCard, EmergencyCard, States
│   │   ├── auth-provider.tsx     # Contexte d'auth client
│   │   └── theme-provider.tsx
│   ├── lib/
│   │   ├── auth.ts               # JWT + bcrypt + session
│   │   ├── db.ts                 # Client Prisma
│   │   ├── validators.ts         # Schémas Zod
│   │   ├── roles.ts              # Définition des rôles et permissions
│   │   ├── llm.ts                # Service LLM (z-ai-web-dev-sdk)
│   │   ├── push.ts               # Service Web Push
│   │   ├── colors.ts             # Tokens de couleur
│   │   ├── utils.ts              # Utilitaires (cn, etc.)
│   │   └── data/                 # Données statiques (centres, vidéos, bot)
│   └── hooks/
│       ├── use-mobile.ts
│       ├── use-toast.ts
│       └── use-push.ts           # Hook notifications push
├── public/
│   └── sw.js                     # Service worker (push notifications)
├── .env.example                  # Variables d'environnement
├── .gitignore
├── vercel.json                   # Configuration Vercel
├── next.config.ts                # Configuration Next.js
├── tailwind.config.ts
├── tsconfig.json
├── prisma/schema.prisma
├── package.json
├── README.md
├── LICENSE
└── tests/                        # Tests (Bun test)
    ├── validators.test.ts
    ├── auth.test.ts
    ├── bot.test.ts
    └── roles.test.ts
```

---

## 🚀 Installation locale

### Prérequis

- **Node.js** 18.18+ (ou **Bun** 1.0+)
- Un éditeur de code (VS Code recommandé)

### Étapes

```bash
# 1. Cloner le dépôt
git clone <votre-repo-url>
cd sante-pontanegra-vercel

# 2. Installer les dépendances
npm install
# ou
bun install

# 3. Copier le fichier d'environnement
cp .env.example .env

# 4. Éditer .env et définir JWT_SECRET (au moins 32 caractères aléatoires)
#    Sur Linux/Mac : openssl rand -base64 32

# 5. Initialiser la base de données (SQLite en local)
npm run db:push

# 6. Lancer le serveur de développement
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

---

## 🗄️ Base de données

### Local (développement)

Par défaut, le projet utilise **SQLite** (via Prisma) pour un démarrage
rapide sans configuration externe. Le fichier `db/custom.db` est créé
automatiquement.

### Production (Vercel) — PostgreSQL

Pour la production, **remplacez SQLite par PostgreSQL** (recommandé) :

1. Créez une base PostgreSQL sur :
   - [Neon](https://neon.tech) (recommandé, serverless, gratuit)
   - [Supabase](https://supabase.com)
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

2. Remplacez `prisma/schema.prisma` par `prisma/schema.postgres.prisma` :
   ```bash
   cp prisma/schema.postgres.prisma prisma/schema.prisma
   ```

3. Mettez à jour `DATABASE_URL` sur Vercel avec votre connection string PostgreSQL.

4. Poussez le schéma :
   ```bash
   npm run db:push
   ```

---

## 🔐 Authentification & Rôles

L'authentification est **stateless** (compatible serverless Vercel) :

- **Mots de passe** : hachés avec bcrypt (10 rounds)
- **Sessions** : JWT signé (HS256), stocké en cookie `httpOnly`
- **Durée de session** : 7 jours
- **Validation** : tous les inputs sont validés avec Zod

### Rôles

4 rôles hiérarchiques : `USER < NURSE < DOCTOR < ADMIN`

| Rôle | Description | Capacités |
|------|-------------|-----------|
| **USER** | Utilisateur standard | Gère son dossier, RDV, communauté |
| **NURSE** | Infirmier(ère) | + Consulte dossiers patients, gère RDV |
| **DOCTOR** | Médecin | + Écrit dossiers, prescriptions, vaccinations |
| **ADMIN** | Administrateur | + Gestion utilisateurs, modération |

Les rôles sont gérés via le panneau d'administration (`/admin`).
Voir `src/lib/roles.ts` pour la matrice complète des permissions.

---

## 🤖 Chat Médecin IA

Le chat médecin utilise **z-ai-web-dev-sdk** (LLM côté serveur) avec un
système de prompt médical contextualisé pour Pointe-Noire (paludisme, fièvre
jaune, numéros d'urgence locaux, etc.).

### Activation

Par défaut, le chat utilise un **bot rule-based** (sans coût).
Pour activer le LLM :

```bash
ENABLE_LLM_CHAT=true
```

Le système tombe gracieusement sur le bot rule-based en cas d'erreur LLM.

### Caractéristiques

- **System prompt médical** : conseils santé généralistes, jamais de diagnostic définitif
- **Contexte Congo** : maladies locales, numéros d'urgence
- **Historique conversation** : 10 derniers messages pour le contexte
- **Sécurité** : recommande toujours de consulter un médecin en personne

---

## 🔔 Notifications Push

L'application supporte les **notifications push navigateur** (Web Push API + service worker).

### Configuration (optionnel)

1. Générez les clés VAPID :
   ```bash
   npx web-push generate-vapid-keys
   ```

2. Ajoutez-les dans `.env` :
   ```
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=<votre-clé-publique>
   VAPID_PRIVATE_KEY=<votre-clé-privée>
   ```

3. Redémarrez le serveur.

Les utilisateurs peuvent activer les notifications depuis **Paramètres → Notifications Push**.

---

## 🌐 Déploiement sur Vercel

### Étape 1 : Push sur GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<user>/sante-pontanegra-vercel.git
git push -u origin main
```

### Étape 2 : Connecter à Vercel

1. Allez sur [vercel.com](https://vercel.com) et connectez votre compte GitHub
2. Cliquez sur **New Project** → sélectionnez le dépôt
3. Vercel détecte automatiquement Next.js, conservez les paramètres par défaut

### Étape 3 : Variables d'environnement

Dans **Settings → Environment Variables**, ajoutez :

| Variable | Valeur | Requis |
|----------|--------|--------|
| `DATABASE_URL` | Connection string PostgreSQL (Neon/Supabase) | ✅ |
| `JWT_SECRET` | Chaîne aléatoire d'au moins 32 caractères (`openssl rand -base64 32`) | ✅ |
| `NEXT_PUBLIC_APP_URL` | `https://votre-app.vercel.app` | ✅ |
| `ENABLE_LLM_CHAT` | `true` (pour activer le LLM) | Optionnel |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Clé publique VAPID | Optionnel |
| `VAPID_PRIVATE_KEY` | Clé privée VAPID | Optionnel |

⚠️ **Important** : Pour la production, **utilisez PostgreSQL**. SQLite n'est
pas adapté à Vercel (système de fichiers éphémère).

### Étape 4 : Déployer

Cliquez sur **Deploy**. Vercel va :
1. Installer les dépendances
2. Générer le client Prisma (`postinstall`)
3. Build le projet
4. Déployer sur une URL `*.vercel.app`

### Étape 5 : Initialiser la base de données de production

Après le premier déploiement, exécutez en local avec la `DATABASE_URL`
de production :

```bash
DATABASE_URL="votre-url-postgresql-production" npm run db:push
```

---

## 📜 Scripts npm

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement sur `:3000` |
| `npm run build` | Build de production |
| `npm run start` | Lance le serveur de production (après build) |
| `npm run lint` | Vérifie le code avec ESLint |
| `npm run test` | Lance les tests (48 tests) |
| `npm run db:push` | Synchronise le schéma Prisma avec la base |
| `npm run db:generate` | Régénère le client Prisma |
| `npm run db:migrate` | Crée une migration Prisma |
| `npm run db:reset` | Réinitialise la base (⚠️ destructif) |

---

## 🧪 Tests

48 tests couvrent les fonctionnalités critiques :

- **Authentification** : hashage bcrypt, JWT signés/vérifiés, tokens invalides
- **Validation** : schémas Zod (login, register, post, appointment, chat)
- **Bot médical** : réponses contextuelles (fièvre, toux, paludisme, grossesse)
- **Rôles** : permissions, hiérarchie, accès médical

```bash
npm run test
# 48 pass — 0 fail — 92 expect() calls
```

---

## 🔒 Sécurité

### Mesures implémentées

- ✅ Mots de passe hachés (bcrypt, 10 rounds)
- ✅ Sessions JWT en cookies `httpOnly`, `sameSite=lax`, `Secure` en HTTPS
- ✅ Validation Zod sur toutes les entrées d'API
- ✅ Authentification requise sur les routes protégées
- ✅ Autorisations par propriétaire (chaque utilisateur ne voit que ses données)
- ✅ Rôles hiérarchiques (USER/NURSE/DOCTOR/ADMIN) avec permissions fines
- ✅ Anti-auto-rétrogradation (un admin ne peut pas se rétrograder lui-même)
- ✅ En-têtes de sécurité (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`)
- ✅ Aucune clé secrète dans le code source
- ✅ Variables d'environnement documentées dans `.env.example`
- ✅ `.gitignore` exclut `.env`, `db/`, `node_modules`, `.next/`

### Vérifications avant déploiement

1. ✅ `JWT_SECRET` défini en production (au moins 32 caractères aléatoires)
2. ✅ `DATABASE_URL` pointe vers une base externe (PostgreSQL)
3. ✅ Aucune variable `.env` en clair dans Git
4. ✅ Cookies sécurisés activés automatiquement en HTTPS

---

## ⚡ Performance

- **Server Components** par défaut, Client Components uniquement quand nécessaire
- **Code splitting** automatique par route
- **Optimisation images** Next.js (AVIF, WebP)
- **Caching** des données statiques
- **Fonts** optimisées avec `next/font`
- **Tailwind CSS 4** : CSS minimal, purgé automatiquement
- **LLM avec maxDuration=30s** pour rester dans les limites Vercel

---

## 📱 Responsive

L'application est **mobile-first** et fonctionne sur :

- 📱 **Smartphone** : barre de navigation en bas, layout adapté
- 📱 **Tablette** : grille 2-3 colonnes selon les écrans
- 💻 **Ordinateur** : barre de navigation en haut, largeur max 1280px

---

## 🎨 Thème

- **Couleur primaire** : vert santé `#0d7a5f`
- **Couleur secondaire** : bleu médecin `#1a5f7a`
- **Couleur urgence** : rouge `#e53935`
- **Mode clair / sombre** : via `next-themes`, persistant dans `localStorage`

---

## 🤝 Contribution

1. Fork le projet
2. Crée une branche : `git checkout -b feature/ma-feature`
3. Commit : `git commit -m 'Add: ma feature'`
4. Push : `git push origin feature/ma-feature`
5. Ouvre une Pull Request

---

## 📄 Licence

Ce projet est distribué sous licence MIT. Voir `LICENSE` pour plus de détails.

---

## 👥 Crédits

- **Auteur** : Santé Pontanegra Team
- **Localisation** : Pointe-Noire, République du Congo
- **Contact** : `contact@santepontanegra.cg`

---

## ⚠️ Avertissement médical

Les informations fournies par Santé Pontanegra, y compris par l'assistant
médical IA, **ne constituent pas un avis médical personnalisé** et ne
remplacent en aucun cas une consultation avec un professionnel de santé.

**En cas d'urgence vitale**, appelez immédiatement le **118** (SAMU/Pompiers)
ou le **117** (Police Secours).
