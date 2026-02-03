import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const saveDream = mutation({
    args: {
        userId: v.string(),
        text: v.optional(v.string()),
        interpretation: v.optional(v.string()),
        sentiment: v.optional(v.string()),
        symbols: v.optional(v.array(v.string())),
        imageUrl: v.optional(v.string()),
        createdAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { createdAt, ...data } = args;
        const dreamId = await ctx.db.insert("dreams", {
            ...data,
            text: args.text ?? "",
            createdAt: createdAt ?? Date.now(),
        });
        return dreamId;
    },
});

export const getDreams = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("dreams")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();
    },
});

export const getDreamById = query({
    args: { id: v.id("dreams") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const updateDream = mutation({
    args: {
        id: v.id("dreams"),
        text: v.string(),
    },
    handler: async (ctx, args) => {
        const { id, text } = args;
        await ctx.db.patch(id, { text });
        return id;
    },
});

export const deleteDream = mutation({
    args: {
        id: v.id("dreams"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
