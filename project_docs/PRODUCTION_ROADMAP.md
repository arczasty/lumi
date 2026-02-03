# 🚀 PRODUCTION ROADMAP: LUMI

This document outlines the steps required to move the "Lumi" application from concept to production.

## 1. 🛡 Security & Authentication

**Current Status:**
✅ Implemented (Mobile & Web)

**Action Plan:**

- [x] **Setup Project**: Initialize Convex Backend & Clerk Auth.
- [x] **Database Schema**:
  - `dreams` table with vector index support (ready for RAG).
  - `users` identity management via Clerk.
- [x] **Auth Flow**:
  - Mobile: Clerk OAuth (Google) with SecureStore cache.
  - Web: Clerk Middleware + Next.js App Router protection.
- [x] **Privacy**: Row Level Security (RLS) via Convex authorization.

## 2. 🧩 Core Logic (Convex + Gemini)

**Current Status:**
beta (Voice & Analysis Active)

**Action Plan:**

- [x] **AI Orchestration**:
  - Convex Action `ai:transcribeAndAnalyze` implemented.
  - Model: Gemini 1.5 Flash (via OpenRouter) for fast multimodal analysis.
- [ ] **Vector Search (RAG)**:
  - Add vector embedding field to `dreams` table.
  - Implement similarity search for "Recurring Themes/Symbols".
- [x] **Voice Processing**:
  - Direct audio upload to Convex Storage.
  - Gemini Native Audio Transcription (Multimodal).
- [ ] **Image Generation**:
  - Implement `generate-dream-art` action (Imagen/Midjourney API).

## 3. 📱 Mobile Application (React Native / Expo)

**Current Status:**
MVP Complete (Migration from Flutter finished)

**Action Plan:**

- [x] **Initialize App**: Migrated to Expo Router + TypeScript.
- [x] **Dependencies**: `expo-av` (Audio), `skia` (Graphics), `clerk` (Auth).
- [x] **Design System**: "Bioluminescent" Dark Mode (`#030014`).
- [x] **Lumi Mascot**:
  - Rebuilt using `@shopify/react-native-skia`.
  - Reactive animations (Breathing, Listening, Thinking).
- [x] **Core Flows**:
  - **Record**: "Hold to Whisper" -> Instant Analysis.
  - **Journal**: Infinite scroll of analyzed dreams with sentiment badges.

## 4. 🌐 Web Application (Next.js)

**Current Status:**
MVP Complete

**Action Plan:**

- [x] **Initialize App**: Next.js 14+ (App Router).
- [x] **Dashboard**: Real-time view of `dreams` query.
- [x] **Landing Page**: Premium "OS for Subconscious" marketing page.
- [x] **Monorepo**: Integrated into Turbo repo structure (`dev:web`, `dev:mobile`).

## 5. ⚙️ Operations & Infrastructure

**Current Status:**
Pending Store Prep

**Action Plan:**

- [ ] **CI/CD**: Set up EAS Build.
- [ ] **Assets**: Generate App Icons/Splashes (Neuro Orchestrator).
- [ ] **Subscription**: Integrate RevenueCat for "Inner Circle" tier management.
