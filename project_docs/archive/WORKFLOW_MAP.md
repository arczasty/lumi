# Lumi App Workflow Map

This document outlines the navigation flow, screen connections, and user journey within the Lumi application.

## 1. Onboarding Flow
**Entry Point:** `app/index.tsx` (Redirects to `/onboarding` if user is new, or `/(tabs)` if authenticated)

| Screen | Path | Purpose | Next Step |
| :--- | :--- | :--- | :--- |
| **Welcome** | `onboarding/index.tsx` | Landing page, "Begin" button. | `onboarding/snapshot` |
| **Dream Snapshot** | `onboarding/snapshot.tsx` | User selects goals (e.g., "Lucid Dreaming"). | `onboarding/entry` |
| **First Dream** | `onboarding/entry.tsx` | User types their first dream (text input). | `onboarding/processing` |
| **Processing** | `onboarding/processing.tsx` | AI "analyzes" the dream (fake delay/animation). | `onboarding/auth-gate` |
| **Auth Gate** | `onboarding/auth-gate.tsx` | Login/Signup (Clerk). Prevents progress until auth. | `onboarding/paywall` (after auth) |
| **Paywall** | `onboarding/paywall.tsx` | Upsell "Inner Circle". Can be skipped. | `/(tabs)` (Main App) |

---

## 2. Main Application Flow (Tabs)
**Entry Point:** `app/(tabs)/_layout.tsx`
**Navigation Style:** Bottom Tab Bar (to be redesigned as floating).

### A. Record Tab (Home) - `/(tabs)/index.tsx`
- **Primary Action:** Record Audio or Type Dream.
- **Connections:**
  - **Start Recording:** Activates microphone, pulsing UI.
  - **Stop Recording:** triggers `transcribeAndAnalyze`.
  - **Save:** Saves dream to Convex DB -> Redirects to `Journal`.

### B. Journal Tab - `/(tabs)/journal.tsx`
- **Display:** List of past dreams (Cards).
- **Interactions:**
  - **Tap Dream Card:** Navigates to `dream/[id].tsx`.
- **Sub-Screen: Dream Details** - `app/dream/[id].tsx`
  - **Display:** Full dream text, AI interpretation, Image.
  - **Actions:** Share, Delete, Edit.
  - **Back:** Returns to `Journal`.

### C. Insights Tab - `/(tabs)/insights.tsx`
- **Display:** Dashboard of stats.
- **Components:**
  - Streak Orb.
  - Sentiment Spectrum (Bar/Gauge).
  - Symbol Cloud (Tags).
- **Logic:** Fetches aggregated data from `getDashboardStats` backend query.

### D. Settings Tab - `/(tabs)/settings.tsx`
- **Display:** User profile, preferences, subscription status.
- **Actions:**
  - **Edit Profile:** Updates Clerk/Convex user data.
  - **Subscription:** Redirects to payment/management.
  - **Sign Out:** Clears session -> Redirects to `onboarding/index`.

---

## 3. Data & State Connections
- **User Sync:** `SessionContext` ensures Clerk user exists in Convex `users` table.
- **Dream Storage:** `Record` screen saves to `dreams` table. `Journal` and `Insights` read from `dreams`.
- **AI Processing:** `Record` triggers `transcribeAndAnalyze` action (OpenRouter/Gemini) -> Updates `dreams` entry.
