import React from "react";
import { StyleSheet, ScrollView, Pressable, View } from "react-native";
import { Text } from "@/components/Themed";
import { SanctuaryBackground } from "@/components/SanctuaryUI/Background";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Sparkles, Moon, TrendingUp, BookOpen } from "lucide-react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { LumiLoader } from "@/components/SanctuaryUI/LumiLoader";
import { StreakOrb } from "@/components/Insights/StreakOrb";
import { SentimentSpectrum } from "@/components/Insights/SentimentSpectrum";
import { SymbolCloud } from "@/components/Insights/SymbolCloud";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { FONTS } from "@/constants/Theme";

export default function InsightsScreen() {
    const { userId } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const stats = useQuery(api.insights.getDashboardStats, userId ? { userId } : "skip");
    const userData = useQuery(api.users.getUser, userId ? { userId } : "skip");

    const firstName = user?.firstName || "Dreamer";
    const currentLevel = userData?.level ?? 1;
    const currentXp = userData?.xp ?? 0;
    const nextLevelXp = currentLevel * 100;
    const xpProgress = Math.min((currentXp / nextLevelXp) * 100, 100);
    const streak = stats?.streak ?? 0;
    const hasDreams = stats && stats.totalEntries > 0;

    // Show loading only when signed in and still fetching
    if (userId && stats === undefined) {
        return (
            <SanctuaryBackground>
                <View style={styles.center}>
                    <LumiLoader />
                </View>
            </SanctuaryBackground>
        );
    }

    return (
        <SanctuaryBackground>
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Insights</Text>
                    </View>

                    {/* Compact Profile Card */}
                    <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 50 }}>
                        <View style={styles.card}>
                            <View style={styles.profileHeader}>
                                <View style={styles.profileTextContainer}>
                                    <Text style={styles.profileName}>{firstName}</Text>
                                    <Text style={styles.profileLevel}>Level {currentLevel} Dreamer</Text>
                                </View>
                                <StreakOrb streak={streak} />
                            </View>

                            {/* XP Progress */}
                            <View style={styles.xpProgressContainer}>
                                <View style={styles.progressBg}>
                                    <MotiView
                                        style={[styles.progressFill, { width: `${xpProgress}%` }]}
                                        animate={{ width: `${xpProgress}%` }}
                                        transition={{ type: "timing", duration: 800 }}
                                    />
                                </View>
                                <Text style={styles.xpValue}>{currentXp} <Text style={styles.xpTotal}>/ {nextLevelXp} XP</Text></Text>
                            </View>
                        </View>
                    </MotiView>


                    {/* Stats Overview - Always visible */}
                    <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 150 }} style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <BookOpen size={20} color="#A78BFA" />
                            <Text style={styles.statValue}>{stats?.totalEntries ?? 0}</Text>
                            <Text style={styles.statLabel}>Dreams</Text>
                        </View>
                        <View style={styles.statCard}>
                            <TrendingUp size={20} color="#A78BFA" />
                            <Text style={styles.statValue}>{streak}</Text>
                            <Text style={styles.statLabel}>Night Streak</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Sparkles size={20} color="#A78BFA" />
                            <Text style={styles.statValue}>{stats?.discoveryCount ?? 0}</Text>
                            <Text style={styles.statLabel}>Meanings</Text>
                        </View>
                    </MotiView>

                    {/* Content based on dream availability */}
                    {!hasDreams ? (
                        // Empty state - but profile is still shown above
                        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 250 }}>
                            <View style={styles.emptyCard}>
                                <Moon size={40} color="#A78BFA" strokeWidth={1.5} />
                                <Text style={styles.emptyTitle}>Start Your Journey</Text>
                                <Text style={styles.emptyText}>Record dreams to unlock insights about your subconscious patterns</Text>
                                <Pressable
                                    style={styles.ctaButton}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                        router.push("/(tabs)");
                                    }}
                                >
                                    <Text style={styles.ctaText}>Record a Dream</Text>
                                </Pressable>
                            </View>
                        </MotiView>
                    ) : (
                        <>
                            {/* Subconscious Synthesis Card */}
                            <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 250 }} style={styles.synthesisCard}>
                                <View style={styles.synthesisHeader}>
                                    <Sparkles size={18} color="#A78BFA" />
                                    <Text style={styles.synthesisLabel}>Subconscious Synthesis</Text>
                                </View>

                                {stats?.synthesis ? (
                                    <>
                                        <Text style={styles.synthesisText}>
                                            {stats.synthesis.synthesis}
                                        </Text>
                                        <View style={styles.synthesisFooter}>
                                            <View style={styles.archetypeTag}>
                                                <Moon size={12} color="#2DD4BF" />
                                                <Text style={styles.archetypeTagName}>{stats.synthesis.dominant_archetype}</Text>
                                            </View>
                                            <Text style={styles.synthesisGuidance}>
                                                {stats.synthesis.guidance}
                                            </Text>
                                        </View>
                                    </>
                                ) : (
                                    <View style={styles.generatingContainer}>
                                        <Text style={styles.generatingText}>Lumi is weaving your patterns...</Text>
                                        <Text style={styles.generatingSub}>Insights typically emerge after multiple entries.</Text>
                                    </View>
                                )}
                            </MotiView>

                            {/* Legacy sections removed - Focusing on Synthesis */}
                        </>
                    )}

                </ScrollView>
            </SafeAreaView>
        </SanctuaryBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    scrollContent: { padding: 20, paddingBottom: 120 },
    // Header
    header: { marginBottom: 24, backgroundColor: "transparent" },
    title: { fontFamily: FONTS.heading.bold, fontSize: 28, color: "#fff" },
    // Profile Card
    card: {
        backgroundColor: "rgba(255,255,255,0.03)",
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
        marginBottom: 16,
    },
    profileHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10, // Reduced from 20 to tighten spacing
        backgroundColor: "transparent"
    },
    profileTextContainer: {
        flex: 1,
        backgroundColor: "transparent"
    },
    profileName: { fontFamily: FONTS.heading.bold, fontSize: 24, color: "#fff" },
    profileLevel: { fontFamily: FONTS.body.regular, fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 4 },
    xpProgressContainer: {
        backgroundColor: "transparent",
        gap: 12,
    },
    progressBg: { height: 6, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" },
    progressFill: { height: "100%", backgroundColor: "#A78BFA", borderRadius: 3 },
    xpValue: {
        fontFamily: FONTS.body.bold,
        fontSize: 12,
        color: "#fff",
        alignSelf: 'flex-end',
    },
    xpTotal: {
        color: "rgba(255,255,255,0.4)",
        fontFamily: FONTS.body.regular,
    },
    // Stats Row
    statsRow: { flexDirection: "row", gap: 12, marginBottom: 16, backgroundColor: "transparent" },
    statCard: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.03)",
        borderRadius: 20,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
        gap: 6,
    },
    statValue: { fontFamily: FONTS.heading.semiBold, fontSize: 24, color: "#A78BFA" },
    statLabel: { fontFamily: FONTS.body.regular, fontSize: 11, color: "rgba(255,255,255,0.4)" },
    // Section Title
    sectionTitle: { fontFamily: FONTS.body.semiBold, fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 16 },
    // Empty State Card
    emptyCard: {
        backgroundColor: "rgba(255,255,255,0.04)",
        borderRadius: 16,
        padding: 32,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
        borderStyle: "dashed",
        gap: 12,
    },
    emptyTitle: { fontFamily: FONTS.heading.semiBold, fontSize: 20, color: "#fff", textAlign: "center" },
    emptyText: { fontFamily: FONTS.body.regular, fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 20 },
    ctaButton: { marginTop: 12, backgroundColor: "#A78BFA", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
    ctaText: { fontFamily: FONTS.body.bold, fontSize: 15, color: "#0A0A0F" },
    // Synthesis Card
    synthesisCard: {
        backgroundColor: "rgba(255,255,255,0.04)",
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: "rgba(167,139,250,0.15)",
        marginBottom: 16,
    },
    synthesisHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    synthesisLabel: {
        fontFamily: FONTS.heading.semiBold,
        fontSize: 14,
        color: '#A78BFA',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    synthesisText: {
        fontFamily: FONTS.body.regular,
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 26,
        marginBottom: 20,
    },
    synthesisFooter: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        paddingTop: 16,
        gap: 12,
    },
    archetypeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(45, 212, 191, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    archetypeTagName: {
        fontFamily: FONTS.body.bold,
        fontSize: 12,
        color: '#2DD4BF',
    },
    synthesisGuidance: {
        fontFamily: FONTS.body.medium,
        fontSize: 14,
        color: '#2DD4BF', // Teal
        fontStyle: 'italic',
    },
    generatingContainer: {
        paddingVertical: 20,
        alignItems: 'center',
        gap: 8,
    },
    generatingText: {
        fontFamily: FONTS.body.medium,
        fontSize: 15,
        color: 'rgba(255,255,255,0.6)',
    },
    generatingSub: {
        fontFamily: FONTS.body.regular,
        fontSize: 12,
        color: 'rgba(255,255,255,0.3)',
    },
});
