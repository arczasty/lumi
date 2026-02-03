import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { MotiView, MotiText } from "moti";
import { SanctuaryBackground } from "./Background";

export const LumiLoader = () => {
    return (
        <SanctuaryBackground>
            <View style={styles.container}>
                {/* Center Orb Breathing */}
                <MotiView
                    from={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 1.2, opacity: 0.5 }}
                    transition={{
                        type: 'timing',
                        duration: 2000,
                        loop: true,
                    }}
                    style={styles.orb}
                />

                {/* Optional Orbiting Particle 1 */}
                <MotiView
                    from={{ rotate: '0deg', translateX: 40 }}
                    animate={{ rotate: '360deg', translateX: 40 }}
                    transition={{
                        type: 'timing',
                        duration: 3000,
                        loop: true,
                        repeatReverse: false,
                    }}
                    style={styles.orbitContainer}
                >
                    <View style={styles.particle} />
                </MotiView>

                {/* Optional Orbiting Particle 2 (Reverse) */}
                <MotiView
                    from={{ rotate: '360deg', translateX: 60 }}
                    animate={{ rotate: '0deg', translateX: 60 }}
                    transition={{
                        type: 'timing',
                        duration: 5000,
                        loop: true,
                        repeatReverse: false,
                    }}
                    style={styles.orbitContainer}
                >
                    <View style={[styles.particle, { backgroundColor: '#F4E04D', width: 6, height: 6 }]} />
                </MotiView>

                {/* Subtitle */}
                <MotiText
                    from={{ opacity: 0.4 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ duration: 1500, loop: true, type: 'timing' }}
                    style={styles.text}
                >
                    Loading...
                </MotiText>
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
    orb: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#BAF2BB',
        shadowColor: "#BAF2BB",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
    },
    orbitContainer: {
        position: 'absolute',
        width: 10,
        height: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    particle: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
        opacity: 0.8,
    },
    text: {
        marginTop: 100,
        color: 'white',
        fontSize: 12,
        letterSpacing: 2,
        textTransform: 'uppercase',
        opacity: 0.6,
    }
});
