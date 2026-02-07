/**
 * Onboarding Paywall Screen
 * 
 * Uses RevenueCat's native Paywall UI for subscription purchases.
 * Falls back to custom UI if RevenueCat is not available.
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable, Platform } from 'react-native';
import { SanctuaryBackground } from "@/components/SanctuaryUI/Background";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useAction, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@clerk/clerk-expo';
import { Text } from '@/components/Themed';
import { BlurView } from 'expo-blur';
import { LucideLock, LucideSparkles, LucideCheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS } from "@/constants/Theme";
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { useRevenueCat } from '@/contexts/RevenueCatContext';

// Simple client-side extraction for teaser text
const extractTeaser = (text: string) => {
    if (!text) return "hidden themes";
    const words = text.split(' ').filter(w => w.length > 5);
    const keyword = words[Math.floor(Math.random() * words.length)] || "mystery";
    return keyword.charAt(0).toUpperCase() + keyword.slice(1);
}

export default function PaywallScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { userId } = useAuth();
    const { dreamId, text } = useLocalSearchParams<{ dreamId?: string, text?: string }>();

    // RevenueCat context
    const { isProUser, presentPaywall, isLoading: rcLoading } = useRevenueCat();

    // Fetch profile for personalization
    const user = useQuery(api.users.getUser, userId ? { userId } : "skip");

    // Convex mutations
    const saveDream = useMutation(api.dreams.saveDream);
    const analyzeDream = useAction(api.ai.analyzeDream);
    const generateDreamImage = useAction(api.ai.generateDreamImage);
    const completeOnboarding = useMutation(api.users.completeOnboarding);

    const [isProcessing, setIsProcessing] = useState(false);

    // Check if already Pro and redirect
    useEffect(() => {
        if (isProUser) {
            handleNavigateToApp();
        }
    }, [isProUser]);

    const handleNavigateToApp = async () => {
        let finalDreamId = dreamId;

        if (userId) {
            await completeOnboarding({ userId });

            // Save dream if we have text but no ID
            if (!dreamId && text) {
                try {
                    const id = await saveDream({ userId, text });
                    finalDreamId = id;
                    analyzeDream({ dreamId: id, text });
                    generateDreamImage({ dreamId: id, dreamText: text });
                } catch (e) { console.error("Save failed", e) }
            }
        }

        router.replace(finalDreamId ? `/dream/${finalDreamId}` : '/(tabs)');
    };

    const handleUnlock = async () => {
        setIsProcessing(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            // Present RevenueCat Paywall
            const result = await RevenueCatUI.presentPaywall();

            switch (result) {
                case PAYWALL_RESULT.PURCHASED:
                case PAYWALL_RESULT.RESTORED:
                    // Success! Navigate to app
                    await handleNavigateToApp();
                    break;
                case PAYWALL_RESULT.NOT_PRESENTED:
                case PAYWALL_RESULT.ERROR:
                case PAYWALL_RESULT.CANCELLED:
                    // User cancelled or error - stay on screen
                    break;
            }
        } catch (error) {
            console.error('Paywall error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSkip = async () => {
        // Free tier - still complete onboarding
        if (userId) {
            await completeOnboarding({ userId });
        }
        router.replace('/(tabs)');
    };

    const teaserWord = extractTeaser(text || "");

    return (
        <SanctuaryBackground>
            {/* Background Content Layer (Blurred) */}
            <View style={StyleSheet.absoluteFill}>
                <View style={{ padding: 30, paddingTop: 100 }}>
                    <Text style={{ fontSize: 32, fontFamily: 'Playfair', color: '#fff' }}>Analysis: {teaserWord}</Text>
                    <Text style={{ marginTop: 20, fontSize: 18, color: '#aaa', lineHeight: 28 }}>
                        {text || "Your dream..."}
                        {'\n\n'}
                        The appearance of {teaserWord} suggests a deep connection to...
                        [Premium content blurred]
                    </Text>
                    <View style={{ marginTop: 40, flexDirection: 'row', gap: 10 }}>
                        <View style={{ width: 100, height: 100, backgroundColor: '#333', borderRadius: 10 }} />
                        <View style={{ width: 100, height: 100, backgroundColor: '#333', borderRadius: 10 }} />
                    </View>
                </View>
                <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
            </View>

            <View style={[styles.container, {
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
                paddingLeft: insets.left,
                paddingRight: insets.right
            }]}>
                <View style={styles.content}>

                    {/* Header */}
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 300 }}
                        style={styles.header}
                    >
                        <View style={styles.lockIcon}>
                            <LucideLock color="#A78BFA" size={32} />
                        </View>
                        <Text style={styles.title}>Your interpretation is ready.</Text>

                        {/* Teaser Box */}
                        <View style={styles.teaserBox}>
                            <Text style={styles.teaserText}>
                                Your dream contains themes of <Text style={{ fontWeight: '700', color: '#A78BFA' }}>{teaserWord}</Text>.
                            </Text>
                            {user?.marketingVibe && (
                                <Text style={[styles.teaserText, { marginTop: 8 }]}>
                                    We found connections to your recent feelings of <Text style={{ fontWeight: '700', color: '#A78BFA' }}>{user.marketingVibe}</Text>.
                                </Text>
                            )}
                            <Text style={styles.teaserSub}>Unlock to verify this match.</Text>
                        </View>

                        {/* Benefits Grid */}
                        <View style={styles.benefitsGrid}>
                            <View style={styles.benefitItem}>
                                <LucideSparkles color="#A78BFA" size={18} />
                                <Text style={styles.benefitText}>Jungian Analysis</Text>
                            </View>
                            <View style={styles.benefitItem}>
                                <LucideSparkles color="#A78BFA" size={18} />
                                <Text style={styles.benefitText}>Ghibli-Style Art</Text>
                            </View>
                            <View style={styles.benefitItem}>
                                <LucideSparkles color="#A78BFA" size={18} />
                                <Text style={styles.benefitText}>Symbol Mapping</Text>
                            </View>
                            <View style={styles.benefitItem}>
                                <LucideSparkles color="#A78BFA" size={18} />
                                <Text style={styles.benefitText}>Private Sanctuary</Text>
                            </View>
                        </View>
                    </MotiView>

                    <View style={{ flex: 1 }} />

                    {/* CTA Section */}
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 600 }}
                        style={styles.footer}
                    >
                        <Pressable
                            onPress={handleUnlock}
                            style={[styles.ctaButton, (isProcessing || rcLoading) && styles.ctaDisabled]}
                            disabled={isProcessing || rcLoading}
                        >
                            <Text style={styles.ctaText}>
                                {isProcessing ? 'Processing...' : 'Unlock Lumi Pro'}
                            </Text>
                            <LucideSparkles color="#030014" size={20} style={{ marginLeft: 8 }} />
                        </Pressable>
                        <Text style={styles.disclaimer}>7-day free trial • Cancel anytime</Text>

                        {/* Continue Free Option */}
                        <Pressable onPress={handleSkip} style={styles.skipButton}>
                            <Text style={styles.skipText}>Continue with free version</Text>
                        </Pressable>
                    </MotiView>

                </View>
            </View>
        </SanctuaryBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, padding: 24 },
    header: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
    lockIcon: {
        width: 50, height: 50, borderRadius: 25,
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
        alignItems: 'center', justifyContent: 'center', marginBottom: 16
    },
    title: { fontSize: 26, fontFamily: FONTS.heading.semiBold, color: '#fff', textAlign: 'center', marginBottom: 16 },
    teaserBox: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#A78BFA',
        width: '100%',
    },
    teaserText: { fontSize: 16, fontFamily: FONTS.body.regular, color: 'rgba(255,255,255,0.9)', lineHeight: 24, fontStyle: 'italic', marginBottom: 8 },
    teaserSub: { fontSize: 13, fontFamily: FONTS.body.semiBold, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: 0.5 },
    benefitsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 24,
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    benefitText: {
        fontSize: 13,
        fontFamily: FONTS.body.medium,
        color: 'rgba(255,255,255,0.8)',
    },
    footer: { alignItems: 'center' },
    ctaButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#A78BFA', borderRadius: 30,
        paddingVertical: 18, width: '100%', marginBottom: 12
    },
    ctaDisabled: { opacity: 0.6 },
    ctaText: { fontSize: 18, fontFamily: FONTS.body.bold, color: '#030014' },
    disclaimer: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: FONTS.body.regular, marginBottom: 16 },
    skipButton: { padding: 10 },
    skipText: { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontFamily: FONTS.body.medium },
});
