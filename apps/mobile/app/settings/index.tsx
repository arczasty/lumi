import React, { useState, useEffect } from "react";
import { StyleSheet, Switch, Platform, Alert, ActivityIndicator, Share } from "react-native";
import { Text, View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { LucideSettings, LucideCrown, LucideLogOut, LucideChevronRight, LucideDownload } from "lucide-react-native";
import { Pressable } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { loadSettings, updateSetting, type AppSettings } from "@/lib/settings";
import { showSuccessToast, showErrorToast, showInfoToast } from "@/lib/toast";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function SettingsScreen() {
    const { signOut, isSignedIn, userId } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const [settings, setSettings] = useState<AppSettings>({
        hapticsEnabled: true,
        notificationsEnabled: true,
        whisperSensitivity: 'High',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Fetch all user dreams for export
    const dreams = useQuery(
        api.dreams.getDreams,
        userId ? { userId } : "skip"
    );

    // Load settings on mount
    useEffect(() => {
        loadSettings().then(setSettings);
    }, []);

    async function handleToggleSetting(key: keyof AppSettings, value: boolean) {
        // Trigger haptic if enabled
        if (settings.hapticsEnabled && key !== 'hapticsEnabled') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        try {
            const updated = await updateSetting(key, value);
            setSettings(updated);
            showSuccessToast(`${key === 'hapticsEnabled' ? 'Haptics' : 'Notifications'} ${value ? 'enabled' : 'disabled'}`);
        } catch (error) {
            showErrorToast('Failed to save setting');
        }
    }

    async function handleExportDreams() {
        if (!dreams || dreams.length === 0) {
            Alert.alert("No Dreams", "You don't have any dreams to export yet.");
            return;
        }

        setIsExporting(true);

        try {
            // Create export data
            const exportData = {
                exportedAt: new Date().toISOString(),
                dreamCount: dreams.length,
                user: {
                    name: user?.firstName || 'Dreamer',
                    email: user?.emailAddresses?.[0]?.emailAddress || 'unknown'
                },
                dreams: dreams.map(dream => ({
                    id: dream._id,
                    date: new Date(dream.createdAt).toISOString(),
                    text: dream.text,
                    interpretation: dream.interpretation,
                    sentiment: dream.sentiment,
                    symbols: dream.symbols,
                    imageUrl: dream.imageUrl
                }))
            };

            const jsonString = JSON.stringify(exportData, null, 2);

            // Use Share API (works on all platforms)
            await Share.share({
                message: jsonString,
                title: `Lumi Dream Journal Export - ${dreams.length} dreams`
            });
            showSuccessToast('Dreams exported successfully');
        } catch (error) {
            console.error('Error exporting dreams:', error);
            showErrorToast('Failed to export dreams');
        } finally {
            setIsExporting(false);
        }
    }

    async function handleSignOut() {
        Alert.alert(
            "Leave Sanctuary?",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            await signOut();
                            showInfoToast("You've left the sanctuary");
                            router.replace("/onboarding");
                        } catch (error) {
                            showErrorToast("Failed to sign out");
                            console.error("Sign out error:", error);
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    }
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Sanctuary Settings</Text>
            </View>

            <View style={styles.content}>

                {/* Profile Section */}
                <View style={styles.section}>
                    <View style={styles.profileCard}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {isSignedIn && user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'G'}
                            </Text>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>
                                {isSignedIn && user?.firstName ? user.firstName : 'Guest Dreamer'}
                            </Text>
                            <Text style={styles.profileStatus}>
                                {isSignedIn ? 'Inner Circle' : 'Traveler'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Inner Circle Promo */}
                <Pressable style={styles.promoCard}>
                    <View style={styles.promoContent}>
                        <LucideCrown color="#030014" size={24} />
                        <View>
                            <Text style={styles.promoTitle}>Join the Inner Circle</Text>
                            <Text style={styles.promoSub}>Unlock RAG Memory & Image Gen</Text>
                        </View>
                    </View>
                    <View style={styles.promoBadge}>
                        <Text style={styles.promoBadgeText}>PRO</Text>
                    </View>
                </Pressable>

                {/* General Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Preferences</Text>

                    <SettingItem
                        label="Haptic Feedback"
                        type="toggle"
                        value={settings.hapticsEnabled}
                        onToggle={(val) => handleToggleSetting('hapticsEnabled', val)}
                    />
                    <SettingItem
                        label="Whisper Mode Sensitivity"
                        type="nav"
                        value={settings.whisperSensitivity}
                    />
                    <SettingItem
                        label="Notifications"
                        type="toggle"
                        value={settings.notificationsEnabled}
                        onToggle={(val) => handleToggleSetting('notificationsEnabled', val)}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Data</Text>

                    <SettingItem
                        label="Export My Journal"
                        type="nav"
                        onPress={handleExportDreams}
                        isLoading={isExporting}
                        icon={<LucideDownload color="#BAF2BB" size={20} />}
                    />
                    <SettingItem label="Clear Local Cache" type="nav" />
                </View>

                <Pressable
                    style={[styles.logoutButton, isLoading && styles.logoutButtonDisabled]}
                    onPress={handleSignOut}
                    disabled={isLoading}
                >
                    <LucideLogOut color="#FF6B6B" size={20} />
                    <Text style={styles.logoutText}>
                        {isLoading ? 'Leaving...' : 'Leave Sanctuary (Sign Out)'}
                    </Text>
                </Pressable>

            </View>
        </SafeAreaView>
    );
}

function SettingItem({
    label,
    type,
    value,
    onToggle,
    onPress,
    isLoading,
    icon
}: {
    label: string,
    type: 'nav' | 'toggle',
    value?: any,
    onToggle?: (value: boolean) => void,
    onPress?: () => void,
    isLoading?: boolean,
    icon?: React.ReactNode
}) {
    return (
        <Pressable style={styles.settingItem} onPress={onPress} disabled={isLoading}>
            <View style={styles.settingLeft}>
                {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
                <Text style={styles.settingLabel}>{label}</Text>
            </View>
            <View style={styles.settingRight}>
                {isLoading && <ActivityIndicator size="small" color="#BAF2BB" />}
                {!isLoading && value && typeof value === 'string' && <Text style={styles.settingValue}>{value}</Text>}
                {!isLoading && type === 'toggle' ? (
                    <Switch
                        value={value}
                        onValueChange={onToggle}
                        trackColor={{ false: "#767577", true: "#BAF2BB" }}
                        thumbColor={value ? "#030014" : "#f4f3f4"}
                    />
                ) : !isLoading && type === 'nav' ? (
                    <LucideChevronRight color="rgba(255,255,255,0.3)" size={20} />
                ) : null}
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#030014",
    },
    header: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        color: '#fff',
        fontWeight: 'bold',
    },
    content: {
        padding: 24,
        gap: 32,
    },
    section: {
        gap: 12,
    },
    sectionHeader: {
        color: '#BAF2BB',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#1A1B41',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#BAF2BB',
    },
    avatarText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    profileInfo: {
        gap: 4,
    },
    profileName: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
    },
    profileStatus: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
    },
    promoCard: {
        backgroundColor: '#BAF2BB',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    promoContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    promoTitle: {
        color: '#030014',
        fontWeight: 'bold',
        fontSize: 16,
    },
    promoSub: {
        color: 'rgba(3,0,20,0.6)',
        fontSize: 13,
    },
    promoBadge: {
        backgroundColor: '#030014',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    promoBadgeText: {
        color: '#BAF2BB',
        fontWeight: 'bold',
        fontSize: 10,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingLabel: {
        color: '#fff',
        fontSize: 16,
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    settingValue: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 20,
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
    },
    logoutText: {
        color: '#FF6B6B',
        fontWeight: '600',
        fontSize: 16,
    },
    logoutButtonDisabled: {
        opacity: 0.5,
    }
});
