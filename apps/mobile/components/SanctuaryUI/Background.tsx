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
                {/* Top Right Teal/Violet Glow - "Hope" */}
                <Circle cx={width * 0.9} cy={height * 0.1} r={width * 1.5} opacity={0.4}>
                    <RadialGradient
                        c={vec(width * 0.9, height * 0.1)}
                        r={width * 1.5}
                        colors={["#A78BFA", "transparent"]}
                    />
                    <Blur blur={120} />
                </Circle>

                {/* Bottom Left Indigo/Blue Glow - "Depth" */}
                <Circle cx={-width * 0.1} cy={height * 0.9} r={width * 2.0} opacity={0.5}>
                    <RadialGradient
                        c={vec(-width * 0.1, height * 0.9)}
                        r={width * 2.0}
                        colors={["#4F46E5", "transparent"]}
                    />
                    <Blur blur={140} />
                </Circle>

                {/* Wide Center Ambient Glow */}
                <Circle cx={width * 0.5} cy={height * 0.5} r={width * 2.0} opacity={0.1}>
                    <RadialGradient
                        c={vec(width * 0.5, height * 0.5)}
                        r={width * 2.0}
                        colors={["#6366F1", "transparent"]}
                    />
                    <Blur blur={150} />
                </Circle>
            </Canvas>

            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: '#0A0520', // Deep Midnight
    }
});
