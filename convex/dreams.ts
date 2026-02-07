import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

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

        // Gamification Logic: Award XP
        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .first();

        if (user) {
            const currentXp = user.xp ?? 0;
            const currentLevel = user.level ?? 1;
            const newXp = currentXp + 10; // Award 10 XP

            // Simple Level Up Logic: Level up every 100 XP
            const nextLevelXp = currentLevel * 100;
            const newLevel = newXp >= nextLevelXp ? currentLevel + 1 : currentLevel;

            // Robust Streak Recalculation
            const allDreams = await ctx.db
                .query("dreams")
                .withIndex("by_user", (q) => q.eq("userId", args.userId))
                .collect();

            // Include the newly inserted dream (it might not be in the query yet depending on transaction state, 
            // but db.insert is usually immediately visible in the same handler)
            const dates = allDreams.map(d => {
                const date = new Date(d.createdAt);
                date.setHours(0, 0, 0, 0);
                return date.getTime();
            });

            // Add current dream date just in case it's not yet in the query
            const curDate = new Date(createdAt ?? Date.now());
            curDate.setHours(0, 0, 0, 0);
            dates.push(curDate.getTime());

            const sortedUniqueDates = Array.from(new Set(dates)).sort((a, b) => b - a);

            let newStreak = 0;
            if (sortedUniqueDates.length > 0) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const yesterday = today.getTime() - 86400000;

                // Only start streak if last entry is today or yesterday
                if (sortedUniqueDates[0] === today.getTime() || sortedUniqueDates[0] === yesterday) {
                    newStreak = 1;
                    let currentCheck = sortedUniqueDates[0];
                    for (let i = 1; i < sortedUniqueDates.length; i++) {
                        const expectedPrev = currentCheck - 86400000;
                        if (sortedUniqueDates[i] === expectedPrev) {
                            newStreak++;
                            currentCheck = expectedPrev;
                        } else {
                            break;
                        }
                    }
                }
            }

            await ctx.db.patch(user._id, {
                xp: newXp,
                level: newLevel,
                lastEntryDate: createdAt ?? Date.now(),
                streak: newStreak,
            });
        }

        if (dreamId) {
            await ctx.scheduler.runAfter(0, api.synthesis.generateSynthesis, { userId: args.userId });
        }

        return dreamId;
    },
});

export const getDreams = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const dreams = await ctx.db
            .query("dreams")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();

        return await Promise.all(
            dreams.map(async (dream) => {
                if (dream.storageId) {
                    const url = await ctx.storage.getUrl(dream.storageId);
                    if (url) {
                        return { ...dream, imageUrl: url };
                    }
                }
                return dream;
            })
        );
    },
});

export const getDreamById = query({
    args: { id: v.id("dreams") },
    handler: async (ctx, args) => {
        const dream = await ctx.db.get(args.id);
        if (!dream) return null;

        if (dream.storageId) {
            const url = await ctx.storage.getUrl(dream.storageId);
            if (url) {
                return { ...dream, imageUrl: url };
            }
        }
        return dream;
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

export const getSymbols = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("symbols").order("desc").collect();
    },
});

export const getSymbolByName = query({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("symbols")
            .withIndex("by_name", (q) => q.eq("name", args.name))
            .first();
    },
});

export const getArchetypes = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("archetypes").order("desc").collect();
    },
});

export const getArchetypeByName = query({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("archetypes")
            .withIndex("by_name", (q) => q.eq("name", args.name))
            .first();
    },
});

export const getEmotions = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("emotions").order("desc").collect();
    },
});

export const getEmotionByName = query({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("emotions")
            .withIndex("by_name", (q) => q.eq("name", args.name))
            .first();
    },
});

export const getUserDiscoveries = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const dreams = await ctx.db
            .query("dreams")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        const symbolCounts = new Map<string, number>();
        const archetypeCounts = new Map<string, number>();
        const emotionCounts = new Map<string, number>();

        // Aggregate counts from dreams
        for (const dream of dreams) {
            dream.dreamSymbols?.forEach((s) =>
                symbolCounts.set(s.symbolId, (symbolCounts.get(s.symbolId) || 0) + 1)
            );
            dream.dreamArchetypes?.forEach((a) =>
                archetypeCounts.set(a.archetypeId, (archetypeCounts.get(a.archetypeId) || 0) + 1)
            );
            dream.dreamEmotions?.forEach((e) =>
                emotionCounts.set(e.emotionId, (emotionCounts.get(e.emotionId) || 0) + 1)
            );
        }

        // Fetch metadata and combine
        const symbols = (
            await Promise.all(
                Array.from(symbolCounts.entries()).map(async ([id, count]) => {
                    const meta = await ctx.db.get(id as any);
                    return meta ? { ...meta, references: count } : null;
                })
            )
        ).filter(Boolean);

        const archetypes = (
            await Promise.all(
                Array.from(archetypeCounts.entries()).map(async ([id, count]) => {
                    const meta = await ctx.db.get(id as any);
                    return meta ? { ...meta, references: count } : null;
                })
            )
        ).filter(Boolean);

        const emotions = (
            await Promise.all(
                Array.from(emotionCounts.entries()).map(async ([id, count]) => {
                    const meta = await ctx.db.get(id as any);
                    return meta ? { ...meta, references: count } : null;
                })
            )
        ).filter(Boolean);

        return {
            symbols,
            archetypes,
            emotions,
        };
    },
});
