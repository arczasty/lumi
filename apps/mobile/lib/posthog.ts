
import PostHog, { PostHogProvider } from 'posthog-react-native'

const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY || "phc_MOCK_KEY_FOR_DEV";
if (!process.env.EXPO_PUBLIC_POSTHOG_API_KEY) {
    console.warn("⚠️ PostHog: EXPO_PUBLIC_POSTHOG_API_KEY is missing. Using mock key.");
}

export const posthog = new PostHog(apiKey, {
    host: 'https://us.i.posthog.com', // Standard US host
})

export { PostHogProvider }
