# PostHog Analytics Integration

This project uses [PostHog](https://posthog.com/) for product analytics.

## Configuration

The integration is configured in `apps/mobile/lib/posthog.ts` and initialized in `apps/mobile/app/_layout.tsx`.

### Environment Variables
Ensure the following variables are set in your `.env.local` (for development) or build configuration (for production):

```bash
# PostHog Project API Key
EXPO_PUBLIC_POSTHOG_API_KEY=phc_YOUR_PUBLIC_KEY

# Optional: Custom Host (default: https://us.i.posthog.com)
# You can hardcode this in lib/posthog.ts if needed
```

## Usage

### capturing Events
Use the `usePostHog` hook in your components:

```typescript
import { usePostHog } from 'posthog-react-native'

const MyComponent = () => {
  const posthog = usePostHog()

  const handlePress = () => {
    posthog.capture('my_custom_event', { property: 'value' })
  }
}
```

### Screen Tracking
Screen tracking can be manually implemented or hooked into the navigation change events if desired. Currently, basic setup is provided.

## Environment Management
The app distinguishes between Dev and Prod Convex environments via:
- `EXPO_PUBLIC_CONVEX_URL_DEV`
- `EXPO_PUBLIC_CONVEX_URL_PROD` (if applicable)

Ensure you are using the correct variables for your build profile.
