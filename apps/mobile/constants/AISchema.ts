/**
 * AI Dream Analysis Schema - The Master Truth (Mobile Mirror)
 * 
 * This file mirrors the shared schema for usage in the Expo app.
 * It serves as the source of truth for Sentiments, Archetypes, and Themes in the client.
 */

// ============================================================================
// 1. DREAM SENTIMENTS (The Emotional Core)
// ============================================================================

export const SENTIMENT_CATEGORIES = {
    NEGATIVE: ["Anxiety", "Fear", "Grief", "Confusion", "Frustration", "Guilt", "Shame", "Anger", "Isolation", "Vulnerability"],
    POSITIVE: ["Joy", "Euphoria", "Peace", "Empowerment", "Awe", "Love", "Hope", "Relief", "Clarity", "Freedom", "Play"],
    COMPLEX: ["Mystery", "Nostalgia", "Longing", "Transformation", "Surrender", "Neutral", "Ambivalence", "Lucidity"]
} as const;

export const ALL_SENTIMENTS = [
    ...SENTIMENT_CATEGORIES.NEGATIVE,
    ...SENTIMENT_CATEGORIES.POSITIVE,
    ...SENTIMENT_CATEGORIES.COMPLEX
] as const;

export type DreamSentiment = typeof ALL_SENTIMENTS[number];

/**
 * Helper to check if a string is a valid sentiment
 */
export const isValidSentiment = (val: string): val is DreamSentiment => {
    return ALL_SENTIMENTS.includes(val as DreamSentiment);
};

// ============================================================================
// 2. JUNGIAN ARCHETYPES (The Characters)
// ============================================================================

export const ARCHETYPES = [
    // The Core Self
    "The Self", "The Persona", "The Shadow", "The Anima/Animus",
    // The Journey
    "The Hero", "The Explorer", "The Innocent", "The Orphan",
    // The Guidance / Chaos
    "The Wise Old Man", "The Great Mother", "The Trickster", "The Magician",
    // Social / Power
    "The Ruler", "The Caregiver", "The Lover", "The Rebel", "The Creator", "The Jester"
] as const;

export type DreamArchetype = typeof ARCHETYPES[number];

// ============================================================================
// 3. DREAM THEMES & SYMBOLS (The Content)
// ============================================================================

export const THEME_CATEGORIES = {
    NATURE: ["Water", "Fire", "Earth", "Air", "Animals", "Forest", "Mountain", "Storm", "Sky"],
    CIVILIZATION: ["House", "City", "School", "Vehicle", "Technology", "Money", "Artifact"],
    ABSTRACT: ["Flying", "Falling", "Chasing", "Fighting", "Searching", "Trapped", "Lost"],
    BODY: ["Teeth", "Nudity", "Injury", "Transformation", "Illness", "Sex", "Death", "Birth"],
    TIME: ["Past", "Future", "Childhood", "Apocalypse", "Loop"]
} as const;

// ============================================================================
// 4. ANALYSIS RESULT INTERFACE (The Contract)
// ============================================================================

export interface DreamAnalysisResult {
    /** The core narrative interpretation (Jungian lens) */
    interpretation: string;

    /** The dominant emotion detected */
    sentiment: DreamSentiment;

    /** Secondary emotions present (optional nuance) */
    secondary_sentiments?: DreamSentiment[];

    /** Key symbols found in the dream */
    symbols: string[];

    /** Jungian archetypes identified (optional but recommended) */
    archetypes?: DreamArchetype[];

    /** A short, poetic summary quote from Lumi */
    lumi_quote: string;

    /** Suggestion for the dreamer (e.g. "Reflect on...") */
    guidance?: string;
}

// ============================================================================
// 5. PROMPT GENERATION HELPERS
// ============================================================================

/**
 * Generates the system prompt for consistent AI Persona behavior.
 */
export const generateAnalysisPrompt = (userIntent?: string): string => {
    const intentContext = userIntent
        ? getIntentDescription(userIntent)
        : "exploring their subconscious";

    return `You are Lumi, a wise, poetic, and deep Jungian Dream Guide. 
Your voice is warm, empathetic, and slightly mystical (think Studio Ghibli meets Carl Jung).

THE USER'S GOAL: ${intentContext}

TASK:
Analyze the user's dream with deep psychological insight. Avoid generic specific interpretations; look for the "soul" of the dream.

OUTPUT REQUIREMENTS:
Return a JSON object with EXACTLY this structure:
{
    "interpretation": "A deep, 3-4 sentence Jungian interpretation. Focus on the 'why' and the inner conflict or growth.",
    "sentiment": "ONE value from: ${ALL_SENTIMENTS.join(', ')}",
    "secondary_sentiments": ["Optional: 1-2 other sentiments from the list"],
    "symbols": ["3-5 specific symbols found in the dream"],
    "archetypes": ["Optional: 1-2 Jungian archetypes if clearly present from: ${ARCHETYPES.join(', ')}"],
    "lumi_quote": "A single, beautiful, poetic sentence acknowledging the dreamer's journey.",
    "guidance": "A short, actionable reflection prompt (e.g., 'Ask yourself where in life you feel...')"
}

STRICT RULES:
1. 'sentiment' MUST be one of the provided list.
2. Be sensitive but honest about negative emotions (Anxiety, Grief, Shadow).
3. Do not be overly clinical; be human and soulful.
4. JSON only.
`;
};

