import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    dreams: defineTable({
        userId: v.string(),
        text: v.string(),
        interpretation: v.optional(v.string()),
        sentiment: v.optional(v.string()),
        symbols: v.optional(v.array(v.string())),
        lumi_quote: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        createdAt: v.number(),
    }).index("by_user", ["userId"]),
});
