/**
 * Custom Toast Configuration for Lumi
 * Matches the sanctuary aesthetic
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BaseToast, ErrorToast, InfoToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={styles.successToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={2}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={styles.errorToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={2}
    />
  ),
  info: (props: any) => (
    <InfoToast
      {...props}
      style={styles.infoToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={2}
    />
  ),
};

const styles = StyleSheet.create({
  successToast: {
    borderLeftColor: '#BAF2BB',
    backgroundColor: 'rgba(186, 242, 187, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(186, 242, 187, 0.3)',
    borderRadius: 16,
    height: undefined,
    minHeight: 60,
    paddingVertical: 12,
  },
  errorToast: {
    borderLeftColor: '#FF6B6B',
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 16,
    height: undefined,
    minHeight: 60,
    paddingVertical: 12,
  },
  infoToast: {
    borderLeftColor: '#F4E04D',
    backgroundColor: 'rgba(244, 224, 77, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244, 224, 77, 0.3)',
    borderRadius: 16,
    height: undefined,
    minHeight: 60,
    paddingVertical: 12,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  text1: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  text2: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
});
