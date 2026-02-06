import React from "react";
import { StyleSheet, Pressable, ScrollView, Dimensions, Platform, View } from "react-native";
import { Text } from "@/components/Themed";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight, Sparkles, TrendingUp, Shield, Moon } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { SanctuaryBackground } from "@/components/SanctuaryUI/Background";
import { FONTS } from "@/constants/Theme";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
// Base design on typical large phone (approx 850px height)
const IS_SMALL_SCREEN = SCREEN_HEIGHT < 750;
const SCALE = SCREEN_HEIGHT < 700 ? 0.85 : SCREEN_HEIGHT < 800 ? 0.92 : 1;

const FEATURES = [
    { icon: Sparkles, text: "Turn confusion into clarity with gentle, guided interpretation" },
    { icon: TrendingUp, text: "Spot the hidden patterns and recurring themes weaving through your life" },
    { icon: Shield, text: "Preserve your journey in a secure, timeless archive" },
    { icon: Moon, text: "Find peace in an environment designed for insight, not engagement" },
];

export default function WelcomeScreen() {
    const router = useRouter();

    const handleBegin = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push("/onboarding/intent");
    };

    return (
        <SanctuaryBackground>
            <SafeAreaView style={styles.container}>
                <View style={styles.contentContainer}>
                    {/* Main Content Area */}
                    <View style={styles.mainWrapper}>

                        {/* Branding */}
                        <MotiView
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: 200 }}
                            style={styles.branding}
                        >
                            <Text style={styles.title}>Lumi</Text>
                            <Text style={styles.tagline}>Your Dream Companion</Text>
                        </MotiView>

                        {/* Body Text */}
                        <MotiView
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: 400 }}
                            style={styles.bodySection}
                        >
                            <Text style={styles.bodyText} numberOfLines={IS_SMALL_SCREEN ? 5 : undefined}>
                                Lumi is the quiet place where you can finally listen.{"\n\n"}
                                Think of this not as a tracker, but as a digital sanctuary - a safe, private space to offload the weight of your dreams, untangle the emotions of the day, and discover what your mind is trying to tell you when the lights go out.
                            </Text>
                        </MotiView>

                        {/* Features */}
                        <MotiView
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: 600 }}
                            style={styles.features}
                        >
                            {FEATURES.map((feature, index) => (
                                <MotiView
                                    key={index}
                                    from={{ opacity: 0, translateX: -20 }}
                                    animate={{ opacity: 1, translateX: 0 }}
                                    transition={{ delay: 700 + index * 100 }}
                                    style={styles.featureRow}
                                >
                                    <View style={styles.featureIconContainer}>
                                        <feature.icon size={16 * SCALE} color="#A78BFA" />
                                    </View>
                                    <Text style={styles.featureText}>{feature.text}</Text>
                                </MotiView>
                            ))}
                        </MotiView>
                    </View>

                    {/* Bottom Actions */}
                    <MotiView
                        from={{ opacity: 0, translateY: 30 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 1200 }}
                        style={styles.bottomSection}
                    >
                        <Pressable style={styles.beginButton} onPress={handleBegin}>
                            <Text style={styles.beginButtonText}>Begin Your Journey</Text>
                            <ArrowRight size={20 * SCALE} color="#030014" />
                        </Pressable>

                        <Text style={styles.terms}>
                            By continuing, you agree to our Terms and Privacy Policy
                        </Text>
                    </MotiView>
                </View>
            </SafeAreaView>
        </SanctuaryBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 28,
        paddingTop: IS_SMALL_SCREEN ? 20 : 40,
        paddingBottom: IS_SMALL_SCREEN ? 20 : 30,
        justifyContent: "space-between",
    },
    mainWrapper: {
        flex: 1,
        justifyContent: "center", // Vertically center the content block
    },

    // Branding
    branding: {
        alignItems: "center",
        marginBottom: 24 * SCALE,
        backgroundColor: "transparent"
    },
    title: {
        fontFamily: FONTS.heading.bold,
        fontSize: 64 * SCALE,
        color: "#fff",
        letterSpacing: -1,
        lineHeight: (70 * SCALE),
    },
    tagline: {
        fontFamily: FONTS.body.semiBold,
        fontSize: 13 * SCALE,
        color: "#A78BFA",
        marginTop: 4 * SCALE,
        textTransform: 'uppercase',
        letterSpacing: 4 * SCALE,
    },

    // Body
    bodySection: {
        marginBottom: 32 * SCALE,
        backgroundColor: "transparent"
    },
    bodyText: {
        fontFamily: FONTS.body.regular,
        fontSize: 17 * SCALE,
        color: "rgba(255,255,255,0.8)",
        textAlign: "center",
        lineHeight: 28 * SCALE,
        letterSpacing: 0.2,
    },

    // Features
    features: {
        gap: 10 * SCALE,
        backgroundColor: "transparent",
        justifyContent: 'center'
    },
    featureRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.03)",
        padding: 14 * SCALE,
        borderRadius: 20 * SCALE,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
    },
    featureIconContainer: {
        width: 32 * SCALE,
        height: 32 * SCALE,
        borderRadius: 16 * SCALE,
        backgroundColor: "rgba(167, 139, 250, 0.15)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14 * SCALE,
    },
    featureText: {
        fontFamily: FONTS.body.medium,
        fontSize: 15 * SCALE,
        color: "#E2E8F0",
        flex: 1,
        lineHeight: 20 * SCALE,
    },

    // Bottom
    bottomSection: {
        marginTop: IS_SMALL_SCREEN ? 20 : 40,
        width: '100%',
        alignItems: 'center',
        gap: 20 * SCALE,
    },
    beginButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        backgroundColor: "#A78BFA",
        paddingVertical: 18 * SCALE,
        width: '100%',
        borderRadius: 30 * SCALE,
        shadowColor: "#A78BFA",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    beginButtonText: {
        fontFamily: FONTS.body.semiBold,
        fontSize: 17 * SCALE,
        color: "#030014",
    },
    terms: {
        fontFamily: FONTS.body.regular,
        fontSize: 11 * SCALE,
        color: "rgba(255,255,255,0.3)",
        textAlign: "center",
    },
});
