# Elan66

Application mobile (Expo / React Native) pour créer une habitude et tenir un défi de 66 jours.

- Données 100% locales (SQLite)
- Check-in quotidien ✅ / ⚠️ / ❌
- Journal lié aux jours (notes)
- SOS (3 minutes)
- Répère (citations + notifications matin/soir)
- Statistiques et progression

## Prérequis

- Node.js 20+
- npm 10+
- Expo CLI (via `npx expo`)
- (Optionnel) EAS CLI pour les dev builds : `npm i -g eas-cli`

## Installation

```bash
npm install
```

## Lancer le projet

### Expo Go (rapide)

```bash
npx expo start
```

Ensuite :
- Android : scanner le QR dans Expo Go
- iOS : scanner le QR (si autorisé)

Note : certaines notifications peuvent être limitées dans Expo Go.

### Dev build (recommandé pour notifications)

Les notifications (rappels + Répère) fonctionnent pleinement en dev build.

1) Config EAS (si nécessaire)
```bash
eas login
eas build:configure
```

2) Build dev (Android)
```bash
eas build --profile development --platform android
```

3) Installer l’APK/AAB sur le téléphone puis lancer l’app.

## Scripts utiles

- `npx expo start` : lancer Metro
- `npm run android` / `npm run ios` (si configurés) : lancer sur device/emulator

## Structure du projet

- `App.js` : entrée principale
- `src/appShell/navigation/*` : navigation (tabs + stack)
- `src/core/db/*` : SQLite (migrations, repo settings)
- `src/core/services/*` : notifications, export/import, citations
- `src/features/habits/*` : création, détail, archives, logs
- `src/features/repere/*` : écran citations + rituel
- `src/features/settings/*` : réglages + à propos

## Données & confidentialité

- Base locale SQLite (`expo-sqlite`)
- Export/Import JSON via partage/DocumentPicker
- Aucune API, aucun compte

## Notifications

- Rappel quotidien d’habitudes (heure réglable)
- Répère : notification citation (Matin / Soir / Matin+Soir / Off) avec heure modifiable

Sur Android : les notifications utilisent des channels (`daily`, `repere`).

## À propos

L’écran « Réglages → À propos » décrit l’application et ses fonctionnalités.
