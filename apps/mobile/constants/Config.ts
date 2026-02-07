/**
 * Global App Configuration & Feature Flags
 * 
 * Centralized place for non-design constants like usage limits, 
 * developer overrides, and external service settings.
 */

export const APP_CONFIG = {
    // Usage Limits
    FREE_WEEKLY_LIMIT: 3, // Increased for onboarding testing (Default should be 3)

    // Feature Flags & Overrides
    // Set to true to bypass RevenueCat and treat all users as PRO for testing
    BYPASS_PRO_CHECK: false,

    // Status Logic Strings
    STATUS: {
        ONBOARDING_COMPLETED: 'completed',
        ONBOARDING_IN_PROGRESS: 'in_progress',
    },

    // Subscription Logic
    SUBSCRIPTION: {
        PRO_TIER: 'pro',
        FREE_TIER: 'free',
    }
} as const;

export default APP_CONFIG;
