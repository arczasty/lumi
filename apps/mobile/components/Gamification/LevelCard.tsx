import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Crown } from 'lucide-react-native';

interface LevelCardProps {
    level: number;
    xp: number;
    nextLevelXp: number;
}

export function LevelCard({ level = 1, xp = 0, nextLevelXp = 100 }: LevelCardProps) {
    const progress = Math.min((xp / nextLevelXp) * 100, 100);

    return (
        <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.container}
        >
            <LinearGradient
                colors={['#4c1d95', '#7c3aed']} // Deep purple to vibrant violet
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                <View style={styles.header}>
                    <View style={styles.levelBadge}>
                        <Crown size={16} color="#FFD700" />
                        <Text style={styles.levelText}>Lvl {level}</Text>
                    </View>
                    <Text style={styles.xpText}>{xp} / {nextLevelXp} XP</Text>
                </View>

                <Text style={styles.rankTitle}>
                    {getLevelTitle(level)}
                </Text>

                <View style={styles.progressBarBg}>
                    <MotiView
                        from={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: 'timing', duration: 1000 }}
                        style={styles.progressBarFill}
                    />
                </View>
            </LinearGradient>
        </MotiView>
    );
}

function getLevelTitle(level: number) {
    if (level < 3) return "Novice Dreamer";
    if (level < 5) return "Lucid Explorer";
    if (level < 10) return "Astral Traveler";
    return "Dream Weaver";
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginTop: 20,
        shadowColor: "#7c3aed",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    card: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    levelBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6
    },
    levelText: {
        color: '#fff',
        fontFamily: 'Inter-Bold',
        fontSize: 12
    },
    xpText: {
        color: 'rgba(255,255,255,0.8)',
        fontFamily: 'Inter',
        fontSize: 12
    },
    rankTitle: {
        color: '#fff',
        fontFamily: 'Playfair-Bold',
        fontSize: 22,
        marginBottom: 16
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 4,
        overflow: 'hidden'
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 4
    }
});
