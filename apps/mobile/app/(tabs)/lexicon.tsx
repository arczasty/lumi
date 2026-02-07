import React, { useState, useMemo } from "react";
import { StyleSheet, FlatList, View, TextInput, Pressable, ScrollView, Modal, Platform } from "react-native";
import { Text } from "@/components/Themed";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { SanctuaryBackground } from "@/components/SanctuaryUI/Background";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BlurView } from "expo-blur";
import { Search, Sparkles, Filter, BookOpen, User, Heart, X, Moon, Plus } from "lucide-react-native";
import { MotiView, MotiText, AnimatePresence } from "moti";
import { FONTS, PURPLE, BACKGROUND, TEXT, BORDER, SHADOW, TYPOGRAPHY } from "@/constants/Theme";
import { LumiLoader } from "@/components/SanctuaryUI/LumiLoader";
import * as Haptics from "expo-haptics";
import { useUser } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { useIsProUser } from "@/contexts/RevenueCatContext";
import { Lock } from "lucide-react-native";
import { RecordFirstDream } from "@/components/EmptyStates/RecordFirstDream";

type LexiconItem = {
    _id: string;
    name: string;
    description: string;
    references: number;
    category?: string;
    type: "symbol" | "archetype" | "emotion";
};

export default function LexiconScreen() {
    const { user: clerkUser } = useUser();
    const router = useRouter();
    const { search } = useLocalSearchParams<{ search?: string }>();

    // Fetch only user-encountered items with user-specific counts
    const discoveries = useQuery(api.dreams.getUserDiscoveries, clerkUser?.id ? { userId: clerkUser.id } : "skip");
    const isProUser = useIsProUser();

    const symbols = discoveries?.symbols;
    const archetypes = discoveries?.archetypes;
    const emotions = discoveries?.emotions;

    const [searchQuery, setSearchQuery] = useState(search || "");
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<LexiconItem | null>(null);

    // Sync search query from params
    React.useEffect(() => {
        if (search) {
            setSearchQuery(search);
            setSelectedType(null); // Clear type filter when searching specifically
        }
    }, [search]);

    // Combine and memoize all items
    const allItems = useMemo(() => {
        if (!symbols || !archetypes || !emotions) return [] as LexiconItem[];

        const combined: LexiconItem[] = [
            ...(symbols as any[]).map(s => ({ ...s, type: "symbol" as const })),
            ...(archetypes as any[]).map(a => ({ ...a, type: "archetype" as const })),
            ...(emotions as any[]).map(e => ({ ...e, type: "emotion" as const }))
        ];

        return combined.sort((a, b) => b.references - a.references);
    }, [symbols, archetypes, emotions]);

    // Derived state for filtering
    const filteredItems = useMemo(() => {
        return allItems.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = selectedType ? item.type === selectedType : true;
            return matchesSearch && matchesType;
        });
    }, [allItems, searchQuery, selectedType]);

    const handleItemPress = (item: LexiconItem, index: number) => {
        const isLocked = !isProUser && index >= 5;
        if (isLocked) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            router.push('/onboarding/paywall'); // Show paywall
            return;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectedItem(item);
    };

    if (discoveries === undefined) {
        return (
            <View style={{ flex: 1 }}>
                <SanctuaryBackground>
                    <LumiLoader />
                </SanctuaryBackground>
            </View>
        );
    }

    const getTypeIcon = (type: string, size = 16, color = "#A78BFA") => {
        switch (type) {
            case "symbol": return <Moon size={size} color={color} />;
            case "archetype": return <User size={size} color={color} />;
            case "emotion": return <Heart size={size} color={color} />;
            default: return <Sparkles size={size} color={color} />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "symbol": return "#A78BFA"; // Purple
            case "archetype": return "#2DD4BF"; // Teal
            case "emotion": return "#FF6B6B"; // Red/Coral
            default: return "#A78BFA";
        }
    };

    return (
        <SanctuaryBackground>
            <SafeAreaView style={styles.container} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>Dream Lexicon</Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Search color="rgba(255,255,255,0.4)" size={20} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Explore meanings..."
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Type Filter */}
                <View style={styles.categoriesContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
                        <Pressable
                            style={[styles.typeChip, !selectedType && styles.typeChipActive]}
                            onPress={() => {
                                Haptics.selectionAsync();
                                setSelectedType(null);
                            }}
                        >
                            <Text style={[styles.typeText, !selectedType && styles.typeTextActive]}>All</Text>
                        </Pressable>
                        {[
                            { id: "symbol", label: "Symbols", color: "#A78BFA" },
                            { id: "archetype", label: "Archetypes", color: "#2DD4BF" },
                            { id: "emotion", label: "Emotions", color: "#FF6B6B" }
                        ].map(type => (
                            <Pressable
                                key={type.id}
                                style={[
                                    styles.typeChip,
                                    selectedType === type.id && { backgroundColor: `${type.color}20`, borderColor: type.color }
                                ]}
                                onPress={() => {
                                    Haptics.selectionAsync();
                                    setSelectedType(type.id);
                                }}
                            >
                                <Text style={[
                                    styles.typeText,
                                    selectedType === type.id && { color: type.color, fontFamily: FONTS.body.bold }
                                ]}>{type.label}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* List */}
                <FlatList
                    data={filteredItems}
                    keyExtractor={(item) => `${item.type}-${item._id}`}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => {
                        const isLocked = !isProUser && index >= 5;
                        return (
                            <MotiView
                                from={{ opacity: 0, translateY: 20 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ delay: index * 40 }}
                            >
                                <Pressable
                                    style={[styles.card, isLocked && styles.cardLocked]}
                                    onPress={() => handleItemPress(item, index)}
                                >
                                    <View style={styles.cardHeader}>
                                        <View style={styles.nameRow}>
                                            <View style={[styles.typeMiniIcon, { backgroundColor: `${getTypeColor(item.type)}20` }]}>
                                                {getTypeIcon(item.type, 12, getTypeColor(item.type))}
                                            </View>
                                            <Text style={styles.itemName}>
                                                {isLocked ? "Refined Wisdom" : item.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                                            </Text>
                                        </View>
                                        {!isLocked && (
                                            <View style={styles.usageBadge}>
                                                <Sparkles size={10} color="#A78BFA" />
                                                <Text style={styles.usageText}>{item.references}</Text>
                                            </View>
                                        )}
                                    </View>

                                    <Text style={[styles.itemDescription, isLocked && { opacity: 0.2 }]} numberOfLines={2}>
                                        {isLocked ? "This deep subconscious connection is currently drifting in the fog. Unlock the full sanctuary to clear its message." : item.description}
                                    </Text>

                                    <View style={styles.cardFooter}>
                                        <View style={styles.typeTag}>
                                            <Text style={[styles.typeTagText, { color: getTypeColor(item.type) }]}>
                                                {item.type.toUpperCase()}
                                            </Text>
                                        </View>
                                        {item.category && !isLocked && (
                                            <View style={styles.categoryTag}>
                                                <Text style={styles.categoryTagText}>{item.category}</Text>
                                            </View>
                                        )}
                                    </View>

                                    {isLocked && (
                                        <View style={styles.lockOverlay}>
                                            <BlurView intensity={12} tint="dark" style={StyleSheet.absoluteFill} />
                                            <View style={styles.proBadgeFloating}>
                                                <View style={styles.proBadgeMini}>
                                                    <Text style={styles.proBadgeMiniText}>PRO</Text>
                                                </View>
                                            </View>
                                            <View style={styles.lockIconContainer}>
                                                <Sparkles size={16} color="#A78BFA" />
                                            </View>
                                        </View>
                                    )}
                                </Pressable>
                            </MotiView>
                        );
                    }}
                    ListEmptyComponent={
                        allItems.length === 0 ? (
                            <RecordFirstDream
                                title="Your Lexicon is Silent"
                                description="Record your dreams to discover the symbols, archetypes, and emotions hidden in your subconscious."
                            />
                        ) : (
                            <View style={styles.emptyState}>
                                <Moon size={40} color="rgba(255,255,255,0.1)" style={{ marginBottom: 12 }} />
                                <Text style={styles.emptyText}>Nothing found in this realm yet.</Text>
                            </View>
                        )
                    }
                />

                {/* Detail Modal */}
                <Modal
                    visible={!!selectedItem}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setSelectedItem(null)}
                >
                    <View style={styles.modalOverlay}>
                        <Pressable style={styles.modalBlur} onPress={() => setSelectedItem(null)}>
                            <BlurView intensity={30} style={StyleSheet.absoluteFill} tint="dark" />
                        </Pressable>

                        <AnimatePresence>
                            {selectedItem && (
                                <MotiView
                                    from={{ opacity: 0, scale: 0.9, translateY: 20 }}
                                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, translateY: 20 }}
                                    style={styles.modalContent}
                                >
                                    <LinearGradient
                                        colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                                        style={styles.modalGradient}
                                    >
                                        <View style={styles.modalHeader}>
                                            <View style={[styles.modalTypeIcon, { backgroundColor: `${getTypeColor(selectedItem.type)}20` }]}>
                                                {getTypeIcon(selectedItem.type, 20, getTypeColor(selectedItem.type))}
                                            </View>
                                            <Pressable
                                                onPress={() => setSelectedItem(null)}
                                                style={styles.modalCloseButton}
                                            >
                                                <X color="rgba(255,255,255,0.5)" size={20} />
                                            </Pressable>
                                        </View>

                                        <Text style={styles.modalTitle}>
                                            {selectedItem.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                                        </Text>

                                        <View style={styles.modalMetaRow}>
                                            <View style={styles.typeBadge}>
                                                <Text style={[styles.typeBadgeText, { color: getTypeColor(selectedItem.type) }]}>
                                                    {selectedItem.type.toUpperCase()}
                                                </Text>
                                            </View>
                                            <View style={styles.modalUsageBadge}>
                                                <Sparkles size={14} color="#A78BFA" />
                                                <Text style={styles.modalUsageText}>{selectedItem.references} reflections</Text>
                                            </View>
                                        </View>

                                        <ScrollView style={styles.modalDescriptionScroll} showsVerticalScrollIndicator={false}>
                                            <Text style={styles.modalDescription}>
                                                {selectedItem.description}
                                            </Text>

                                            {selectedItem.category && (
                                                <View style={styles.modalCategorySection}>
                                                    <Text style={styles.categoryLabel}>Realm</Text>
                                                    <Text style={styles.categoryValue}>{selectedItem.category}</Text>
                                                </View>
                                            )}
                                        </ScrollView>

                                        <Pressable
                                            style={styles.modalActionButton}
                                            onPress={() => setSelectedItem(null)}
                                        >
                                            <Text style={styles.modalActionButtonText}>Close Insight</Text>
                                        </Pressable>
                                    </LinearGradient>
                                </MotiView>
                            )}
                        </AnimatePresence>
                    </View>
                </Modal>
            </SafeAreaView>
        </SanctuaryBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: "center" },
    loadingText: { marginTop: 16, color: "rgba(255,255,255,0.5)", fontFamily: FONTS.body.regular },

    // Header
    header: { paddingHorizontal: 24, marginBottom: 24, paddingTop: 10 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
    title: { fontFamily: FONTS.heading.bold, fontSize: 32, color: "#fff" },
    subtitle: { fontFamily: FONTS.body.regular, fontSize: 13, color: "rgba(255,255,255,0.4)", marginLeft: 40 },

    searchContainer: { paddingHorizontal: 24, marginBottom: 16 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "rgba(255,255,255,0.03)",
        borderRadius: 18,
        paddingHorizontal: 16,
        height: 52,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: "#fff",
        fontFamily: FONTS.body.regular,
        fontSize: 15,
    },

    categoriesContainer: { marginBottom: 16 },
    categoriesContent: { paddingHorizontal: 24, gap: 10 },
    typeChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },
    typeChipActive: {
        backgroundColor: "rgba(167, 139, 250, 0.15)",
        borderColor: "#A78BFA",
    },
    typeText: {
        color: "rgba(255,255,255,0.5)",
        fontFamily: FONTS.body.medium,
        fontSize: 13,
    },
    typeTextActive: {
        color: "#A78BFA",
        fontFamily: FONTS.body.bold,
    },

    listContent: { padding: 24, paddingBottom: 120, gap: 16 },
    card: {
        backgroundColor: "rgba(255, 255, 255, 0.03)",
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    typeMiniIcon: {
        width: 24,
        height: 24,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemName: {
        fontFamily: FONTS.heading.semiBold,
        fontSize: 17,
        color: "#fff",
        letterSpacing: 0.3,
    },
    usageBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: "rgba(167, 139, 250, 0.08)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    usageText: {
        color: "#A78BFA",
        fontSize: 11,
        fontFamily: FONTS.body.bold,
    },
    itemDescription: {
        color: "rgba(255,255,255,0.6)",
        fontFamily: FONTS.body.regular,
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    typeTag: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    typeTagText: {
        fontSize: 9,
        fontFamily: FONTS.body.bold,
        letterSpacing: 0.5,
    },
    categoryTag: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        backgroundColor: "rgba(255,255,255,0.05)",
    },
    categoryTagText: {
        color: "rgba(255,255,255,0.4)",
        fontSize: 9,
        fontFamily: FONTS.body.medium,
        textTransform: 'uppercase',
    },
    emptyState: { alignItems: 'center', paddingTop: 60, opacity: 0.5 },
    emptyText: { color: "#fff", fontFamily: FONTS.body.regular, fontStyle: 'italic', fontSize: 14 },
    emptyTextCenter: { color: "rgba(255,255,255,0.6)", fontFamily: FONTS.body.regular, fontSize: 16, textAlign: "center", lineHeight: 24, marginBottom: 32 },
    emptyTitle: { fontFamily: FONTS.heading.bold, fontSize: 28, color: '#fff', textAlign: 'center', marginBottom: 12 },
    recordFirstContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 40 },
    emptyIconContainer: { marginBottom: 24 },
    ctaButton: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 24, backgroundColor: "#A78BFA" },
    ctaButtonText: { fontFamily: FONTS.body.semiBold, fontSize: 16, color: "#030014" },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: 24,
    },
    modalBlur: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: '#0A0B1A',
    },
    modalGradient: {
        padding: 30,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTypeIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontFamily: FONTS.heading.bold,
        fontSize: 28,
        color: "#fff",
        marginBottom: 12,
    },
    modalMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    typeBadgeText: {
        fontSize: 10,
        fontFamily: FONTS.body.bold,
        letterSpacing: 1,
    },
    modalUsageBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    modalUsageText: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 13,
        fontFamily: FONTS.body.medium,
    },
    modalDescriptionScroll: {
        maxHeight: 300,
        marginBottom: 30,
    },
    modalDescription: {
        color: "rgba(255,255,255,0.85)",
        fontFamily: FONTS.body.regular,
        fontSize: 16,
        lineHeight: 26,
    },
    modalCategorySection: {
        marginTop: 24,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    categoryLabel: {
        color: "rgba(255,255,255,0.3)",
        fontSize: 10,
        fontFamily: FONTS.body.bold,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    categoryValue: {
        color: '#A78BFA',
        fontSize: 14,
        fontFamily: FONTS.body.medium,
    },
    modalActionButton: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        height: 54,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    modalActionButtonText: {
        color: '#fff',
        fontFamily: FONTS.body.bold,
        fontSize: 15,
    },
    proBadgeMini: {
        backgroundColor: 'rgba(167, 139, 250, 0.3)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(167, 139, 250, 0.5)',
    },
    proBadgeMiniText: {
        fontFamily: FONTS.body.bold,
        fontSize: 10,
        color: '#A78BFA',
    },
    proBadgeFloating: {
        position: 'absolute',
        top: 20,
        right: 20,
    },
    cardLocked: {
        opacity: 0.8,
    },
    lockOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 20,
        overflow: 'hidden',
    },
    lockIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
});
