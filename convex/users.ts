import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Creates or updates a user in the database.
 * Usually called after authentication.
 */
export const syncUser = mutation({
    args: {
        userId: v.string(),
        email: v.optional(v.string()),
        name: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .first();

        if (user) {
            // Update existing user if needed
            return user._id;
        }

        // Create new user
        return await ctx.db.insert("users", {
            userId: args.userId,
            email: args.email,
            name: args.name,
            createdAt: Date.now(),
            onboardingStatus: "in_progress",
            xp: 0,
            level: 1,
            streak: 0,
        });
    },
});

/**
 * Updates the dreamer profile during onboarding.
 */
export const updateProfile = mutation({
    args: {
        userId: v.string(),
        dreamFrequency: v.optional(v.string()),
        primaryGoal: v.optional(v.string()),
        marketingVibe: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .first();

        if (!user) throw new Error("User not found");

        await ctx.db.patch(user._id, {
            dreamFrequency: args.dreamFrequency ?? user.dreamFrequency,
            primaryGoal: args.primaryGoal ?? user.primaryGoal,
            marketingVibe: args.marketingVibe ?? user.marketingVibe,
        });
    },
});

/**
 * Marks onboarding as complete.
 */
export const completeOnboarding = mutation({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .first();

        if (!user) throw new Error("User not found");

        await ctx.db.patch(user._id, {
            onboardingStatus: "completed",
        });
    },
});

/**
 * Gets the current user's profile.
 */
export const getUser = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .first();
    },
});
