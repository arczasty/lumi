import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Canvas, Circle, Blur, RadialGradient, vec } from "@shopify/react-native-skia";
import { useWindowDimensions } from "react-native";

export const SanctuaryBackground = ({ children }: { children: ReactNode }) => {
    const { width, height } = useWindowDimensions();

    return (
        <View style={styles.container}>
            {/* Deep Midnight Base Gradient */}
            <LinearGradient
                colors={["#0A0520", "#0F0E35", "#151040"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Skia Ambient Light Orbs */}
            <Canvas style={StyleSheet.absoluteFill}>
                {/* Top Right Teal/Violet Glow - "Hope" (Stronger) */}
                <Circle cx={width * 0.8} cy={height * 0.15} r={width * 1.0} opacity={0.5}>
                    <RadialGradient
                        c={vec(width * 0.8, height * 0.15)}
                        r={width * 1.0}
                        colors={["#A78BFA", "transparent"]}
                    />
                    <Blur blur={90} />
                </Circle>

                {/* Bottom Left Indigo/Blue Glow - "Depth" (Stronger) */}
                <Circle cx={0} cy={height * 0.85} r={width * 1.2} opacity={0.6}>
                    <RadialGradient
                        c={vec(0, height * 0.85)}
                        r={width * 1.2}
                        colors={["#4F46E5", "transparent"]}
                    />
                    <Blur blur={110} />
                </Circle>

                {/* Center Ambient Glow to kill the void */}
                <Circle cx={width * 0.5} cy={height * 0.5} r={width * 0.8} opacity={0.15}>
                    <RadialGradient
                        c={vec(width * 0.5, height * 0.5)}
                        r={width * 0.8}
                        colors={["#6366F1", "transparent"]}
                    />
                    <Blur blur={120} />
                </Circle>
            </Canvas>

            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0520', // Deep Midnight
    }
});
