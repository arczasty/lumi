import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Update user's subscription status from RevenueCat
 * Called when a purchase is made or restored
 */
export const updateSubscriptionStatus = mutation({
    args: {
        userId: v.string(),
        subscriptionTier: v.union(v.literal("free"), v.literal("pro")),
        subscriptionPlan: v.optional(v.string()),
        subscriptionExpiresAt: v.optional(v.number()),
        revenuecatCustomerId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .first();

        if (!user) {
            throw new Error("User not found");
        }

        await ctx.db.patch(user._id, {
            subscriptionTier: args.subscriptionTier,
            subscriptionPlan: args.subscriptionPlan,
            subscriptionExpiresAt: args.subscriptionExpiresAt,
            revenuecatCustomerId: args.revenuecatCustomerId,
        });

        return { success: true };
    },
});

/**
 * Log a subscription event for analytics
 */
export const logSubscriptionEvent = mutation({
    args: {
        userId: v.string(),
        eventType: v.string(),
        productId: v.optional(v.string()),
        plan: v.optional(v.string()),
        revenue: v.optional(v.number()),
        currency: v.optional(v.string()),
        transactionId: v.optional(v.string()),
        platform: v.optional(v.string()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("subscription_events", {
            userId: args.userId,
            eventType: args.eventType,
            productId: args.productId,
            plan: args.plan,
            revenue: args.revenue,
            currency: args.currency,
            transactionId: args.transactionId,
            platform: args.platform,
            metadata: args.metadata,
            createdAt: Date.now(),
        });
    },
});

/**
 * Get user's current subscription status
 */
export const getSubscriptionStatus = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .first();

        if (!user) {
            return { tier: "free" as const, plan: null, expiresAt: null };
        }

        return {
            tier: user.subscriptionTier || "free",
            plan: user.subscriptionPlan || null,
            expiresAt: user.subscriptionExpiresAt || null,
        };
    },
});

/**
 * Check if user is a Pro subscriber
 */
export const isProUser = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .first();

        if (!user) return false;

        // Lifetime users never expire
        if (user.subscriptionPlan === "lifetime" && user.subscriptionTier === "pro") {
            return true;
        }

        // Check if subscription is still active
        if (user.subscriptionTier === "pro" && user.subscriptionExpiresAt) {
            return user.subscriptionExpiresAt > Date.now();
        }

        return user.subscriptionTier === "pro";
    },
});

/**
 * Get subscription analytics (admin use)
 */
export const getSubscriptionAnalytics = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 100;

        const events = await ctx.db
            .query("subscription_events")
            .withIndex("by_created")
            .order("desc")
            .take(limit);

        // Calculate basic stats
        const purchases = events.filter((e) => e.eventType === "purchase");
        const cancellations = events.filter((e) => e.eventType === "cancellation");

        const totalRevenue = purchases.reduce((sum, e) => sum + (e.revenue || 0), 0);

        return {
            recentEvents: events,
            stats: {
                totalPurchases: purchases.length,
                totalCancellations: cancellations.length,
                totalRevenue,
            },
        };
    },
});
