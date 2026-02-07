import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { tokenCache } from "../lib/cache";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LumiLoader } from "@/components/SanctuaryUI/LumiLoader";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/ToastConfig";
import { posthog, PostHogProvider } from "@/lib/posthog";
import { RevenueCatProvider } from "@/contexts/RevenueCatContext";

// Google Fonts via Expo packages
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from "@expo-google-fonts/nunito";

const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL_DEV || process.env.EXPO_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  console.error("❌ Convex: Missing EXPO_PUBLIC_CONVEX_URL_DEV or EXPO_PUBLIC_CONVEX_URL in .env.local");
}
const convex = new ConvexReactClient(CONVEX_URL || "https://missing-url.convex.cloud");

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

const LumiTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#030014", // Deep Midnight
    primary: "#A78BFA", // Purple accent (EcoCalm-inspired)
    card: "rgba(255, 255, 255, 0.05)", // Glassmorphic
    text: "#FFFFFF",
    border: "rgba(255, 255, 255, 0.1)",
    notification: "#F4E04D", // Candlelight Gold
  },
};

function RootLayoutNav() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(tabs)";

    // For MVP: Allow guest access, but you can enable this later for auth requirement
    // Uncomment below to require authentication:
    /*
    if (isSignedIn && !inAuthGroup) {
      router.replace("/(tabs)");
    } else if (!isSignedIn && inAuthGroup) {
      router.replace("/onboarding");
    }
    */
  }, [isLoaded, isSignedIn, segments]);

  if (!isLoaded) {
    return <LumiLoader />;
  }

  return (
    <>
      <ThemeProvider value={LumiTheme}>
        <Stack>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="record" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="dream/[id]" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
      <Toast config={toastConfig} />
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Heading Font: Playfair Display
    "Playfair": PlayfairDisplay_400Regular,
    "Playfair-SemiBold": PlayfairDisplay_600SemiBold,
    "Playfair-Bold": PlayfairDisplay_700Bold,
    // Body Font: Nunito
    "Nunito": Nunito_400Regular,
    "Nunito-Medium": Nunito_500Medium,
    "Nunito-SemiBold": Nunito_600SemiBold,
    "Nunito-Bold": Nunito_700Bold,
    // Icons
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return <LumiLoader />;
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <RevenueCatProvider>
          <PostHogProvider client={posthog}>
            <SafeAreaProvider>
              <RootLayoutNav />
            </SafeAreaProvider>
          </PostHogProvider>
        </RevenueCatProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
