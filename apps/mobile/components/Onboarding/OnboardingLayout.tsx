
import React from 'react';
import { StyleSheet, View, Pressable, Platform } from 'react-native';
import { SanctuaryBackground } from "@/components/SanctuaryUI/Background";
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, MotiText } from 'moti';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/Themed';

interface OnboardingLayoutProps {
    children: React.ReactNode;
    currentStep: number; // 1-indexed
    totalSteps: number;
    showBack?: boolean;
    onBack?: () => void;
}

export const OnboardingLayout = ({ children, currentStep, totalSteps, showBack = true, onBack }: OnboardingLayoutProps) => {
    const router = useRouter();

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (onBack) onBack();
        else router.back();
    };

    return (
        <SanctuaryBackground>
            <SafeAreaView style={styles.container}>
                {/* Header: Back Only */}
                <View style={styles.header}>
                    <View style={styles.leftContainer}>
                        {showBack && (
                            <Pressable onPress={handleBack} style={styles.backButton}>
                                <ChevronLeft color="rgba(255,255,255,0.7)" size={24} />
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* Segmented Progress Bar (Static) */}
                <View style={styles.progressContainer}>
                    {Array.from({ length: totalSteps }).map((_, index) => {
                        const isActive = index < currentStep;
                        return (
                            <View key={index} style={styles.segmentWrapper}>
                                <View
                                    style={[
                                        styles.segment,
                                        {
                                            backgroundColor: isActive ? '#A78BFA' : 'rgba(255,255,255,0.1)',
                                            opacity: isActive ? 1 : 0.5
                                        }
                                    ]}
                                />
                            </View>
                        );
                    })}
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {children}
                </View>

            </SafeAreaView>
        </SanctuaryBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 10,
        marginBottom: 16,
    },
    leftContainer: { width: 44, alignItems: 'flex-start' },
    rightContainer: { width: 44 },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepCounterContainer: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    stepText: {
        fontSize: 14,
        fontFamily: 'Inter-Medium',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    totalSteps: {
        color: 'rgba(255,255,255,0.5)',
    },
    progressContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 6,
        marginBottom: 10,
    },
    segmentWrapper: {
        flex: 1,
        height: 4,
        position: 'relative',
    },
    segment: {
        flex: 1,
        height: '100%',
        borderRadius: 2,
    },
    glow: {
        backgroundColor: '#A78BFA',
        borderRadius: 2,
        shadowColor: "#A78BFA",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
    },
    content: {
        flex: 1,
    }
});
