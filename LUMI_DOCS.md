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
Lumi is the **"OS for the Subconscious"** — an AI-powered dream interpreter acting as an empathetic, longitudinal companion. It moves beyond generic "coin-based" apps to offer a **private, bioluminescent sanctuary** for dialogue with your inner self.

### Theme: "Bioluminescent Sanctuary"
- **Visuals**: Studio Ghibli inspired, high-depth glassmorphism, watercolor-ink hybrid.
- **Tone**: Socratic, Mystical, Empathetic.
- **Colors**:
  - Background: Twilight Indigo (`#030014`)
  - Accent: Sanctuary Purple (`#A78BFA`)
  - Surface: Glassmorphic Navy (`rgba(255,255,255,0.06)`)

### Terminology
| Standard Term | Lumi Term |
|---------------|-----------|
| User | Traveler / Dreamer |
| Dream Entry | Reflection |
| Analysis | Insight |
| Subscription | Inner Circle / Sanctuary Access |

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React Native + Expo (SDK 54) |
| **Navigation** | Expo Router (File-based) |
| **Backend** | Convex (Realtime DB + Mutations + Crons) |
| **Auth** | Clerk (JWT-based sync with Convex) |
| **AI** | OpenRouter (Gemini 2.0 Flash / Gemini 1.5 Pro) |
| **Analytics** | PostHog (Behavioral Tracking & Identity) |
| **Payments** | RevenueCat (Subscription & Customer Center) |
| **Security** | Expo SecureStore + LocalAuthentication (Biometrics) |

---

## 3. Project Structure

```
Lumi_v0/
├── apps/
│   └── mobile/           # React Native app
│       ├── app/          # Navigation Screens
│       │   ├── (tabs)/   # Main Experience (Journal, Insights, Lexicon, Settings)
│       │   ├── onboarding/ # Detailed persona discovery
│       │   └── dream/    # Dream Detail [id]
│       ├── components/   
│       │   ├── Gamification/ # Leveling, XP, Streaks
│       │   ├── SanctuaryUI/  # Custom Backgrounds, Loaders, Sparkles
│       │   └── Navigation/   # Floating Glass TabBar
│       └── lib/          # Logic (Auth, PostHog, Settings, RevenueCat)
├── convex/               # Backend Logic
│   ├── schema.ts         # Multi-table relational schema
│   ├── ai.ts             # Multimodal analysis actions
│   ├── dreams.ts         # CRUD + Gamification triggers
│   ├── users.ts          # Persona & Profile sync
│   └── crons.ts          # Scheduled maintenance & synthesis
```

---

## 4. Environment Variables

Create `.env.local` in `apps/mobile/`:

```bash
# Clerk
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Convex
EXPO_PUBLIC_CONVEX_URL_DEV=https://...

# PostHog
EXPO_PUBLIC_POSTHOG_API_KEY=phc_...

# AI (Set in Convex Dashboard)
OPENROUTER_API_KEY=sk-or-...
```

---

## 5. Feature Ecosystem

### 🏆 Gamification (The Leveling System)
- **XP**: Awarded for recordings (10 XP) and consistency.
- **Levels**: Level up every `Level * 500` XP (currently).
- **Streak**: Tracks daily sanctuary visits.
- **Sync**: Level & XP logic lives in `convex/dreams.ts` on every successful save.

### 🧠 Subconscious Pipeline
1. **Input**: Voice or Multi-line Text entry during onboarding.
2. **Synthetic Analysis**: Instant, intent-based "Glimpse" presented during onboarding to eliminate cold-start latency.
3. **Background Analysis**: Deep AI analysis and image generation trigger in the background post-authentication.
4. **Insight Extraction**: AI extracts **Symbols**, **Archetypes**, and **Emotions** into relational tables.
5. **Visualization**: Studio Ghibli style artwork generated via AI actions.
6. **Lexicon**: Auto-populated dictionary of personal symbols discovered by the Traveler.

### 🔒 Security & Privacy
- **Biometric Lock**: FaceID/TouchID protection for the journal.
- **Local Persistence**: `expo-secure-store` for app-wide UI settings.
- **Data Sovereignty**: Export functionality for all personal reflections.

### 📈 Global Analytics (PostHog)
- **Identity Tracking**: Users identified by Clerk ID.
- **Funnel Analysis**: Tracking the journey from onboarding to paywall.
- **Engagement**: Capture events for dream recordings and setting changes.

---

## 6. Production Roadmap

| Phase | Status | Key Features |
|-------|--------|--------------|
| **Core Infrastructure** | ✅ Done | Clerk Auth, Convex DB, AI Analysis |
| **Engagement MVP** | ✅ Done | Tab Navigation, Floating UI, Gamification |
| **Security & Analytics**| ✅ Done | Biometrics, PostHog integration |
| **Monetization** | � Active | RevenueCat Integration, Customer Center |
| **Post-MVP Vision** | 🔲 Planned | Smart Reminders, Weekly Totem, Spirit Guides |

> [!IMPORTANT]
> **Post-MVP Planning**: For details on the long-term vision (2026+), refer to [ROADMAP_POST_MVP.md](./ROADMAP_POST_MVP.md).

---

## 7. Development Protocols

1. **Schema Integrity**: Always check `convex/schema.ts` before adding new data fields.
2. **Design Tokens**: Use `constants/Theme.ts`. Do not use hardcoded hex codes.
3. **Haptics**: Always trigger `Light` feedback on primary button taps.
4. **Analytics**: Capture significant User Actions: `posthog.capture('event_name')`.

---
*Last Updated: 2026-02-07*
