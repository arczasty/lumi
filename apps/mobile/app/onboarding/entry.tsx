import React, { useState, useMemo } from 'react';
import { StyleSheet, View, TextInput, KeyboardAvoidingView, Platform, Keyboard, Pressable, TouchableWithoutFeedback } from 'react-native';
import { SanctuaryBackground } from "@/components/SanctuaryUI/Background";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/Themed';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Sparkles, ArrowRight } from 'lucide-react-native';
import { FONTS } from "@/constants/Theme";
import { useWindowDimensions } from "react-native";

export default function EntryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const { width, height } = useWindowDimensions();
    // params: intent, age, sex, recall
    const [text, setText] = useState("");

    const intent = params.intent as string;
    const recall = params.recall as string;

    const dynamicPrompt = useMemo(() => {
        if (intent === 'fog' || recall === 'static') {
            return "What is the very last thing you remember feeling?";
        }
        if (intent === 'shadow') {
            return "Unburden the tension. What was chasing you?";
        }
        if (intent === 'mirror' || intent === 'control') {
            return "What symbols appeared in the dark?";
        }
        return "What fragments remain?";
    }, [intent, recall]);

    const handleSubmit = async () => {
        if (!text.trim()) return;

        Keyboard.dismiss();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Pass dream text + profile params to Analysis
        router.push({
            pathname: '/onboarding/analysis',
            params: { ...params, text }
        });
    };

    const scale = height < 700 ? 0.9 : 1;

    return (
        <SanctuaryBackground>
            <View style={{
                flex: 1,
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
                paddingLeft: insets.left,
                paddingRight: insets.right
            }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.container}>
                            {/* Header */}
                            <MotiView
                                from={{ opacity: 0, translateY: 10 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                style={styles.header}
                            >
                                <Text style={styles.stepIndicator}>Step 4 of 5</Text>
                                <Text style={[styles.title, { fontSize: 32 * scale }]}>Capture the Fragment</Text>
                                <Text style={styles.subtitle}>
                                    Don't worry about grammar or logic. Speak to the void, and it will answer.
                                </Text>
                            </MotiView>

                            {/* Content */}
                            <MotiView
                                from={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 300 }}
                                style={styles.content}
                            >
                                <Text style={[styles.dynamicPrompt, { fontSize: 22 * scale }]}>
                                    {dynamicPrompt}
                                </Text>

                                <BlurView intensity={20} tint="dark" style={styles.glassInput}>
                                    <TextInput
                                        style={[styles.input, { fontSize: 18 * scale }]}
                                        multiline
                                        placeholder="I was in a house I didn't recognize, and the water was rising..."
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        value={text}
                                        onChangeText={setText}
                                    />
                                </BlurView>
                            </MotiView>

                            {/* Footer Action */}
                            <MotiView
                                from={{ opacity: 0, translateY: 20 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                style={styles.footer}
                            >
                                <Pressable
                                    onPress={handleSubmit}
                                    disabled={text.length < 5}
                                    style={[
                                        styles.analyzeButton,
                                        { opacity: text.length < 5 ? 0.5 : 1 }
                                    ]}
                                >
                                    <Sparkles size={20} color="#030014" style={{ marginRight: 8 }} />
                                    <Text style={styles.buttonText}>Analyze Reflection</Text>
                                    <ArrowRight size={20} color="#030014" style={{ marginLeft: 8 }} />
                                </Pressable>
                            </MotiView>

                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </View>
        </SanctuaryBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
    },
    header: {
        marginTop: 20,
        marginBottom: 24,
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
    content: {
        flex: 1,
    },
    dynamicPrompt: {
        fontFamily: FONTS.heading.regular,
        color: '#A78BFA',
        marginBottom: 24,
        lineHeight: 32,
    },
    glassInput: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(0,0,0,0.2)',
        flex: 1,
        maxHeight: 300,
    },
    input: {
        padding: 24,
        color: '#fff',
        fontFamily: FONTS.body.regular,
        textAlignVertical: 'top',
        height: '100%',
    },
    footer: {
        paddingVertical: 20,
        marginBottom: 10,
    },
    analyzeButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 56,
        borderRadius: 28,
        backgroundColor: "#A78BFA",
        width: '100%',
    },
    buttonText: {
        fontFamily: FONTS.body.bold,
        fontSize: 16,
        color: "#030014",
    },
});
