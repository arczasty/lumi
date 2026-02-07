import React from 'react';
import { View, StyleSheet, Platform, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MotiView } from 'moti';
import { Mic, BookOpen, Sparkles, Settings, Library } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { isSignedIn, userId } = useAuth();
    const user = useQuery(api.users.getUser, userId ? { userId } : "skip");

    // Hide if not signed in OR if still in in-progress onboarding
    if (!isSignedIn) return null;
    if (user && user.onboardingStatus !== "completed") return null;

    return (
        <View style={styles.container}>
            <BlurView intensity={30} tint="dark" style={styles.blur}>
                <View style={styles.content}>
                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key];
                        if ((options as any).href === null) return null;
                        const isFocused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                navigation.navigate(route.name);
                            }
                        };

                        let Icon;
                        switch (route.name) {
                            case 'index': Icon = BookOpen; break;
                            case 'insights': Icon = Sparkles; break;
                            case 'lexicon': Icon = Library; break;
                            case 'settings': Icon = Settings; break;
                            default: Icon = Sparkles;
                        }

                        return (
                            <Pressable
                                key={route.key}
                                onPress={onPress}
                                style={styles.tab}
                            >
                                <MotiView
                                    animate={{
                                        scale: isFocused ? 1.1 : 1,
                                        opacity: isFocused ? 1 : 0.5,
                                    }}
                                    transition={{ type: 'spring', damping: 15 }}
                                    style={styles.iconContainer}
                                >
                                    <Icon
                                        size={24}
                                        color={isFocused ? "#D4BAF2" : "rgba(255,255,255,0.5)"}
                                        fill={isFocused && route.name !== 'settings' ? "rgba(212, 186, 242, 0.2)" : "transparent"}
                                    />
                                    {isFocused && (
                                        <MotiView
                                            from={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            style={styles.activeDot}
                                        />
                                    )}
                                </MotiView>
                            </Pressable>
                        );
                    })}
                </View>
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        borderRadius: 35,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    blur: {
        width: '100%',
        height: 70,
        backgroundColor: 'rgba(20,20,30,0.6)',
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    tab: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeDot: {
        position: 'absolute',
        bottom: -12,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#D4BAF2',
    }
});
