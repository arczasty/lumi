import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Text } from '@/components/Themed';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS } from '@/constants/Theme';

export function StreakOrb({ streak }: { streak: number }) {
    return (
        <View style={styles.container}>
            {/* Outer Rotating Ring */}
            <MotiView
                from={{ rotate: '0deg' }}
                animate={{ rotate: '360deg' }}
                transition={{
                    type: 'timing',
                    duration: 10000,
                    loop: true,
                    repeatReverse: false,
                }}
                style={styles.orbitContainer}
            >
                <MotiView
                    animate={{
                        opacity: [0.4, 0.8, 0.4],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        type: 'timing',
                        duration: 3000,
                        loop: true,
                    }}
                    style={styles.particle}
                />
            </MotiView>

            {/* Pulsing Breathing Background */}
            <MotiView
                from={{ scale: 0.8, opacity: 0.3 }}
                animate={{ scale: 1.2, opacity: 0.1 }}
                transition={{
                    type: 'timing',
                    duration: 4000,
                    loop: true,
                }}
                style={[StyleSheet.absoluteFill, styles.glow]}
            />

            {/* Inner Glow Core */}
            <MotiView
                animate={{
                    opacity: [0.2, 0.5, 0.2],
                    scale: [0.95, 1.05, 0.95],
                }}
                transition={{
                    type: 'timing',
                    duration: 2500,
                    loop: true,
                }}
                style={[StyleSheet.absoluteFill, styles.innerGlow]}
            />

            <LinearGradient
                colors={['rgba(167, 139, 250, 0.3)', 'rgba(3, 0, 20, 0.6)']}
                style={styles.orb}
            >
                <MotiView
                    from={{ translateY: 5, opacity: 0 }}
                    animate={{ translateY: 0, opacity: 1 }}
                    transition={{ delay: 300, type: 'spring' }}
                    style={{ alignItems: 'center' }}
                >
                    <Text style={styles.count}>{streak}</Text>
                    <Text style={styles.label}>Day Streak</Text>
                </MotiView>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    orbitContainer: {
        position: 'absolute',
        width: 80,
        height: 80,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    particle: {
        marginTop: 4, // Offset from the edge
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#A78BFA',
        shadowColor: '#A78BFA',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
    },
    glow: {
        borderRadius: 40, // Half of container width
        backgroundColor: '#A78BFA',
    },
    innerGlow: {
        borderRadius: 40,
        backgroundColor: '#A78BFA',
        margin: 8,
    },
    orb: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(167, 139, 250, 0.5)',
        shadowColor: '#A78BFA',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        overflow: 'hidden',
    },
    count: {
        fontSize: 22,
        fontFamily: FONTS.heading.bold,
        color: '#fff',
        marginBottom: -2,
    },
    label: {
        fontSize: 7,
        fontFamily: FONTS.body.medium,
        color: 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 1,
        textAlign: 'center',
        lineHeight: 8,
    },
});
