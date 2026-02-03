# Lumi - Bioluminescent Dream Journal

A beautiful mobile app for recording, interpreting, and journaling your dreams using AI-powered analysis.

## Overview

Lumi is a React Native mobile application built with Expo that helps users capture their dreams and receive AI-generated interpretations. The app features a stunning "bioluminescent sanctuary" aesthetic with glowing animations and smooth transitions.

## Tech Stack

- **Frontend**: React Native + Expo (Managed Workflow)
- **Navigation**: Expo Router (File-based routing)
- **Backend**: Convex (Realtime DB + Functions)
- **Authentication**: Clerk (Integrated with Convex)
- **AI**: OpenRouter (Gemini / Claude) via Convex Actions
- **Styling**: React Native StyleSheet + Moti (Animation) + Lucide React Native (Icons)
- **Graphics**: React Native Skia for advanced visuals
- **Language**: TypeScript

## Project Structure

```
Lumi_v0/
├── apps/
│   └── mobile/           # React Native app
│       ├── app/          # Expo Router screens
│       ├── components/   # Reusable components
│       └── constants/    # Colors, theme config
├── convex/               # Backend functions & schema
│   ├── dreams.ts        # Dream CRUD operations
│   ├── ai.ts            # AI interpretation logic
│   └── schema.ts        # Database schema
└── package.json         # Monorepo config
```

## Prerequisites

- Node.js 18+ and npm 10+
- iOS Simulator (macOS) or Android Emulator
- Expo CLI
- Clerk account (for authentication)
- Convex account (for backend)
- OpenRouter API key (for AI features)

## Environment Variables

Create a `.env.local` file in the project root with the following:

```bash
# Clerk Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Convex Backend
CONVEX_DEPLOYMENT=...
CONVEX_URL=https://...

# OpenRouter AI (in Convex dashboard)
OPENROUTER_API_KEY=sk-or-...
```

### Setting up Environment Variables

1. **Clerk**:
   - Sign up at [clerk.com](https://clerk.com)
   - Create a new application
   - Copy the Publishable Key to `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`

2. **Convex**:
   - Sign up at [convex.dev](https://convex.dev)
   - Run `npx convex dev` to initialize
   - Add your OpenRouter API key in Convex dashboard (Environment Variables)

3. **OpenRouter**:
   - Sign up at [openrouter.ai](https://openrouter.ai)
   - Generate an API key
   - Add it to Convex environment variables as `OPENROUTER_API_KEY`

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Lumi_v0
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see above)

4. Initialize Convex backend:
```bash
npm run dev:convex
```

5. In a new terminal, start the Expo dev server:
```bash
npm run dev:mobile
```

6. Run on simulator:
```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

## Available Scripts

From the project root:

- `npm run dev:mobile` - Start Expo Metro bundler
- `npm run dev:convex` - Start Convex backend sync
- `npm run dev:web` - Start web app (if applicable)
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Run linter across all workspaces
- `npm run typecheck` - Run TypeScript compiler checks
- `npm run check-all` - Run lint, typecheck, and audit

From `apps/mobile`:

- `npm run ios` - Build and run on iOS
- `npm run android` - Build and run on Android
- `npm test` - Run mobile component tests

## Features

### Core Features
- Record dreams via text input
- AI-powered dream interpretation using Gemini/Claude
- Beautiful journal view with dream cards
- Dream detail view with full interpretation
- Edit and delete dreams
- Share dreams and export journal

### UI/UX Features
- Bioluminescent sanctuary theme
- Glassmorphism effects with blur
- Smooth animations using Moti and Reanimated
- Skia-powered graphics for mascot and backgrounds
- Custom loading states and skeletons

## Testing

The project includes comprehensive tests:

### Component Tests
Located in `apps/mobile/components/__tests__/`:
- LumiMascot component tests
- SanctuaryBackground component tests
- LumiLoader component tests

### Convex Function Tests
Located in `convex/dreams.test.ts`:
- saveDream mutation tests
- getDreams query tests
- updateDream mutation tests
- deleteDream mutation tests

Run tests:
```bash
# All tests
npm test

# Mobile component tests only
npm test --workspace=apps/mobile

# Convex tests only
vitest run

# Watch mode
npm run test:watch
```

## Database Schema

### Dreams Table
```typescript
{
  userId: string,           // Clerk user ID
  text: string,             // Dream content
  interpretation?: string,  // AI interpretation
  sentiment?: string,       // Detected sentiment
  symbols?: string[],       // Extracted symbols
  lumi_quote?: string,      // Inspirational quote
  imageUrl?: string,        // Generated dream image
  createdAt: number,        // Timestamp
}
```

## Deployment

### Mobile App
```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Backend
Convex deploys automatically when you push to production:
```bash
npx convex deploy
```

## Troubleshooting

### Common Issues

1. **Metro bundler errors**: Clear cache with `npx expo start --clear`
2. **Convex sync issues**: Restart with `npx convex dev`
3. **TypeScript errors**: Run `npm run typecheck` to see all errors
4. **Test failures**: Ensure all mocks are properly configured in `jest-setup.js`

### Expo Prebuild
If you add native modules, run:
```bash
npx expo prebuild --clean
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm test`
4. Run linter: `npm run lint`
5. Run typecheck: `npm run typecheck`
6. Commit with conventional commits (feat:, fix:, etc.)
7. Create a pull request

## License

Private - All rights reserved

## Support

For issues or questions, please open an issue on GitHub.

---

Built with love using Claude Code
