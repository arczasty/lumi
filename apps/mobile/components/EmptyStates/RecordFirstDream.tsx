import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Text } from "@/components/Themed";
import { MotiView } from "moti";
import { Moon, Plus } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { FONTS } from "@/constants/Theme";
import { useTheme } from "@react-navigation/native";

interface RecordFirstDreamProps {
    title?: string;
    description?: string;
}

export function RecordFirstDream({
    title = "Your Sanctuary Awaits",
    description = "Begin your journey with Lumi by recording your first dream"
}: RecordFirstDreamProps) {
    const router = useRouter();
    const { colors } = useTheme();

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push("/record");
    };

    return (
        <View style={styles.emptyContainer}>
            <MotiView
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", duration: 800 }}
                style={styles.emptyIconContainer}
            >
                <Moon size={64} color="#A78BFA" strokeWidth={1.5} />
            </MotiView>

            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 600, delay: 300 }}
            >
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                    {title}
                </Text>
                <Text style={[styles.emptyText, { color: colors.text }]}>
                    {description}
                </Text>
            </MotiView>
            <MotiView
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", duration: 500, delay: 600 }}
            >
                <Pressable
                    style={[styles.ctaButton, { backgroundColor: "#A78BFA" }]}
                    onPress={handlePress}
                >
                    <Plus size={20} color="#030014" />
                    <Text style={styles.ctaButtonText}>Record Your First Dream</Text>
                </Pressable>
            </MotiView>
        </View>
    );
}

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 40,
        paddingHorizontal: 40,
        backgroundColor: "transparent",
    },
    emptyIconContainer: {
        marginBottom: 24,
    },
    emptyTitle: {
        fontFamily: FONTS.heading.bold,
        fontSize: 32,
        color: '#fff',
        textAlign: "center",
        marginBottom: 12,
    },
    emptyText: {
        fontFamily: FONTS.body.regular,
        fontSize: 16,
        textAlign: "center",
        opacity: 0.6,
        lineHeight: 24,
        marginBottom: 32,
    },
    ctaButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 24,
    },
    ctaButtonText: {
        fontFamily: FONTS.body.semiBold,
        fontSize: 16,
        color: "#030014",
    },
});
