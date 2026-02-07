import React from "react";
import { StyleSheet, ScrollView, Pressable, View, Modal, TextInput, Alert, Platform, KeyboardAvoidingView } from "react-native";
import { Text } from "@/components/Themed";
import { SanctuaryBackground } from "@/components/SanctuaryUI/Background";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Sparkles, Moon, TrendingUp, BookOpen, Camera, Edit2, X, Check } from "lucide-react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { LumiLoader } from "@/components/SanctuaryUI/LumiLoader";
import { StreakOrb } from "@/components/Insights/StreakOrb";
import { SentimentSpectrum } from "@/components/Insights/SentimentSpectrum";
import { SymbolCloud } from "@/components/Insights/SymbolCloud";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { FONTS } from "@/constants/Theme";
import { BlurView } from "expo-blur";
import * as ImagePicker from 'expo-image-picker';
import { useIsProUser } from "@/contexts/RevenueCatContext";

export default function InsightsScreen() {
    const { userId } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const isProUser = useIsProUser();
    const stats = useQuery(api.insights.getDashboardStats, userId ? { userId } : "skip");
    const userData = useQuery(api.users.getUser, userId ? { userId } : "skip");

    const firstName = user?.firstName || "Dreamer";
    const [isEditingName, setIsEditingName] = React.useState(false);
    const [newName, setNewName] = React.useState(user?.fullName || "");
    const [isUploading, setIsUploading] = React.useState(false);

    const handlePickAvatar = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled && result.assets[0].uri) {
                setIsUploading(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

                const asset = result.assets[0];
                const response = await fetch(asset.uri);
                const blob = await response.blob();

                // Clerk requires a valid image mime type
                if (!blob.type.startsWith('image/')) {
                    console.error("Invalid blob type:", blob.type);
                    throw new Error(`Invalid image format: ${blob.type}`);
                }

                await user?.setProfileImage({
                    file: blob,
                });

                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error) {
            console.error("Failed to update avatar:", error);
            Alert.alert("Error", "Failed to update avatar. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateName = async () => {
        if (!newName.trim()) return;

        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const nameParts = newName.trim().split(" ");
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

            await user?.update({
                firstName,
                lastName,
            });

            setIsEditingName(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            console.error("Failed to update name:", error);
            Alert.alert("Error", "Failed to update name.");
        }
    };
    const currentLevel = userData?.level ?? 1;
    const currentXp = userData?.xp ?? 0;
    const nextLevelXp = 100 * Math.pow(currentLevel, 2);
    // Simple progress based on total XP vs next threshold
    // For a more granular bar (0-100% of current level), we'd need:
    // const prevLevelXp = 100 * Math.pow(currentLevel - 1, 2);
    // const levelRange = nextLevelXp - prevLevelXp;
    // const progressInLevel = currentXp - prevLevelXp;
    // const xpProgress = (progressInLevel / levelRange) * 100;

    // But keeping it simple for now to match UI design (showing Total XP)
    const xpProgress = Math.min((currentXp / nextLevelXp) * 100, 100);
    const streak = stats?.streak ?? 0;
    const hasDreams = stats && stats.totalEntries > 0;

    if (userId && stats === undefined) {
        return (
            <View style={{ flex: 1 }}>
                <SanctuaryBackground>
                    <LumiLoader />
                </SanctuaryBackground>
            </View>
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
                                <Pressable
                                    onPress={handlePickAvatar}
                                    disabled={isUploading}
                                    style={styles.avatarPressable}
                                >
                                    <Image
                                        source={{ uri: user?.imageUrl || "https://avatar.vercel.sh/lumi" }}
                                        style={[styles.avatar, isUploading && { opacity: 0.5 }]}
                                    />
                                    <View style={styles.cameraIconBadge}>
                                        <Camera size={12} color="#fff" />
                                    </View>
                                </Pressable>
                                <View style={styles.profileTextContainer}>
                                    <Pressable
                                        onPress={() => {
                                            setNewName(user?.fullName || "");
                                            setIsEditingName(true);
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        }}
                                        style={styles.namePressable}
                                    >
                                        <View style={styles.nameRow}>
                                            <Text style={styles.profileName}>{user?.fullName || firstName}</Text>
                                        </View>
                                        <Text style={styles.profileEmail}>{user?.primaryEmailAddress?.emailAddress}</Text>
                                    </Pressable>
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
                                <View style={styles.xpTextRow}>
                                    <Text style={styles.xpValue}>{currentXp} <Text style={styles.xpTotal}>/ {nextLevelXp} XP</Text></Text>
                                </View>
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
                            <MotiView
                                from={{ opacity: 0, translateY: 20 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ delay: 250 }}
                                style={[styles.synthesisCard, !isProUser && styles.synthesisCardCompact]}
                            >
                                <View style={styles.synthesisHeader}>
                                    <View style={styles.synthesisTitleRow}>
                                        <Sparkles size={18} color="#A78BFA" />
                                        <Text style={styles.synthesisLabel}>Subconscious Synthesis</Text>
                                    </View>
                                    {!isProUser && (
                                        <View style={styles.proBadgeMini}>
                                            <Text style={styles.proBadgeMiniText}>PRO</Text>
                                        </View>
                                    )}
                                </View>

                                {isProUser ? (
                                    stats?.synthesis ? (
                                        <View style={styles.synthesisContentContainer}>
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
                                        </View>
                                    ) : (
                                        <View style={styles.generatingContainer}>
                                            <Text style={styles.generatingText}>Lumi is weaving your patterns...</Text>
                                            <Text style={styles.generatingSub}>Insights typically emerge after multiple entries.</Text>
                                        </View>
                                    )
                                ) : (
                                    /* Compact Teaser for Free Users */
                                    <View style={styles.teaserContent}>
                                        <Text style={styles.teaserText}>
                                            Unlock the hidden patterns and recurring archetypes woven through your latest dreams.
                                        </Text>
                                        <Pressable
                                            style={styles.unlockButton}
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                                                router.push('/onboarding/paywall');
                                            }}
                                        >
                                            <Sparkles size={16} color="#030014" />
                                            <Text style={styles.unlockButtonText}>Envision Synthesis</Text>
                                        </Pressable>
                                    </View>
                                )}
                            </MotiView>

                            {/* Legacy sections removed - Focusing on Synthesis */}
                        </>
                    )}

                </ScrollView>

                {/* Name Edit Modal */}
                <Modal
                    visible={isEditingName}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setIsEditingName(false)}
                >
                    <BlurView intensity={60} tint="dark" style={styles.modalOverlay}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.modalContent}
                        >
                            <View style={styles.modalCard}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Update Identity</Text>
                                    <Pressable onPress={() => setIsEditingName(false)}>
                                        <X size={20} color="rgba(255,255,255,0.5)" />
                                    </Pressable>
                                </View>

                                <Text style={styles.modalLabel}>WHAT NAME SHALL THE VOID REMEMBER?</Text>

                                <TextInput
                                    style={styles.modalInput}
                                    value={newName}
                                    onChangeText={setNewName}
                                    placeholder="Enter your name"
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    autoFocus
                                    maxLength={30}
                                />

                                <View style={styles.modalActions}>
                                    <Pressable
                                        style={[styles.modalButton, styles.cancelButton]}
                                        onPress={() => setIsEditingName(false)}
                                    >
                                        <Text style={styles.cancelButtonText}>Recall</Text>
                                    </Pressable>
                                    <Pressable
                                        style={[styles.modalButton, styles.saveButton]}
                                        onPress={handleUpdateName}
                                    >
                                        <Check size={18} color="#030014" style={{ marginRight: 6 }} />
                                        <Text style={styles.saveButtonText}>Confirm</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </BlurView>
                </Modal>
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
        gap: 16,
        marginBottom: 20,
        backgroundColor: "transparent"
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: 'rgba(167, 139, 250, 0.4)',
    },
    profileTextContainer: {
        flex: 1,
        backgroundColor: "transparent"
    },
    profileName: { fontFamily: FONTS.heading.bold, fontSize: 24, color: "#fff" },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    namePressable: {
        backgroundColor: 'transparent',
    },
    avatarPressable: {
        position: 'relative',
        backgroundColor: 'transparent',
    },
    cameraIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#A78BFA',
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#030014',
    },
    profileEmail: { fontFamily: FONTS.body.regular, fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 },
    profileLevel: { fontFamily: FONTS.body.semiBold, fontSize: 12, color: "#A78BFA", marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
    xpProgressContainer: {
        backgroundColor: "transparent",
        gap: 8,
    },
    progressBg: { height: 6, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" },
    progressFill: { height: "100%", backgroundColor: "#A78BFA", borderRadius: 3 },
    xpTextRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
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
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    synthesisTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    proBadgeMini: {
        backgroundColor: 'rgba(167, 139, 250, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(167, 139, 250, 0.3)',
    },
    proBadgeMiniText: {
        fontFamily: FONTS.body.bold,
        fontSize: 10,
        color: '#A78BFA',
    },
    synthesisContentContainer: {
        position: 'relative',
    },
    synthesisCardCompact: {
        padding: 20,
    },
    teaserContent: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    teaserText: {
        fontFamily: FONTS.body.regular,
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    unlockButton: {
        backgroundColor: '#A78BFA',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        marginBottom: 10,
    },
    unlockButtonText: {
        fontFamily: FONTS.body.bold,
        fontSize: 14,
        color: '#030014',
    },
    lockReason: {
        fontFamily: FONTS.body.medium,
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
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
    // Modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '100%',
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    modalCard: {
        width: '100%',
        backgroundColor: 'rgba(3, 0, 20, 0.85)',
        borderRadius: 32,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(167, 139, 250, 0.3)',
        gap: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    modalTitle: {
        fontFamily: FONTS.heading.bold,
        fontSize: 22,
        color: '#fff',
    },
    modalLabel: {
        fontFamily: FONTS.body.bold,
        fontSize: 11,
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: 2,
    },
    modalInput: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        color: '#fff',
        fontFamily: FONTS.body.medium,
        fontSize: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        backgroundColor: 'transparent',
    },
    modalButton: {
        flex: 1,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    cancelButton: {
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    saveButton: {
        backgroundColor: '#A78BFA',
    },
    cancelButtonText: {
        fontFamily: FONTS.body.bold,
        fontSize: 16,
        color: 'rgba(255,255,255,0.5)',
    },
    saveButtonText: {
        fontFamily: FONTS.body.bold,
        fontSize: 16,
        color: '#030014',
    },
});
