/**
 * Toast Notification Helpers
 * Centralized toast notifications with consistent styling
 */

import Toast from 'react-native-toast-message';

export function showSuccessToast(message: string, title?: string) {
  Toast.show({
    type: 'success',
    text1: title || 'Success',
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
}

export function showErrorToast(message: string, title?: string) {
  Toast.show({
    type: 'error',
    text1: title || 'Error',
    text2: message,
    position: 'top',
    visibilityTime: 4000,
  });
}

export function showInfoToast(message: string, title?: string) {
  Toast.show({
    type: 'info',
    text1: title || 'Info',
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
}
