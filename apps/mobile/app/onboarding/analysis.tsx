import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Dimensions, ScrollView, Pressable, Platform } from "react-native";
import { Text } from "@/components/Themed";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MotiView, MotiText, AnimatePresence } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Lock, Sparkles, ArrowRight, BrainCircuit, Activity, Waves } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { SanctuaryBackground } from "@/components/SanctuaryUI/Background";
import { FONTS } from "@/constants/Theme";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { getSentimentColors } from "@/constants/AISchema";
import { ONBOARDING_GLIMPSES } from "@/constants/OnboardingGlimpses";

import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

const { width, height } = Dimensions.get("window");

type OnboardingAct = "MAPPING" | "REVEAL";

const STATUS_MESSAGES = [
    { title: "Isolating Frequencies", icon: Waves },
    { title: "Consulting Archetypes", icon: BrainCircuit },
    { title: "Mapping Subconscious", icon: Activity },
    { title: "Preparing Synthesis", icon: Sparkles },
];

export default function AnalysisScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{
        text: string;
        intent: string;
        age: string;
        sex: string;
        recall: string;
    }>();

    const [act, setAct] = useState<OnboardingAct>("MAPPING");
    const [statusIndex, setStatusIndex] = useState(0);
    const [preAuthId, setPreAuthId] = useState<string | null>(null);

    // Convex Operations
    const createPreAuth = useMutation(api.dreams.createPreAuthDream);
    const analyzeProactive = useAction(api.ai.analyzeDream);
    const generateImageProactive = useAction(api.ai.generateDreamImage);

    const analysisStarted = useRef(false);

    // Get the synthetic glimpse based on intent
    const glimpse = ONBOARDING_GLIMPSES[params.intent as string] || ONBOARDING_GLIMPSES.default;
    const sentimentStyle = getSentimentColors(glimpse.sentiment);

    useEffect(() => {
        // Start Proactive Analysis immediately
        const startProactiveFlow = async () => {
            if (analysisStarted.current || !params.text) return;
            analysisStarted.current = true;

            try {
                // 1. Create the pre-auth skeleton
                const id = await createPreAuth({ text: params.text });
                setPreAuthId(id);

                // 2. Fire and forget AI actions in the background
                // We don't await these because we want the UI to stay snappy
                analyzeProactive({ preAuthId: id, text: params.text }).catch(e => console.error("Proactive analysis failed", e));
                generateImageProactive({ preAuthId: id, dreamText: params.text }).catch(e => console.error("Proactive image failed", e));

            } catch (err) {
                console.error("Failed to start proactive analysis", err);
            }
        };

        startProactiveFlow();

        // ACT 1: Cycling through status messages (Mapping)
        const statusInterval = setInterval(() => {
            setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
        }, 800);

        // Transition to ACT 2 (Reveal) after 3.2 seconds
        const timer = setTimeout(() => {
            setAct("REVEAL");
            clearInterval(statusInterval);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 3200);

        return () => {
            clearInterval(statusInterval);
            clearTimeout(timer);
        };
    }, [params.text]);

    const handleUnlock = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push({
            pathname: "/onboarding/auth-gate",
            params: {
                ...params,
                preAuthId: preAuthId || undefined
            }
        });
    };

    const StatusIcon = STATUS_MESSAGES[statusIndex].icon;

    return (
        <SanctuaryBackground>
            <View style={{ flex: 1 }}>
                <AnimatePresence exitBeforeEnter>
                    {act === "MAPPING" ? (
                        <MotiView
                            key="mapping"
                            style={styles.mappingContainer}
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: 'timing', duration: 1000 }}
                        >
                            <View style={styles.neuralCore}>
                                <MotiView
                                    animate={{
                                        rotate: '360deg',
                                        scale: [1, 1.2, 1],
                                    }}
                                    transition={{
                                        rotate: { loop: true, duration: 4000, type: 'timing' },
                                        scale: { loop: true, duration: 2000 },
                                    }}
                                    style={styles.neuralRing}
                                />
                                <MotiView
                                    animate={{
                                        opacity: [0.3, 0.7, 0.3],
                                        scale: [0.9, 1.1, 0.9]
                                    }}
                                    transition={{ loop: true, duration: 2000 }}
                                    style={styles.neuralPulse}
                                />
                                <StatusIcon size={40} color="#A78BFA" />
                            </View>

                            <MotiView
                                key={statusIndex}
                                from={{ opacity: 0, translateY: 10 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                exit={{ opacity: 0, translateY: -10 }}
                                transition={{ type: 'timing', duration: 400 }}
                                style={styles.statusTextContainer}
                            >
                                <Text style={styles.statusText}>{STATUS_MESSAGES[statusIndex].title}</Text>
                            </MotiView>
                        </MotiView>
                    ) : (
                        <MotiView
                            key="reveal"
                            style={{ flex: 1 }}
                            from={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'timing', duration: 1000 }}
                        >
                            <ScrollView
                                contentContainerStyle={[
                                    styles.scrollContainer,
                                    { paddingTop: insets.top + (height < 700 ? 10 : 24), paddingBottom: 100 + insets.bottom }
                                ]}
                                showsVerticalScrollIndicator={false}
                            >
                                <MotiView
                                    from={{ opacity: 0, translateY: 20 }}
                                    animate={{ opacity: 1, translateY: 0 }}
                                    transition={{ delay: 200 }}
                                    style={styles.header}
                                >
                                    <Text style={styles.overline}>Threshold Detected</Text>
                                    <Text style={styles.title}>{glimpse.title}</Text>
                                </MotiView>

                                {/* Glimpse Card */}
                                <MotiView
                                    from={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 500 }}
                                    style={styles.cardContainer}
                                >
                                    {/* Visual Header - Archetype Indicator */}
                                    <View style={styles.archetypeHeader}>
                                        <LinearGradient
                                            colors={["rgba(167, 139, 250, 0.2)", "rgba(3, 0, 20, 0.8)"]}
                                            style={StyleSheet.absoluteFill}
                                        />
                                        <MotiView
                                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                                            transition={{ loop: true, duration: 3000 }}
                                        >
                                            <Sparkles size={48} color="#A78BFA" />
                                        </MotiView>
                                        <Text style={styles.archetypeLabel}>{glimpse.archetype}</Text>
                                    </View>

                                    <View style={styles.cardContent}>
                                        <View style={styles.tagsRow}>
                                            <View style={[
                                                styles.tag,
                                                {
                                                    backgroundColor: sentimentStyle.bg,
                                                    borderColor: sentimentStyle.border,
                                                    borderWidth: 1
                                                }
                                            ]}>
                                                <Text style={[styles.tagText, { color: sentimentStyle.text }]}>
                                                    {glimpse.sentiment}
                                                </Text>
                                            </View>
                                            {glimpse.symbols.map((symbol, idx) => (
                                                <View key={idx} style={styles.symbolTag}>
                                                    <Text style={styles.symbolTagText}>{symbol}</Text>
                                                </View>
                                            ))}
                                        </View>

                                        <Text style={styles.analysisText}>
                                            {glimpse.interpretation}
                                        </Text>

                                        {/* Blurred Hook */}
                                        <View style={styles.blurContainer}>
                                            <View style={styles.quoteBox}>
                                                <Text style={styles.quoteText}>"{glimpse.lumi_quote}"</Text>
                                            </View>
                                            <Text style={styles.blurredText}>
                                                The specific fragments of your dream—the rising water, the house of glass, the silent observer—hold the key to this week's psychological transition. Deep synthesis is preparing your full report...
                                            </Text>
                                            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                                            <View style={styles.lockOverlay}>
                                                <Lock size={20} color="#A78BFA" />
                                            </View>
                                        </View>
                                    </View>
                                </MotiView>
                            </ScrollView>

                            <MotiView
                                from={{ opacity: 0, translateY: 50 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ delay: 1000 }}
                                style={[styles.footer, { paddingBottom: 24 + insets.bottom }]}
                            >
                                <Pressable
                                    onPress={handleUnlock}
                                    style={styles.button}
                                >
                                    <Sparkles size={20} color="#030014" style={{ marginRight: 8 }} />
                                    <Text style={styles.buttonText}>Reveal Specific Synthesis</Text>
                                    <ArrowRight size={20} color="#030014" style={{ marginLeft: 8 }} />
                                </Pressable>
                            </MotiView>
                        </MotiView>
                    )}
                </AnimatePresence>
            </View>
        </SanctuaryBackground>
    );
}

