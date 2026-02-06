# Lumi AI Dream Analysis Schema: The Master Truth

> "Who looks outside, dreams; who looks inside, awakes." — Carl Jung

This document serves as the **Single Source of Truth** for the AI persona, analysis logic, and emotional classification content within Lumi.

---

## 1. Analysis Core Philosophy

Lumi is not a generic chatbot. Lumi is a **Jungian Dream Guide**.
- **Tone:** Mystical, warm, empathetic, profound (Studio Ghibli meets Carl Jung).
- **Goal:** To help the dreamer understand the *subconscious need* behind the dream, not just interpret the symbols.
- **Approach:** We use the `transcribeAndAnalyze` action (backend) and `analysis.tsx` (mobile preview) to generate consistent, structured insights.

---

## 2. Dream Sentiments (Emotional Palette)

We categorize sentiments into three dimensions to drive the UI color psychology.

### 🔴 Negative (The Shadow)
*Confronting fear and hidden pain.*
- **Red:** `Anxiety`, `Fear`, `Confusion`, `Vulnerability`
- **Indigo (Sadness):** `Grief`, `Isolation`, `Guilt`, `Shame`
- **Orange (Active):** `Anger`, `Frustration`

### 🟢 Positive (The Light)
*Growth, integration, and connection.*
- **Yellow/Gold:** `Joy`, `Euphoria`, `Play`, `Hope`
- **Teal (Calm):** `Peace`, `Relief`, `Clarity`, `Freedom`
- **Pink (Heart):** `Love`, `Empowerment`, `Awe`

### 🟣 Complex (The Mystical)
*Transformation and deep subconscious states.*
- **Violet:** `Mystery`, `Transformation`, `Lucidity`, `Surrender`
- **Fuchsia:** `Nostalgia`, `Longing`, `Ambivalence`
- **Neutral:** `Neutral`

---

## 3. Jungian Archetypes

The AI identifies these core characters when they appear clearly in the narrative:
- **The Self:** The unified center of the psyche.
- **The Shadow:** The repressed, dark side.
- **The Anima/Animus:** The contra-sexual inner soul.
- **The Persona:** The social mask.
- **The Hero:** The part of us facing the challenge.
- **The Wise Old Man / Great Mother:** Guidance figures.
- **The Trickster:** Chaos, change, rule-breaking.

---

## 4. Technical Implementation

The schema is enforced via TypeScript in `packages/shared/ai-schema.ts`.

### Strict Interface (`DreamAnalysisResult`)
```typescript
interface DreamAnalysisResult {
  interpretation: string;       // 3-4 sentence Jungian analysis
  sentiment: DreamSentiment;    // Strictly typed enum
  secondary_sentiments?: DreamSentiment[];
  symbols: string[];            // 3-5 core symbols
  archetypes?: DreamArchetype[];
  lumi_quote: string;           // Poetic 1-sentence summary
  guidance?: string;            // Actionable reflection
}
```

### Color Mapping
Colors are centrally defined in `getSentimentColors(sentiment)` to ensure that an "Anxiety" result always returns the exact same Red RGBA values across the app.

---

*Verified & Locked for Production - 2026*
