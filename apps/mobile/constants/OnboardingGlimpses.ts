/**
 * Synthetic Glimpses for Onboarding
 * 
 * These are pre-written, archetypal interpretations used during 
 * the high-momentum onboarding flow to provide immediate value 
 * while the real AI analysis processes in the background.
 */

export interface OnboardingGlimpse {
    title: string;
    interpretation: string;
    sentiment: string;
    symbols: string[];
    archetype: string;
    lumi_quote: string;
}

export const ONBOARDING_GLIMPSES: Record<string, OnboardingGlimpse> = {
    fog: {
        title: "The Emergent Path",
        interpretation: "The weight of the unremembered is beginning to lift. Your subconscious is like a landscape at dawn—shifting from static noise into defined shapes. This fragment you captured is a marker of your increasing sensitivity to the subtle internal frequencies that others often ignore.",
        sentiment: "Clarity",
        symbols: ["Mist", "Lantern", "Echo"],
        archetype: "The Explorer",
        lumi_quote: "Clear eyes see the truth that has always Been there."
    },
    shadow: {
        title: "The Threshold Guardian",
        interpretation: "What appeared as a threat is actually a messenger in disguise. Your dream suggests that you are standing at the edge of your own internal boundary. This tension is not an end, but an invitation to reclaim a part of your power that you've kept locked away in the dark.",
        sentiment: "Vulnerability",
        symbols: ["Threshold", "Chase", "Key"],
        archetype: "The Shadow",
        lumi_quote: "The brightest light is found by looking into the deepest dark."
    },
    mirror: {
        title: "The Reflective Soul",
        interpretation: "The images you've encountered are reflections of an interior architecture you are only just beginning to map. Your dream speaks to a deep internal alignment, where the soul is attempting to communicate a truth about your character that has been obscured by the noise of waking life.",
        sentiment: "Awe",
        symbols: ["Reflection", "Portal", "Statue"],
        archetype: "The Self",
        lumi_quote: "When we look into the lake of sleep, we see our eternal face."
    },
    control: {
        title: "The Sovereign Dreamer",
        interpretation: "You are beginning to realize that the physics of the dream space obey the laws of your own will. This fragment reveals a flicker of sovereign agency—a sign that you are moving from a passive observer to an active architect of your own subconscious reality.",
        sentiment: "Lucidity",
        symbols: ["Wings", "Command", "Gravity"],
        archetype: "The Magician",
        lumi_quote: "The master of the dream is the master of the self."
    },
    default: {
        title: "The Initial Spark",
        interpretation: "This reflection is the first ripple in a vast ocean of insight. By documenting these fragments, you are signaling to your subconscious that you are ready to listen. There is a story unfolding within you, and this dream is the opening chapter of a profound transformation.",
        sentiment: "Mystery",
        symbols: ["Seed", "Ripple", "Fragment"],
        archetype: "The Hero",
        lumi_quote: "Every journey into the self begins with a single, honest word."
    }
};
