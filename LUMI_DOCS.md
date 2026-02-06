# LUMI_DOCS
> **The Single Source of Truth for the Lumi Ecosystem**

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run dev:mobile` | Start Expo Metro bundler |
| `npm run dev:convex` | Start Convex backend sync |
| `npx expo run:ios` | Build & run on iOS simulator |
| `npx expo run:android` | Build & run on Android |
| `npx convex deploy` | Deploy backend to production |

---

## 1. Vision & Identity

### The Concept
Lumi is the **"OS for the Subconscious"** — an AI-powered dream interpreter that acts as a longitudinal, empathetic companion for spiritual introspection. Unlike predatory "coin-based" dream apps, Lumi offers a **private, continuous dialogue** with your subconscious.

### Theme: "Bioluminescent Sanctuary"
- **Visuals**: Studio Ghibli inspired, soft lighting, watercolor-ink hybrid.
- **Tone**: Empathetic, Socratic, Mystical but grounded.
- **Colors**:
  - Background: Twilight Indigo (`#030014`, `#1A1B41`)
  - Primary Glow: Bioluminescent Teal (`#BAF2BB`)
  - Highlights: Warm Amber (`#F4E04D`)

### Design System

| Token | Hex | Usage |
|-------|-----|-------|
| `PURPLE.primary` | `#A78BFA` | Primary accent color |
| `PURPLE.glow` | `#8B5CF6` | Shadows and glows |
| `BACKGROUND.base` | `#0A0A0F` | App background |
| `BACKGROUND.card` | `#141420` | Card surfaces |

See `constants/Theme.ts` for the complete design token system.

### Terminology
| Standard Term | Lumi Term |
|---------------|-----------|
| User | Dreamer / Traveler |
| Dream Entry | Reflection |
| Analysis | Insight |
| Subscription | Inner Circle / Sanctuary Access |

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React Native + Expo (Managed Workflow) |
| **Navigation** | Expo Router (File-based) |
| **Backend** | Convex (Realtime DB + Functions) |
| **Auth** | Clerk (JWT, OAuth) |
| **AI** | OpenRouter (Gemini 1.5 Flash / Claude) |
| **Animations** | Moti + Reanimated |
| **Graphics** | React Native Skia |
| **Analytics** | PostHog |
| **Payments** | RevenueCat (Planned) |
| **Language** | TypeScript |

---

## 3. Project Structure

```
Lumi_v0/
├── apps/
│   └── mobile/           # React Native app
│       ├── app/          # Expo Router screens
│       │   ├── (tabs)/   # Main tab screens
│       │   ├── onboarding/ # Onboarding flow
│       │   └── dream/    # Dream detail [id]
│       ├── components/   # Reusable UI components
│       │   ├── Gamification/ # LevelCard, XP
│       │   ├── Insights/     # StreakOrb, SentimentSpectrum
│       │   ├── Navigation/   # FloatingTabBar
│       │   └── SanctuaryUI/  # Background, Sparkle
│       └── lib/          # Utilities (posthog, settings)
├── convex/               # Backend functions & schema
│   ├── schema.ts         # Database schema
│   ├── dreams.ts         # Dream CRUD + XP logic
│   ├── users.ts          # User sync & profile
│   ├── insights.ts       # Dashboard stats query
│   └── ai.ts             # AI interpretation actions
└── project_docs/         # (Archived) Legacy docs
```

---

## 4. Environment Variables

Create `.env.local` in `apps/mobile/`:

```bash
# Clerk Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Convex Backend
EXPO_PUBLIC_CONVEX_URL_DEV=https://...
EXPO_PUBLIC_CONVEX_URL_PROD=https://... # (Optional)

# PostHog Analytics
EXPO_PUBLIC_POSTHOG_API_KEY=phc_...

# OpenRouter AI (Set in Convex Dashboard, NOT client-side)
OPENROUTER_API_KEY=sk-or-...
```

---

## 5. Application Workflow

### Onboarding Flow
```
Welcome → Dream Snapshot → First Dream → Processing → Auth Gate → Paywall → Main App
```

