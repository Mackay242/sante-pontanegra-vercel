# 🚀 Guide de déploiement Vercel — Santé Pontanegra

Ce guide vous accompagne pas à pas pour déployer Santé Pontanegra sur Vercel
avec une base PostgreSQL Neon, le chat IA, et les notifications push.

**Durée totale** : ~15 minutes

---

## 📋 Prérequis

- Un compte [GitHub](https://github.com)
- Un compte [Vercel](https://vercel.com) (gratuit, connectez-vous avec GitHub)
- Un compte [Neon](https://neon.tech) (gratuit, base PostgreSQL serverless)
- Node.js 18+ installé localement
- Le code du projet `sante-pontanegra-vercel` sur votre machine

---

## Étape 1 — Préparer la base PostgreSQL sur Neon

1. **Créer un compte Neon** : allez sur https://neon.tech et inscrivez-vous (gratuit, 0.5 GB inclus).

2. **Créer un projet** :
   - Cliquez sur **New Project**
   - Name : `sante-pontanegra`
   - Region : `Frankfurt (eu-central-1)` (le plus proche de l'Afrique centrale depuis l'Europe)
   - Postgres version : 16 (default)
   - Cliquez sur **Create project**

3. **Copier la connection string** :
   - Sur le dashboard Neon, dans l'onglet **Connection Details**
   - Cliquez sur **Pooled connection** (recommandé pour Vercel serverless)
   - Copiez l'URL au format : `postgresql://user:password@host/dbname?sslmode=require`

4. **Gardez cette URL de côté**, on en aura besoin à l'étape 4.

---

## Étape 2 — Générer les secrets de production

Dans votre terminal, à la racine du projet :

```bash
npm run secrets
```

Ce script génère :
- `JWT_SECRET` — secret JWT de 384 bits (sécurité maximale)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — clé publique pour push notifications
- `VAPID_PRIVATE_KEY` — clé privée pour push notifications

Copiez toutes les valeurs affichées dans un fichier temporaire.

---

## Étape 3 — Pousser le code sur GitHub

```bash
# Initialiser git (si pas déjà fait)
git init
git add .
git commit -m "feat: Santé Pontanegra — PWA ready for Vercel"
git branch -M main

# Créer un repo sur GitHub (https://github.com/new)
# Name: sante-pontanegra-vercel
# Ne pas initialiser avec README/gitignore (le projet en a déjà)

# Connecter et pousser
git remote add origin https://github.com/VOTRE-USER/sante-pontanegra-vercel.git
git push -u origin main
```

---

## Étape 4 — Importer le projet sur Vercel

1. **Aller sur Vercel** : https://vercel.com/new
2. **Importer le repo** : sélectionnez `sante-pontanegra-vercel` dans la liste
3. **Vercel détecte automatiquement Next.js** — laissez les paramètres par défaut :
   - Framework Preset: **Next.js**
   - Build Command: `next build` (automatique)
   - Output Directory: `.next` (automatique)
   - Install Command: `npm install` (automatique)

4. **NE PAS cliquer sur Deploy tout de suite** — d'abord les variables d'environnement (étape 5).

---

## Étape 5 — Configurer les variables d'environnement

Dans la page Vercel, section **Environment Variables**, ajoutez chacune de ces variables :

| Name | Value | Environments |
|------|-------|--------------|
| `DATABASE_URL` | `postgresql://...` (URL Neon de l'étape 1) | Production, Preview, Development |
| `JWT_SECRET` | (généré à l'étape 2) | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://sante-pontanegra-vercel.vercel.app` (voir plus bas) | Production, Preview |
| `ENABLE_LLM_CHAT` | `true` | Production, Preview |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | (généré à l'étape 2) | Production, Preview, Development |
| `VAPID_PRIVATE_KEY` | (généré à l'étape 2) | Production, Preview, Development |

⚠️ **Pour `NEXT_PUBLIC_APP_URL`** : Vercel attribue une URL après le premier déploiement.
Laissez vide au premier déploiement, puis après le déploiement revenez ici pour mettre
l'URL correcte (`https://votre-app.vercel.app`) et redéployez.

---

## Étape 6 — Basculer le schéma Prisma sur PostgreSQL

Avant de déployer, basculez le schéma Prisma sur PostgreSQL (le projet utilise SQLite en local).

**Option A — Swap direct (simple)** :

```bash
# Remplacez le schéma par la version PostgreSQL
cp prisma/schema.postgres.prisma prisma/schema.prisma
git add prisma/schema.prisma
git commit -m "chore: switch Prisma to PostgreSQL for production"
git push
```

**Option B — Schémas multiples (avancé)** :

Gardez SQLite en local et PostgreSQL en prod via un script. Voir
[Prisma multi-environment](https://www.prisma.io/docs/guides/development-environment).

Recommandé : **Option A** (plus simple, et Neon est gratuit pour le dev aussi).

---

## Étape 7 — Déployer !

1. De retour sur Vercel, cliquez sur **Deploy**
2. Vercel va :
   - Installer les dépendances (`npm install`)
   - Générer le client Prisma (`postinstall`)
   - Build le projet (`next build`)
   - Déployer sur une URL `*.vercel.app`

⏱️ Durée : ~2-3 minutes

3. Une fois terminé, Vercel affiche :
   ```
   ✅ Deployment Ready
   https://sante-pontanegra-vercel-xxx.vercel.app
   ```

---

## Étape 8 — Initialiser la base de données PostgreSQL

Votre base Neon est vide. Il faut pousser le schéma Prisma dessus.

En local, avec la `DATABASE_URL` de Neon :

```bash
# Option A — commande dédiée
DATABASE_URL="postgresql://...votre-url-neon..." npm run db:push:prod

# Option B — commande directe
DATABASE_URL="postgresql://...votre-url-neon..." npx prisma db push --accept-data-loss --schema=prisma/schema.postgres.prisma
```

Vérifiez dans le dashboard Neon → **Tables** : vous devriez voir
`User`, `Post`, `Comment`, `MedicalDossier`, `Appointment`, `Vaccination`,
`Pregnancy`, `ChatMessage`, `PushSubscription`.

---

## Étape 9 — Tester l'app en production

1. Visitez votre URL Vercel : `https://votre-app.vercel.app`
2. Testez :
   - Inscription : créez un compte
   - Connexion
   - Dashboard
   - Chat médecin (avec LLM activé)
   - Centres de santé
   - Communauté (créez un post)
   - Rendez-vous (créez un RDV)
   - Profil → Paramètres → Notifications push (activez)

3. **Pour installer la PWA sur téléphone** :
   - **Android** : Ouvrez l'URL dans Chrome → menu ⋮ → "Installer l'application"
   - **iOS** : Ouvrez l'URL dans Safari → bouton Partager → "Sur l'écran d'accueil"

---

## Étape 10 — Promouvoir un utilisateur en ADMIN (optionnel)

Pour accéder au panneau d'administration `/admin`, votre compte doit avoir le rôle `ADMIN`.

Soit via le SQL Editor de Neon :

```sql
UPDATE "User"
SET role = 'ADMIN'
WHERE email = 'votre-email@test.cg';
```

Soit via la CLI Prisma Studio :

```bash
DATABASE_URL="postgresql://...votre-url-neon..." npx prisma studio
```

(Ouvre une interface graphique pour éditer les utilisateurs)

---

## 🎉 Félicitations !

Votre application Santé Pontanegra est maintenant :
- ✅ Déployée sur Vercel (URL publique HTTPS)
- ✅ Connectée à PostgreSQL (Neon)
- ✅ Chat médecin IA activé (z-ai-web-dev-sdk)
- ✅ Notifications push configurées
- ✅ Installable comme app native (PWA)
- ✅ Accessible depuis n'importe quel appareil

---

## 🔧 Maintenance

### Mettre à jour le code

```bash
git add .
git commit -m "fix: ma modification"
git push
```

Vercel redéploie automatiquement à chaque push sur `main`.

### Modifier le schéma de base

1. Éditez `prisma/schema.prisma`
2. Poussez le schéma en local :
   ```bash
   npm run db:push
   ```
3. Poussez le schéma en production :
   ```bash
   DATABASE_URL="...neon..." npm run db:push:prod
   ```
4. Commit + push :
   ```bash
   git add prisma/schema.prisma
   git commit -m "db: nouvelle colonne"
   git push
   ```

### Variables d'environnement

Pour modifier une variable :
1. Vercel → votre projet → Settings → Environment Variables
2. Modifiez la valeur
3. Cliquez sur **Redeploy** pour appliquer

---

## ❓ Dépannage

### Build failed: "Prisma can't reach database"
→ Vérifiez que `DATABASE_URL` est bien au format `postgresql://...?sslmode=require`

### Erreur 500 sur /api/auth/register
→ Vérifiez que `JWT_SECRET` est défini et fait au moins 32 caractères

### Notifications push ne marchent pas
→ Vérifiez les variables `NEXT_PUBLIC_VAPID_PUBLIC_KEY` et `VAPID_PRIVATE_KEY`
→ Vérifiez que `NEXT_PUBLIC_APP_URL` correspond à votre URL Vercel

### Chat médecin répond comme un bot simple
→ Vérifiez que `ENABLE_LLM_CHAT=true` est défini sur Vercel

### Page blanche après déploiement
→ Vérifiez les logs : Vercel → votre déploiement → **Logs**
→ Vérifiez que `DATABASE_URL` pointe vers Neon (pas vers SQLite local)

---

## 📞 Support

- **Documentation Vercel** : https://vercel.com/docs
- **Documentation Prisma** : https://www.prisma.io/docs
- **Documentation Neon** : https://neon.tech/docs
- **Documentation Next.js 16** : https://nextjs.org/docs

---

## 📊 Coûts (estimation)

| Service | Plan gratuit | Utilisation estimée |
|---------|--------------|----------------------|
| **Vercel** (Hobby) | 100 GB bandwidth, 100h build/mois | Suffisant pour ~1000 users |
| **Neon** (Free) | 0.5 GB storage, 100h compute/mois | Suffisant pour ~5000 users |
| **Total** | **0 € / mois** | jusqu'à ~1000-5000 users |

Au-delà, prévoir un plan payant Vercel Pro (20 $/mois) et Neon Scale (19 $/mois).
