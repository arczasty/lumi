import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable, Platform, ScrollView, Dimensions } from 'react-native';
import { SanctuaryBackground } from "@/components/SanctuaryUI/Background";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useAction, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@clerk/clerk-expo';
import { Text } from '@/components/Themed';
import { BlurView } from 'expo-blur';
import {
    LucideLock,
    LucideSparkles,
    LucideCheckCircle2,
    LucideArrowLeft,
    LucideMoon,
    LucideCrown,
    LucideZap,
    LucideInfinity,
    LucideEye
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS, PURPLE, TEXT } from "@/constants/Theme";
import { LinearGradient } from 'expo-linear-gradient';
import { PurchasesPackage } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import Purchases from 'react-native-purchases';
import { useRevenueCat } from '@/contexts/RevenueCatContext';

const { width } = Dimensions.get('window');

export default function PaywallScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { userId } = useAuth();
    const { dreamId, text, source } = useLocalSearchParams<{ dreamId?: string, text?: string, source?: string }>();

    const { isProUser, presentPaywall, isLoading: rcLoading } = useRevenueCat();
    const user = useQuery(api.users.getUser, userId ? { userId } : "skip");

    const completeOnboarding = useMutation(api.users.completeOnboarding);
    const saveDream = useMutation(api.dreams.saveDream);
    const analyzeDream = useAction(api.ai.analyzeDream);
    const generateDreamImage = useAction(api.ai.generateDreamImage);

    const [isProcessing, setIsProcessing] = useState(false);
    const [allPackages, setAllPackages] = useState<PurchasesPackage[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);

    useEffect(() => {
        const loadOfferings = async () => {
            try {
                const offerings = await Purchases.getOfferings();
                if (offerings.current && offerings.current.availablePackages.length > 0) {
                    const packages = offerings.current.availablePackages.sort((a, b) =>
                        (b.product.subscriptionPeriod === 'P1Y' ? 1 : -1)
                    );
                    setAllPackages(packages);
                    // Default to Annual (usually the first one after sort, or finding explicitly)
                    const annual = packages.find(p => p.product.subscriptionPeriod === 'P1Y');
                    setSelectedPackage(annual || packages[0]);
                }
            } catch (e) {
                console.error("Error loading offerings:", e);
            }
        };
        loadOfferings();
    }, []);

    useEffect(() => {
        if (isProUser) {
            handleSuccessNavigation();
        }
    }, [isProUser]);

    const handleSuccessNavigation = async () => {
        if (userId) {
            await completeOnboarding({ userId });

            if (!dreamId && text) {
                try {
                    const id = await saveDream({ userId, text });
                    analyzeDream({ dreamId: id, text });
                    generateDreamImage({ dreamId: id, dreamText: text });
                    router.replace(`/dream/${id}`);
                    return;
                } catch (e) { console.error(e); }
            }
        }
        router.replace('/(tabs)');
    };

    const handleUnlock = async () => {
        setIsProcessing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        try {
            if (!selectedPackage) return;
            const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
            if (customerInfo.activeSubscriptions.length > 0) {
                await handleSuccessNavigation();
            }
        } catch (error: any) {
            if (!error.userCancelled) {
                console.error('Paywall error:', error);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (router.canGoBack()) router.back();
        else router.replace('/(tabs)');
    };

    const features = [
        { icon: <LucideInfinity size={18} color="#A78BFA" />, title: "Unlimited Reflections", sub: "Record every whisper of the night" },
        { icon: <LucideZap size={18} color="#A78BFA" />, title: "Deep Synthesis", sub: "AI-powered psychological overviews" },
        { icon: <LucideEye size={18} color="#A78BFA" />, title: "Visionary Artwork", sub: "Studio Ghibli style dream painting" },
        { icon: <LucideCrown size={18} color="#A78BFA" />, title: "The Full Lexicon", sub: "Unlock 500+ symbolic meanings" },
    ];

    return (
        <SanctuaryBackground>
            <View style={[styles.container, { paddingTop: insets.top }]}>
                {/* Header Actions */}
                <View style={styles.headerActions}>
                    <Pressable onPress={handleBack} style={styles.backButton}>
                        <LucideArrowLeft color="rgba(255,255,255,0.6)" size={24} />
                    </Pressable>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Hero Section */}
                    <MotiView
                        from={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={styles.hero}
                    >
                        <LinearGradient
                            colors={['rgba(167, 139, 250, 0.2)', 'transparent']}
                            style={styles.heroGlow}
                        />
                        <Text style={styles.heroTitle}>Ascend to Sanctuary Pro</Text>
                        <Text style={styles.heroSub}>Connect deeply with your subconscious self.</Text>
                    </MotiView>

                    {/* Features Grid */}
                    <View style={styles.featuresGrid}>
                        {features.map((f, i) => (
                            <MotiView
                                key={i}
                                from={{ opacity: 0, translateX: -20 }}
                                animate={{ opacity: 1, translateX: 0 }}
                                transition={{ delay: 200 + (i * 100) }}
                                style={styles.featureCard}
                            >
                                <View style={styles.featureIcon}>{f.icon}</View>
                                <View style={styles.featureText}>
                                    <Text style={styles.featureTitle}>{f.title}</Text>
                                    <Text style={styles.featureSub}>{f.sub}</Text>
                                </View>
                            </MotiView>
                        ))}
                    </View>

                    {/* Testimonial/Vibe */}
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 800 }}
                        style={styles.vibeCard}
                    >
                        <LucideSparkles size={16} color="#A78BFA" style={{ opacity: 0.5 }} />
                        <Text style={styles.vibeText}>
                            "The symbols Lumi found in my dreams predicted changes I wasn't even aware of yet."
                        </Text>
                        <Text style={styles.vibeAuthor}>— Sarah, Pro Member</Text>
                    </MotiView>
                    {/* Package Selector */}
                    <View style={styles.packagesContainer}>
                        {allPackages.map((pkg) => {
                            const isSelected = selectedPackage?.identifier === pkg.identifier;
                            const isAnnual = pkg.product.subscriptionPeriod === 'P1Y';

                            return (
                                <Pressable
                                    key={pkg.identifier}
                                    onPress={() => {
                                        Haptics.selectionAsync();
                                        setSelectedPackage(pkg);
                                    }}
                                    style={[
                                        styles.packageCard,
                                        isSelected && styles.packageCardSelected
                                    ]}
                                >
                                    <View style={styles.packageRadio}>
                                        {isSelected && <View style={styles.packageRadioInner} />}
                                    </View>
                                    <View style={styles.packageInfo}>
                                        <Text style={styles.packageTitle}>
                                            {isAnnual ? 'Annual (Best Value)' : 'Monthly'}
                                        </Text>
                                        <Text style={styles.packagePrice}>
                                            {pkg.product.priceString} / {isAnnual ? 'year' : 'month'}
                                        </Text>
                                    </View>
                                    {isAnnual && (
                                        <View style={styles.saveBadge}>
                                            <Text style={styles.saveText}>SAVE 20%</Text>
                                        </View>
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Spacer for Footer */}
                    <View style={{ height: 180 }} />
                </ScrollView>

                {/* Floating Gradient Footer */}
                <LinearGradient
                    colors={['transparent', 'rgba(3, 0, 20, 0.9)', '#030014']}
                    locations={[0, 0.3, 1]}
                    style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}
                >
                    <Pressable
                        onPress={handleUnlock}
                        style={[styles.ctaButton, isProcessing && styles.ctaDisabled]}
                        disabled={isProcessing}
                    >
                        <LinearGradient
                            colors={['#A78BFA', '#7C3AED']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.ctaGradient}
                        >
                            <View style={styles.ctaContent}>
                                <Text style={styles.ctaText}>
                                    {isProcessing ? 'Unlocking...' : (selectedPackage?.product.introPrice ? `Start ${selectedPackage.product.introPrice.periodNumberOfUnits}-Day Free Trial` : 'Unlock Sanctuary Pro')}
                                </Text>
                                <Text style={styles.ctaSub}>
                                    {selectedPackage ? `Then ${selectedPackage.product.priceString}/${selectedPackage.product.subscriptionPeriod === 'P1Y' ? 'year' : 'month'}` : 'Loading offer...'}
                                </Text>
                            </View>
                            <View style={styles.shineElement} />
                        </LinearGradient>
                    </Pressable>

                    <Text style={styles.disclaimer}>Cancel anytime in settings. No questions asked.</Text>

                    <Pressable
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            handleSuccessNavigation();
                        }}
                        style={styles.skipButton}
                    >
                        <Text style={styles.skipButtonText}>Restore Purchases</Text>
                    </Pressable>
                </LinearGradient>
            </View>
        </SanctuaryBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerActions: { paddingHorizontal: 20, height: 50, justifyContent: 'center' },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
    scrollContent: { padding: 24, paddingBottom: 150 },

    // Hero
    // Hero
    hero: { alignItems: 'center', marginBottom: 24, paddingTop: 10, position: 'relative' },
    heroGlow: { position: 'absolute', top: -100, width: width, height: 400, opacity: 0.3 },
    heroTitle: { fontSize: 32, fontFamily: FONTS.heading.bold, color: '#fff', textAlign: 'center' },
    heroSub: { fontSize: 16, fontFamily: FONTS.body.regular, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 8 },

    // Features
    featuresGrid: { gap: 10, marginBottom: 24 },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        gap: 12,
    },
    featureIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(167, 139, 250, 0.1)', alignItems: 'center', justifyContent: 'center' },
    featureText: { flex: 1 },
    featureTitle: { fontSize: 15, fontFamily: FONTS.body.bold, color: '#fff' },
    featureSub: { fontSize: 13, fontFamily: FONTS.body.regular, color: 'rgba(255,255,255,0.4)', marginTop: 0 },

    // Vibe Card
    vibeCard: {
        padding: 24,
        alignItems: 'center',
        backgroundColor: 'rgba(45, 212, 191, 0.03)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(45, 212, 191, 0.1)',
        gap: 12,
    },
    vibeText: { fontSize: 14, fontFamily: FONTS.body.regular, color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontStyle: 'italic', lineHeight: 22 },
    vibeAuthor: { fontSize: 12, fontFamily: FONTS.body.bold, color: '#2DD4BF', textTransform: 'uppercase', letterSpacing: 1 },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    ctaButton: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#A78BFA',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    },
    ctaDisabled: { opacity: 0.7 },
    ctaGradient: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center'
    },
    ctaContent: { alignItems: 'center', gap: 4 },
    ctaText: { fontSize: 18, fontFamily: FONTS.heading.bold, color: '#fff' },
    ctaSub: { fontSize: 13, fontFamily: FONTS.body.medium, color: 'rgba(255,255,255,0.8)' },
    shineElement: {
        position: 'absolute',
        top: -20,
        right: -20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
        transform: [{ scaleX: 2 }],
        filter: 'blur(20px)',
    },
    disclaimer: { fontSize: 12, fontFamily: FONTS.body.regular, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 16 },
    skipButton: { marginTop: 12, paddingVertical: 8, alignItems: 'center' },
    skipButtonText: { fontFamily: FONTS.body.medium, fontSize: 13, color: 'rgba(255,255,255,0.3)', letterSpacing: 0.5 },

    // Package Selector
    packagesContainer: { gap: 12, marginBottom: 20 },
    packageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    packageCardSelected: {
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
        borderColor: '#A78BFA',
    },
    packageRadio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    packageRadioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#A78BFA',
    },
    packageInfo: { flex: 1 },
    packageTitle: { fontFamily: FONTS.body.bold, fontSize: 15, color: '#fff' },
    packagePrice: { fontFamily: FONTS.body.regular, fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
    saveBadge: { backgroundColor: '#A78BFA', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    saveText: { fontFamily: FONTS.body.bold, fontSize: 10, color: '#030014' },
});

