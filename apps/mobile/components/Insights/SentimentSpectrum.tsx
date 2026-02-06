import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { MotiView } from 'moti';

const SENTIMENT_COLORS: Record<string, string> = {
    'Positive': '#A78BFA',
    'Negative': '#F2BABA',
    'Neutral': '#E2E2E2',
    'Anxiety': '#F2D4BA',
    'Bliss': '#D4BAF2',
    'Confused': '#BAEBF2'
};

export function SentimentSpectrum({ counts }: { counts: Record<string, number> }) {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    if (total === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Emotional Spectrum</Text>
            <View style={styles.bar}>
                {Object.entries(counts).map(([sentiment, count], index) => {
                    const percentage = (count / total) * 100;
                    const color = SENTIMENT_COLORS[sentiment] || '#888';
                    return (
                        <MotiView
                            key={sentiment}
                            from={{ width: '0%' }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ type: 'timing', duration: 1000, delay: index * 100 }}
                            style={{
                                height: '100%',
                                backgroundColor: color,
                                opacity: 0.8
                            }}
                        />
                    );
                })}
            </View>
            <View style={styles.legend}>
                {Object.entries(counts).map(([sentiment, count]) => (
                    <View key={sentiment} style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: SENTIMENT_COLORS[sentiment] || '#888' }]} />
                        <Text style={styles.legendText}>{sentiment} ({count})</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 16,
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
    },
    header: {
        fontSize: 14,
        fontFamily: 'Inter-Medium',
        color: '#fff',
        marginBottom: 12,
    },
    bar: {
        flexDirection: 'row',
        height: 12,
        borderRadius: 6,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 12,
    },
    legend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6
    },
    legendText: {
        fontSize: 12,
        fontFamily: 'Inter',
        color: 'rgba(255,255,255,0.6)'
    }
});