### Main App (Tabs)
| Tab | Path | Purpose |
|-----|------|---------|
| **Record** | `/(tabs)/index.tsx` | Record dreams via voice or text. Central "breathing orb" UI. |
| **Journal** | `/(tabs)/journal.tsx` | List of past dreams. Tap to view details. Includes LevelCard. |
| **Insights** | `/(tabs)/insights.tsx` | Dashboard: Streak, Sentiment, Symbol Cloud. |
| **Settings** | `/(tabs)/settings.tsx` | Profile, preferences, export, logout. Includes LevelCard. |

### Dream Detail
- **Path**: `app/dream/[id].tsx`
- **Actions**: View full text, AI interpretation, generated image, edit, delete, share.

---

## 6. Database Schema (Convex)

### `dreams` Table
```typescript
{
  userId: string,
  text: string,
  interpretation?: string,
  sentiment?: string,
  symbols?: string[],
  lumi_quote?: string,
  imageUrl?: string,
  createdAt: number,
}
```

### `users` Table
```typescript
{
  userId: string,           // Clerk Subject ID
  email?: string,
  name?: string,
  dreamFrequency?: string,
  primaryGoal?: string,
  marketingVibe?: string,
  onboardingStatus?: string,
  streak?: number,
  lastEntryDate?: number,
  xp?: number,              // Gamification
  level?: number,           // Gamification
  createdAt: number,
}
```

---

## 7. Feature Documentation

### Gamification (XP & Levels)
- **XP Award**: 10 XP per recorded dream.
- **Level Formula**: Level up every `level * 100` XP.
- **Titles**: "Novice Dreamer" → "Lucid Explorer" → "Astral Traveler" → "Dream Weaver".
- **Components**: `LevelCard` displayed in Journal & Settings.

### AI Analysis Pipeline
1. User records dream (text or audio).
2. `saveDream` mutation stores entry.
3. `transcribeAndAnalyze` action (if audio) transcribes via Gemini multimodal.
4. `analyzeDream` action extracts symbols, sentiment, interpretation.
5. `generateDreamImage` action creates Studio Ghibli-style visualization.

### PostHog Analytics
- **Init**: `apps/mobile/lib/posthog.ts`
- **Provider**: Wrapped in `apps/mobile/app/_layout.tsx`
- **Usage**: `usePostHog()` hook → `posthog.capture('event_name', { ... })`

---

## 8. Development Commands

```bash
# Install dependencies
npm install

# Start Convex backend (in one terminal)
npm run dev:convex

# Start Expo (in another terminal)
npm run dev:mobile

# Build native app (required for audio/camera features)
npx expo run:ios
npx expo run:android

# Clear cache if issues
npx expo start --clear

# Run tests
npm test

# Lint & Typecheck
npm run lint
npm run typecheck
```

---

## 9. Troubleshooting

| Issue | Solution |
|-------|----------|
| `ExponentAV` module missing | Run `npx expo run:ios` to rebuild native app |
| `api.insights` type error | Run `npx convex dev` to regenerate types |
| Metro bundler errors | `npx expo start --clear` |
| Convex sync issues | Restart `npx convex dev` |
| SafeAreaView warnings | Use `react-native-safe-area-context` |

---

## 10. Production Roadmap

| Phase | Status | Items |
|-------|--------|-------|
| **Auth & DB** | ✅ Done | Clerk, Convex, RLS |
| **AI Pipeline** | ✅ Done | Transcription, Analysis, Image Gen |
| **Mobile MVP** | ✅ Done | Record, Journal, Insights, Settings |
| **Gamification** | ✅ Done | XP, Levels, LevelCard |
| **Vector Search (RAG)** | 🔲 Planned | Recurring themes/symbols |
| **RevenueCat** | 🔲 Planned | Subscription management |
| **App Store** | 🔲 Planned | CI/CD, EAS Build, Assets |

---

## 11. AI Agent Protocol

> **For AI assistants (Antigravity, etc.) working on this codebase:**

1. **Read this document first** before making changes.
2. **Schema changes** must update this document.
3. **New env vars** must be added to Section 4.
4. **After work**: Run `npm run check-all` to verify.

---

## 12. Skills & Workflows

### Recommended Workflows
| Command | Purpose |
|---------|---------|
| `/dev-build` | Rebuild native app with cache clear |
| `/convex-sync` | Regenerate Convex types |
| `/release-prep` | Version bump, changelog, store prep |

### Adding a Workflow
Create `.agent/workflows/[name].md`:
```markdown
---
description: Short description
---
1. Step one
2. Step two
```

---

*Last Updated: 2026-02-06*
