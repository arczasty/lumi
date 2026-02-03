import React, { useState } from "react";
import { StyleSheet, Dimensions, Platform, ScrollView, ActivityIndicator, Share, Alert, Modal, TextInput } from "react-native";
import { Text, View } from "@/components/Themed";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";
import { LucideArrowLeft, LucideShare, LucideSparkles, LucideMoon, LucideEdit3, LucideTrash2, LucideX, LucideCheck, LucideImage } from "lucide-react-native";
import { Pressable } from "react-native";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import * as Sharing from 'expo-sharing';
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { getSentimentColor } from "@/utils/colors";
import { LumiMascot } from "@/components/LumiMascot";
import { LumiLoader } from "@/components/SanctuaryUI/LumiLoader";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

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

🔮 Symbols: ${topSymbols.map(s => `#${s}`).join(' ')}

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
                <ActivityIndicator size="large" color="#BAF2BB" />
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
                                from={{ opacity: 0.3, scale: 0.9 }}
                                animate={{ opacity: 0.5, scale: 1.0 }}
                                transition={{ loop: true, type: 'timing', duration: 4000 }}
                            >
                                <LucideImage color="#BAF2BB" size={80} strokeWidth={1} opacity={0.3} />
                            </MotiView>
                            <Text style={styles.artLabel}>Painting your dream...</Text>
                        </View>
                    )}

                    <SafeAreaView style={styles.headerControls} edges={['top']}>
                        <Pressable onPress={handleBack} style={styles.iconButton}>
                            <LucideArrowLeft color="#fff" size={24} />
                        </Pressable>
                        <Pressable
                            style={[styles.iconButton, isSharing && styles.iconButtonDisabled]}
                            onPress={handleShare}
                            disabled={isSharing}
                        >
                            {isSharing ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <LucideShare color="#fff" size={24} />
                            )}
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
                    <View style={styles.actionRow}>
                        <Pressable
                            style={styles.editButton}
                            onPress={handleEditPress}
                        >
                            <LucideEdit3 color="#BAF2BB" size={18} />
                            <Text style={styles.editButtonText}>Edit</Text>
                        </Pressable>

                        <Pressable
                            style={styles.deleteButton}
                            onPress={handleDeletePress}
                        >
                            <LucideTrash2 color="#FF6B6B" size={18} />
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </Pressable>
                    </View>

                    <View style={styles.separator} />

                    {/* Analysis Section */}
                    {dream.interpretation ? (
                        <View style={styles.analysisSection}>
                            <View style={styles.sectionTitleRow}>
                                <LucideSparkles color="#F4E04D" size={20} />
                                <Text style={styles.sectionTitle}>Lumi's Insight</Text>
                            </View>
                            <Text style={styles.interpretation}>{dream.interpretation}</Text>

                            {dream.lumi_quote && (
                                <View style={styles.quoteBox}>
                                    <View style={styles.quoteMascotContainer}>
                                        <LumiMascot isListening={false} amplitude={0} />
                                    </View>
                                    <Text style={styles.quoteText}>
                                        "{dream.lumi_quote}"
                                    </Text>
                                </View>
                            )}
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
                                <LucideX color="#fff" size={24} />
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
                                        <LucideCheck color="#030014" size={18} />
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
    iconButtonDisabled: {
        opacity: 0.5,
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
        borderLeftColor: '#F4E04D',
    },
    quoteMascotContainer: {
        width: 40,
        height: 40,
        marginBottom: 12,
        marginLeft: -4,
    },
    quoteText: {
        color: '#F4E04D',
        fontStyle: 'italic',
        fontSize: 16,
        lineHeight: 24,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
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
        color: '#BAF2BB',
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
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1A1B41',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        minHeight: '70%',
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
        backgroundColor: '#BAF2BB',
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
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
        marginBottom: 20,
    },
    editButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(186, 242, 187, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(186, 242, 187, 0.3)',
    },
    editButtonText: {
        color: '#BAF2BB',
        fontSize: 14,
        fontWeight: '600',
    },
    deleteButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 107, 0.3)',
    },
    deleteButtonText: {
        color: '#FF6B6B',
        fontSize: 14,
        fontWeight: '600',
    },
});
