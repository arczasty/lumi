import React, { useState } from "react";
import { StyleSheet, Dimensions, Platform, ScrollView, ActivityIndicator, Share, Alert, Modal, TextInput, View } from "react-native";
import { Text } from "@/components/Themed";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Sparkles, Moon, Trash2, X, Check, Image as LucideImage, User, Heart } from "lucide-react-native";
import { Pressable } from "react-native";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import * as Sharing from 'expo-sharing';
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { getSentimentColor } from "@/utils/colors";
import { LumiLoader } from "@/components/SanctuaryUI/LumiLoader";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { FONTS, PURPLE, BACKGROUND, TEXT, BORDER, SHADOW, TYPOGRAPHY } from "@/constants/Theme";
import { LinearGradient } from "expo-linear-gradient";

export default function DreamDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [isSharing, setIsSharing] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editedText, setEditedText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Convex hooks
    const dream = useQuery(api.dreams.getDreamById, {
        id: id as Id<"dreams">
    });
    const updateDream = useMutation(api.dreams.updateDream);
    const deleteDream = useMutation(api.dreams.deleteDream);
    const analyzeDream = useAction(api.ai.analyzeDream);

    // Handle Edit
    const handleEditPress = () => {
        if (dream) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setEditedText(dream.text);
            setIsEditModalVisible(true);
        }
    };

    const handleSaveEdit = async () => {
        if (!dream || !editedText.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Dream text cannot be empty',
            });
            return;
        }

        try {
            setIsSubmitting(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            // Update the dream
            await updateDream({
                id: dream._id,
                text: editedText.trim(),
            });

            setIsEditModalVisible(false);

            // Ask if user wants to re-analyze
            Alert.alert(
                "Re-analyze Dream?",
                "Would you like Lumi to analyze your edited dream?",
                [
                    {
                        text: "No",
                        style: "cancel",
                        onPress: () => {
                            Toast.show({
                                type: 'success',
                                text1: 'Dream Updated',
                                text2: 'Your dream has been saved',
                            });
                        }
                    },
                    {
                        text: "Yes",
                        onPress: async () => {
                            try {
                                await analyzeDream({
                                    dreamId: dream._id,
                                    text: editedText.trim(),
                                });
                                Toast.show({
                                    type: 'success',
                                    text1: 'Dream Updated',
                                    text2: 'Lumi is analyzing your dream...',
                                });
                            } catch (error) {
                                Toast.show({
                                    type: 'error',
                                    text1: 'Analysis Failed',
                                    text2: 'Could not re-analyze dream',
                                });
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to update dream',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Delete
    const handleDeletePress = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

        Alert.alert(
            "Delete Dream?",
            "This action cannot be undone. Your dream and its analysis will be permanently deleted.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            if (dream) {
                                await deleteDream({ id: dream._id });
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                Toast.show({
                                    type: 'success',
                                    text1: 'Dream Deleted',
                                    text2: 'Your dream has been removed',
                                });
                                router.back();
                            }
                        } catch (error) {
                            Toast.show({
                                type: 'error',
                                text1: 'Error',
                                text2: 'Failed to delete dream',
                            });
                        }
                    }
                }
            ]
        );
    };


    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    const handleShare = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (!dream || !dream.interpretation) {
            Alert.alert("Not Ready", "Please wait for Lumi to finish analyzing your dream.");
            return;
        }

        setIsSharing(true);

        try {
            // Extract first 2 sentences from interpretation
            const sentences = dream.interpretation.match(/[^.!?]+[.!?]+/g) || [];
            const excerpt = sentences.slice(0, 2).join(' ').trim();

            // Get top 3 symbols
            const topSymbols = dream.symbols?.slice(0, 3) || [];

            // Format the shareable text
            const shareText = `🌙 Dream from ${new Date(dream.createdAt).toLocaleDateString()}

"${dream.text}"

✨ Lumi's Insight:
${excerpt}

🔮 Symbols: ${topSymbols.join(', ')}

Interpreted by Lumi 🌙
Your bioluminescent dream journal`;

            // Use native Share API
            const result = await Share.share({
                message: shareText,
                title: 'My Dream Interpretation'
            });

            if (result.action === Share.sharedAction) {
                // Shared successfully
                showSuccessToast('Dream shared successfully');
            }
        } catch (error) {
            showErrorToast('Unable to share your dream at this time');
        } finally {
            setIsSharing(false);
        }
    };

    if (dream === undefined) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#A78BFA" />
                <Text style={styles.loadingText}>Retrieving memory...</Text>
            </View>
        );
    }

    if (dream === null) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={styles.errorText}>Dream not found.</Text>
                <Pressable onPress={handleBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Return to Sanctuary</Text>
                </Pressable>
            </View>
        );
    }

    const sentimentColors = getSentimentColor(dream.sentiment);

    const handleTagPress = (name: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push({ pathname: "/lexicon", params: { search: name } });
    };

    const MinimalTag = ({ name, color, onPress }: { name: string, color: string, onPress: () => void }) => (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.minimalTag,
                { backgroundColor: `${color}12`, borderColor: `${color}25` },
                pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] }
            ]}
        >
            <Text style={[styles.minimalTagText, { color }]}>{name}</Text>
        </Pressable>
    );

    const renderArchetypes = () => {
        if (!dream.dreamArchetypes || dream.dreamArchetypes.length === 0) return null;
        return (
            <View style={styles.tagSection}>
                <View style={styles.tagSectionHeader}>
                    <User size={12} color="#2DD4BF" strokeWidth={2.5} />
                    <Text style={[styles.tagSectionLabel, { color: '#2DD4BF' }]}>Archetypes</Text>
                </View>
                <View style={styles.tagsRow}>
                    {dream.dreamArchetypes.map((a, i) => (
                        <MinimalTag
                            key={i}
                            name={a.name}
                            color="#2DD4BF"
                            onPress={() => handleTagPress(a.name)}
                        />
                    ))}
                </View>
            </View>
        );
    };

    const renderEmotions = () => {
        if (!dream.dreamEmotions || dream.dreamEmotions.length === 0) return null;
        return (
            <View style={styles.tagSection}>
                <View style={styles.tagSectionHeader}>
                    <Heart size={12} color="#FF6B6B" strokeWidth={2.5} />
                    <Text style={[styles.tagSectionLabel, { color: '#FF6B6B' }]}>Underlying Emotions</Text>
                </View>
                <View style={styles.tagsRow}>
                    {dream.dreamEmotions.map((e, i) => (
                        <MinimalTag
                            key={i}
                            name={e.name}
                            color="#FF6B6B"
                            onPress={() => handleTagPress(e.name)}
                        />
                    ))}
                </View>
            </View>
        );
    };

    const renderSymbols = () => {
        if (!dream.dreamSymbols || dream.dreamSymbols.length === 0) return null;
        return (
            <View style={styles.tagSection}>
                <View style={styles.tagSectionHeader}>
                    <Moon size={12} color="#A78BFA" strokeWidth={2.5} />
                    <Text style={[styles.tagSectionLabel, { color: '#A78BFA' }]}>Symbols</Text>
                </View>
                <View style={styles.tagsRow}>
                    {dream.dreamSymbols.map((s, i) => (
                        <MinimalTag
                            key={i}
                            name={s.name}
                            color="#A78BFA"
                            onPress={() => handleTagPress(s.name)}
                        />
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header Image Area */}
                <View style={styles.imageHeader}>
                    {dream.imageUrl ? (
                        <Image
                            source={{ uri: dream.imageUrl }}
                            style={styles.heroImage}
                            contentFit="cover"
                            transition={500}
                        />
                    ) : (
                        <View style={styles.placeholderArt}>
                            <MotiView
                                from={{ opacity: 0.5, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1.1 }}
                                transition={{
                                    type: 'timing',
                                    duration: 2000,
                                    loop: true,
                                }}
                                style={styles.loadingOrbContainer}
                            >
                                <View style={styles.loadingOrbOuter}>
                                    <View style={styles.loadingOrbInner} />
                                </View>
                            </MotiView>
                            <Text style={styles.artLabel}>Lumi is painting your dream...</Text>
                        </View>
                    )}

                    <SafeAreaView style={styles.headerControls} edges={['top']}>
                        <Pressable onPress={handleBack} style={styles.iconButton}>
                            <ArrowLeft color="#fff" size={24} />
                        </Pressable>
                        <View style={styles.headerRightActions}>
                            <Pressable
                                onPress={handleDeletePress}
                                style={[styles.iconButton, styles.deleteButton]}
                            >
                                <Trash2 color="#FF6B6B" size={20} />
                            </Pressable>
                        </View>
                    </SafeAreaView>
                </View>

                <View style={styles.contentContainer}>
                    {/* Meta Header */}
                    <View style={styles.metaRow}>
                        <Text style={styles.dateTitle}>
                            {new Date(dream.createdAt).toLocaleDateString(undefined, {
                                month: 'long', day: 'numeric', year: 'numeric'
                            })}
                        </Text>
                        {dream.sentiment && (
                            <View style={[styles.sentimentBadge, {
                                backgroundColor: sentimentColors.bg,
                                borderColor: sentimentColors.text + '40'
                            }]}>
                                <Text style={[styles.sentimentText, { color: sentimentColors.text }]}>{dream.sentiment}</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.dreamText}>"{dream.text}"</Text>

                    {/* Action Buttons */}
                    {/* Analysis Section (Insight) - Unified Card Style */}
                    {dream.interpretation ? (
                        <View style={styles.unifiedCard}>
                            <View style={styles.sectionTitleRow}>
                                <Sparkles color="#2DD4BF" size={18} />
                                <Text style={[styles.sectionTitle, { color: '#2DD4BF' }]}>Lumi's Insight</Text>
                            </View>
                            <Text style={styles.interpretation}>{dream.interpretation}</Text>

                            {dream.lumi_quote && (
                                <View style={styles.quoteBox}>
                                    <View style={styles.quoteIconContainer}>
                                        <Moon size={18} color="#2DD4BF" style={{ opacity: 0.8 }} />
                                    </View>
                                    <Text style={styles.quoteText}>
                                        "{dream.lumi_quote}"
                                    </Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        <View style={styles.unifiedCard}>
                            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                                <MotiView
                                    from={{ opacity: 0.3, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ loop: true, type: 'timing', duration: 1500 }}
                                >
                                    <Sparkles color="#2DD4BF" size={32} />
                                </MotiView>
                                <Text style={[styles.analyzingText, { color: '#2DD4BF' }]}>Lumi is analyzing your dream...</Text>
                            </View>
                        </View>
                    )}

                    {/* Guidance Section - Prominent Box */}
                    {dream.guidance && (
                        <LinearGradient
                            colors={['rgba(167, 139, 250, 0.1)', 'rgba(167, 139, 250, 0.05)']}
                            style={styles.guidanceCard}
                        >
                            <Text style={styles.guidanceLabel}>💡 Guidance</Text>
                            <Text style={styles.guidanceText}>{dream.guidance}</Text>
                        </LinearGradient>
                    )}

                    {/* Compact Meanings Section */}
                    {(dream.dreamArchetypes?.length || dream.dreamEmotions?.length || dream.dreamSymbols?.length) && (
                        <View style={styles.meaningsCard}>
                            {renderArchetypes()}
                            {renderEmotions()}
                            {renderSymbols()}
                        </View>
                    )}

                    {/* Action Footer */}
                    {/* Action Footer - Removed Archive Reflection as requested */}
                    <View style={styles.footerActions}>
                        {/* Empty footer for spacing */}
                    </View>

                </View>

                {/* Edit Modal */}
                <Modal
                    visible={isEditModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setIsEditModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Edit Dream</Text>
                                <Pressable
                                    onPress={() => setIsEditModalVisible(false)}
                                    style={styles.closeButton}
                                >
                                    <X color="#fff" size={24} />
                                </Pressable>
                            </View>

                            <TextInput
                                style={styles.textInput}
                                value={editedText}
                                onChangeText={setEditedText}
                                multiline
                                placeholder="Write your dream here..."
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                autoFocus
                                editable={!isSubmitting}
                            />

                            <View style={styles.modalActions}>
                                <Pressable
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setIsEditModalVisible(false)}
                                    disabled={isSubmitting}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </Pressable>

                                <Pressable
                                    style={[styles.modalButton, styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
                                    onPress={handleSaveEdit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#030014" size="small" />
                                    ) : (
                                        <>
                                            <Check color="#030014" size={18} />
                                            <Text style={styles.saveButtonText}>Save</Text>
                                        </>
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
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
    heroImage: {
        width: '100%',
        height: '100%',
    },
    placeholderArt: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.3,
    },
    artLabel: {
        color: '#A78BFA',
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
    headerRightActions: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    iconButtonDisabled: {
        opacity: 0.5,
    },
    contentContainer: {
        flex: 1,
        marginTop: -32,
        backgroundColor: '#030014',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingVertical: 32,
        minHeight: 500,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    // Styles Refined for 2026 Vibe
    dateTitle: {
        color: TEXT.primary,
        fontSize: 20,
        fontFamily: FONTS.heading.bold,
        letterSpacing: 0.5,
    },
    sentimentBadge: {
        backgroundColor: 'rgba(186, 242, 187, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(186, 242, 187, 0.2)',
    },
    sentimentText: {
        color: '#A78BFA',
        fontSize: 11,
        fontFamily: FONTS.body.bold,
        textTransform: 'uppercase',
    },
    dreamText: {
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: 16,
        lineHeight: 28,
        fontFamily: FONTS.body.regular,
        marginBottom: 32,
        fontStyle: 'italic',
    },
    separator: {
        height: 1,
        backgroundColor: BORDER.subtle,
        marginBottom: 24,
    },
    // Unified Card Style for Consistency
    unifiedCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
        marginBottom: 24,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: FONTS.heading.semiBold,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    interpretation: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 16,
        lineHeight: 26,
        fontFamily: FONTS.body.regular,
        marginBottom: 16,
    },
    quoteBox: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    quoteIconContainer: {
        marginTop: 2,
    },
    quoteText: {
        flex: 1,
        color: '#2DD4BF', // Teal
        fontStyle: 'italic',
        fontSize: 15,
        lineHeight: 22,
        fontFamily: FONTS.heading.regular,
    },
    guidanceCard: {
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(167, 139, 250, 0.2)',
        marginBottom: 24,
    },
    guidanceLabel: {
        color: '#A78BFA',
        fontSize: 12,
        fontFamily: FONTS.body.bold,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 10,
    },
    guidanceText: {
        color: '#FFFFFF',
        fontSize: 16,
        lineHeight: 24,
        fontFamily: FONTS.body.medium,
    },
    sectionLabel: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 11,
        fontFamily: FONTS.body.bold,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    archetypesSection: {
        marginBottom: 24,
    },
    archetypeCard: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    archetypeGradient: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(45, 212, 191, 0.2)', // Teal border
        borderRadius: 12,
    },
    analysisSection: {
        marginBottom: 24,
    },
    symbolsSection: {
        marginBottom: 20,
    },
    symbolsList: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 12,
    },
    symbolItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    archetypeText: {
        fontSize: 13,
        fontFamily: FONTS.body.semiBold,
    },
    archetypesScroll: {
        paddingVertical: 4,
    },
    secondarySentimentsSection: {
        marginBottom: 24,
    },
    sentimentsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    secondarySentimentTag: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    secondarySentimentText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 13,
        fontFamily: FONTS.body.medium,
    },

    // Removed old structuredSymbolCard styles as unifiedCard is used
    symbolHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 6,
    },
    symbolIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    structuredSymbolName: {
        color: '#A78BFA',
        fontSize: 16,
        fontFamily: FONTS.heading.semiBold,
    },
    structuredSymbolContext: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        lineHeight: 20,
        fontFamily: FONTS.body.regular,
        fontStyle: 'italic',
        marginTop: 4,
    },
    symbolsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    symbolTag: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    symbolText: {
        color: TEXT.secondary,
        fontSize: 14,
        fontFamily: FONTS.body.medium,
    },
    // Action Button Styles
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    editButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(186, 242, 187, 0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(186, 242, 187, 0.3)',
    },
    editButtonText: {
        color: '#A78BFA',
        fontSize: 16,
        fontWeight: '600',
    },
    deleteButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 107, 0.3)',
    },
    deleteButtonText: {
        color: '#FF6B6B',
        fontSize: 16,
        fontWeight: '600',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(3, 0, 20, 0.95)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#030014',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        padding: 24,
        minHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textInput: {
        flex: 1,
        color: '#fff',
        fontSize: 18,
        lineHeight: 28,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        textAlignVertical: 'top',
        marginBottom: 24,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    cancelButtonText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#A78BFA',
        flexDirection: 'row',
        gap: 8,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#030014',
        fontSize: 16,
        fontWeight: '600',
    },
    footerActions: {
        marginTop: 40,
        paddingTop: 32,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
    },

    // Meanings Section
    meaningsCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 24,
        gap: 20,
    },
    tagSection: {
        width: '100%',
    },
    tagSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    tagSectionLabel: {
        fontSize: 10,
        fontFamily: FONTS.body.bold,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        opacity: 0.8,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    minimalTag: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
    },
    minimalTagText: {
        fontSize: 12,
        fontFamily: FONTS.body.semiBold,
        textTransform: 'uppercase',
    },
    // New Loading Styles
    loadingOrbContainer: {
        marginBottom: 16,
    },
    loadingOrbOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(167, 139, 250, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingOrbInner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#A78BFA',
        shadowColor: '#A78BFA',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 16,
    },
    deleteButton: {
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderColor: 'rgba(255, 107, 107, 0.2)',
    },
});
