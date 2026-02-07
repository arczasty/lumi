/**
 * RevenueCat SDK Initialization and Helpers
 *
 * This module handles RevenueCat SDK configuration and provides
 * utility functions for subscription management.
 */

import { Platform } from 'react-native';
import Purchases, {
    LOG_LEVEL,
    CustomerInfo,
    PurchasesOfferings,
    PurchasesPackage,
} from 'react-native-purchases';
import { REVENUECAT_CONFIG } from '@/constants/revenuecat-config';

// API Keys from environment
const IOS_API_KEY = process.env.EXPO_PUBLIC_RC_IOS;
const ANDROID_API_KEY = process.env.EXPO_PUBLIC_RC_ANDROID;

/**
 * Initialize the RevenueCat SDK
 * Call this once when the app starts
 */
export async function initializeRevenueCat(): Promise<void> {
    // Set log level for debugging (reduce in production)
    if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    } else {
        Purchases.setLogLevel(LOG_LEVEL.ERROR);
    }

    const apiKey = Platform.OS === 'ios' ? IOS_API_KEY : ANDROID_API_KEY;

    if (!apiKey) {
        console.error('❌ RevenueCat: Missing API key for platform:', Platform.OS);
        return;
    }

    try {
        Purchases.configure({ apiKey });
        console.log('✅ RevenueCat: SDK configured successfully');
    } catch (error) {
        console.error('❌ RevenueCat: Failed to configure SDK:', error);
    }
}

/**
 * Log in a user to RevenueCat (for cross-platform sync)
 * Call this after user authentication
 */
export async function loginUser(appUserId: string): Promise<CustomerInfo | null> {
    try {
        const { customerInfo } = await Purchases.logIn(appUserId);
        console.log('✅ RevenueCat: User logged in:', appUserId);
        return customerInfo;
    } catch (error) {
        console.error('❌ RevenueCat: Failed to log in user:', error);
        return null;
    }
}

/**
 * Log out the current user (for sign out flows)
 */
export async function logoutUser(): Promise<CustomerInfo | null> {
    try {
        const customerInfo = await Purchases.logOut();
        console.log('✅ RevenueCat: User logged out');
        return customerInfo;
    } catch (error) {
        console.error('❌ RevenueCat: Failed to log out:', error);
        return null;
    }
}

/**
 * Get current customer info
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
        const customerInfo = await Purchases.getCustomerInfo();
        return customerInfo;
    } catch (error) {
        console.error('❌ RevenueCat: Failed to get customer info:', error);
        return null;
    }
}

/**
 * Get available offerings (products)
 */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
    try {
        const offerings = await Purchases.getOfferings();
        return offerings;
    } catch (error) {
        console.error('❌ RevenueCat: Failed to get offerings:', error);
        return null;
    }
}

/**
 * Check if user has the "Lumi Pro" entitlement
 */
export function hasProEntitlement(customerInfo: CustomerInfo | null): boolean {
    if (!customerInfo) return false;
    return typeof customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID] !== 'undefined';
}

/**
 * Get the active subscription plan type
 */
export function getActiveSubscriptionPlan(customerInfo: CustomerInfo | null): 'monthly' | 'yearly' | 'lifetime' | null {
    if (!customerInfo || !hasProEntitlement(customerInfo)) {
        return null;
    }

    const entitlement = customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID];
    if (!entitlement) return null;

    const productId = entitlement.productIdentifier;

    if (productId.includes('monthly')) return 'monthly';
    if (productId.includes('yearly') || productId.includes('annual')) return 'yearly';
    if (productId.includes('lifetime')) return 'lifetime';

    return null;
}

/**
 * Get expiration date for subscription (null for lifetime)
 */
export function getSubscriptionExpirationDate(customerInfo: CustomerInfo | null): number | null {
    if (!customerInfo) return null;

    const entitlement = customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID];
    if (!entitlement) return null;

    // Lifetime purchases don't expire
    if (entitlement.productIdentifier.includes('lifetime')) {
        return null;
    }

    return entitlement.expirationDate ? new Date(entitlement.expirationDate).getTime() : null;
}

/**
 * Purchase a package
 */
export async function purchasePackage(packageToPurchase: PurchasesPackage): Promise<CustomerInfo | null> {
    try {
        const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
        console.log('✅ RevenueCat: Purchase successful');
        return customerInfo;
    } catch (error: any) {
        if (error.userCancelled) {
            console.log('ℹ️ RevenueCat: User cancelled purchase');
        } else {
            console.error('❌ RevenueCat: Purchase failed:', error);
        }
        return null;
    }
}

/**
 * Restore purchases
 */
export async function restorePurchases(): Promise<CustomerInfo | null> {
    try {
        const customerInfo = await Purchases.restorePurchases();
        console.log('✅ RevenueCat: Purchases restored');
        return customerInfo;
    } catch (error) {
        console.error('❌ RevenueCat: Failed to restore purchases:', error);
        return null;
    }
}
