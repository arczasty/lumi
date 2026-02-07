import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { MotiView } from 'moti';

export function SymbolCloud({ symbols }: { symbols: { name: string; count: number }[] }) {
    if (!symbols || symbols.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Recurring Themes</Text>
            <View style={styles.cloud}>
                {symbols.map((item, index) => (
                    <MotiView
                        key={item.name}
                        from={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', delay: index * 100 }}
                        style={styles.tag}
                    >
                        <Text style={styles.tagText}>{item.name}</Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{item.count}</Text>
                        </View>
                    </MotiView>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 16,
    },
    header: {
        fontSize: 14,
        fontFamily: 'Inter-Medium',
        color: '#fff',
        marginBottom: 12,
        paddingHorizontal: 4
    },
    cloud: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    tagText: {
        fontSize: 14,
        fontFamily: 'Inter',
        color: '#fff',
        marginRight: 6
    },
    countBadge: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    countText: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.8)',
        fontFamily: 'Inter-Medium'
    }
});
