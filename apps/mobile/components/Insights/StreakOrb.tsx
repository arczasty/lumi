import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView, Text } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

export function StreakOrb({ streak }: { streak: number }) {
    return (
        <View style={styles.container}>
            <MotiView
                from={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: 1.1, opacity: 0.4 }}
                transition={{ type: 'timing', duration: 2000, loop: true }}
                style={[StyleSheet.absoluteFill, styles.glow]}
            />
            <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
                style={styles.orb}
            >
                <Text style={styles.count}>{streak}</Text>
                <Text style={styles.label}>Day Streak</Text>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
    glow: {
        borderRadius: 60,
        backgroundColor: '#A78BFA',
        shadowColor: '#A78BFA',
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 10,
    },
    orb: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    count: {
        fontSize: 32,
        fontFamily: 'Playfair',
        color: '#fff',
        fontWeight: '600',
    },
    label: {
        fontSize: 10,
        fontFamily: 'Inter',
        color: 'rgba(255,255,255,0.7)',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 4,
    },
});
