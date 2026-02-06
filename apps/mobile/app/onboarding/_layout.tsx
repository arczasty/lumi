
import { Stack } from "expo-router";

export default function OnboardingLayout() {
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
