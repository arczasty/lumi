import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Platform, ScrollView } from 'react-native';
import { SanctuaryBackground } from "@/components/SanctuaryUI/Background";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useOAuth } from '@clerk/clerk-expo';
import { Text } from '@/components/Themed';
import * as Haptics from 'expo-haptics';
import { Lock, Check, Apple, CircuitBoard, Mail } from 'lucide-react-native'; // Changed: Using generic icons or available ones
import { FontAwesome5 } from '@expo/vector-icons'; // Fallback for brand icons if needed
import { useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { FONTS, SHADOW } from "@/constants/Theme";
import { MotiView } from 'moti';
import { useUser } from '@clerk/clerk-expo';

export default function AuthGateScreen() {
    const router = useRouter();
    // Receive params from Analysis
    const { text, intent, age, sex, recall } = useLocalSearchParams<{
        text: string,
        intent: string,
        age: string,
        sex: string,
        recall: string
    }>();

    const [loading, setLoading] = useState(false);

    // Auth Hooks
    const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: "oauth_google" });
    const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: "oauth_apple" });

    // Convex Hooks
    const saveDream = useMutation(api.dreams.saveDream);
    const updateProfile = useMutation(api.users.updateProfile);
    const syncUser = useMutation(api.users.syncUser);
    const analyzeDream = useAction(api.ai.analyzeDream);
    const generateDreamImage = useAction(api.ai.generateDreamImage);
    const { user } = useUser();
    const { isLoaded: isUserLoaded } = useUser();

    // Effect to handle post-auth logic once user is loaded
    React.useEffect(() => {
        if (!isUserLoaded || !user?.id || loading) return;

        // Check if we have pending actions from onboarding
        if (intent && text) {
            handlePostAuth(user.id);
        }
    }, [isUserLoaded, user?.id]);

    const handlePostAuth = async (clerkUserId: string) => {
        if (loading) return; // Prevent double execution
        setLoading(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            console.log("Starting post-auth sequence for:", clerkUserId);

            // 1. Sync User (Convex side handles existing vs new)
            await syncUser({ userId: clerkUserId });

            // 2. Save Profile Data
            if (intent) {
                await updateProfile({
                    userId: clerkUserId,
                    primaryGoal: intent,
                    marketingVibe: recall,
                });
            }

            // 3. Save Dream
            let dreamId;
            if (text) {
                dreamId = await saveDream({
                    userId: clerkUserId,
                    text: text
                });

                // Trigger AI
                analyzeDream({ dreamId, text });
                generateDreamImage({ dreamId, dreamText: text });
            }

            // 4. Go to Paywall
            router.replace({
                pathname: '/onboarding/paywall',
                params: { dreamId, text }
            });

        } catch (e) {
            console.error("Failed to save post-auth", e);
            // Fallback navigation
            router.replace({ pathname: '/onboarding/paywall', params: { text } });
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async (strategy: 'google' | 'apple') => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const flow = strategy === 'google' ? startGoogleFlow : startAppleFlow;
            const res = await flow() as any;
            const { createdSessionId, setActive } = res;

            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId });
                // We do NOT call handleSuccess here anymore.
                // We let the useEffect pick up the change in `user` state.
            }
        } catch (err) {
            console.error("OAuth error", err);
        }
    };

    return (
        <SanctuaryBackground>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>

                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        style={styles.header}
                    >
                        <Lock size={48} color="#A78BFA" style={{ marginBottom: 24 }} />
                        <Text style={styles.title}>Preserve this Insight</Text>
                        <Text style={styles.subtitle}>
                            Your subconscious is sensitive data. We encrypt it within a secure Sanctuary that only you can access.
                        </Text>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 300 }}
                        style={styles.benefitsList}
                    >
                        <View style={styles.benefitItem}>
                            <View style={styles.checkContainer}>
                                <Check size={14} color="#030014" />
                            </View>
                            <Text style={styles.benefitText}>Save "The Weight of Water" analysis</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <View style={styles.checkContainer}>
                                <Check size={14} color="#030014" />
                            </View>
                            <Text style={styles.benefitText}>Uncover your psychological Archetype</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <View style={styles.checkContainer}>
                                <Check size={14} color="#030014" />
                            </View>
                            <Text style={styles.benefitText}>Begin your streak as a Novice Dreamer</Text>
                        </View>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 600 }}
                        style={styles.actions}
                    >
                        <Text style={styles.ctaText}>Create your Sanctuary</Text>

                        <View style={styles.socialRow}>
                            {/* Apple */}
                            <Pressable
                                style={[styles.socialButton, { backgroundColor: '#FFFFFF' }]}
                                onPress={() => handleSignIn('apple')}
                            >
                                <FontAwesome5 name="apple" size={26} color="#000000" />
                            </Pressable>

                            {/* Google */}
                            <Pressable
                                style={[styles.socialButton, { backgroundColor: '#FFFFFF' }]}
                                onPress={() => handleSignIn('google')}
                            >
                                <FontAwesome5 name="google" size={24} color="#000000" />
                            </Pressable>

                            {/* Email */}
                            <Pressable
                                style={[styles.socialButton, { backgroundColor: '#FFFFFF' }]}
                                onPress={() => console.log("Email Auth")}
                            >
                                <Mail size={24} color="#000000" />
                            </Pressable>
                        </View>

                        <Text style={styles.securityNote}>
                            Secure. Private. Encrypted.
                        </Text>
                    </MotiView>

                </View>
            </SafeAreaView>
        </SanctuaryBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    title: {
        fontFamily: FONTS.heading.bold,
        fontSize: 32,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        fontFamily: FONTS.body.regular,
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        lineHeight: 24,
    },
    benefitsList: {
        width: '100%',
        gap: 20,
        marginBottom: 64,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    checkContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#A78BFA',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    benefitText: {
        fontFamily: FONTS.body.medium,
        fontSize: 15,
        color: '#FFFFFF',
        flex: 1,
        lineHeight: 20,
    },
    actions: {
        width: '100%',
        alignItems: 'center',
        gap: 24,
    },
    socialRow: {
        flexDirection: 'row',
        gap: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    socialButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#FFFFFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    googleIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    securityNote: {
        fontFamily: FONTS.body.medium,
        fontSize: 12,
        color: 'rgba(255,255,255,0.3)',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    ctaText: {
        fontFamily: FONTS.heading.bold,
        fontSize: 24,
        color: '#FFFFFF',
        marginBottom: 8,
        letterSpacing: 1,
        textTransform: 'uppercase',
        ...SHADOW.purple,
    },
});
