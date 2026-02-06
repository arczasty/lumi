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

        // Check if today or yesterday has an entry to start the streak
        // If no entry today or yesterday, streak is 0.
        const todayTime = today.getTime();
        const yesterdayTime = todayTime - 86400000;

        if (sortedDays.length > 0) {
            if (sortedDays[0] === todayTime || sortedDays[0] === yesterdayTime) {
                streak = 1;
                // Check backwards
                let currentCheck = sortedDays[0] === todayTime ? todayTime : yesterdayTime;

                for (let i = 1; i < sortedDays.length; i++) {
                    const expectedPrev = currentCheck - 86400000;
                    if (sortedDays[i] === expectedPrev) {
                        streak++;
                        currentCheck = expectedPrev;
                    } else {
                        break;
                    }
                }
            }
        }

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
            if (d.symbols) {
                d.symbols.forEach(s => {
                    // Normalize somewhat
                    const clean = s.trim().toLowerCase();
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
            streak,
            sentimentCounts,
            topSymbols,
            recentActivity: dreams.slice(0, 7).map(d => ({ date: d.createdAt, sentiment: d.sentiment }))
        };
    },
});
