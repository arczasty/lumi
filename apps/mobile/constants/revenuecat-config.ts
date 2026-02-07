/**
 * RevenueCat Configuration Constants
 * 
 * These values are configured in the RevenueCat dashboard.
 * iOS products are prefixed with 'lumi_' to match App Store Connect.
 */

export const REVENUECAT_CONFIG = {
    // Entitlement identifier - grants access to premium features
    ENTITLEMENT_ID: 'Lumi Pro',

    // Product identifiers (iOS - App Store Connect)
    PRODUCT_IDS: {
        MONTHLY: 'lumi_monthly',
        YEARLY: 'lumi_yearly',
        LIFETIME: 'lumi_lifetime',
    },

    // Package identifiers (RevenueCat offerings)
    PACKAGE_IDS: {
        MONTHLY: '$rc_monthly',
        ANNUAL: '$rc_annual',
        LIFETIME: '$rc_lifetime',
    },
} as const;

export type SubscriptionTier = 'free' | 'pro';
export type SubscriptionPlan = 'monthly' | 'yearly' | 'lifetime' | null;
