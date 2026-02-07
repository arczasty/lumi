/**
 * Common Backend Configuration
 */

export const CONFIG = {
    // Usage Limits
    FREE_WEEKLY_LIMIT: 10, // Matches frontend

    // Time Intervals (in milliseconds)
    INTERVALS: {
        SEVEN_DAYS: 7 * 24 * 60 * 60 * 1000,
    },

    // Status Logic
    SUBSCRIPTION_TIERS: {
        PRO: "pro",
        FREE: "free",
    },

    // XP & Gamification
    XP: {
        BASE_ENTRY: 50,
        STREAK_BONUS: 15,
        THRESHOLD_MULTIPLIER: 100,
    }
} as const;
