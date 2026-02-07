/**
 * RevenueCat Context Provider
 *
 * Provides subscription state and purchase methods throughout the app.
 * Automatically syncs subscription status to Convex database.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import { CustomerInfo, PurchasesOfferings, PurchasesPackage } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { useAuth } from '@clerk/clerk-expo';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

import {
    initializeRevenueCat,
    loginUser,
    logoutUser,
    getCustomerInfo,
    getOfferings,
    hasProEntitlement,
    getActiveSubscriptionPlan,
    getSubscriptionExpirationDate,
    purchasePackage,
    restorePurchases as restorePurchasesHelper,
} from '@/lib/revenuecat';
import { REVENUECAT_CONFIG } from '@/constants/revenuecat-config';

interface RevenueCatContextType {
    // State
    isInitialized: boolean;
    isLoading: boolean;
    isProUser: boolean;
    customerInfo: CustomerInfo | null;
    offerings: PurchasesOfferings | null;
    currentPlan: 'monthly' | 'yearly' | 'lifetime' | null;

    // Actions
    refreshCustomerInfo: () => Promise<void>;
    purchase: (packageToPurchase: PurchasesPackage) => Promise<boolean>;
    restorePurchases: () => Promise<boolean>;
    presentPaywall: () => Promise<boolean>;
    presentPaywallIfNeeded: () => Promise<boolean>;
    presentCustomerCenter: () => Promise<void>;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined);

interface RevenueCatProviderProps {
    children: ReactNode;
}

export function RevenueCatProvider({ children }: RevenueCatProviderProps) {
    const { userId, isSignedIn } = useAuth();

    // Convex mutations for database sync
    const updateSubscriptionStatus = useMutation(api.subscriptions.updateSubscriptionStatus);
    const logSubscriptionEvent = useMutation(api.subscriptions.logSubscriptionEvent);

    // State
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);

    // Derived state
    const isProUser = hasProEntitlement(customerInfo);
    const currentPlan = getActiveSubscriptionPlan(customerInfo);

    /**
     * Sync subscription status to Convex database
     */
    const syncToDatabase = useCallback(async (info: CustomerInfo | null) => {
        if (!userId || !info) return;

        const isPro = hasProEntitlement(info);
        const plan = getActiveSubscriptionPlan(info);
        const expiresAt = getSubscriptionExpirationDate(info);

        try {
            await updateSubscriptionStatus({
                userId,
                subscriptionTier: isPro ? 'pro' : 'free',
                subscriptionPlan: plan || undefined,
                subscriptionExpiresAt: expiresAt || undefined,
                revenuecatCustomerId: info.originalAppUserId,
            });
            console.log('✅ RevenueCat: Synced subscription to database');
        } catch (error) {
            console.error('❌ RevenueCat: Failed to sync to database:', error);
        }
    }, [userId, updateSubscriptionStatus]);

    /**
     * Log a subscription event to the database for analytics
     */
    const logEvent = useCallback(async (
        eventType: string,
        info: CustomerInfo,
        additionalData?: Record<string, any>
    ) => {
        if (!userId) return;

        const plan = getActiveSubscriptionPlan(info);
        const entitlement = info.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID];

        try {
            await logSubscriptionEvent({
                userId,
                eventType,
                productId: entitlement?.productIdentifier,
                plan: plan || undefined,
                platform: Platform.OS,
                metadata: additionalData,
            });
            console.log('✅ RevenueCat: Logged event:', eventType);
        } catch (error) {
            console.error('❌ RevenueCat: Failed to log event:', error);
        }
    }, [userId, logSubscriptionEvent]);

    /**
     * Initialize RevenueCat SDK
     */
    useEffect(() => {
        async function init() {
            await initializeRevenueCat();
            setIsInitialized(true);
        }
        init();
    }, []);

    /**
     * Log in user when authenticated and fetch data
     */
    useEffect(() => {
        async function setupUser() {
            if (!isInitialized) return;

            setIsLoading(true);

            try {
                if (isSignedIn && userId) {
                    // Log in to RevenueCat with Clerk user ID
                    const info = await loginUser(userId);
                    setCustomerInfo(info);
                    await syncToDatabase(info);
                } else {
                    // Anonymous or logged out
                    await logoutUser();
                    const info = await getCustomerInfo();
                    setCustomerInfo(info);
                }

                // Fetch offerings
                const offers = await getOfferings();
                setOfferings(offers);
            } catch (error) {
                console.error('❌ RevenueCat: Setup error:', error);
            } finally {
                setIsLoading(false);
            }
        }

        setupUser();
    }, [isInitialized, isSignedIn, userId]);

    /**
     * Refresh customer info
     */
    const refreshCustomerInfo = useCallback(async () => {
        const info = await getCustomerInfo();
        setCustomerInfo(info);
        await syncToDatabase(info);
    }, [syncToDatabase]);

    /**
     * Purchase a package
     */
    const purchase = useCallback(async (packageToPurchase: PurchasesPackage): Promise<boolean> => {
        setIsLoading(true);
        try {
            const info = await purchasePackage(packageToPurchase);
            if (info) {
                setCustomerInfo(info);
                await syncToDatabase(info);
                await logEvent('purchase', info, {
                    packageIdentifier: packageToPurchase.identifier,
                });
                return hasProEntitlement(info);
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [syncToDatabase, logEvent]);

    /**
     * Restore purchases
     */
    const restorePurchases = useCallback(async (): Promise<boolean> => {
        setIsLoading(true);
        try {
            const info = await restorePurchasesHelper();
            if (info) {
                setCustomerInfo(info);
                await syncToDatabase(info);
                await logEvent('restore', info);
                return hasProEntitlement(info);
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [syncToDatabase, logEvent]);

    /**
     * Present RevenueCat Paywall
     */
    const presentPaywall = useCallback(async (): Promise<boolean> => {
        try {
            const result = await RevenueCatUI.presentPaywall();

            if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
                await refreshCustomerInfo();
                if (customerInfo) {
                    await logEvent(result === PAYWALL_RESULT.PURCHASED ? 'purchase' : 'restore', customerInfo);
                }
                return true;
            }

            return false;
        } catch (error) {
            console.error('❌ RevenueCat: Paywall error:', error);
            return false;
        }
    }, [refreshCustomerInfo, customerInfo, logEvent]);

    /**
     * Present Paywall only if user doesn't have the entitlement
     */
    const presentPaywallIfNeeded = useCallback(async (): Promise<boolean> => {
        try {
            const result = await RevenueCatUI.presentPaywallIfNeeded({
                requiredEntitlementIdentifier: REVENUECAT_CONFIG.ENTITLEMENT_ID,
            });

            if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
                await refreshCustomerInfo();
                return true;
            }

            // User already has entitlement or dismissed
            return result === PAYWALL_RESULT.NOT_PRESENTED;
        } catch (error) {
            console.error('❌ RevenueCat: Paywall error:', error);
            return false;
        }
    }, [refreshCustomerInfo]);

    /**
     * Present Customer Center for subscription management
     */
    const presentCustomerCenter = useCallback(async (): Promise<void> => {
        try {
            await RevenueCatUI.presentCustomerCenter({
                callbacks: {
                    onRestoreCompleted: async ({ customerInfo: info }) => {
                        setCustomerInfo(info);
                        await syncToDatabase(info);
                    },
                },
            });
        } catch (error) {
            console.error('❌ RevenueCat: Customer center error:', error);
        }
    }, [syncToDatabase]);

    const value: RevenueCatContextType = {
        isInitialized,
        isLoading,
        isProUser,
        customerInfo,
        offerings,
        currentPlan,
        refreshCustomerInfo,
        purchase,
        restorePurchases,
        presentPaywall,
        presentPaywallIfNeeded,
        presentCustomerCenter,
    };

    return (
        <RevenueCatContext.Provider value={value}>
            {children}
        </RevenueCatContext.Provider>
    );
}

/**
 * Hook to access RevenueCat context
 */
export function useRevenueCat(): RevenueCatContextType {
    const context = useContext(RevenueCatContext);
    if (!context) {
        throw new Error('useRevenueCat must be used within a RevenueCatProvider');
    }
    return context;
}

/**
 * Hook to check if user is Pro (convenience)
 */
export function useIsProUser(): boolean {
    const { isProUser } = useRevenueCat();
    return isProUser;
}
