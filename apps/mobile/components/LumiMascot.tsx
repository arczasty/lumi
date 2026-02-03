import React, { useEffect } from "react";
import { useWindowDimensions, View, StyleSheet } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    interpolate,
} from "react-native-reanimated";

interface LumiMascotProps {
    isListening?: boolean;
    amplitude?: number;
}

/**
 * LumiMascot - A soft, ethereal orb that breathes with life
 * Redesigned for a premium "Bioluminescent Sanctuary" feel
 * Uses layered gradients instead of harsh Skia blur
 */
export const LumiMascot: React.FC<LumiMascotProps> = ({
    isListening = false,
    amplitude = 0,
}) => {
    const { width } = useWindowDimensions();
    const size = width * 0.45;

    // Breathing animation
    const breath = useSharedValue(0);

    useEffect(() => {
        breath.value = withRepeat(
            withTiming(1, {
                duration: 4000,
                easing: Easing.bezier(0.4, 0.0, 0.6, 1.0),
            }),
            -1,
            true
        );
    }, []);

    // Outer aura - expands/contracts gently
    const auraStyle = useAnimatedStyle(() => {
        const scale = interpolate(breath.value, [0, 1], [1, 1.12]);
        const opacity = interpolate(breath.value, [0, 1], [0.3, 0.5]);
        return {
            transform: [{ scale }],
            opacity,
        };
    });

    // Middle glow - breathes opposite to create depth
    const glowStyle = useAnimatedStyle(() => {
        const scale = interpolate(breath.value, [0, 1], [1.05, 0.95]);
        const opacity = interpolate(breath.value, [0, 1], [0.6, 0.8]);
        return {
            transform: [{ scale }],
            opacity,
        };
    });

    // Core - subtle pulse
    const coreStyle = useAnimatedStyle(() => {
        const scale = interpolate(breath.value, [0, 1], [0.9, 1.1]);
        const listeningBoost = isListening ? 1 + amplitude * 0.3 : 1;
        return {
            transform: [{ scale: scale * listeningBoost }],
        };
    });

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {/* Outermost Aura - very soft, large */}
            <Animated.View
                style={[
                    styles.layer,
                    styles.aura,
                    { width: size, height: size, borderRadius: size / 2 },
                    auraStyle,
                ]}
            />

            {/* Middle Glow - main body */}
            <Animated.View
                style={[
                    styles.layer,
                    styles.glow,
                    {
                        width: size * 0.7,
                        height: size * 0.7,
                        borderRadius: (size * 0.7) / 2,
                    },
                    glowStyle,
                ]}
            />

            {/* Inner Core - bright center */}
            <Animated.View
                style={[
                    styles.layer,
                    styles.core,
                    {
                        width: size * 0.35,
                        height: size * 0.35,
                        borderRadius: (size * 0.35) / 2,
                    },
                    coreStyle,
                ]}
            />

            {/* Hotspot - tiny bright center */}
            <View
                style={[
                    styles.layer,
                    styles.hotspot,
                    {
                        width: size * 0.12,
                        height: size * 0.12,
                        borderRadius: (size * 0.12) / 2,
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
    },
    layer: {
        position: "absolute",
    },
    aura: {
        backgroundColor: "rgba(186, 242, 187, 0.08)",
        shadowColor: "#BAF2BB",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 60,
    },
    glow: {
        backgroundColor: "rgba(186, 242, 187, 0.15)",
        shadowColor: "#BAF2BB",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 40,
    },
    core: {
        backgroundColor: "rgba(220, 255, 220, 0.5)",
        shadowColor: "#E8FFF0",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 25,
    },
    hotspot: {
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        shadowColor: "#FFFFFF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
    },
});
