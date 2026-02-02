# 🛠 DEVELOPMENT: Technical Architecture

> [!IMPORTANT]
> **AI AGENT GUARDRAIL**: Before modifying any codebase logic, check for existing schemas in `@lumi/shared` and ensure any new environment variables are validated via Zod.

## 1. Technical Stack

- **Monorepo**: Turborepo 2 + npm workspaces.
- **Mobile**: Flutter (Dart) + Riverpod (State Management).
- **Backend**: Firebase (Auth, Firestore, Functions, Genkit).
- **Web**: Next.js (Marketing only) - *Optional/Phase 2*.
- **Shared**: Flutter Packages / Plugins.

### Lumi-Specific Libraries (Flutter)
- **Animation**: `rive` (Runtime for Rive).
- **Audio**: `flutter_sound` or `record` (for Whisper Mode) + ElevenLabs API.
- **AI/ML**: `firebase_genkit` (AI Orchestration).
- **Monetization**: `purchases_flutter` (RevenueCat).

## 2. Professional Standards

### Environment Safety

We use **Zod** for runtime environment variable validation.

### Environment Safety

- **Config**: Managed via `flutter_dotenv` or Firebase Remote Config.


### Quality Gates

- **Husky**: Pre-commit hooks run `lint-staged`.
- **ESLint v9**: Uses the Flat Config format (`eslint.config.mjs`).
- **Prettier**: Global formatting standards.

## 3. Directory Map

- `/apps/lumi_mobile`: The Flutter Application.
- `/apps/web`: Marketing landing page (optional).
- `/project_docs`: Strategic and technical documentation.

## 4. Development Workflow

1.  **Mobile**:
    -   `flutter pub get` (Install dependencies).
    -   `flutter run` (Start debug session).
2.  **Backend**:
    -   `firebase login`
    -   `firebase deploy` (Deploy Functions/Firestore rules).

