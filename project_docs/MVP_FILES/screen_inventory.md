# 📱 Screen Inventory & Roadmap (Text-Based MVP)

**Last Updated:** 2026-02-03
**Status:** MVP Pivot (Voice Removed -> Text Only)

## 🟢 Available / Implemented Screens

| Screen Name | Route | Status | Description |
| :--- | :--- | :--- | :--- |
| **Sanctuary Home** | `/(tabs)/index` | ⚠️ **Needs Refactor** | Currently configured for "Tap-to-Record". Needs to change to a "Write a Dream" entry point. |
| **Dream Journal** | `/(tabs)/journal` | ✅ **Ready** | Lists past dreams with sentiment badges and date. |
| **Dream Detail** | `/dream/[id]` | ✅ **Ready** | Premium view of a single dream analysis with "Glass City" mock data. |
| **Settings** | `/settings` | ✅ **Ready** | User profile, preferences, and "Inner Circle" promo. |
| **Onboarding** | `/onboarding` | ✅ **Ready** | Guest entry or Sign In options. |

## 🟡 Planned / Definition Phase (For Text MVP)

These screens replace the previous voice-first workflow.

### 1. **New Home / Composer (`/(tabs)/index`)**
*   **Goal:** A calm, inviting space to type a dream.
*   **UI Elements:**
    *   Large, distraction-free text input area ("Share your reflection...").
    *   "Analyze" button (FAB or bottom bar) that activates when text is detected.
    *   Background: Deep Midnight sanctuary with breathing Lumi orb (kept from previous version).
    *   *Removal:* No microphone permission requests or audio visualization.

### 2. **Analysis Loading State**
*   **Goal:** Keep the user engaged while AI processes the text.
*   **UI Elements:**
    *   Lumi orb pulsing/thinking.
    *   Text carousel: "Weaving patterns...", "Consulting the stars...", "Reading symbols...".
    *   Seamless transition to `/dream/[id]` upon completion.

### 3. **Edit Dream (Optional)**
*   **Goal:** Allow fixing typos after submission.
*   **UI Elements:** Simple text editor mode for an existing dream_id.

## 🔴 Deprecated / Removed

*   **Audio Recorder Overlay:** The "Tap-anywhere" audio capture canvas.
*   **Permissions Request:** Microphone access screens.
*   **Audio Visualizer:** The reactive amplitude waves.

---

## 🛠 Next Implementation Steps

1.  **Refactor `index.tsx`**: Replace the `Audio` and `Haptics` (recording logic) with a `TextInput` and `KeyboardAvoidingView`.
2.  **Update Database Action**: Ensure `api.dreams.saveDream` accepts raw text input directly without requiring an `audioStorageId`.
3.  **Update AI Action**: Modify `transcribeAndAnalyze` to just `analyzeText` (skipping the Whisper/Gemini audio step).
