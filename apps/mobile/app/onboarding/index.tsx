import React from "react";
import { StyleSheet, Dimensions, Platform } from "react-native";
import { Text, View } from "@/components/Themed";
import { Link, useRouter } from "expo-router";
import { createMetadata } from "@/components/Themed"; // Assuming this might exist or I'll just use basic components
import { MotiView, MotiText } from "moti";
import { LinearGradient } from "expo-linear-gradient"; // You might need to install this if not present, but usually standard in Expo
import { Pressable } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function OnboardingScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            {/* Background Gradient Fallback */}
            <View style={[styles.absoluteFill, { backgroundColor: "#030014" }]} />

            {/* Decorative Orbs */}
            <MotiView
                from={{ opacity: 0.3, scale: 0.8 }}
                animate={{ opacity: 0.5, scale: 1.2 }}
                transition={{ type: "timing", duration: 5000, loop: true }}
                style={[styles.orb, { top: -100, right: -100, backgroundColor: "#BAF2BB" }]}
            />
            <MotiView
                from={{ opacity: 0.3, scale: 1.2 }}
                animate={{ opacity: 0.5, scale: 0.8 }}
                transition={{ type: "timing", duration: 7000, loop: true }}
                style={[styles.orb, { bottom: -100, left: -100, backgroundColor: "#1A1B41" }]}
            />

            <View style={styles.content}>
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 300 }}
                    style={styles.heroContainer}
                >
                    {/* Placeholder for Gen AI Image */}
                    <View style={styles.mascotPlaceholder}>
                        <Image
                            source={require("../../assets/images/icon.png")}
                            style={styles.mascotImage}
                            contentFit="contain"
                        />
                    </View>
                    <Text style={styles.title}>Lumi</Text>
                    <Text style={styles.subtitle}>The OS for your Subconscious</Text>
                </MotiView>

                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 800 }}
                    style={styles.featureList}
                >
                    <FeatureItem icon="🌙" text="Capture dreams in a whisper" />
                    <FeatureItem icon="✨" text="Uncover hidden symbols" />
                    <FeatureItem icon="🦉" text="Consult your spirit guide" />
                </MotiView>

                <MotiView
                    from={{ opacity: 0, translateY: 50 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 1200 }}
                    style={styles.actionContainer}
                >
                    <Pressable
                        style={styles.guestButton}
                        onPress={() => router.replace("/(tabs)")}
                    >
                        <Text style={styles.guestButtonText}>Enter Sanctuary as Guest</Text>
                    </Pressable>

                    <Pressable
                        style={styles.signInButton}
                        onPress={() => router.replace("/(tabs)")} // For now route to tabs, eventually auth
                    >
                        <Text style={styles.signInButtonText}>Sign In / Restore</Text>
                    </Pressable>
                </MotiView>
            </View>
        </SafeAreaView>
    );
}

function FeatureItem({ icon, text }: { icon: string, text: string }) {
    return (
        <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>{icon}</Text>
            <Text style={styles.featureText}>{text}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#030014",
    },
    absoluteFill: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 32,
        paddingVertical: 60,
    },
    heroContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    mascotPlaceholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: "#BAF2BB",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    mascotImage: {
        width: 100,
        height: 100,
    },
    title: {
        fontSize: 48,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 8,
        fontStyle: 'italic',
    },
    featureList: {
        marginTop: 40,
        gap: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    featureIcon: {
        fontSize: 24,
        marginRight: 16,
    },
    featureText: {
        color: '#E0E0E0',
        fontSize: 16,
        fontWeight: '500',
    },
    actionContainer: {
        gap: 16,
    },
    guestButton: {
        backgroundColor: '#BAF2BB',
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: "#BAF2BB",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    guestButtonText: {
        color: '#030014',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    signInButton: {
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    signInButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    orb: {
        position: "absolute",
        width: 400,
        height: 400,
        borderRadius: 200,
        opacity: 0.3,
        filter: 'blur(80px)', // Valid in simpler web views, might need explicit BlurView for native perfect glass
    },
});
