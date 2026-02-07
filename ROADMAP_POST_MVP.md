# 🚀 Lumi: Post-MVP Roadmap (2026 Vision)

This document outlines the high-priority features and architectural improvements planned for the post-MVP phase of the Lumi Sanctuary.

---

## 1. Engagement & Automation

### 🕒 Smart Reminder Windows
*   **Concept**: Move beyond generic daily reminders to "Retention Windows".
*   **Implementation**: 
    *   Allow users to set a "Wake-up Window" (e.g., 7:00 AM - 8:00 AM).
    *   Trigger high-priority, gentle notifications during this window to catch dreams before "The Fade".
    *   Integrate with iOS/Android Sleep APIs to detect wake-up events for real-time prompting.

### 📊 Weekly Subconscious Digest (Weekly Totem)
*   **Concept**: A high-value Sunday report synthesizing the week's subconscious narrative.
*   **Implementation**:
    *   **Convex Crons**: Schedule a job to run every Sunday at 00:00 UTC.
    *   **AI Synthesis**: Run a large-context AI prompt to identify recurring themes across all entries from the last 7 days.
    *   **The Totem**: Generate a unique "Weekly Totem" (Visual + Poem) that represents the user's mental state.
    *   **Push Delivery**: Notify the user when their "Ancient Reflection" is ready.

---

## 2. Deep Personalization (AI Spirit Guides)

### 🎭 Archetypal Personalities
*   **Concept**: Let users choose the "Lens" through which their dreams are interpreted.
*   **Guides**:
    *   **The Jungian**: Focuses on archetypes, shadows, and collective subconscious.
    *   **The Mystical Shaman**: Focuses on symbols, spirits, and ancient omens.
    *   **The Clinical Scientist**: Focuses on memory consolidation, stress levels, and cognitive patterns.
*   **Tech**: System Prompt selection in `convex/ai.ts` based on user preference stored in `users` table.

---

## 3. Privacy & Security

### 🔐 Biometric Lock UI
*   **Concept**: A full-screen security barrier for the "Inner Sanctuary".
*   **Implementation**:
    *   Create a reusable `SecurityBarrier` component.
    *   Trigger on app mount or resume if `biometricLockEnabled` is ON.
    *   Blur the background (using `expo-blur`) until FaceID/TouchID is successfully verified.

---

## 4. Advanced Analytics & Retention

### 📈 Retention Flywheel (PostHog)
*   **Goal**: Use the newly integrated PostHog data to drive decisions.
*   **Funnel Optimization**:
    *   Track "Record Start" vs. "Save Success" to find friction points in the recording UI.
    *   Analyze "Interpretation Read Time" to see if users value the AI content.
    *   Monitor "XP Level Progress" to tune gamification rewards.

---

## 5. Technical Debt & Scaling
*   **Vector Database (RAG)**: Move from simple keyword symbols to full vector embeddings for "Subconscious Search".
*   **Localization**: Support for multicultural dream symbols (Dreaming in Polish, Japanese, etc.).
*   **Offline First**: Better support for recording dreams in poor connectivity areas.
*   **Centralized Design Tokens & Magic String Registry**: 
    *   **Goal**: Eliminate hardcoded magic numbers, colors (brand hexes), and logic strings (status types, subscription slugs).
    *   **Implementation**: Create a unified `constants/` registry that all screens import from, ensuring that a single change to `BRAND_ACCENT` or `FREE_REFLECTIONS_LIMIT` propagates app-wide.

---
*Created: 2026-02-07*
