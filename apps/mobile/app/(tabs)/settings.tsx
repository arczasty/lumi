import React, { useState, useEffect, useCallback } from "react";
import { Text } from "@/components/Themed";
import { StyleSheet, Switch, Platform, Alert, Share, ScrollView, Pressable, Linking, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    LogOut, Download, Bell, Vibrate, HelpCircle, ExternalLink,
    RefreshCcw, Crown, Sparkles, RotateCcw, Fingerprint, Brain,
    ShieldCheck, ChevronRight, Zap, Ghost
} from "lucide-react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';
import { loadSettings, updateSetting, type AppSettings } from "@/lib/settings";
import { showSuccessToast, showErrorToast, showInfoToast } from "@/lib/toast";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SanctuaryBackground } from "@/components/SanctuaryUI/Background";
import { MotiView, AnimatePresence } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";
import { FONTS, PURPLE, TEXT, BORDER, BACKGROUND } from "@/constants/Theme";
import { useRevenueCat } from "@/contexts/RevenueCatContext";
import { posthog } from "@/lib/posthog";

const IS_DEV = process.env.EXPO_PUBLIC_DEVELOPMENT === "TRUE";

export default function SettingsScreen() {
    const { signOut, userId } = useAuth();
    const { user: clerkUser } = useUser();
    const router = useRouter();
    const [settings, setSettings] = useState<AppSettings>({
        hapticsEnabled: true,
        notificationsEnabled: true,
        biometricLockEnabled: false,
        autoAnalysisEnabled: true,
        whisperSensitivity: "High",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    // RevenueCat subscription state
    const { isProUser, currentPlan, presentPaywall, presentCustomerCenter, restorePurchases } = useRevenueCat();

    // Convex User Data
    const userData = useQuery(api.users.getUser, userId ? { userId } : "skip");
    const dreams = useQuery(api.dreams.getDreams, userId ? { userId } : "skip");

    useEffect(() => {
        loadSettings().then(setSettings);
    }, []);

    const handleToggleSetting = useCallback(async (key: keyof AppSettings, value: boolean) => {
        if (settings.hapticsEnabled) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Special handling for Biometrics
        if (key === 'biometricLockEnabled' && value) {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (!hasHardware || !isEnrolled) {
                Alert.alert("Biometrics Unavailable", "Please set up FaceID or TouchID on your device first.");
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Confirm to enable Biometric Lock',
            });

            if (!result.success) return;
        }

        // Special handling for Notifications
        if (key === 'notificationsEnabled' && value) {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Required", "Please enable notifications in your device settings to receive dream reminders.");
                return;
            }
        }

        try {
            const updated = await updateSetting(key, value);
            setSettings(updated);

            // Analytics
            posthog.capture('settings_changed', {
                setting: key,
                value: value
            });

            showSuccessToast(`${key.replace(/([A-Z])/g, ' $1').trim()} ${value ? "enabled" : "disabled"}`);
        } catch {
            showErrorToast("Failed to save setting");
        }
    }, [settings.hapticsEnabled]);

    async function handleExportDreams() {
        if (!dreams || dreams.length === 0) {
            Alert.alert("No Dreams", "You don't have any dreams to export yet.");
            return;
        }
        setIsExporting(true);
        posthog.capture('export_dreams_initiated');

        try {
            const exportData = {
                exportedAt: new Date().toISOString(),
                user: userData?.name || clerkUser?.fullName,
                dreamCount: dreams.length,
                dreams: dreams.map((d) => ({
                    date: new Date(d.createdAt).toISOString(),
                    text: d.text,
                    interpretation: d.interpretation,
                    sentiment: d.sentiment,
                })),
            };
            await Share.share({
                message: JSON.stringify(exportData, null, 2),
                title: `Lumi Journal Export - ${dreams.length} dreams`,
            });
            posthog.capture('export_dreams_success', { count: dreams.length });
            showSuccessToast("Dreams exported");
        } catch (e) {
            posthog.capture('export_dreams_error');
            showErrorToast("Failed to export");
        } finally {
            setIsExporting(false);
        }
    }

    async function handleSignOut() {
        Alert.alert("Sign Out of Sanctuary?", "Are you sure you want to end this session?", [
            { text: "Cancel", onPress: () => posthog.capture('sign_out_cancelled'), style: "cancel" },
            {
                text: "Sign Out",
                style: "destructive",
                onPress: async () => {
                    posthog.capture('sign_out_confirmed');
                    try {
                        setIsLoading(true);
                        await signOut();
                        showInfoToast("Signed out");
                        router.replace("/onboarding");
                    } catch {
                        showErrorToast("Failed to sign out");
                    } finally {
                        setIsLoading(false);
                    }
                },
            },
        ]);
    }

    const appVersion = Constants.expoConfig?.version || "1.0.0";

    return (
        <SanctuaryBackground>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Settings</Text>
                    </View>



                    {/* Preferences Section */}
                    <Section title="Sanctuary Experience" delay={100}>
                        <SettingRow
                            icon={<Vibrate size={20} color={PURPLE.primary} />}
                            label="Haptic Feedback"
                            description="Physical resonance on interaction"
                            value={settings.hapticsEnabled}
                            onToggle={(v) => handleToggleSetting("hapticsEnabled", v)}
                        />
                        <Divider />
                        <SettingRow
                            icon={<Bell size={20} color={PURPLE.primary} />}
                            label="Dream Reminders"
                            description="Gentle prompts to record"
                            value={settings.notificationsEnabled}
                            onToggle={(v) => handleToggleSetting("notificationsEnabled", v)}
                        />
                        <Divider />
                        <SettingRow
                            icon={<Brain size={20} color={PURPLE.primary} />}
                            label="Auto-Analysis"
                            description="AI insights as you record"
                            value={settings.autoAnalysisEnabled}
                            onToggle={(v) => handleToggleSetting("autoAnalysisEnabled", v)}
                        />
                    </Section>

                    {/* Security Section */}
                    <Section title="Privacy & Security" delay={200}>
                        <SettingRow
                            icon={<Fingerprint size={20} color={PURPLE.primary} />}
                            label="Biometric Lock"
                            description="Secure your dreams with FaceID"
                            value={settings.biometricLockEnabled}
                            onToggle={(v) => handleToggleSetting("biometricLockEnabled", v)}
                        />
                    </Section>

                    {/* Subscription Section */}
                    <Section title="Membership" delay={300}>
                        {isProUser ? (
                            <Pressable
                                style={styles.premiumCard}
                                onPress={() => presentCustomerCenter()}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: 'rgba(167,139,250,0.2)' }]}>
                                    <Crown size={20} color={PURPLE.primary} />
                                </View>
                                <View style={styles.flex1}>
                                    <Text style={styles.settingLabel}>Lumi Pro Active</Text>
                                    <Text style={styles.settingDescription}>
                                        Managing your infinite subscription
                                    </Text>
                                </View>
                                <ChevronRight size={20} color={TEXT.muted} />
                            </Pressable>
                        ) : (
                            <Pressable
                                style={styles.proShowcaseCard}
                                onPress={() => router.push('/onboarding/paywall')}
                            >
                                <LinearGradient
                                    colors={['#A78BFA', '#7C3AED']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.proGradient}
                                >
                                    <View style={styles.proShowcaseContent}>
                                        <View style={styles.proShowcaseLeft}>
                                            <Crown size={32} color="#fff" style={{ marginBottom: 12 }} />
                                            <Text style={styles.proShowcaseTitle}>Ascend to Pro</Text>
                                            <Text style={styles.proShowcaseSub}>Unlock the full depth of your psyche</Text>
                                            <View style={styles.benefitList}>
                                                {[
                                                    'Unlimited Reflections',
                                                    'Deep Jungian Synthesis',
                                                    'Full Symbol Lexicon',
                                                    'Premium AI Guidance'
                                                ].map((benefit, i) => (
                                                    <View key={i} style={styles.benefitItem}>
                                                        <Sparkles size={12} color="#fff" />
                                                        <Text style={styles.benefitText}>{benefit}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                        <View style={styles.upgradeBadge}>
                                            <Zap size={14} color="#7C3AED" />
                                            <Text style={styles.upgradeText}>UPGRADE</Text>
                                        </View>
                                    </View>
                                </LinearGradient>
                            </Pressable>
                        )}
                        {!isProUser && (
                            <Pressable
                                style={styles.restoreButton}
                                onPress={async () => {
                                    setIsRestoring(true);
                                    try {
                                        const restored = await restorePurchases();
                                        if (restored) showSuccessToast("Purchases restored!");
                                        else showInfoToast("No purchases found");
                                    } catch (e) {
                                        showErrorToast("Restore failed");
                                    } finally {
                                        setIsRestoring(false);
                                    }
                                }}
                            >
                                <RotateCcw size={14} color={PURPLE.primary} />
                                <Text style={styles.restoreText}>{isRestoring ? "Restoring..." : "Restore Purchases"}</Text>
                            </Pressable>
                        )}
                    </Section>

                    {/* Data Section */}
                    <Section title="Journal Management" delay={400}>
                        <ActionRow
                            icon={<Download size={20} color={PURPLE.primary} />}
                            label="Export Dream Journal"
                            onPress={handleExportDreams}
                        />
                        <Divider />
                        <ActionRow
                            icon={<HelpCircle size={20} color={PURPLE.primary} />}
                            label="Help & Feedback"
                            onPress={() => Linking.openURL("mailto:support@lumi.app")}
                        />
                    </Section>

                    {/* Account Section */}
                    <Section title="Account" delay={500}>
                        <ActionRow
                            icon={<Ghost size={20} color={TEXT.muted} />}
                            label="Sign Out of Sanctuary"
                            onPress={handleSignOut}
                        />
                    </Section>

                    {/* Developer Section */}
                    {IS_DEV && (
                        <Section title="🧪 Developer Laboratory" delay={600} titleColor={SEMANTIC.warning}>
                            <ActionRow
                                icon={<RefreshCcw size={20} color={SEMANTIC.warning} />}
                                label="Reset Onboarding"
                                onPress={() => {
                                    Alert.alert("Reset?", "This will restart your journey.", [
                                        { text: "NoWay" },
                                        {
                                            text: "Reset", style: 'destructive', onPress: async () => {
                                                await signOut();
                                                router.replace("/onboarding");
                                            }
                                        }
                                    ]);
                                }}
                            />
                        </Section>
                    )}

                    {/* Version */}
                    <View style={styles.footer}>
                        <Text style={styles.versionText}>Lumi Sanctuary v{appVersion}</Text>
                        <Text style={styles.copyrightText}>© 2026 Lumi. Bioluminescent Minds.</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SanctuaryBackground>
    );
}

