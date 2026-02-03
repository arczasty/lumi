import React, { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import { Canvas, Circle, Group, Blur, vec, LinearGradient, RadialGradient } from "@shopify/react-native-skia";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing, useDerivedValue } from "react-native-reanimated";

interface LumiMascotProps {
    isListening: boolean;
    amplitude: number;
}

export const LumiMascot: React.FC<LumiMascotProps> = ({ isListening, amplitude }) => {
    const { width } = useWindowDimensions();
    const size = width * 0.4;
    const center = size / 2;

    const glowScale = useSharedValue(1);
    const breath = useSharedValue(0);

    useEffect(() => {
        glowScale.value = withRepeat(withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.sin) }), -1, true);
        breath.value = withRepeat(withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }), -1, true);
    }, []);

    const ampValue = useDerivedValue(() => {
        return isListening ? 1 + amplitude * 1.5 : 1;
    });

    return (
        <Canvas style={{ width: size, height: size }}>
            <Group>
                {/* Core Glow */}
                <Circle cx={center} cy={center} r={center * 0.7} color="#BAF2BB">
                    <Blur blur={20} />
                </Circle>

                {/* Inner Spirit */}
                <Circle cx={center} cy={center} r={center * 0.4 * glowScale.value * ampValue.value} color="#FFFFFF">
                    <Blur blur={5} />
                </Circle>

                {/* Aura */}
                <Circle cx={center} cy={center} r={center * 0.9} opacity={0.3}>
                    <RadialGradient c={vec(center, center)} r={center * 0.9} colors={["#BAF2BB", "transparent"]} />
                </Circle>
            </Group>
        </Canvas>
    );
};
