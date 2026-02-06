
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PaywallScreen from '../paywall';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@clerk/clerk-expo';
import { useMutation, useAction, useQuery } from 'convex/react';

// --- Mocks ---

jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
    useLocalSearchParams: jest.fn(),
}));

jest.mock('@clerk/clerk-expo', () => ({
    useAuth: jest.fn(),
}));

jest.mock('convex/react', () => ({
    useMutation: jest.fn(),
    useAction: jest.fn(),
    useQuery: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
    notificationAsync: jest.fn(),
    NotificationFeedbackType: {
        Success: 'success',
    },
}));

jest.mock('moti', () => ({
    MotiView: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/components/SanctuaryUI/Background', () => ({
    SanctuaryBackground: ({ children }: any) => <>{children}</>,
}));

jest.mock('expo-blur', () => ({
    BlurView: ({ children }: any) => <>{children}</>,
}));

jest.mock('lucide-react-native', () => ({
    LucideLock: () => 'LockIcon',
    LucideCheck: () => 'CheckIcon',
    LucideSparkles: () => 'SparklesIcon',
    LucideCheckCircle2: () => 'CheckCircleIcon',
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 10 }),
}));

describe('PaywallScreen Integration', () => {
    const mockReplace = jest.fn();
    const mockParams = {
        dreamId: 'dream_123',
        text: 'I was in a bioluminescent sanctuary.',
    };

    const mockCompleteOnboarding = jest.fn();
    const mockSaveDream = jest.fn();
    const mockAnalyzeDream = jest.fn();
    const mockGenerateDreamImage = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
        (useLocalSearchParams as jest.Mock).mockReturnValue(mockParams);
        (useAuth as jest.Mock).mockReturnValue({ userId: 'clerk_user_123' });

        (useQuery as jest.Mock).mockReturnValue({ name: 'Dreamer' });

        (useMutation as jest.Mock).mockImplementation((apiRef) => {
            if (apiRef.name === 'completeOnboarding') return mockCompleteOnboarding;
            if (apiRef.name === 'saveDream') return mockSaveDream;
            return jest.fn();
        });
        (useAction as jest.Mock).mockImplementation((apiRef) => {
            if (apiRef.name === 'analyzeDream') return mockAnalyzeDream;
            if (apiRef.name === 'generateDreamImage') return mockGenerateDreamImage;
            return jest.fn();
        });
    });

    it('renders and handles unlock action', async () => {
        const { getByText } = render(<PaywallScreen />);

        expect(getByText('Claim your sanctuary')).toBeTruthy();

        const unlockButton = getByText('Start your journey');
        fireEvent.press(unlockButton);

        await waitFor(() => {
            expect(mockCompleteOnboarding).toHaveBeenCalledWith({ userId: 'clerk_user_123' });
            expect(mockReplace).toHaveBeenCalledWith({
                pathname: "/(tabs)/Record",
                params: { dreamId: 'dream_123' }
            });
        });

        expect(Haptics.notificationAsync).toHaveBeenCalled();
    });

    it('handles plan switching', () => {
        const { getByText } = render(<PaywallScreen />);

        const monthlyPlan = getByText('Lumi Monthly');
        fireEvent.press(monthlyPlan);

        // Verification of selected state would be UI-specific (style checks)
        // For now just ensuring no crash and press works
    });
});
