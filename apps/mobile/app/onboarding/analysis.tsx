import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, ImageBackground, Dimensions, ScrollView, Pressable } from "react-native";
import { Text } from "@/components/Themed";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MotiView, MotiText } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";
import { Lock, Sparkles, ArrowRight, Share2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { SanctuaryBackground } from "@/components/SanctuaryUI/Background";
import { FONTS } from "@/constants/Theme";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import {
    generateAnalysisPrompt,
    normalizeSentiment,
    getSentimentColors,
    DreamAnalysisResult,
    DreamSentiment
} from "@/constants/AISchema";

const { width } = Dimensions.get("window");

// Loading messages for the analysis stage
const LOADING_MESSAGES = [
    "Consulting Archetype Database...",
    "Decoding Symbol Patterns...",
    "Analyzing Emotional Landscape...",
    "Preparing Your Interpretation...",
];

export default function AnalysisScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        text: string;
        intent: string;
        age: string;
        sex: string;
        recall: string;
    }>();

    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
    const [analysis, setAnalysis] = useState<DreamAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const messageIndexRef = useRef(0);

    useEffect(() => {
        // Cycle through loading messages
        const messageInterval = setInterval(() => {
            messageIndexRef.current = (messageIndexRef.current + 1) % LOADING_MESSAGES.length;
            setLoadingMessage(LOADING_MESSAGES[messageIndexRef.current]);
        }, 2000);

        // Perform the actual AI analysis
        const analyzeTheDream = async () => {
            try {
                // During onboarding, we don't have a userId yet, so we do a "preview" analysis
                // The actual dream saving happens in auth-gate after authentication

                const dreamText = params.text || "";
                const userIntent = params.intent || "curious";

                // Call the AI directly for a preview (without saving to DB)
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${process.env.EXPO_PUBLIC_OPENROUTER_API_KEY}`,
                        "X-Title": "Lumi App - Onboarding Preview"
                    },
                    body: JSON.stringify({
                        model: "google/gemini-2.0-flash-001",
                        messages: [
                            {
                                role: "system",
                                content: generateAnalysisPrompt(userIntent)
                            },
                            {
                                role: "user",
                                content: dreamText
                            }
                        ],
                        response_format: { type: "json_object" }
                    })
                });

                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error.message || "Analysis failed");
                }

                const content = data.choices?.[0]?.message?.content;
                if (!content) {
                    throw new Error("Empty response from AI");
                }

                const rawResult = JSON.parse(content);

                // Normalize result to ensure strict adherence to schema
                const result: DreamAnalysisResult = {
                    interpretation: rawResult.interpretation || "No interpretation provided.",
                    sentiment: normalizeSentiment(rawResult.sentiment),
                    symbols: Array.isArray(rawResult.symbols) ? rawResult.symbols.slice(0, 5) : [],
                    lumi_quote: rawResult.lumi_quote || "Dreams reflect the hidden self."
                };

                setAnalysis(result);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            } catch (err) {
                console.error("Analysis error:", err);
                setError(String(err));
                // Fallback to a basic analysis if AI fails
                setAnalysis({
                    interpretation: "Your dream contains rich symbolism waiting to be explored. The fragments you've shared hint at deeper currents flowing beneath your waking consciousness. By observing these patterns over time, you may find clearer guidance...",
                    sentiment: "Mystery",
                    symbols: ["Unknown", "Journey", "Transition"],
                    lumi_quote: "Every dream is a doorway, waiting for the right key."
                });
            } finally {
                setLoading(false);
                clearInterval(messageInterval);
            }
        };

        analyzeTheDream();

        return () => clearInterval(messageInterval);
    }, [params.text, params.intent]);

    const handleUnlock = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push({
            pathname: "/onboarding/auth-gate",
            params: {
                ...params,
                // Pass the analysis results so they can be saved after auth
                analysisInterpretation: analysis?.interpretation,
                analysisSentiment: analysis?.sentiment,
                analysisSymbols: analysis?.symbols?.join(","),
                analysisQuote: analysis?.lumi_quote
            }
        });
    };

    // Generate a title from the first symbol or sentiment
    const generateTitle = () => {
        if (!analysis) return "Your Dream";
        const firstSymbol = analysis.symbols?.[0] || "Dream";
        return `The ${firstSymbol}`;
    };

    if (loading) {
        return (
            <SanctuaryBackground>
                <View style={styles.loadingContainer}>
                    <MotiView
                        from={{ scale: 0.8, opacity: 0.5 }}
                        animate={{ scale: 1.1, opacity: 1 }}
                        transition={{ loop: true, type: "timing", duration: 1500 }}
                    >
                        <Sparkles size={64} color="#A78BFA" />
                    </MotiView>
                    <MotiText
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 500 }}
                        style={styles.loadingText}
                    >
                        {loadingMessage}
                    </MotiText>
                </View>
            </SanctuaryBackground>
        );
    }

    const sentimentStyle = getSentimentColors(analysis?.sentiment || "Mystery");

    return (
        <SanctuaryBackground>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>

                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        style={styles.header}
                    >
                        <Text style={styles.overline}>Pattern Detected</Text>
                        <Text style={styles.title}>{generateTitle()}</Text>
                    </MotiView>

                    {/* Result Card */}
                    <MotiView
                        from={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 300 }}
                        style={styles.cardContainer}
                    >
                        {/* Visual Header */}
                        <View style={styles.imagePlaceholder}>
                            <LinearGradient
                                colors={["#4338CA", "#312E81", "#1E1B4B"]}
                                style={StyleSheet.absoluteFill}
                            />
                            <Sparkles size={48} color="rgba(255,255,255,0.2)" />
                        </View>

                        {/* Content */}
                        <View style={styles.cardContent}>
                            {/* Sentiment Tags */}
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
                                        {analysis?.sentiment || "Mystery"}
                                    </Text>
                                </View>
                                {analysis?.symbols?.slice(0, 2).map((symbol, idx) => (
                                    <View key={idx} style={[styles.tag, { backgroundColor: "rgba(99, 102, 241, 0.1)", borderColor: "rgba(99, 102, 241, 0.2)", borderWidth: 1 }]}>
                                        <Text style={[styles.tagText, { color: "#A5B4FC" }]}>{symbol}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Teaser Text - First part of interpretation */}
                            <Text style={styles.analysisText}>
                                {analysis?.interpretation?.substring(0, 200) || "Your dream contains fascinating symbolism..."}
                                {(analysis?.interpretation?.length || 0) > 200 ? "..." : ""}
                            </Text>

                            {/* Blurred Section - Rest of interpretation */}
                            <View style={styles.blurContainer}>
                                <Text style={styles.blurredText}>
                                    {analysis?.interpretation?.substring(200) || analysis?.lumi_quote || "Unlock your full interpretation to discover deeper insights about your subconscious patterns and symbolic meanings..."}
                                </Text>
                                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                                <View style={styles.lockOverlay}>
                                    <Lock size={24} color="#A78BFA" />
                                </View>
                            </View>
                        </View>
                    </MotiView>

                </ScrollView>

                {/* Floating Bottom Action */}
                <MotiView
                    from={{ opacity: 0, translateY: 50 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 800 }}
                    style={styles.footer}
                >
                    <Pressable
                        onPress={handleUnlock}
                        style={styles.button}
                    >
                        <Lock size={20} color="#030014" style={{ marginRight: 8 }} />
                        <Text style={styles.buttonText}>Unlock Full Interpretation & Save</Text>
                        <ArrowRight size={20} color="#030014" style={{ marginLeft: 8 }} />
                    </Pressable>
                </MotiView>

            </SafeAreaView>
        </SanctuaryBackground>
    );
}


const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginTop: 24,
        fontFamily: FONTS.body.medium,
        fontSize: 16,
        color: "rgba(255,255,255,0.7)",
    },
    scrollContainer: {
        padding: 24,
        paddingBottom: 100,
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
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 32,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        overflow: "hidden",
    },
    imagePlaceholder: {
        height: 160,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    cardContent: {
        padding: 24,
    },
    tagsRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    tag: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    tagText: {
        fontFamily: FONTS.body.semiBold,
        fontSize: 13,
    },
    analysisText: {
        fontFamily: FONTS.body.regular,
        fontSize: 17,
        color: "rgba(255,255,255,0.9)",
        lineHeight: 26,
        marginBottom: 8,
    },
    blurContainer: {
        marginTop: 8,
        position: "relative",
        borderRadius: 12, // subtle radius for the blur block
        overflow: 'hidden',
    },
    blurredText: {
        fontFamily: FONTS.body.regular,
        fontSize: 17,
        color: "rgba(255,255,255,0.5)",
        lineHeight: 26,
    },
    lockOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.1)",
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 40,
        // Add gradient to fade out content behind button?
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 56,
        borderRadius: 28,
        backgroundColor: "#A78BFA",
        shadowColor: "#A78BFA",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    buttonText: {
        fontFamily: FONTS.body.bold,
        fontSize: 16,
        color: "#030014",
    },
});
