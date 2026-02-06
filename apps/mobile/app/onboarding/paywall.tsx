
import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, Pressable } from 'react-native';
import { SanctuaryBackground } from "@/components/SanctuaryUI/Background";
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useAction, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@clerk/clerk-expo';
import { Text } from '@/components/Themed';
import { BlurView } from 'expo-blur';
import { LucideLock, LucideCheck, LucideSparkles, LucideCheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS } from "@/constants/Theme";

const { width } = Dimensions.get('window');

// Simple client-side extraction since we are aggressive and might not have AI result ready instantly
const extractTeaser = (text: string) => {
    if (!text) return "hidden themes";
    const words = text.split(' ').filter(w => w.length > 5);
    const keyword = words[Math.floor(Math.random() * words.length)] || "mystery";
    return keyword.charAt(0).toUpperCase() + keyword.slice(1);
}

export default function PaywallScreen() {
    const router = useRouter();
    const { userId } = useAuth();
    const { dreamId, text } = useLocalSearchParams<{ dreamId?: string, text?: string }>();

    // Fetch profile for personalization
    const user = useQuery(api.users.getUser, userId ? { userId } : "skip");

    // Fallback save if came from Bypass or failed auth save
    const saveDream = useMutation(api.dreams.saveDream);
    const analyzeDream = useAction(api.ai.analyzeDream);
    const generateDreamImage = useAction(api.ai.generateDreamImage);
    const completeOnboarding = useMutation(api.users.completeOnboarding);

    const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');

    const handleUnlock = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        let finalDreamId = dreamId;

        if (userId) {
            await completeOnboarding({ userId });

            // If we came from bypass with just text, save it now
            if (!dreamId && text) {
                try {
                    const id = await saveDream({ userId, text });
                    finalDreamId = id;
                    analyzeDream({ dreamId: id, text });
                    generateDreamImage({ dreamId: id, dreamText: text });
                } catch (e) { console.error("Save failed", e) }
            }
        }

        // Navigate to the main app, focused on the new dream
        router.replace(finalDreamId ? `/dream/${finalDreamId}` : '/(tabs)');
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
                        [This content is blurred out in the actual UI]
                    </Text>
                    <View style={{ marginTop: 40, flexDirection: 'row', gap: 10 }}>
                        <View style={{ width: 100, height: 100, backgroundColor: '#333', borderRadius: 10 }} />
                        <View style={{ width: 100, height: 100, backgroundColor: '#333', borderRadius: 10 }} />
                    </View>
                </View>
                <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
            </View>

            <SafeAreaView style={styles.container}>
                <View style={styles.content}>

                    {/* Header: Aggressive Teaser */}
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

                        {/* Shadow Analysis Teaser */}
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

                        {/* Benefits List */}
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

                    {/* Plans */}
                    <MotiView
                        from={{ opacity: 0, translateY: 50 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 600 }}
                        style={styles.plansContainer}
                    >
                        <Pressable
                            onPress={() => setSelectedPlan('yearly')}
                            style={[
                                styles.planCard,
                                selectedPlan === 'yearly' && styles.selectedPlan
                            ]}
                        >
                            <View style={styles.planHeader}>
                                <Text style={styles.planTitle}>Yearly (Most Popular)</Text>
                                {selectedPlan === 'yearly' && <LucideCheckCircle2 size={20} color="#030014" />}
                            </View>
                            <Text style={styles.planPrice}>$39.99 <Text style={styles.perPeriod}>/ year</Text></Text>
                            <Text style={styles.trialText}>7-day free trial</Text>
                        </Pressable>

                        <Pressable
                            onPress={() => setSelectedPlan('monthly')}
                            style={[
                                styles.planCard,
                                selectedPlan === 'monthly' && styles.selectedPlan,
                                { marginTop: 12 }
                            ]}
                        >
                            <View style={styles.planHeader}>
                                <Text style={styles.planTitle}>Monthly</Text>
                                {selectedPlan === 'monthly' && <LucideCheckCircle2 size={20} color="#030014" />}
                            </View>
                            <Text style={styles.planPrice}>$4.99 <Text style={styles.perPeriod}>/ month</Text></Text>
                        </Pressable>
                    </MotiView>

                    {/* CTA */}
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 800 }}
                        style={styles.footer}
                    >
                        <Pressable onPress={handleUnlock} style={styles.ctaButton}>
                            <Text style={styles.ctaText}>Unlock My Results</Text>
                            <LucideSparkles color="#030014" size={20} style={{ marginLeft: 8 }} />
                        </Pressable>
                        <Text style={styles.disclaimer}>No commitment. Cancel anytime in settings.</Text>
                        <Pressable
                            onPress={() => router.replace('/(tabs)')}
                            style={{ padding: 10, marginTop: 10 }}
                        >
                            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>[DEV: SKIP PAYWALL]</Text>
                        </Pressable>
                    </MotiView>

                </View>
            </SafeAreaView>
        </SanctuaryBackground>
    );
}

const LucideCheckCircleIcon = ({ size, color }: { size: number, color: string }) => (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#A78BFA', alignItems: 'center', justifyContent: 'center' }}>
        <LucideCheck size={size * 0.6} color={color} />
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, padding: 24 },
    header: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
    lockIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(186, 242, 187, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
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
    plansContainer: { marginBottom: 20 },
    planCard: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' },
    selectedPlan: { borderColor: '#A78BFA', backgroundColor: 'rgba(186, 242, 187, 0.1)' },
    planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    planTitle: { fontSize: 16, fontFamily: FONTS.body.semiBold, color: '#fff' },
    planPrice: { fontSize: 24, fontFamily: FONTS.heading.bold, color: '#fff' },
    perPeriod: { fontSize: 14, fontFamily: FONTS.body.regular, color: 'rgba(255,255,255,0.6)' },
    trialText: { fontSize: 14, color: '#A78BFA', marginTop: 4, fontFamily: FONTS.body.medium },
    footer: { alignItems: 'center' },
    ctaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#A78BFA', borderRadius: 30, paddingVertical: 18, width: '100%', marginBottom: 16 },
    ctaText: { fontSize: 18, fontFamily: FONTS.body.bold, color: '#030014' },
    disclaimer: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: FONTS.body.regular },
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
    }
});
