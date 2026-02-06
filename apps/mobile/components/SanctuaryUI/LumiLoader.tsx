import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { SanctuaryBackground } from "@/components/SanctuaryUI/Background";
import { MotiView, MotiText, AnimatePresence } from "moti";

const LOADING_PHRASES = [
    "Consulting the stars...",
    "Drifting through the ether...",
    "Weaving starlight...",
    "Listening to the silence...",
    "Awakening your sanctuary...",
];

export const LumiLoader = () => {
    const [phraseIndex, setPhraseIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <SanctuaryBackground>
            <View style={styles.container}>
                {/* Animated Pulse Orb */}
                <MotiView
                    from={{ opacity: 0.5, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1.1 }}
                    transition={{
                        type: 'timing',
                        duration: 1500,
                        loop: true,
                    }}
                    style={styles.orbContainer}
                >
                    <View style={styles.orbOuter}>
                        <View style={styles.orbInner} />
                    </View>
                </MotiView>

                {/* Mystical Text Rotator */}
                <View style={styles.textContainer}>
                    <AnimatePresence exitBeforeEnter>
                        <MotiText
                            key={phraseIndex}
                            from={{ opacity: 0, translateY: 10 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            exit={{ opacity: 0, translateY: -10 }}
                            transition={{ type: 'timing', duration: 500 }}
                            style={styles.text}
                        >
                            {LOADING_PHRASES[phraseIndex]}
                        </MotiText>
                    </AnimatePresence>
                </View>
            </View>
        </SanctuaryBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    orbContainer: {
        marginBottom: 40,
    },
    orbOuter: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(186, 242, 187, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    orbInner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#A78BFA',
        shadowColor: '#A78BFA',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
    },
    textContainer: {
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 18,
        fontFamily: 'Playfair',
        letterSpacing: 1,
        textAlign: 'center',
    }
});
