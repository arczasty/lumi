import React, { useState } from "react";
import { StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, View as RNView } from "react-native";
import { Text, View } from "@/components/Themed";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { SanctuaryBackground } from "@/components/SanctuaryUI/Background";
import { FONTS } from "@/constants/Theme";
import { useWindowDimensions } from "react-native";

const SEX_OPTIONS = ["Male", "Female", "Non-Binary", "Prefer not to say"];

export default function TravelerScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { width, height } = useWindowDimensions();

    const [age, setAge] = useState("");
    const [sex, setSex] = useState<string | null>(null);

    const handleContinue = () => {
        if (!age || !sex) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push({
            pathname: "/onboarding/signal",
            params: { ...params, age, sex },
        });
    };

    const scale = height < 700 ? 0.9 : 1;
    const isValid = age.length > 0 && sex !== null;

    return (
        <SanctuaryBackground>
            {/* Use RNView to avoid opaque background from Themed View */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <SafeAreaView style={{ flex: 1 }}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ flex: 1 }}
                    >
                        <RNView style={styles.container}>

                            <MotiView
                                from={{ opacity: 0, translateY: 10 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                style={styles.header}
                            >
                                <Text style={styles.stepIndicator}>Step 2 of 5</Text>
                                <Text style={[styles.title, { fontSize: 32 * scale }]}>Who is the Dreamer?</Text>
                                <Text style={styles.subtitle}>
                                    Symbolism often shifts with life stages and identity. This data helps Lumi select the correct psychological archetypes for you.
                                </Text>
                            </MotiView>

                            <RNView style={styles.inputSection}>
                                {/* Input 1: Age */}
                                <MotiView
                                    from={{ opacity: 0, translateX: -10 }}
                                    animate={{ opacity: 1, translateX: 0 }}
                                    transition={{ delay: 300 }}
                                    style={styles.fieldContainer}
                                >
                                    <Text style={styles.label}>Years around the Sun</Text>
                                    <TextInput
                                        style={styles.ageInput}
                                        placeholder="e.g. 28"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        keyboardType="number-pad"
                                        maxLength={3}
                                        value={age}
                                        onChangeText={setAge}
                                    />
                                </MotiView>

                                {/* Input 2: Sex */}
                                <MotiView
                                    from={{ opacity: 0, translateX: -10 }}
                                    animate={{ opacity: 1, translateX: 0 }}
                                    transition={{ delay: 400 }}
                                    style={styles.fieldContainer}
                                >
                                    <Text style={styles.label}>Identity</Text>
                                    <Text style={styles.helperText}>Used solely for Jungian archetype mapping (e.g., Anima/Animus).</Text>

                                    <RNView style={styles.chipsContainer}>
                                        {SEX_OPTIONS.map((option) => {
                                            const isSelected = sex === option;
                                            return (
                                                <Pressable
                                                    key={option}
                                                    onPress={() => {
                                                        Haptics.selectionAsync();
                                                        setSex(option);
                                                    }}
                                                    style={[
                                                        styles.chip,
                                                        isSelected && styles.chipSelected
                                                    ]}
                                                >
                                                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                                                        {option}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </RNView>
                                </MotiView>
                            </RNView>

                            <MotiView
                                from={{ opacity: 0, translateY: 20 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                style={styles.footer}
                            >
                                <Pressable
                                    onPress={handleContinue}
                                    style={[
                                        styles.button,
                                        !isValid && styles.buttonDisabled
                                    ]}
                                    disabled={!isValid}
                                >
                                    <Text style={[styles.buttonText, { color: isValid ? "#030014" : "rgba(255,255,255,0.3)" }]}>Continue</Text>
                                    <ArrowRight size={20} color={isValid ? "#030014" : "rgba(255,255,255,0.3)"} />
                                </Pressable>
                            </MotiView>

                        </RNView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </TouchableWithoutFeedback>
        </SanctuaryBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: "space-between",
    },
    header: {
        marginTop: 20,
        marginBottom: 24,
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
    inputSection: {
        flex: 1,
        gap: 32,
    },
    fieldContainer: {
        gap: 8,
    },
    label: {
        fontFamily: FONTS.body.semiBold,
        fontSize: 18,
        color: "#FFFFFF",
        marginBottom: 4,
    },
    helperText: {
        fontFamily: FONTS.body.regular,
        fontSize: 14,
        color: "rgba(255,255,255,0.5)",
        marginBottom: 12,
        lineHeight: 20,
    },
    ageInput: {
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        borderRadius: 16,
        padding: 16,
        color: "#FFFFFF",
        fontFamily: FONTS.body.medium,
        fontSize: 18,
    },
    chipsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    chip: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    chipSelected: {
        backgroundColor: "#A78BFA",
        borderColor: "#A78BFA",
    },
    chipText: {
        fontFamily: FONTS.body.medium,
        fontSize: 15,
        color: "rgba(255,255,255,0.8)",
    },
    chipTextSelected: {
        color: "#030014",
        fontFamily: FONTS.body.semiBold,
    },
    footer: {
        paddingVertical: 20,
        backgroundColor: 'transparent',
        marginBottom: 10,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#A78BFA",
    },
    buttonDisabled: {
        backgroundColor: "rgba(255,255,255,0.1)",
    },
    buttonText: {
        fontFamily: FONTS.body.bold,
        fontSize: 16,
    },
});
