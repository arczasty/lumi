
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AuthGateScreen from '../auth-gate';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth, useOAuth, useUser } from '@clerk/clerk-expo';
import { useMutation, useAction } from 'convex/react';

// --- Mocks ---

jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
    useLocalSearchParams: jest.fn(),
}));

jest.mock('@clerk/clerk-expo', () => ({
    useAuth: jest.fn(),
    useOAuth: jest.fn(),
    useUser: jest.fn(),
}));

jest.mock('convex/react', () => ({
    useMutation: jest.fn(),
    useAction: jest.fn(),
}));

jest.mock('@/convex/_generated/api', () => ({
    api: {
        users: {
            syncUser: 'syncUser',
            updateProfile: 'updateProfile',
        },
        dreams: {
            saveDream: 'saveDream',
        },
        ai: {
            analyzeDream: 'analyzeDream',
            generateDreamImage: 'generateDreamImage',
        }
    }
}));

jest.mock('@expo/vector-icons', () => ({
    FontAwesome5: () => 'FontAwesome5Icon',
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

jest.mock('moti', () => ({
    MotiView: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/components/SanctuaryUI/Background', () => ({
    SanctuaryBackground: ({ children }: any) => <>{children}</>,
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('lucide-react-native', () => ({
    Lock: () => 'LockIcon',
    Check: () => 'CheckIcon',
    Apple: () => 'AppleIcon',
    CircuitBoard: () => 'CircuitBoardIcon',
    Mail: () => 'MailIcon',
}));

describe('AuthGateScreen Integration', () => {
    const mockReplace = jest.fn();
    const mockParams = {
        text: 'I was in a bioluminescent sanctuary.',
        intent: 'mirror',
        recall: 'vivid',
    };

    const mockStartOAuthFlow = jest.fn();
    const mockSyncUser = jest.fn();
    const mockUpdateProfile = jest.fn();
    const mockSaveDream = jest.fn().mockResolvedValue('dream_123');
    const mockAnalyzeDream = jest.fn();
    const mockGenerateDreamImage = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        // Router & Params
        (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
        (useLocalSearchParams as jest.Mock).mockReturnValue(mockParams);

        // Clerk Mocks
        (useAuth as jest.Mock).mockReturnValue({ isLoaded: true, isSignedIn: false });
        (useUser as jest.Mock).mockReturnValue({ isLoaded: true, user: null });
        (useOAuth as jest.Mock).mockReturnValue({ startOAuthFlow: mockStartOAuthFlow });

        // Convex Mocks
        (useMutation as jest.Mock).mockImplementation((apiName) => {
            if (apiName === 'syncUser') return mockSyncUser;
            if (apiName === 'updateProfile') return mockUpdateProfile;
            if (apiName === 'saveDream') return mockSaveDream;
            return jest.fn();
        });
        (useAction as jest.Mock).mockImplementation((apiName) => {
            if (apiName === 'analyzeDream') return mockAnalyzeDream;
            if (apiName === 'generateDreamImage') return mockGenerateDreamImage;
            return jest.fn();
        });
    });

    it('renders and handles login flow', async () => {
        const { getByText, getByTestId } = render(<AuthGateScreen />);

        expect(getByText('Preserve this Insight')).toBeTruthy();

        // Simulate successful OAuth
        mockStartOAuthFlow.mockResolvedValue({
            createdSessionId: 'session_123',
            setActive: jest.fn().mockResolvedValue(undefined),
        });

        const googleButton = getByTestId('google-auth-button');
        fireEvent.press(googleButton);

        expect(mockStartOAuthFlow).toHaveBeenCalled();
    });

    it('triggers post-auth sequence when user becomes available', async () => {
        // Start with no user
        const { rerender } = render(<AuthGateScreen />);

        // Simulate user logged in now
        (useUser as jest.Mock).mockReturnValue({
            isLoaded: true,
            user: { id: 'clerk_user_123' }
        });

        rerender(<AuthGateScreen />);

        // Verify post-auth sequence
        await waitFor(() => {
            expect(mockSyncUser).toHaveBeenCalledWith({ userId: 'clerk_user_123' });
            expect(mockUpdateProfile).toHaveBeenCalledWith({
                userId: 'clerk_user_123',
                primaryGoal: 'mirror',
                marketingVibe: 'vivid',
            });
            expect(mockSaveDream).toHaveBeenCalledWith({
                userId: 'clerk_user_123',
                text: 'I was in a bioluminescent sanctuary.',
            });
        });

        expect(mockAnalyzeDream).toHaveBeenCalled();
        expect(mockGenerateDreamImage).toHaveBeenCalled();

        expect(mockReplace).toHaveBeenCalledWith({
            pathname: '/onboarding/paywall',
            params: { dreamId: 'dream_123', text: 'I was in a bioluminescent sanctuary.' }
        });
    });
});
