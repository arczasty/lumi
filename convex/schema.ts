import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    dreams: defineTable({
        userId: v.string(),
        text: v.string(),
        // Analysis Results
        interpretation: v.optional(v.string()), // The "soulful" interpretation
        sentiment: v.optional(v.string()), // Primary sentiment

        // Detailed Analysis
        secondary_sentiments: v.optional(v.array(v.string())),
        symbols: v.optional(v.array(v.string())), // Legacy string array
        archetypes: v.optional(v.array(v.string())),

        // Structured Symbols (New)
        dreamSymbols: v.optional(v.array(v.object({
            symbolId: v.id("symbols"),
            name: v.string(), // Snapshot of name for easier display
            context: v.string(), // How it appeared in this specific dream
        }))),

        // Structured Archetypes
        dreamArchetypes: v.optional(v.array(v.object({
            archetypeId: v.id("archetypes"),
            name: v.string(),
            context: v.string(),
        }))),

        // Structured Emotions
        dreamEmotions: v.optional(v.array(v.object({
            emotionId: v.id("emotions"),
            name: v.string(),
            context: v.string(),
        }))),

        lumi_quote: v.optional(v.string()),
        guidance: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        storageId: v.optional(v.id("_storage")),
        // Image generation tracking
        imageStatus: v.optional(v.union(
            v.literal("pending"),
            v.literal("generating"),
            v.literal("completed"),
            v.literal("failed")
        )),
        imageRetryCount: v.optional(v.number()),
        imageLastAttempt: v.optional(v.number()),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_image_status", ["imageStatus"]),

    symbols: defineTable({
        name: v.string(), // Unique name (e.g. "Snake")
        description: v.string(), // General Jungian/Universal meaning
        category: v.string(), // e.g. "Animals", "Nature", "Objects"
        references: v.number(), // Counter for usage
    }).index("by_name", ["name"]),

    archetypes: defineTable({
        name: v.string(),
        description: v.string(),
        category: v.optional(v.string()),
        references: v.number(),
    }).index("by_name", ["name"]),

    emotions: defineTable({
        name: v.string(),
        description: v.string(),
        category: v.optional(v.string()),
        references: v.number(),
    }).index("by_name", ["name"]),

    users: defineTable({
        userId: v.string(), // Clerk Subject ID
        email: v.optional(v.string()),
        name: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        storageId: v.optional(v.id("_storage")),
        imageStatus: v.optional(v.union(
            v.literal("pending"),
            v.literal("generating"),
            v.literal("completed"),
            v.literal("failed")
        )),

        // Onboarding Data
        age: v.optional(v.number()),
        sex: v.optional(v.string()), // 'Male', 'Female', 'Non-Binary', 'Prefer not to say'
        dreamFrequency: v.optional(v.string()),
        primaryGoal: v.optional(v.string()), // 'subconscious', 'nightmares', 'lucid', 'curious'
        marketingVibe: v.optional(v.string()), // 'confused', 'inspired', 'anxious', 'neutral'
        onboardingStatus: v.optional(v.string()), // 'completed'

        // Subscription Status (synced from RevenueCat)
        subscriptionTier: v.optional(v.union(v.literal("free"), v.literal("pro"))),
        subscriptionPlan: v.optional(v.string()), // 'monthly', 'yearly', 'lifetime'
        subscriptionExpiresAt: v.optional(v.number()), // Unix timestamp, null for lifetime
        revenuecatCustomerId: v.optional(v.string()),

        // Gamification
        streak: v.optional(v.number()),
        lastEntryDate: v.optional(v.number()),
        xp: v.optional(v.number()),
        level: v.optional(v.number()),

        // Subconscious Synthesis
        lastSynthesis: v.optional(v.string()), // The narrative overview
        lastSynthesisDate: v.optional(v.number()),

        createdAt: v.number(),
    }).index("by_user_id", ["userId"]),

    // Subscription events for analytics
    subscription_events: defineTable({
        userId: v.string(),
        eventType: v.string(), // 'purchase', 'renewal', 'cancellation', 'expiration', 'restore', 'trial_started'
        productId: v.optional(v.string()), // e.g., 'lumi_monthly'
        plan: v.optional(v.string()), // 'monthly', 'yearly', 'lifetime'
        revenue: v.optional(v.number()), // Amount in cents
        currency: v.optional(v.string()), // e.g., 'USD'
        transactionId: v.optional(v.string()),
        platform: v.optional(v.string()), // 'ios', 'android'
        metadata: v.optional(v.any()), // Additional RevenueCat data
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_event_type", ["eventType"])
        .index("by_created", ["createdAt"]),

    pre_auth_dreams: defineTable({
        text: v.string(),
        interpretation: v.optional(v.string()),
        sentiment: v.optional(v.string()),
        secondary_sentiments: v.optional(v.array(v.string())),
        symbols: v.optional(v.array(v.string())),
        archetypes: v.optional(v.array(v.string())),
        lumi_quote: v.optional(v.string()),
        guidance: v.optional(v.string()),
        // Structured Symbols
        dreamSymbols: v.optional(v.array(v.object({
            symbolId: v.id("symbols"),
            name: v.string(),
            context: v.string(),
        }))),
        // Structured Archetypes
        dreamArchetypes: v.optional(v.array(v.object({
            archetypeId: v.id("archetypes"),
            name: v.string(),
            context: v.string(),
        }))),
        // Structured Emotions
        dreamEmotions: v.optional(v.array(v.object({
            emotionId: v.id("emotions"),
            name: v.string(),
            context: v.string(),
        }))),
        imageUrl: v.optional(v.string()),
        storageId: v.optional(v.id("_storage")),
        imageStatus: v.optional(v.union(
            v.literal("pending"),
            v.literal("generating"),
            v.literal("completed"),
            v.literal("failed")
        )),
        imageRetryCount: v.optional(v.number()),
        imageLastAttempt: v.optional(v.number()),
        createdAt: v.number(),
    }).index("by_created", ["createdAt"]),
});
