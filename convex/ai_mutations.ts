/**
 * Internal mutations for AI operations
 * These cannot be in ai.ts because it has "use node" directive
 */

import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const updateDreamResults = internalMutation({
    args: {
        id: v.optional(v.id("dreams")),
        preAuthId: v.optional(v.id("pre_auth_dreams")),
        text: v.optional(v.string()),
        interpretation: v.optional(v.string()),
        sentiment: v.optional(v.string()),
        secondary_sentiments: v.optional(v.array(v.string())),
        symbols: v.optional(v.array(v.string())),
        archetypes: v.optional(v.array(v.string())),
        lumi_quote: v.optional(v.string()),
        guidance: v.optional(v.string()),
        dreamSymbols: v.optional(v.array(v.object({
            symbolId: v.id("symbols"),
            name: v.string(),
            context: v.string(),
        }))),
        dreamArchetypes: v.optional(v.array(v.object({
            archetypeId: v.id("archetypes"),
            name: v.string(),
            context: v.string(),
        }))),
        dreamEmotions: v.optional(v.array(v.object({
            emotionId: v.id("emotions"),
            name: v.string(),
            context: v.string(),
        }))),
    },
    handler: async (ctx, args) => {
        const { id, preAuthId, ...results } = args;
        if (id) {
            await ctx.db.patch(id, results);
        } else if (preAuthId) {
            await ctx.db.patch(preAuthId, results);
        }
    },
});

export const updateDreamImage = internalMutation({
    args: {
        id: v.optional(v.id("dreams")),
        preAuthId: v.optional(v.id("pre_auth_dreams")),
        imageUrl: v.optional(v.string()),
        storageId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        const updates: any = {
            imageStatus: "completed",
        };

        if (args.imageUrl) updates.imageUrl = args.imageUrl;
        if (args.storageId) updates.storageId = args.storageId;

        if (args.id) {
            await ctx.db.patch(args.id, updates);
        } else if (args.preAuthId) {
            await ctx.db.patch(args.preAuthId, updates);
        }
    },
});

export const updateImageStatus = internalMutation({
    args: {
        id: v.optional(v.id("dreams")),
        preAuthId: v.optional(v.id("pre_auth_dreams")),
        status: v.union(
            v.literal("pending"),
            v.literal("generating"),
            v.literal("completed"),
            v.literal("failed")
        ),
        incrementRetry: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const targetId = args.id || args.preAuthId;
        if (!targetId) return;

        const table = args.id ? "dreams" : "pre_auth_dreams";
        const record = await ctx.db.get(targetId as any);
        if (!record) return;

        const updates: Record<string, any> = {
            imageStatus: args.status,
            imageLastAttempt: Date.now(),
        };

        if (args.incrementRetry) {
            updates.imageRetryCount = ((record as any).imageRetryCount || 0) + 1;
        }

        await ctx.db.patch(targetId as any, updates);
    },
});

export const getFailedDreamImages = internalQuery({
    args: {},
    handler: async (ctx) => {
        const MAX_RETRIES = 3;
        const dreams = await ctx.db
            .query("dreams")
            .withIndex("by_image_status", (q) => q.eq("imageStatus", "failed"))
            .collect();

        // Filter to only those with retry count < 3 and has text
        return dreams
            .filter((d) => (d.imageRetryCount || 0) < MAX_RETRIES && d.text)
            .map((d) => ({ id: d._id, text: d.text }));
    },
});

export const processDreamSymbols = internalMutation({
    args: {
        symbols: v.array(v.object({
            name: v.string(),
            context: v.string(),
            description: v.optional(v.string()),
            category: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        const processedSymbols = [];

        for (const symbol of args.symbols) {
            const normalizedName = symbol.name.trim().toLowerCase();

            const existing = await ctx.db
                .query("symbols")
                .withIndex("by_name", (q) => q.eq("name", normalizedName))
                .first();

            let symbolId;

            if (existing) {
                symbolId = existing._id;
                await ctx.db.patch(existing._id, {
                    references: (existing.references || 0) + 1
                });
            } else {
                symbolId = await ctx.db.insert("symbols", {
                    name: normalizedName,
                    description: symbol.description || "A mysterious symbol from your dreams.",
                    category: symbol.category || "General",
                    references: 1,
                });
            }

            processedSymbols.push({
                symbolId,
                name: normalizedName,
                context: symbol.context
            });
        }

        return processedSymbols;
    },
});

export const processDreamArchetypes = internalMutation({
    args: {
        archetypes: v.array(v.object({
            name: v.string(),
            context: v.string(),
            description: v.optional(v.string()),
            category: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        const processed = [];

        for (const item of args.archetypes) {
            const normalizedName = item.name.trim().toLowerCase();

            const existing = await ctx.db
                .query("archetypes")
                .withIndex("by_name", (q) => q.eq("name", normalizedName))
                .first();

            let archetypeId;

            if (existing) {
                archetypeId = existing._id;
                await ctx.db.patch(existing._id, {
                    references: (existing.references || 0) + 1
                });
            } else {
                archetypeId = await ctx.db.insert("archetypes", {
                    name: normalizedName,
                    description: item.description || "A deep archetype of the collective unconscious.",
                    category: item.category || "General",
                    references: 1,
                });
            }

            processed.push({
                archetypeId,
                name: normalizedName,
                context: item.context
            });
        }

        return processed;
    },
});

export const processDreamEmotions = internalMutation({
    args: {
        emotions: v.array(v.object({
            name: v.string(),
            context: v.string(),
            description: v.optional(v.string()),
            category: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        const processed = [];

        for (const item of args.emotions) {
            const normalizedName = item.name.trim().toLowerCase();

            const existing = await ctx.db
                .query("emotions")
                .withIndex("by_name", (q) => q.eq("name", normalizedName))
                .first();

            let emotionId;

            if (existing) {
                emotionId = existing._id;
                await ctx.db.patch(existing._id, {
                    references: (existing.references || 0) + 1
                });
            } else {
                emotionId = await ctx.db.insert("emotions", {
                    name: normalizedName,
                    description: item.description || "An underlying emotion felt in the dream realm.",
                    category: item.category || "General",
                    references: 1,
                });
            }

            processed.push({
                emotionId,
                name: normalizedName,
                context: item.context
            });
        }

        return processed;
    },
});
