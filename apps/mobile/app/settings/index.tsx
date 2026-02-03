import React from "react";
import { StyleSheet, Switch, Platform } from "react-native";
import { Text, View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { LucideSettings, LucideCrown, LucideLogOut, LucideChevronRight } from "lucide-react-native";
import { Pressable } from "react-native";

export default function SettingsScreen() {
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
                            <Text style={styles.avatarText}>G</Text>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>Guest Dreamer</Text>
                            <Text style={styles.profileStatus}>Traveler</Text>
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

                    <SettingItem label="Haptic Feedback" type="toggle" value={true} />
                    <SettingItem label="Whisper Mode Sensitivity" type="nav" value="High" />
                    <SettingItem label="Notifications" type="nav" />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Data</Text>

                    <SettingItem label="Export My Journal" type="nav" />
                    <SettingItem label="Clear Local Cache" type="nav" />
                </View>

                <Pressable style={styles.logoutButton}>
                    <LucideLogOut color="#FF6B6B" size={20} />
                    <Text style={styles.logoutText}>Leave Sanctuary (Sign Out)</Text>
                </Pressable>

            </View>
        </SafeAreaView>
    );
}

function SettingItem({ label, type, value }: { label: string, type: 'nav' | 'toggle', value?: any }) {
    return (
        <Pressable style={styles.settingItem}>
            <Text style={styles.settingLabel}>{label}</Text>
            <View style={styles.settingRight}>
                {value && typeof value === 'string' && <Text style={styles.settingValue}>{value}</Text>}
                {type === 'toggle' ? (
                    <Switch
                        value={value}
                        trackColor={{ false: "#767577", true: "#BAF2BB" }}
                        thumbColor={value ? "#030014" : "#f4f3f4"}
                    />
                ) : (
                    <LucideChevronRight color="rgba(255,255,255,0.3)" size={20} />
                )}
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
    }
});
