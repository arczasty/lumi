import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    dreams: defineTable({
        userId: v.string(),
        text: v.string(),
        interpretation: v.optional(v.string()),
        sentiment: v.optional(v.string()),
        symbols: v.optional(v.array(v.string())),
        imageUrl: v.optional(v.string()),
        audioUrl: v.optional(v.string()),
        audioStorageId: v.optional(v.string()), // For Convex Storage
        createdAt: v.number(),
    }).index("by_user", ["userId"]),
});
