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
                colors={["#030014", "#0A0B2E", "#110F24"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Skia Ambient Light Orbs */}
            <Canvas style={StyleSheet.absoluteFill}>
                {/* Top Right Teal Glow */}
                <Circle cx={width} cy={0} r={width * 0.8} opacity={0.3}>
                    <RadialGradient
                        c={vec(width, 0)}
                        r={width * 0.8}
                        colors={["#BAF2BB", "transparent"]}
                    />
                    <Blur blur={60} />
                </Circle>

                {/* Bottom Left Indigo Glow */}
                <Circle cx={0} cy={height} r={width * 0.9} opacity={0.4}>
                    <RadialGradient
                        c={vec(0, height)}
                        r={width * 0.9}
                        colors={["#4F46E5", "transparent"]}
                    />
                    <Blur blur={80} />
                </Circle>
            </Canvas>

            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#030014',
    }
});
