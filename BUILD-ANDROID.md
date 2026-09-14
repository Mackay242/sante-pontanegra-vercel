# 📱 Guide de compilation Android — Santé Pontanegra

Ce guide explique comment générer un **APK Android signé release** à partir du projet, installable à vie sur n'importe quel téléphone Android.

**Prérequis** : Android Studio installé (gratuit, ~10 Go)

---

## 🛠️ Étape 1 — Installer Android Studio

1. Télécharge Android Studio : https://developer.android.com/studio
2. Installe-le (par défaut tout est coché, clique "Next" jusqu'à la fin)
3. Au premier lancement, Android Studio télécharge le SDK Android (~5 Go)
4. Une fois terminé, ferme Android Studio

---

## 📥 Étape 2 — Cloner le projet sur ton ordi

```bash
git clone https://github.com/Mackay242/sante-pontanegra-vercel.git
cd sante-pontanegra-vercel
npm install
```

---

## 🔧 Étape 3 — Synchroniser Capacitor

Maintenant que les dépendances sont installées, synchronise les assets web vers le projet Android :

```bash
npx cap sync android
```

Tu dois voir :
```
✔ Copying web assets from public to android/app/src/main/assets/public in X.XXms
✔ Creating capacitor.config.json in android/app/src/main/assets in XXXms
✔ copy android in X.XXms
✔ Updating Android plugins in X.XXms
✔ update android in X.XXms
```

---

## 📂 Étape 4 — Ouvrir dans Android Studio

```bash
npx cap open android
```

Android Studio s'ouvre avec le projet. Attends que Gradle finisse de se synchroniser (première fois = ~5-10 min, il télécharge les dépendances Android).

**Si tu as une erreur "SDK not found"** :
1. Dans Android Studio : File → Settings → Appearance & Behavior → System Settings → Android SDK
2. Vérifie que "Android 14.0 (API 34)" est coché
3. Clique "Apply" pour installer

---

## 🔑 Étape 5 — Créer une clé de signature (keystore)

Cette clé signe ton APK pour qu'il soit reconnu comme authentique.

### 5.1 — Générer le keystore

Dans un terminal (sur ton ordi, pas Android Studio) :

```bash
keytool -genkey -v -keystore sante-pontanegra.keystore -alias sante-pontanegra -keyalg RSA -keysize 2048 -validity 10000
```

Réponds aux questions :
- Keystore password : **choisis un mot de passe fort** (ex: `Sante2026Pontanegra!`)
- Re-enter password : **le même**
- What is your first and last name? : `Santé Pontanegra`
- Organizational unit? : `Health`
- Organization? : `Santé Pontanegra`
- City? : `Pointe-Noire`
- State? : `Pointe-Noire`
- Country code? : `CG`
- Enter password for `sante-pontanegra` : **même mot de passe que le keystore**

**⚠️ SAUVEGARDE CE FICHIER `.keystore` EN SÉCURITÉ !**
- Si tu le perds, tu ne pourras plus publier de mises à jour avec la même identité
- Ne le commit JAMAIS sur GitHub (il est dans `.gitignore`)
- Garde-en une copie sur un cloud (Google Drive, etc.)

### 5.2 — Configurer Gradle pour signer

Dans Android Studio, ouvre le fichier `android/app/build.gradle`. Ajoute à la fin (avant la dernière `}`) :

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('keystore.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 5.3 — Créer le fichier `keystore.properties`

Crée un fichier `android/keystore.properties` (à la racine du dossier android) avec :

```properties
storeFile=../sante-pontanegra.keystore
storePassword=TON_MOT_DE_PASSE
keyAlias=sante-pontanegra
keyPassword=TON_MOT_DE_PASSE
```

⚠️ **Remplace `TON_MOT_DE_PASSE` par le mot de passe que tu as choisi en 5.1.**

⚠️ **Ce fichier est dans `.gitignore` — ne le commit pas sur GitHub !**

---

## 📦 Étape 6 — Compiler l'APK signé release

### Méthode A — Via Android Studio (visuel)

1. Menu : **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Attends ~5-10 min (première fois)
3. Quand c'est fini, une notification apparaît en bas à droite
4. Clique sur "locate" pour ouvrir le dossier dans l'explorateur
5. L'APK est dans : `android/app/build/outputs/apk/release/app-release.apk`

### Méthode B — En ligne de commande

```bash
cd android
./gradlew assembleRelease
```

L'APK est généré dans : `android/app/build/outputs/apk/release/app-release.apk`

---

## 📲 Étape 7 — Installer l'APK sur ton téléphone

### 7.1 — Activer "Sources inconnues" sur Android

1. Sur ton téléphone : **Paramètres → Sécurité → Sources inconnues** (ou "Installer des apps inconnues")
2. Active l'option pour "Chrome" ou "Files"

### 7.2 — Transférer l'APK

3 méthodes au choix :
- **USB** : copie le fichier `app-release.apk` sur ton téléphone
- **Google Drive / WeTransfer** : upload + download sur téléphone
- **QR code** : génère un QR code avec https://cli.link qui pointe vers ton APK sur Drive

### 7.3 — Installer

1. Sur le téléphone, ouvre le fichier `app-release.apk`
2. Android demande l'autorisation d'installer → clique **Installer**
3. L'app s'installe avec l'icône verte cœur
4. Ouvre l'app → elle charge ton URL Vercel en webview native 🎉

---

## ✅ Test de l'app installée

| Test | Action attendue |
|------|-----------------|
| Ouvrir l'app | Splash screen vert 1.5s → page d'accueil Vercel |
| Appuyer sur le bouton retour | Quitte l'app (comportement natif) |
| Mettre en mode avion | L'app reste accessible (cache service worker) |
| Partager un post (bouton Partager) | Ouvre le menu de partage natif Android |
| Prendre une photo (dans le chat médecin) | Ouvre la caméra native |
| Vibrer sur une action | Vibration native du téléphone |

---

## 🔄 Mettre à jour l'app

### Si tu modifies le code (sur Vercel)

→ **Rien à faire** ! L'app Android charge ton URL Vercel. Quand tu push sur GitHub, Vercel redéploie automatiquement, et l'app Android voit immédiatement les changements.

### Si tu modifies la config Capacitor (appId, plugins, etc.)

1. Modifie `capacitor.config.ts`
2. Synchronise :
   ```bash
   npx cap sync android
   ```
3. Recompile l'APK (Étape 6)
4. Distribue le nouvel APK aux utilisateurs

---

## 📋 Checklist de publication

Avant de distribuer l'APK publiquement, vérifie :

- [ ] L'APK est signé en release (pas debug)
- [ ] Le `appId` est correct : `cg.santepontanegra.app`
- [ ] L'app charge l'URL Vercel en HTTPS
- [ ] Le service worker est actif (mode offline fonctionne)
- [ ] Les permissions Android sont claires (caméra, localisation)
- [ ] Le fichier `keystore` est sauvegardé en lieu sûr
- [ ] Un numéro de version est défini dans `android/app/build.gradle` (`versionCode` et `versionName`)

---

## ❓ Dépannage

### "Permission denied" en exécutant `gradlew`

```bash
chmod +x android/gradlew
```

### "SDK license not accepted"

```bash
cd android
./gradlew --version  # ça accepte les licences automatiquement
```

### L'app affiche un écran blanc

→ Vérifie ta connexion internet (l'app charge une URL Vercel)
→ Vérifie que l'URL dans `capacitor.config.ts` est bien HTTPS

### "Cleartext HTTP traffic not permitted"

→ Normal, on a désactivé le cleartext. L'app doit charger du HTTPS uniquement.

### Le build échoue avec "Cannot find symbol @capacitor/..."

```bash
npm install
npx cap sync android
```

---

## 🎯 Pour passer au Play Store plus tard

Quand tu seras prêt à publier sur le Play Store (25 € une fois) :

1. Compile un `.aab` (Android App Bundle) au lieu d'un `.apk` :
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
   Le fichier sera dans `android/app/build/outputs/bundle/release/app-release.aab`

2. Va sur https://play.google.com/console
3. Paye les 25 € (une fois, à vie)
4. Crée une app : `Santé Pontanegra`
5. Upload le fichier `.aab`
6. Remplis la fiche (description, captures d'écran, etc.)
7. Soumets pour validation (1-3 jours)
8. L'app est en ligne sur le Play Store 🎉

---

## 📞 Support

- **Documentation Capacitor** : https://capacitorjs.com/docs
- **Documentation Android Studio** : https://developer.android.com/studio/intro
- **Générateur de keystore** : `keytool` (inclus avec Java/Android Studio)

---

## 📊 Récap des fichiers importants

| Fichier | Rôle |
|---------|------|
| `capacitor.config.ts` | Configuration Capacitor (URL, plugins, splash screen) |
| `android/` | Projet Android natif (généré par `npx cap add android`) |
| `android/app/src/main/res/` | Icônes et splash screens (déjà générés) |
| `android/play-store/` | Icône 512x512 pour Play Store |
| `android/keystore.properties` | Référence au keystore (NON commité) |
| `sante-pontanegra.keystore` | Clé de signature (NON commité, à sauvegarder) |

⚠️ **Fichiers à ne JAMAIS committer sur GitHub** :
- `*.keystore`
- `keystore.properties`
- `android/app/build/` (build artifacts)
- `android/.gradle/` (cache Gradle)

Ils sont déjà dans `.gitignore`.
