
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AnalysisScreen from '../analysis';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

// --- Mocks ---

jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
    useLocalSearchParams: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
    notificationAsync: jest.fn(),
    NotificationFeedbackType: {
        Success: 'success',
    },
    impactAsync: jest.fn(),
    ImpactFeedbackStyle: {
        Medium: 'medium',
    },
}));

jest.mock('moti', () => {
    const { Text } = require('react-native');
    return {
        MotiView: ({ children }: any) => <>{children}</>,
        MotiText: ({ children }: any) => <Text>{children}</Text>,
    };
});

jest.mock('@/components/SanctuaryUI/Background', () => ({
    SanctuaryBackground: ({ children }: any) => <>{children}</>,
}));

jest.mock('expo-linear-gradient', () => ({
    LinearGradient: ({ children }: any) => <>{children}</>,
}));

jest.mock('expo-blur', () => ({
    BlurView: ({ children }: any) => <>{children}</>,
}));

jest.mock('lucide-react-native', () => ({
    Lock: () => 'LockIcon',
    Sparkles: () => 'SparklesIcon',
    ArrowRight: () => 'ArrowRightIcon',
    Share2: () => 'Share2Icon',
}));

// Mock safe area
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock global fetch
global.fetch = jest.fn() as jest.Mock;

describe('AnalysisScreen Integration', () => {
    const mockPush = jest.fn();
    const mockParams = {
        text: 'I was flying over a forest of crystals.',
        intent: 'curious',
    };

    const mockAnalysisResponse = {
        choices: [{
            message: {
                content: JSON.stringify({
                    interpretation: "This dream symbolizes a desire for clarity and new perspectives.",
                    sentiment: "Peace",
                    symbols: ["Crystals", "Flight"],
                    lumi_quote: "The sky is not the limit, it's the beginning."
                })
            }
        }]
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        (useLocalSearchParams as jest.Mock).mockReturnValue(mockParams);
        (global.fetch as jest.Mock).mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockAnalysisResponse),
        });
    });

    it('shows loading state then displays analysis results', async () => {
        const { getByText, queryByText } = render(<AnalysisScreen />);

        // 1. Initial Loading State
        expect(getByText('Consulting Archetype Database...')).toBeTruthy();

        // 2. Wait for Analysis to load
        await waitFor(() => expect(queryByText('The Crystals')).toBeTruthy(), { timeout: 3000 });

        // 3. Verify Analysis Content
        expect(getByText('This dream symbolizes a desire for clarity and new perspectives.')).toBeTruthy();
        expect(getByText('Peace')).toBeTruthy();
        expect(getByText('Crystals')).toBeTruthy();
        expect(getByText('Flight')).toBeTruthy();

        // 4. Test Unlock Button
        const unlockButton = getByText('Unlock Full Interpretation & Save');
        fireEvent.press(unlockButton);

        // 5. Verify Navigation
        expect(mockPush).toHaveBeenCalledWith({
            pathname: "/onboarding/auth-gate",
            params: {
                ...mockParams,
                analysisInterpretation: "This dream symbolizes a desire for clarity and new perspectives.",
                analysisSentiment: "Peace",
                analysisSymbols: "Crystals,Flight",
                analysisQuote: "The sky is not the limit, it's the beginning."
            }
        });
        expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
    });

    it('handles fetch error gracefully with fallback', async () => {
        (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

        const { getByText, queryByText } = render(<AnalysisScreen />);

        await waitFor(() => expect(queryByText('The Unknown')).toBeTruthy());

        // Should show fallback interpretation
        expect(getByText(/Your dream contains rich symbolism waiting to be explored/)).toBeTruthy();
    });
});
