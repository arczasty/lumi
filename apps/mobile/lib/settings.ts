/**
 * Settings Persistence using expo-secure-store
 * Manages user preferences for haptics, notifications, etc.
 */

import * as SecureStore from 'expo-secure-store';

export type AppSettings = {
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
  biometricLockEnabled: boolean;
  autoAnalysisEnabled: boolean;
  whisperSensitivity: 'Low' | 'Medium' | 'High';
};

const SETTINGS_KEY = 'lumi_app_settings';

const DEFAULT_SETTINGS: AppSettings = {
  hapticsEnabled: true,
  notificationsEnabled: true,
  biometricLockEnabled: false,
  autoAnalysisEnabled: true,
  whisperSensitivity: 'High',
};

/**
 * Load settings from secure storage
 */
export async function loadSettings(): Promise<AppSettings> {
  try {
    const stored = await SecureStore.getItemAsync(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn('Failed to load settings:', error);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Save settings to secure storage
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw error;
  }
}

/**
 * Update a specific setting
 */
export async function updateSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): Promise<AppSettings> {
  const current = await loadSettings();
  const updated = { ...current, [key]: value };
  await saveSettings(updated);
  return updated;
}