const styles = StyleSheet.create({
    mappingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    neuralCore: {
        width: 140,
        height: 140,
        alignItems: "center",
        justifyContent: "center",
    },
    neuralRing: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#A78BFA',
        borderStyle: 'dashed',
        opacity: 0.5,
    },
    neuralPulse: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(167, 139, 250, 0.2)',
    },
    statusTextContainer: {
        marginTop: 40,
        height: 30,
        alignItems: 'center',
    },
    statusText: {
        fontFamily: FONTS.body.medium,
        fontSize: 16,
        color: "rgba(255,255,255,0.6)",
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    scrollContainer: {
        padding: 24,
    },
    header: {
        marginBottom: 24,
        alignItems: "center",
    },
    overline: {
        fontFamily: FONTS.body.medium,
        fontSize: 13,
        color: "#A78BFA",
        textTransform: "uppercase",
        letterSpacing: 2,
        marginBottom: 8,
    },
    title: {
        fontFamily: FONTS.heading.bold,
        fontSize: 32,
        color: "#FFFFFF",
        textAlign: "center",
    },
    cardContainer: {
        backgroundColor: "rgba(255,255,255,0.03)",
        borderRadius: 32,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        overflow: "hidden",
    },
    archetypeHeader: {
        height: 180,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: '#030014',
    },
    archetypeLabel: {
        marginTop: 16,
        fontFamily: FONTS.body.bold,
        fontSize: 12,
        color: '#A78BFA',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    cardContent: {
        padding: 24,
    },
    tagsRow: {
        flexDirection: "row",
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    tag: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    tagText: {
        fontFamily: FONTS.body.bold,
        fontSize: 12,
    },
    symbolTag: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    symbolTagText: {
        color: "rgba(255,255,255,0.5)",
        fontFamily: FONTS.body.medium,
        fontSize: 12,
    },
    analysisText: {
        fontFamily: FONTS.body.regular,
        fontSize: 18,
        color: "rgba(255,255,255,0.9)",
        lineHeight: 28,
        marginBottom: 24,
    },
    blurContainer: {
        marginTop: 10,
        position: "relative",
        borderRadius: 20,
        overflow: 'hidden',
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    quoteBox: {
        marginBottom: 16,
        borderLeftWidth: 2,
        borderLeftColor: '#A78BFA',
        paddingLeft: 12,
    },
    quoteText: {
        fontFamily: FONTS.body.semiBold,
        fontSize: 15,
        color: '#A78BFA',
        fontStyle: 'italic',
    },
    blurredText: {
        fontFamily: FONTS.body.regular,
        fontSize: 16,
        color: "rgba(255,255,255,0.3)",
        lineHeight: 24,
    },
    lockOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(3,0,20,0.1)",
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 56,
        borderRadius: 28,
        backgroundColor: "#A78BFA",
        // Soft Glow
        shadowColor: "#A78BFA",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonText: {
        fontFamily: FONTS.body.bold,
        fontSize: 16,
        color: "#030014",
    },
});
