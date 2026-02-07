
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

export default function OnboardingLayout() {
    const router = useRouter();

    return (
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            {/* Main Onboarding Flow */}
            <Stack.Screen name="index" />
            <Stack.Screen name="intent" />
            <Stack.Screen name="traveler" />
            <Stack.Screen name="signal" />
            <Stack.Screen name="entry" />
            <Stack.Screen name="analysis" />
            <Stack.Screen name="auth-gate" />
            <Stack.Screen name="paywall" />
        </Stack>
    );
}
