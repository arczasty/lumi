import { v } from "convex/values";
import { query } from "./_generated/server";

export const getDashboardStats = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const dreams = await ctx.db
            .query("dreams")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc") // Newest first
            .take(100); // Limit to last 100 for stats to keep it fast

        // 1. Calculate Streak (simplified: consecutive days with entries)
        // Note: In a real prod app, you'd likely store/update streak on the User object daily.
        // Here we calculate ad-hoc from recent history.
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const uniqueDays = new Set<number>();
        dreams.forEach(d => {
            const date = new Date(d.createdAt);
            date.setHours(0, 0, 0, 0);
            uniqueDays.add(date.getTime());
        });

        const sortedDays = Array.from(uniqueDays).sort((a, b) => b - a);
        const yesterday = new Date(Date.now() - 86400000);
        yesterday.setHours(0, 0, 0, 0);

        // Calculate discovery count
        const uniqueSymbols = new Set<string>();
        const uniqueArchetypes = new Set<string>();
        const uniqueEmotions = new Set<string>();

        dreams.forEach(d => {
            d.dreamSymbols?.forEach(s => uniqueSymbols.add(s.name));
            d.dreamArchetypes?.forEach(a => uniqueArchetypes.add(a.name));
            d.dreamEmotions?.forEach(e => uniqueEmotions.add(e.name));
        });

        const discoveryCount = uniqueSymbols.size + uniqueArchetypes.size + uniqueEmotions.size;

        // Fetch user for synthesis
        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .first();

        // 2. Sentiment Analysis
        const sentimentCounts: Record<string, number> = {};
        dreams.forEach(d => {
            if (d.sentiment) {
                sentimentCounts[d.sentiment] = (sentimentCounts[d.sentiment] || 0) + 1;
            }
        });

        // 3. Top Symbols
        const symbolCounts: Record<string, number> = {};
        dreams.forEach(d => {
            if (d.dreamSymbols) {
                d.dreamSymbols.forEach(s => {
                    const clean = s.name.trim().toLowerCase();
                    symbolCounts[clean] = (symbolCounts[clean] || 0) + 1;
                });
            }
        });

        const topSymbols = Object.entries(symbolCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        return {
            totalEntries: dreams.length,
            streak: user?.streak ?? 0,
            sentimentCounts,
            topSymbols,
            discoveryCount,
            synthesis: user?.lastSynthesis ? JSON.parse(user.lastSynthesis) : null,
            lastSentiment: dreams[0]?.sentiment,
            recentActivity: dreams.slice(0, 7).map(d => ({ date: d.createdAt, sentiment: d.sentiment }))
        };
    },
});
