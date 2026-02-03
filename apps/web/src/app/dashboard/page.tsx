"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Loader2, Moon, Sparkles, Calendar } from "lucide-react";
import { Doc } from "../../../convex/_generated/dataModel";

export default function Dashboard() {
    const { user, isLoaded } = useUser();
    const dreams = useQuery(api.dreams.getDreams, user ? { userId: user.id } : "skip");

    if (!isLoaded || dreams === undefined) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#030014]">
                <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 bg-[#030014] p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Dream Journal</h1>
                        <p className="text-gray-500">{dreams.length} patterns woven into time</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                        <span className="flex items-center gap-2 text-teal-400">
                            <Sparkles className="w-4 h-4" />
                            {dreams.length > 0 ? "Insights evolving" : "Awaiting first dream"}
                        </span>
                    </div>
                </header>

                {dreams.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-white/5 rounded-3xl">
                        <Moon className="w-12 h-12 text-gray-700 mb-6" />
                        <h3 className="text-xl font-medium mb-2">Your journal is a blank page</h3>
                        <p className="text-gray-500 max-w-sm">
                            Use the Lumi mobile app to record your first dream and see it analyzed here.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dreams.map((dream: Doc<"dreams">) => (
                            <div
                                key={dream._id}
                                className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all group backdrop-blur-xl"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(dream.createdAt).toLocaleDateString()}
                                    </div>
                                    {dream.sentiment && (
                                        <span className="px-2 py-1 rounded-md bg-teal-500/10 text-teal-400 text-[10px] font-bold uppercase tracking-wider border border-teal-500/20">
                                            {dream.sentiment}
                                        </span>
                                    )}
                                </div>

                                <p className="text-gray-200 line-clamp-3 mb-6 leading-relaxed">
                                    {dream.text}
                                </p>

                                {dream.symbols && dream.symbols.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {dream.symbols.slice(0, 3).map((symbol: string) => (
                                            <span key={symbol} className="text-[11px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20">
                                                {symbol}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {dream.interpretation && (
                                    <div className="pt-6 border-t border-white/5">
                                        <h4 className="flex items-center gap-2 text-xs font-semibold text-teal-400 mb-2">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            Lumi Insight
                                        </h4>
                                        <p className="text-xs text-gray-400 italic line-clamp-2 leading-relaxed">
                                            {dream.interpretation}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