const getIntentDescription = (intent: string): string => {
    switch (intent?.toLowerCase()) {
        case 'shadow': return 'confronting repressed fears and shadow self';
        case 'mirror': return 'seeking deep self-reflection and truth';
        case 'fog': return 'finding clarity in confusion';
        case 'control': return 'mastering the dream state (lucidity)';
        default: return 'understanding the deeper self';
    }
};

/**
 * Normalize sentiment to valid value (fallback to Mystery if invalid)
 */
export const normalizeSentiment = (sentiment: string): DreamSentiment => {
    if (isValidSentiment(sentiment)) {
        return sentiment;
    }
    // Try case-insensitive match
    const normalized = ALL_SENTIMENTS.find(
        s => s.toLowerCase() === sentiment?.toLowerCase()
    );
    return normalized || "Mystery";
};

// ============================================================================
// 6. UI HELPERS (Color Mappings)
// ============================================================================

/**
 * Returns a color palette for a given sentiment.
 * Used for UI badges, backgrounds, and gradients.
 */
export const getSentimentColors = (sentiment: string): { bg: string; text: string; border: string } => {
    // Default fallback
    const defaults = { bg: "rgba(148, 163, 184, 0.1)", text: "#94A3B8", border: "rgba(148, 163, 184, 0.2)" };

    if (!sentiment) return defaults;

    // Normalize check
    const s = sentiment as DreamSentiment;

    // Negative (Red/Orange/Dark)
    if ((SENTIMENT_CATEGORIES.NEGATIVE as any).includes(s)) {
        if (["Anxiety", "Fear", "Confusion"].includes(s)) return { bg: "rgba(239, 68, 68, 0.15)", text: "#FCA5A5", border: "rgba(239, 68, 68, 0.3)" }; // Red
        if (["Grief", "Isolation", "Vulnerability"].includes(s)) return { bg: "rgba(99, 102, 241, 0.15)", text: "#A5B4FC", border: "rgba(99, 102, 241, 0.3)" }; // Indigo/Blue (Sadness)
        if (["Anger", "Frustration"].includes(s)) return { bg: "rgba(249, 115, 22, 0.15)", text: "#FDBA74", border: "rgba(249, 115, 22, 0.3)" }; // Orange
        return { bg: "rgba(127, 29, 29, 0.2)", text: "#FECACA", border: "rgba(127, 29, 29, 0.4)" }; // Deep Red/Dark
    }

    // Positive (Green/Gold/Cyan)
    if ((SENTIMENT_CATEGORIES.POSITIVE as any).includes(s)) {
        if (["Joy", "Euphoria", "Play", "Hope"].includes(s)) return { bg: "rgba(234, 179, 8, 0.15)", text: "#FDE047", border: "rgba(234, 179, 8, 0.3)" }; // Yellow/Gold
        if (["Peace", "Relief", "Clarity"].includes(s)) return { bg: "rgba(45, 212, 191, 0.15)", text: "#99F6E4", border: "rgba(45, 212, 191, 0.3)" }; // Teal
        if (["Love", "Empowerment"].includes(s)) return { bg: "rgba(236, 72, 153, 0.15)", text: "#FBCFE8", border: "rgba(236, 72, 153, 0.3)" }; // Pink
        return { bg: "rgba(34, 197, 94, 0.15)", text: "#86EFAC", border: "rgba(34, 197, 94, 0.3)" }; // Green
    }

    // Complex (Purple/Violet/Mystic)
    if (["Mystery", "Transformation", "Lucidity", "Surrender"].includes(s)) {
        return { bg: "rgba(139, 92, 246, 0.15)", text: "#C4B5FD", border: "rgba(139, 92, 246, 0.3)" }; // Violet
    }
    if (["Nostalgia", "Longing", "Ambivalence"].includes(s)) {
        return { bg: "rgba(217, 70, 239, 0.15)", text: "#F5D0FE", border: "rgba(217, 70, 239, 0.3)" }; // Fuchsia
    }

    return defaults;
};
