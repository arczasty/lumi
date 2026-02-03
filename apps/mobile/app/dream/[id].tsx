import React from "react";
import { StyleSheet, Dimensions, Platform, ScrollView, ActivityIndicator } from "react-native";
import { Text, View } from "@/components/Themed";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";
import { LucideArrowLeft, LucideShare, LucideSparkles, LucideMoon } from "lucide-react-native";
import { Pressable } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function DreamDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // Fetch Real Data
    const dream = useQuery(api.dreams.getDreamById, {
        id: id as Id<"dreams">
    });

    if (dream === undefined) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#BAF2BB" />
                <Text style={styles.loadingText}>Retrieving memory...</Text>
            </View>
        );
    }

    if (dream === null) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={styles.errorText}>Dream not found.</Text>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Return to Sanctuary</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header Image Area */}
                <View style={styles.imageHeader}>
                    <View style={styles.placeholderArt}>
                        <MotiView
                            from={{ opacity: 0.3, scale: 0.9 }}
                            animate={{ opacity: 0.5, scale: 1.0 }}
                            transition={{ loop: true, type: 'timing', duration: 4000 }}
                        >
                            <LucideMoon color="#BAF2BB" size={80} strokeWidth={1} />
                        </MotiView>
                    </View>

                    <SafeAreaView style={styles.headerControls} edges={['top']}>
                        <Pressable onPress={() => router.back()} style={styles.iconButton}>
                            <LucideArrowLeft color="#fff" size={24} />
                        </Pressable>
                        <Pressable style={styles.iconButton}>
                            <LucideShare color="#fff" size={24} />
                        </Pressable>
                    </SafeAreaView>
                </View>

                <View style={styles.contentContainer}>
                    {/* Meta Header */}
                    <View style={styles.metaRow}>
                        <Text style={styles.date}>
                            {new Date(dream.createdAt).toLocaleDateString(undefined, {
                                month: 'short', day: 'numeric', year: 'numeric'
                            })}
                        </Text>
                        {dream.sentiment && (
                            <View style={styles.sentimentBadge}>
                                <Text style={styles.sentimentText}>{dream.sentiment}</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.dreamText}>"{dream.text}"</Text>

                    <View style={styles.separator} />

                    {/* Analysis Section */}
                    {dream.interpretation ? (
                        <View style={styles.analysisSection}>
                            <View style={styles.sectionTitleRow}>
                                <LucideSparkles color="#F4E04D" size={20} />
                                <Text style={styles.sectionTitle}>Lumi's Insight</Text>
                            </View>
                            <Text style={styles.interpretation}>{dream.interpretation}</Text>

                            {/* Note: Schema does not yet have 'lumiQuote', using placeholder logic if needed or just omission */}
                            <View style={styles.quoteBox}>
                                <Text style={styles.quoteText}>
                                    "The subconscious speaks in whispers, and you have finally listened."
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.analysisSection}>
                            <ActivityIndicator color="#F4E04D" />
                            <Text style={styles.analyzingText}>Lumi is analyzing your dream...</Text>
                        </View>
                    )}

                    {/* Symbols */}
                    {dream.symbols && (
                        <View style={styles.symbolsRow}>
                            {dream.symbols.map((s, i) => (
                                <View key={i} style={styles.symbolTag}>
                                    <Text style={styles.symbolText}>#{s}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#030014",
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: 'rgba(255,255,255,0.5)',
        marginTop: 16,
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 18,
        marginBottom: 20,
    },
    analyzingText: {
        color: '#F4E04D',
        marginTop: 10,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    backButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    backButtonText: {
        color: '#fff',
    },
    scrollContent: {
        paddingBottom: 60,
    },
    imageHeader: {
        height: 300,
        backgroundColor: '#1A1B41',
        position: 'relative',
    },
    placeholderArt: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.3,
    },
    artLabel: {
        color: '#BAF2BB',
        marginTop: 16,
        opacity: 0.6,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    headerControls: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        flex: 1,
        marginTop: -40,
        backgroundColor: '#030014',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 32,
        minHeight: 500,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    date: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sentimentBadge: {
        backgroundColor: 'rgba(186, 242, 187, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(186, 242, 187, 0.2)',
    },
    sentimentText: {
        color: '#BAF2BB',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    dreamText: {
        color: '#FFF',
        fontSize: 20,
        lineHeight: 32,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        marginBottom: 32,
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 32,
    },
    analysisSection: {
        marginBottom: 32,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    sectionTitle: {
        color: '#F4E04D',
        fontSize: 18,
        fontWeight: '600',
    },
    interpretation: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        lineHeight: 26,
        marginBottom: 24,
    },
    quoteBox: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 20,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#BAF2BB',
    },
    quoteText: {
        color: '#BAF2BB',
        fontStyle: 'italic',
        fontSize: 16,
        lineHeight: 24,
    },
    symbolsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    symbolTag: {
        backgroundColor: '#1A1B41',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    symbolText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
    }
});
