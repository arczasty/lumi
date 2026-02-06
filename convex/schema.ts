import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    dreams: defineTable({
        userId: v.string(),
        text: v.string(),
        interpretation: v.optional(v.string()),
        sentiment: v.optional(v.string()),
        secondary_sentiments: v.optional(v.array(v.string())),
        symbols: v.optional(v.array(v.string())),
        archetypes: v.optional(v.array(v.string())),
        lumi_quote: v.optional(v.string()),
        guidance: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        createdAt: v.number(),
    }).index("by_user", ["userId"]),

    users: defineTable({
        userId: v.string(), // Clerk Subject ID
        email: v.optional(v.string()),
        name: v.optional(v.string()),

        // Onboarding Data
        dreamFrequency: v.optional(v.string()),
        primaryGoal: v.optional(v.string()), // 'subconscious', 'nightmares', 'lucid', 'curious'
        marketingVibe: v.optional(v.string()), // 'confused', 'inspired', 'anxious', 'neutral'
        onboardingStatus: v.optional(v.string()), // 'completed'

        // Gamification
        streak: v.optional(v.number()),
        lastEntryDate: v.optional(v.number()),
        xp: v.optional(v.number()),
        level: v.optional(v.number()),

        createdAt: v.number(),
    }).index("by_user_id", ["userId"]),
});
