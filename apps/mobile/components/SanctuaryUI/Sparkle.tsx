import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
    withDelay,
    runOnJS,
} from 'react-native-reanimated';
import { Canvas, Circle, Blur, Group, RadialGradient, vec } from '@shopify/react-native-skia';

interface SparkleProps {
    x: number;
    y: number;
    delay?: number;
    onComplete?: () => void;
}

export const Sparkle: React.FC<SparkleProps> = ({ x, y, delay = 0, onComplete }) => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        // Sparkle Animation Sequence
        scale.value = withDelay(
            delay,
            withSequence(
                withTiming(1, { duration: 400 }),
                withTiming(0, { duration: 400 }, (finished) => {
                    if (finished && onComplete) {
                        runOnJS(onComplete)();
                    }
                })
            )
        );
        opacity.value = withDelay(
            delay,
            withSequence(
                withTiming(1, { duration: 300 }),
                withTiming(0, { duration: 500 })
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
            position: 'absolute',
            left: x - 10,
            top: y - 10,
        };
    });

    return (
        <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
            <Canvas style={{ width: 20, height: 20 }}>
                <Group>
                    <Circle cx={10} cy={10} r={5} color="#F4E04D">
                        <Blur blur={2} />
                    </Circle>
                    {/* Cross shape for sparkle */}
                    <Circle cx={10} cy={10} r={2} color="#FFFFFF" />
                </Group>
            </Canvas>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 20,
        height: 20,
    },
});
