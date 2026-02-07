/**
 * Constants for AI Analysis and Prompts
 * 
 * These constants are used both in prompt generation and response parsing/validation.
 */

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

export type ValidSentiment = typeof ALL_SENTIMENTS[number];
export type ValidArchetype = typeof ARCHETYPES[number];

/**
 * Normalize sentiment to valid value (fallback to Mystery if invalid)
 */
export const normalizeSentiment = (sentiment: string): ValidSentiment => {
    const normalized = ALL_SENTIMENTS.find(
        s => s.toLowerCase() === sentiment?.toLowerCase()
    );
    return normalized || "Mystery";
};