// Helper Components
function Section({ title, children, delay, titleColor }: { title: string, children: React.ReactNode, delay: number, titleColor?: string }) {
    return (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay, type: 'timing', duration: 500 }}
            style={styles.section}
        >
            <Text style={[styles.sectionTitle, titleColor ? { color: titleColor } : null]}>{title}</Text>
            <View style={styles.card}>
                {children}
            </View>
        </MotiView>
    );
}

function SettingRow({ icon, label, description, value, onToggle }: { icon: any, label: string, description: string, value: boolean, onToggle: (v: boolean) => void }) {
    return (
        <View style={styles.row}>
            <View style={styles.iconContainer}>{icon}</View>
            <View style={styles.flex1}>
                <Text style={styles.settingLabel}>{label}</Text>
                <Text style={styles.settingDescription}>{description}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: "rgba(255,255,255,0.05)", true: PURPLE.primary + '80' }}
                thumbColor={value ? PURPLE.primary : "#666"}
            />
        </View>
    );
}

function ActionRow({ icon, label, onPress, isDestructive }: { icon: any, label: string, onPress: () => void, isDestructive?: boolean }) {
    return (
        <Pressable
            style={({ pressed }) => [styles.row, pressed && { backgroundColor: 'rgba(255,255,255,0.03)' }]}
            onPress={onPress}
        >
            <View style={[styles.iconContainer, isDestructive && { backgroundColor: 'rgba(239,68,68,0.1)' }]}>{icon}</View>
            <Text style={[styles.settingLabel, isDestructive && { color: SEMANTIC.error }]}>{label}</Text>
            <ChevronRight size={16} color={isDestructive ? SEMANTIC.error + '40' : TEXT.muted} />
        </Pressable>
    );
}

