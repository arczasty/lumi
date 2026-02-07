import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { MODELS } from "./lib/models";
import { getSynthesisSystemPrompt } from "./lib/prompts";

export const getSynthesis = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .first();

        if (!user) return null;

        return {
            content: user.lastSynthesis,
            date: user.lastSynthesisDate,
        };
    },
});

export const updateSynthesis = mutation({
    args: {
        userId: v.string(),
        synthesis: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .first();

        if (user) {
            await ctx.db.patch(user._id, {
                lastSynthesis: args.synthesis,
                lastSynthesisDate: Date.now(),
            });
        }
    },
});

export const generateSynthesis = action({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const MODEL = MODELS.dreamAnalysis;
        const api_key = process.env.OPENROUTER_API_KEY;

        if (!api_key) throw new Error("OPENROUTER_API_KEY is not set");

        // 1. Get last 7-10 dreams
        const dreams = await ctx.runQuery(api.dreams.getDreams, {
            userId: args.userId,
        });

        if (!dreams || dreams.length < 2) return null; // Need at least 2 dreams for a synthesis

        // 2. Format dream data for prompt
        // Take up to 10
        const recentDreams = dreams.slice(0, 10);
        const dreamData = recentDreams.map((d: any) => ({
            date: new Date(d.createdAt).toLocaleDateString(),
            text: d.text.slice(0, 500),
            sentiment: d.sentiment
        }));

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${api_key}`,
                    "Content-Type": "application/json",
                    "X-Title": "Lumi App",
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        { role: "system", content: getSynthesisSystemPrompt() },
                        { role: "user", content: `Here are my recent dreams: ${JSON.stringify(dreamData)}` }
                    ],
                    response_format: { type: "json_object" }
                })
            });

            const data = await response.json() as any;
            const content = data.choices?.[0]?.message?.content;

            if (content) {
                await ctx.runMutation(api.synthesis.updateSynthesis, {
                    userId: args.userId,
                    synthesis: content
                });
                return JSON.parse(content);
            }
        } catch (error) {
            console.error("Synthesis generation failed:", error);
            return null;
        }

        return null;
    }
});
