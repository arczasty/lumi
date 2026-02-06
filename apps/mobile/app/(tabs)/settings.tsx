import React, { useState, useEffect } from "react";
import { StyleSheet, Switch, Platform, Alert, Share, ScrollView, Pressable, Linking } from "react-native";
import { Text, View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogOut, Download, Bell, Vibrate, HelpCircle, ExternalLink, RefreshCcw, Bug } from "lucide-react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { loadSettings, updateSetting, type AppSettings } from "@/lib/settings";
import { showSuccessToast, showErrorToast, showInfoToast } from "@/lib/toast";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SanctuaryBackground } from "@/components/SanctuaryUI/Background";
import { MotiView } from "moti";
import Constants from "expo-constants";
import { FONTS } from "@/constants/Theme";

const IS_DEV = process.env.EXPO_PUBLIC_DEVELOPMENT === "TRUE";

export default function SettingsScreen() {
    const { signOut, userId } = useAuth();
    const router = useRouter();
    const [settings, setSettings] = useState<AppSettings>({
        hapticsEnabled: true,
        notificationsEnabled: true,
        whisperSensitivity: "High",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const dreams = useQuery(api.dreams.getDreams, userId ? { userId } : "skip");

    useEffect(() => {
        loadSettings().then(setSettings);
    }, []);

    async function handleToggleSetting(key: keyof AppSettings, value: boolean) {
        if (settings.hapticsEnabled && key !== "hapticsEnabled") {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        try {
            const updated = await updateSetting(key, value);
            setSettings(updated);
            showSuccessToast(`${key === "hapticsEnabled" ? "Haptics" : "Notifications"} ${value ? "enabled" : "disabled"}`);
        } catch {
            showErrorToast("Failed to save setting");
        }
    }

    async function handleExportDreams() {
        if (!dreams || dreams.length === 0) {
            Alert.alert("No Dreams", "You don't have any dreams to export yet.");
            return;
        }
        setIsExporting(true);
        try {
            const exportData = {
                exportedAt: new Date().toISOString(),
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
            showSuccessToast("Dreams exported");
        } catch {
            showErrorToast("Failed to export");
        } finally {
            setIsExporting(false);
        }
    }

    async function handleSignOut() {
        Alert.alert("Leave Sanctuary?", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Sign Out",
                style: "destructive",
                onPress: async () => {
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

    // DEV ONLY: Reset to onboarding
    async function handleDevReset() {
        Alert.alert("🧪 Dev Reset", "This will sign you out and restart from onboarding.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Reset",
                style: "destructive",
                onPress: async () => {
                    try {
                        await signOut();
                        router.replace("/onboarding");
                    } catch {
                        router.replace("/onboarding");
                    }
                },
            },
        ]);
    }

    const appVersion = Constants.expoConfig?.version || "1.0.0";

    return (
        <SanctuaryBackground>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Settings</Text>
                    </View>

                    {/* Preferences */}
                    <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 100 }}>
                        <Text style={styles.sectionTitle}>Preferences</Text>
                        <View style={styles.card}>
                            <View style={styles.settingRow}>
                                <View style={styles.settingIcon}>
                                    <Vibrate size={18} color="#A78BFA" />
                                </View>
                                <View style={styles.settingInfo}>
                                    <Text style={styles.settingLabel}>Haptic Feedback</Text>
                                    <Text style={styles.settingDescription}>Vibrations on interactions</Text>
                                </View>
                                <Switch
                                    value={settings.hapticsEnabled}
                                    onValueChange={(v) => handleToggleSetting("hapticsEnabled", v)}
                                    trackColor={{ false: "rgba(255,255,255,0.1)", true: "rgba(167,139,250,0.5)" }}
                                    thumbColor={settings.hapticsEnabled ? "#A78BFA" : "#666"}
                                />
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.settingRow}>
                                <View style={styles.settingIcon}>
                                    <Bell size={18} color="#A78BFA" />
                                </View>
                                <View style={styles.settingInfo}>
                                    <Text style={styles.settingLabel}>Notifications</Text>
                                    <Text style={styles.settingDescription}>Dream reminders</Text>
                                </View>
                                <Switch
                                    value={settings.notificationsEnabled}
                                    onValueChange={(v) => handleToggleSetting("notificationsEnabled", v)}
                                    trackColor={{ false: "rgba(255,255,255,0.1)", true: "rgba(167,139,250,0.5)" }}
                                    thumbColor={settings.notificationsEnabled ? "#A78BFA" : "#666"}
                                />
                            </View>
                        </View>
                    </MotiView>

                    {/* Data */}
                    <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 200 }}>
                        <Text style={styles.sectionTitle}>Data</Text>
                        <View style={styles.card}>
                            <Pressable style={styles.actionRow} onPress={handleExportDreams} disabled={isExporting}>
                                <View style={styles.settingIcon}>
                                    <Download size={18} color="#A78BFA" />
                                </View>
                                <Text style={styles.actionLabel}>Export Dreams</Text>
                            </Pressable>
                        </View>
                    </MotiView>

                    {/* Support */}
                    <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 300 }}>
                        <Text style={styles.sectionTitle}>Support</Text>
                        <View style={styles.card}>
                            <Pressable style={styles.actionRow} onPress={() => Linking.openURL("mailto:support@lumi.app")}>
                                <View style={styles.settingIcon}>
                                    <HelpCircle size={18} color="#A78BFA" />
                                </View>
                                <Text style={styles.actionLabel}>Help & Feedback</Text>
                                <ExternalLink size={14} color="rgba(255,255,255,0.3)" />
                            </Pressable>
                        </View>
                    </MotiView>

                    {/* Account */}
                    <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 400 }}>
                        <Text style={styles.sectionTitle}>Account</Text>
                        <View style={styles.card}>
                            <Pressable style={styles.actionRow} onPress={handleSignOut} disabled={isLoading}>
                                <View style={[styles.settingIcon, { backgroundColor: "rgba(239,68,68,0.15)" }]}>
                                    <LogOut size={18} color="#EF4444" />
                                </View>
                                <Text style={[styles.actionLabel, { color: "#EF4444" }]}>Sign Out</Text>
                            </Pressable>
                        </View>
                    </MotiView>

                    {/* DEV ONLY */}
                    {IS_DEV && (
                        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 500 }}>
                            <Text style={[styles.sectionTitle, { color: "#F59E0B" }]}>🧪 Developer</Text>
                            <View style={[styles.card, { borderColor: "rgba(245,158,11,0.3)" }]}>
                                <Pressable style={styles.actionRow} onPress={handleDevReset}>
                                    <View style={[styles.settingIcon, { backgroundColor: "rgba(245,158,11,0.15)" }]}>
                                        <RefreshCcw size={18} color="#F59E0B" />
                                    </View>
                                    <Text style={[styles.actionLabel, { color: "#F59E0B" }]}>Reset & Restart Onboarding</Text>
                                </Pressable>
                            </View>
                        </MotiView>
                    )}

                    {/* Version */}
                    <View style={styles.versionContainer}>
                        <Text style={styles.versionText}>Lumi v{appVersion}</Text>
                        {IS_DEV && <Text style={styles.devBadge}>DEV MODE</Text>}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SanctuaryBackground>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 120 },
    // Header
    header: { marginBottom: 24, backgroundColor: "transparent" },
    headerTitle: { fontFamily: FONTS.heading.bold, fontSize: 28, color: "#fff" },
    // Sections
    sectionTitle: { fontFamily: FONTS.body.semiBold, fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 8, marginLeft: 4, letterSpacing: 0.5 },
    card: {
        backgroundColor: "rgba(255,255,255,0.06)",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        marginBottom: 20,
    },
    divider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginHorizontal: 16 },
    // Setting Row
    settingRow: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "transparent" },
    settingIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "rgba(167,139,250,0.15)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },
    settingInfo: { flex: 1, backgroundColor: "transparent" },
    settingLabel: { fontFamily: FONTS.body.medium, fontSize: 15, color: "#fff" },
    settingDescription: { fontFamily: FONTS.body.regular, fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 },
    // Action Row
    actionRow: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "transparent" },
    actionLabel: { fontFamily: FONTS.body.medium, flex: 1, fontSize: 15, color: "#fff" },
    // Version
    versionContainer: { alignItems: "center", marginTop: 20, gap: 8, backgroundColor: "transparent" },
    versionText: { fontFamily: FONTS.body.regular, fontSize: 12, color: "rgba(255,255,255,0.3)" },
    devBadge: { fontFamily: FONTS.body.bold, fontSize: 10, color: "#F59E0B", paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "rgba(245,158,11,0.15)", borderRadius: 4 },
});
