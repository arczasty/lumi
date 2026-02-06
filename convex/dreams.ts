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

            await ctx.db.patch(user._id, {
                xp: newXp,
                level: newLevel,
                lastEntryDate: Date.now(),
                // Streak logic could go here (check if lastEntryDate was yesterday)
            });
        }

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
