# CLAUDE.md - Project Context & Operational Manual

## 0. ⚠️ PRIME DIRECTIVE
- **Speed & Precision:** Do not ask for permission to edit files. You have `--dangerously-skip-permissions` enabled.
- **Verification:** Never claim a task is done until you have run the build/test command and confirmed it passes.
- **Self-Correction:** If a command fails, read the error, attempt a fix, and retry. Only stop if you are stuck in a loop (>3 attempts).

---

## 1. Project Identity
**Lumi_v0 (Bioluminescent Dream Journal)**
- **Platform:** Mobile (iOS/Android) via **Expo** (Managed Workflow)
- **Framework:** React Native + Expo Router
- **Language:** TypeScript
- **Backend:** **Convex** (Realtime DB + Functions)
- **Auth:** **Clerk** (Integrated with Convex)
- **Styling:** `StyleSheet.create` (Standard RN) + `moti` (Animation) + `lucide-react-native` (Icons)
- **AI Engine:** OpenRouter (Gemini / Claude) via Convex Actions

---

## 2. The Toolbelt (Commands)
*Run these from the project root (`/Lumi_v0`).*

- **Start App:** `npm run dev:mobile -- --clear` (Starts Expo + Metro)
- **Start Backend:** `npm run dev:convex` (Syncs functions & schema)
- **Prebuild Native:** `npx expo prebuild --clean` (Regenerate android/ios folders)
- **Run on Sim:** `npx expo run:ios` (Auto-builds & launches)
- **Lint:** `npm run lint`

---

## 3. Coding Standards (The "Sanctuary Vibe")
1.  **Aesthetics First:** UI MUST look premium ("Bioluminescent Sanctuary"). Use `SanctuaryBackground`, Glassmorphism (`BlurView`), and Glowing Gradients.
2.  **Functional:** Use Functional Components + Hooks.
3.  **Data Fetching:** Use `useQuery` (Convex) for reading, `useMutation` for writing. NO raw fetch calls in UI.
4.  **Navigation:** Use `expo-router` (File-based routing in `app/`).
5.  **Files:** `kebab-case` for folders/routes, `PascalCase` for Components.

---

## 4. Environment & Terminal
*You are running in a Ghostty terminal.*

- **Environment Vars:** stored in `.env.local` (Clerk Keys, Convex URL).
- **Backend Sync:** If schema changes, run `npx convex dev` or check the running backend process.

---

## 5. Git & GitHub Workflow
*We use `gh` CLI.*

### 5.1 Branching
- **Commit Style:** Conventional Commits (`feat:`, `fix:`, `style:`, `refactor:`).
- **Frequency:** Commit often.

---

## 6. 🧠 MEMORY BANK (Lessons Learned)
### 6.1 Expo & Native Modules
- **Issue:** TextEncoder/Decoder missing in RN. **Fix:** Polyfilled in `index.js`.
- **Issue:** `react-native-skia` version mismatch. **Fix:** Use `npx expo install --fix` or align with Expo SDK version.

### 6.2 Convex Patterns
- **Pattern:** Actions (`internalAction`) for AI calls (long running), Mutations (`internalMutation`) for DB writes.
- **Auth:** Pass `userId` manually if needed, but prefer `ctx.auth.getUserIdentity()`.

### 6.3 UI/UX Defaults
- **Font:** `Georgia` (iOS) / `serif` (Android) for Dreamy Headers.
- **Colors:** Midnight (`#030014`), Teal (`#BAF2BB`), Gold (`#F4E04D`).