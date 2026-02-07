import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Platform, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { SanctuaryBackground } from "@/components/SanctuaryUI/Background";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useOAuth, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { Text } from '@/components/Themed';
import * as Haptics from 'expo-haptics';
import { Lock, Check, Apple, Mail, Sparkles, Shield, User as UserIcon, ArrowRight, Moon } from 'lucide-react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { FONTS, SHADOW } from "@/constants/Theme";
import { MotiView, AnimatePresence } from 'moti';
import { useUser } from '@clerk/clerk-expo';
import { BlurView } from 'expo-blur';

export default function AuthGateScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { text, intent, age, sex, recall, preAuthId } = useLocalSearchParams<{
        text: string,
        intent: string,
        age: string,
        sex: string,
        recall: string,
        preAuthId: string
    }>();

    const [loading, setLoading] = useState(false);
    const [emailVisible, setEmailVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [magicLinkSent, setMagicLinkSent] = useState(false);

    // Auth Hooks
    const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: "oauth_google" });
    const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: "oauth_apple" });
    const { signIn, isLoaded: signInLoaded } = useSignIn();
    const { signUp, isLoaded: signUpLoaded } = useSignUp();

    // Convex Hooks
    const saveDream = useMutation(api.dreams.saveDream);
    const claimPreAuth = useMutation(api.dreams.claimPreAuthDream);
    const updateProfile = useMutation(api.users.updateProfile);
    const syncUser = useMutation(api.users.syncUser);
    const analyzeDream = useAction(api.ai.analyzeDream);
    const generateDreamImage = useAction(api.ai.generateDreamImage);
    const { user, isLoaded: isUserLoaded } = useUser();

    // Effect to handle post-auth logic once user is loaded
    React.useEffect(() => {
        if (!isUserLoaded || !user?.id || loading) return;

        if (intent && text) {
            handlePostAuth(user.id);
        }
    }, [isUserLoaded, user?.id]);

    const handlePostAuth = async (clerkUserId: string) => {
        if (loading) return;
        setLoading(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            await syncUser({ userId: clerkUserId });

            await updateProfile({
                userId: clerkUserId,
                age: age ? parseInt(age, 10) : undefined,
                sex: sex,
                primaryGoal: intent,
                marketingVibe: recall,
            });

            let dreamId;
            if (preAuthId) {
                // Claim the already analyzed (or being analyzed) dream
                dreamId = await claimPreAuth({
                    preAuthId: preAuthId as any,
                    userId: clerkUserId
                });
            } else if (text) {
                // Fallback for direct recording or missing pre-auth
                dreamId = await saveDream({
                    userId: clerkUserId,
                    text: text
                });

                analyzeDream({ dreamId, text });
                generateDreamImage({ dreamId, dreamText: text });
            }

            router.replace({
                pathname: '/onboarding/paywall',
                params: { dreamId, text }
            });

        } catch (e) {
            console.error("Failed to save post-auth", e);
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
            }
        } catch (err) {
            console.error("OAuth error", err);
        }
    };

    const handleMagicLink = async () => {
        if (!email || !signInLoaded || !signUpLoaded) return;
        setLoading(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            // Try sign in first
            try {
                const si = await signIn.create({ identifier: email });
                const factor = si.supportedFirstFactors?.find(f => f.strategy === 'email_link') as any;

                if (!factor) throw new Error("Email link not supported for this account");

                await signIn.prepareFirstFactor({
                    strategy: 'email_link',
                    emailAddressId: factor.emailAddressId,
                    redirectUrl: 'lumi://auth-callback',
                });

                setMagicLinkSent(true);
            } catch (err: any) {
                // If user doesn't exist, create account
                if (err.errors?.[0]?.code === 'form_identifier_not_found') {
                    await signUp.create({ emailAddress: email });
                    await signUp.prepareEmailAddressVerification({
                        strategy: 'email_link',
                        redirectUrl: 'lumi://auth-callback'
                    });
                    setMagicLinkSent(true);
                } else {
                    throw err;
                }
            }
        } catch (err) {
            console.error("Magic link error", err);
            // Show some error to user?
        } finally {
            setLoading(false);
        }
    };

    const dreamPreviewSnippet = text ? `"${text.substring(0, 25)}..."` : "Your reflection";

    return (
        <SanctuaryBackground>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
                        <MotiView
                            from={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={styles.header}
                        >
                            <View style={styles.lockIconContainer}>
                                <Shield size={32} color="#A78BFA" />
                                <MotiView
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ loop: true, duration: 3000 }}
                                    style={styles.iconGlow}
                                />
                            </View>
                            <Text style={styles.title}>Secure Your Sanctuary</Text>
                            <Text style={styles.subtitle}>
                                Your subconscious data is encrypted and private. Connect to sync your insights across all realms.
                            </Text>
                        </MotiView>

                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 300 }}
                            style={styles.benefitsList}
                        >
                            {[
                                {
                                    icon: Sparkles,
                                    text: "Immortalize this Insight",
                                    sub: "This interpretation will be permanently saved to your profile"
                                },
                                {
                                    icon: Moon,
                                    text: "Cosmic Patterns",
                                    sub: "Uncover how your soul's language evolves over time"
                                },
                                {
                                    icon: Shield,
                                    text: "Sacred Sanctuary",
                                    sub: "Your subconscious is yours alone. Encrypted and untouchable."
                                },
                            ].map((benefit, i) => (
                                <View key={i} style={styles.benefitItem}>
                                    <View style={styles.benefitIcon}>
                                        <benefit.icon size={20} color="#A78BFA" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.benefitText}>{benefit.text}</Text>
                                        <Text style={styles.benefitSub}>{benefit.sub}</Text>
                                    </View>
                                </View>
                            ))}
                        </MotiView>

                        <MotiView
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: 600 }}
                            style={styles.actions}
                        >
                            <AnimatePresence>
                                {!emailVisible ? (
                                    <MotiView
                                        key="socials"
                                        style={styles.socialRow}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                    >
                                        <Pressable style={styles.socialButton} onPress={() => handleSignIn('apple')}>
                                            <FontAwesome5 name="apple" size={26} color="#000000" />
                                        </Pressable>
                                        <Pressable style={styles.socialButton} onPress={() => handleSignIn('google')}>
                                            <FontAwesome5 name="google" size={24} color="#000000" />
                                        </Pressable>
                                        <Pressable
                                            style={[styles.socialButton, { backgroundColor: '#A78BFA' }]}
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                setEmailVisible(true);
                                            }}
                                        >
                                            <Mail size={24} color="#030014" />
                                        </Pressable>
                                    </MotiView>
                                ) : (
                                    <MotiView
                                        key="email-input"
                                        from={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        style={styles.emailContainer}
                                    >
                                        {magicLinkSent ? (
                                            <View style={styles.sentContainer}>
                                                <Check size={32} color="#A78BFA" />
                                                <Text style={styles.sentText}>Magic Link Sent!</Text>
                                                <Text style={styles.sentSub}>Check your inbox to enter the Sanctuary.</Text>
                                                <Pressable onPress={() => setMagicLinkSent(false)} style={styles.resetLink}>
                                                    <Text style={styles.resetLinkText}>Try another email</Text>
                                                </Pressable>
                                            </View>
                                        ) : (
                                            <>
                                                <BlurView intensity={20} tint="dark" style={styles.emailInputWrapper}>
                                                    <TextInput
                                                        placeholder="Enter your email"
                                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                                        style={styles.emailInput}
                                                        value={email}
                                                        onChangeText={setEmail}
                                                        autoCapitalize="none"
                                                        keyboardType="email-address"
                                                        autoFocus
                                                    />
                                                </BlurView>
                                                <View style={styles.emailButtons}>
                                                    <Pressable
                                                        onPress={() => setEmailVisible(false)}
                                                        style={styles.cancelButton}
                                                    >
                                                        <Text style={styles.cancelText}>Back</Text>
                                                    </Pressable>
                                                    <Pressable
                                                        onPress={handleMagicLink}
                                                        style={styles.sendButton}
                                                        disabled={loading || !email}
                                                    >
                                                        {loading ? <ActivityIndicator color="#030014" /> : (
                                                            <>
                                                                <Text style={styles.sendText}>Send Link</Text>
                                                                <ArrowRight size={18} color="#030014" />
                                                            </>
                                                        )}
                                                    </Pressable>
                                                </View>
                                            </>
                                        )}
                                    </MotiView>
                                )}
                            </AnimatePresence>

                            <Text style={styles.securityNote}>
                                <Check size={12} color="rgba(255,255,255,0.3)" /> GDPR Compliant • AES-256 Encryption
                            </Text>
                        </MotiView>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SanctuaryBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    lockIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        position: 'relative',
    },
    iconGlow: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#A78BFA',
        borderRadius: 40,
        filter: 'blur(15px)',
    },
    title: {
        fontFamily: FONTS.heading.bold,
        fontSize: 32,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontFamily: FONTS.body.regular,
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        lineHeight: 24,
    },
    benefitsList: {
        width: '100%',
        gap: 16,
        marginBottom: 48,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    benefitIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    benefitText: {
        fontFamily: FONTS.body.bold,
        fontSize: 15,
        color: '#FFFFFF',
        marginBottom: 2,
    },
    benefitSub: {
        fontFamily: FONTS.body.regular,
        fontSize: 13,
        color: 'rgba(255,255,255,0.4)',
    },
    actions: {
        width: '100%',
        alignItems: 'center',
        gap: 24,
    },
    socialRow: {
        flexDirection: 'row',
        gap: 20,
        width: '100%',
        justifyContent: 'center',
    },
    socialButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOW.dark,
    },
    emailContainer: {
        width: '100%',
        alignItems: 'center',
    },
    emailInputWrapper: {
        width: '100%',
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(167, 139, 250, 0.3)',
        overflow: 'hidden',
        paddingHorizontal: 20,
    },
    emailInput: {
        flex: 1,
        fontFamily: FONTS.body.medium,
        fontSize: 16,
        color: '#FFFFFF',
    },
    emailButtons: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
        marginTop: 16,
    },
    cancelButton: {
        flex: 1,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    cancelText: {
        fontFamily: FONTS.body.bold,
        fontSize: 16,
        color: 'rgba(255,255,255,0.5)',
    },
    sendButton: {
        flex: 2,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#A78BFA',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    sendText: {
        fontFamily: FONTS.body.bold,
        fontSize: 16,
        color: '#030014',
    },
    sentContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    sentText: {
        fontFamily: FONTS.heading.bold,
        fontSize: 20,
        color: '#FFFFFF',
        marginTop: 12,
    },
    sentSub: {
        fontFamily: FONTS.body.regular,
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        marginTop: 4,
    },
    resetLink: {
        marginTop: 16,
    },
    resetLinkText: {
        fontFamily: FONTS.body.medium,
        fontSize: 14,
        color: '#A78BFA',
        textDecorationLine: 'underline',
    },
    securityNote: {
        fontFamily: FONTS.body.medium,
        fontSize: 12,
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: 1,
        marginTop: 8,
    },
});
