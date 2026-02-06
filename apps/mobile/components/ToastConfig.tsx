
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { CheckCircle, AlertCircle, Info } from 'lucide-react-native';

const GlassToast = ({ type, text1, text2 }: { type: 'success' | 'error' | 'info', text1?: string, text2?: string }) => {
  const isSuccess = type === 'success';
  const isError = type === 'error';

  const iconColor = isSuccess ? '#A78BFA' : isError ? '#FF6B6B' : '#F4E04D';
  const Icon = isSuccess ? CheckCircle : isError ? AlertCircle : Info;

  return (
    <View style={styles.container}>
      <BlurView intensity={30} tint="dark" style={styles.glass}>
        <View style={[styles.borderStrip, { backgroundColor: iconColor }]} />
        <View style={styles.content}>
          <Icon size={24} color={iconColor} style={styles.icon} />
          <View style={styles.textContainer}>
            {text1 && <Text style={styles.title}>{text1}</Text>}
            {text2 && <Text style={styles.message}>{text2}</Text>}
          </View>
        </View>
      </BlurView>
    </View>
  );
};

export const toastConfig = {
  success: ({ text1, text2 }: any) => <GlassToast type="success" text1={text1} text2={text2} />,
  error: ({ text1, text2 }: any) => <GlassToast type="error" text1={text1} text2={text2} />,
  info: ({ text1, text2 }: any) => <GlassToast type="info" text1={text1} text2={text2} />,
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    marginTop: 10,
  },
  glass: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 0,
    backgroundColor: 'rgba(20, 20, 35, 0.6)',
  },
  borderStrip: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: 0,
    opacity: 0.8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 16,
    flex: 1,
  },
  icon: {
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Playfair-SemiBold',
    color: '#FFF',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
});
