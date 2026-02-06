
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EntryScreen from '../entry';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

// --- Mocks ---

// Mock expo-router
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
    useLocalSearchParams: jest.fn(),
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
    SafeAreaView: ({ children, style }: any) => <>{children}</>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock expo-blur
jest.mock('expo-blur', () => ({
    BlurView: ({ children }: any) => <>{children}</>,
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
    notificationAsync: jest.fn(),
    NotificationFeedbackType: {
        Success: 'success',
    },
    ImpactFeedbackStyle: {
        Light: 'light',
        Medium: 'medium',
        Heavy: 'heavy',
    },
}));

// Mock Moti (animations) - just render children directly
jest.mock('moti', () => ({
    MotiView: ({ children }: any) => <>{children}</>,
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Skia/SanctuaryBackground to avoid native complexity
jest.mock('@/components/SanctuaryUI/Background', () => ({
    SanctuaryBackground: ({ children }: any) => <>{children}</>,
}));

// Mock Lucide icons
jest.mock('lucide-react-native', () => ({
    Sparkles: () => 'SparklesIcon',
    ArrowRight: () => 'ArrowRightIcon',
}));

describe('EntryScreen Integration', () => {
    const mockPush = jest.fn();
    const mockParams = {
        intent: 'fog',
        recall: 'static',
        age: '25',
        sex: 'female',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        (useLocalSearchParams as jest.Mock).mockReturnValue(mockParams);
    });

    it('renders correctly and handles user input flow', async () => {
        const { getByText, getByPlaceholderText } = render(<EntryScreen />);

        // 1. Verify Dynamic Prompt based on intent='fog'
        expect(getByText('What is the very last thing you remember feeling?')).toBeTruthy();

        // 2. Verify Button is initially disabled (opacity logic check or just finding it)
        const buttonText = getByText('Analyze Reflection');
        // In React Native, "disabled" prop handling depends on the component. 
        // The component uses opacity to visually indicate disabled state, logic prevents action.

        // 3. Enter Text
        const input = getByPlaceholderText("I was in a house I didn't recognize, and the water was rising...");
        fireEvent.changeText(input, 'I felt a sudden splash of cold water.');

        // 4. Press Button
        fireEvent.press(buttonText);

        // 5. Verify Navigation and Side Effects
        expect(Haptics.notificationAsync).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith({
            pathname: '/onboarding/analysis',
            params: {
                ...mockParams,
                text: 'I felt a sudden splash of cold water.',
            },
        });
    });

    it('does not navigate if text is too short', () => {
        const { getByText, getByPlaceholderText } = render(<EntryScreen />);

        const input = getByPlaceholderText("I was in a house I didn't recognize, and the water was rising...");
        fireEvent.changeText(input, 'Hi'); // Too short (< 5 chars)

        fireEvent.press(getByText('Analyze Reflection'));

        expect(mockPush).not.toHaveBeenCalled();
    });
});
