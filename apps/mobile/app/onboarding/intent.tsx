import React, { useState } from "react";
import { StyleSheet, Pressable, ScrollView, Dimensions, View as RNView } from "react-native";
import { Text, View } from "@/components/Themed";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";
import { CloudFog, Ghost, Sparkles, Zap, ArrowRight, Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { SanctuaryBackground } from "@/components/SanctuaryUI/Background";
import { FONTS } from "@/constants/Theme";
import { useWindowDimensions } from "react-native";

const INTENTS = [
    {
        id: "fog",
        label: "The Fog",
        desc: "I want to stop forgetting my dreams.",
        icon: CloudFog,
        color: "#94A3B8", // Slate
    },
    {
        id: "shadow",
        label: "The Shadow",
        desc: "I want to decode anxiety or nightmares.",
        icon: Ghost,
        color: "#6366F1", // Indigo
    },
    {
        id: "mirror",
        label: "The Mirror",
        desc: "I seek spiritual growth and self-knowledge.",
        icon: Sparkles,
        color: "#A78BFA", // Purple
    },
    {
        id: "control",
        label: "The Control",
        desc: "I want to learn Lucid Dreaming.",
        icon: Zap,
        color: "#22D3EE", // Cyan
    },
];

export default function IntentScreen() {
    const router = useRouter();
    const { width, height } = useWindowDimensions();
    const [selected, setSelected] = useState<string | null>(null);

    const handleSelect = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelected(id);
    };

    const handleContinue = () => {
        if (!selected) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push({
            pathname: "/onboarding/traveler",
            params: { intent: selected },
        });
    };

    const scale = height < 700 ? 0.9 : 1;

    return (
        <SanctuaryBackground>
            {/* Use RNView to avoid opaque background from Themed View */}
            <SafeAreaView style={{ flex: 1 }}>
                <RNView style={styles.container}>

                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        style={styles.header}
                    >
                        <Text style={styles.stepIndicator}>Step 1 of 5</Text>
                        <Text style={[styles.title, { fontSize: 32 * scale }]}>What seeks to be resolved?</Text>
                        <Text style={styles.subtitle}>
                            Lumi adapts its interpretive lens based on your primary goal.
                        </Text>
                    </MotiView>

                    <ScrollView
                        contentContainerStyle={styles.optionsContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        {INTENTS.map((item, index) => {
                            const Icon = item.icon;
                            const isSelected = selected === item.id;

                            return (
                                <MotiView
                                    key={item.id}
                                    from={{ opacity: 0, translateX: -20 }}
                                    animate={{ opacity: 1, translateX: 0 }}
                                    transition={{ delay: index * 100 + 300 }}
                                >
                                    <Pressable
                                        onPress={() => handleSelect(item.id)}
                                        style={[
                                            styles.optionCard,
                                            { borderColor: isSelected ? item.color : "rgba(255,255,255,0.1)" },
                                            isSelected && { backgroundColor: "rgba(255,255,255,0.05)" }
                                        ]}
                                    >
                                        <View style={[styles.iconContainer, { backgroundColor: isSelected ? item.color : "rgba(255,255,255,0.05)" }]}>
                                            <Icon size={24} color={isSelected ? "#000" : "#A78BFA"} />
                                        </View>
                                        <View style={styles.textContainer}>
                                            <Text style={[styles.optionLabel, isSelected && { color: item.color }]}>{item.label}</Text>
                                            <Text style={styles.optionDesc}>{item.desc}</Text>
                                        </View>
                                        {isSelected && (
                                            <MotiView from={{ scale: 0 }} animate={{ scale: 1 }}>
                                                <Check size={20} color={item.color} />
                                            </MotiView>
                                        )}
                                    </Pressable>
                                </MotiView>
                            );
                        })}
                    </ScrollView>

                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        style={styles.footer}
                    >
                        <Pressable
                            onPress={handleContinue}
                            style={[
                                styles.button,
                                !selected && styles.buttonDisabled,
                                selected && { backgroundColor: INTENTS.find(i => i.id === selected)?.color || "#A78BFA" }
                            ]}
                            disabled={!selected}
                        >
                            <Text style={[styles.buttonText, { color: "#030014" }]}>Continue</Text>
                            <ArrowRight size={20} color="#030014" />
                        </Pressable>
                    </MotiView>

                </RNView>
            </SafeAreaView>
        </SanctuaryBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        marginTop: 20,
        marginBottom: 32,
        backgroundColor: 'transparent',
    },
    stepIndicator: {
        fontFamily: FONTS.body.medium,
        fontSize: 13,
        color: "rgba(255,255,255,0.5)",
        textTransform: "uppercase",
        letterSpacing: 2,
        marginBottom: 12,
    },
    title: {
        fontFamily: FONTS.heading.bold,
        color: "#FFFFFF",
        marginBottom: 12,
    },
    subtitle: {
        fontFamily: FONTS.body.regular,
        fontSize: 16,
        color: "rgba(255,255,255,0.7)",
        lineHeight: 24,
    },
    optionsContainer: {
        gap: 16,
        paddingBottom: 40,
    },
    optionCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        backgroundColor: "rgba(3,0,20,0.4)", // Darker glass
    },
    textContainer: {
        flex: 1,
        marginLeft: 16,
        backgroundColor: 'transparent',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    optionLabel: {
        fontFamily: FONTS.body.semiBold,
        fontSize: 18,
        color: "#FFFFFF",
        marginBottom: 4,
    },
    optionDesc: {
        fontFamily: FONTS.body.regular,
        fontSize: 14,
        color: "rgba(255,255,255,0.5)",
        lineHeight: 20,
    },
    footer: {
        paddingVertical: 20,
        backgroundColor: 'transparent',
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 56,
        borderRadius: 28,
    },
    buttonDisabled: {
        backgroundColor: "rgba(255,255,255,0.1)",
    },
    buttonText: {
        fontFamily: FONTS.body.bold,
        fontSize: 16,
    },
});