function Divider() {
    return <View style={styles.divider} />;
}

const SEMANTIC = {
    error: '#EF4444',
    warning: '#F59E0B',
};

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 140 },
    flex1: { flex: 1 },

    // Header
    header: { marginBottom: 24 },
    title: { fontFamily: FONTS.heading.bold, fontSize: 32, color: TEXT.primary },



    // Sections
    section: { marginBottom: 24 },
    sectionTitle: {
        fontFamily: FONTS.body.semiBold,
        fontSize: 13,
        color: TEXT.muted,
        marginBottom: 12,
        marginLeft: 4,
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    card: {
        backgroundColor: "rgba(255,255,255,0.04)",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
        overflow: 'hidden',
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.05)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    settingLabel: { fontFamily: FONTS.body.bold, fontSize: 16, color: TEXT.primary },
    settingDescription: { fontFamily: FONTS.body.regular, fontSize: 12, color: TEXT.muted, marginTop: 2 },
    divider: { height: 1, backgroundColor: "rgba(255,255,255,0.05)", marginLeft: 72 },

    // Membership Card Specific
    premiumCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: 'rgba(167,139,250,0.05)',
    },
    restoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    restoreText: { fontFamily: FONTS.body.semiBold, fontSize: 12, color: PURPLE.primary },

    // Footer
    footer: { alignItems: "center", marginTop: 20, gap: 4 },
    versionText: { fontFamily: FONTS.body.regular, fontSize: 12, color: TEXT.disabled },
    copyrightText: { fontFamily: FONTS.body.regular, fontSize: 10, color: TEXT.disabled },
    proShowcaseCard: {
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 16,
    },
    proGradient: {
        padding: 24,
    },
    proShowcaseContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    proShowcaseLeft: {
        flex: 1,
    },
    proShowcaseTitle: {
        fontFamily: FONTS.heading.bold,
        fontSize: 24,
        color: '#fff',
        marginBottom: 4,
    },
    proShowcaseSub: {
        fontFamily: FONTS.body.medium,
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 16,
    },
    benefitList: {
        gap: 8,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    benefitText: {
        fontFamily: FONTS.body.medium,
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
    },
    upgradeBadge: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    upgradeText: {
        fontFamily: FONTS.body.bold,
        fontSize: 12,
        color: '#7C3AED',
    },
});
