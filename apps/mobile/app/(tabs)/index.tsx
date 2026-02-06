import React, { useState, useEffect } from "react";
import { StyleSheet, Pressable, Dimensions, Platform, TextInput, KeyboardAvoidingView, ScrollView, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "@/components/Themed";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { SanctuaryBackground } from "@/components/SanctuaryUI/Background";
import { MotiView, MotiText, AnimatePresence } from "moti";
import { Send, Mic, Square, Sparkles, BookOpen } from "lucide-react-native";
import { useRouter } from "expo-router";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import * as Haptics from "expo-haptics";
import { FONTS } from "@/constants/Theme";

import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';

export default function RecordScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const { user: clerkUser } = useUser();

  const [dreamText, setDreamText] = useState("");
  const [status, setStatus] = useState<"idle" | "writing" | "recording" | "analyzing" | "completed">("idle");

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const saveDream = useMutation(api.dreams.saveDream);
  const analyzeDream = useAction(api.ai.analyzeDream);
  const generateDreamImage = useAction(api.ai.generateDreamImage);
  const generateUploadUrl = useMutation(api.dreams.generateUploadUrl);
  const transcribeAndAnalyze = useAction(api.ai.transcribeAndAnalyze);

  useEffect(() => {
    return () => {
      if (recorder.isRecording) {
        recorder.stop();
      }
    };
  }, []);

  const handleTextChange = (text: string) => {
    setDreamText(text);
    if (text.length > 0) setStatus('writing');
    else if (status !== 'recording') setStatus('idle');
  };

  async function startRecording() {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        showErrorToast("Microphone permission required");
        return;
      }

      recorder.record();
      setStatus("recording");
    } catch (err) {
      console.error('Failed to start recording', err);
      showErrorToast("Failed to start recording");
    }
  }

  async function stopRecording() {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStatus("analyzing");

      await recorder.stop();
      const uri = recorder.uri;

      if (!uri || !userId) {
        showErrorToast("Recording failed");
        setStatus("idle");
        return;
      }

      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uri);
      const blob = await response.blob();
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type || "audio/m4a" },
        body: blob,
      });
      const { storageId } = await uploadResponse.json();

      const dreamId = await saveDream({ userId, text: "Processing voice recording..." });
      await transcribeAndAnalyze({ dreamId, storageId });

      showSuccessToast("Dream captured!");
      setStatus("completed");
      setTimeout(() => {
        router.push({ pathname: '/dream/[id]', params: { id: dreamId } });
        setStatus("idle");
      }, 800);

    } catch (err) {
      console.error('Failed to process recording', err);
      showErrorToast("Failed to process recording");
      setStatus("idle");
    }
  }

  async function handleSubmitDream() {
    if (!dreamText.trim() || !userId) return;

    Keyboard.dismiss();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStatus("analyzing");

    try {
      const dreamId = await saveDream({ userId, text: dreamText.trim() });
      const dreamTextCopy = dreamText.trim();
      setDreamText("");

      analyzeDream({ dreamId, text: dreamTextCopy }).catch(console.error);
      generateDreamImage({ dreamId, dreamText: dreamTextCopy }).catch(console.error);

      showSuccessToast("Dream saved!");

      setTimeout(() => {
        setStatus("completed");
        router.push({ pathname: '/dream/[id]', params: { id: dreamId } });
        setStatus("idle");
      }, 1500);

    } catch (e) {
      showErrorToast("Failed to save dream");
      setStatus("idle");
    }
  }

  const firstName = clerkUser?.firstName || "Dreamer";

  return (
    <SanctuaryBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{firstName} ✨</Text>
          </View>

          {/* Main Recording Card */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 100 }}
            style={styles.mainCard}
          >
            {/* Orb + Prompt */}
            <View style={styles.orbSection}>
              <MotiView
                animate={{
                  scale: status === 'recording' ? [1, 1.2, 1] : status === 'analyzing' ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  type: 'timing',
                  duration: status === 'recording' ? 1000 : 1500,
                  loop: status === 'recording' || status === 'analyzing',
                }}
                style={styles.orbContainer}
              >
                <View style={styles.orbOuter}>
                  <View style={styles.orbInner} />
                </View>
              </MotiView>

              <AnimatePresence>
                <MotiText
                  key={status}
                  from={{ opacity: 0, translateY: 10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0 }}
                  style={styles.promptText}
                >
                  {status === 'analyzing' ? "Weaving your dream..." :
                    status === 'recording' ? "Listening..." :
                      status === 'writing' ? "Keep writing..." :
                        "What did you dream?"}
                </MotiText>
              </AnimatePresence>
            </View>

            {/* Text Input */}
            {status !== 'analyzing' && (
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Describe your dream..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  multiline
                  value={dreamText}
                  onChangeText={handleTextChange}
                  editable={status !== 'recording'}
                />
              </View>
            )}

            {/* Action Buttons */}
            {status !== 'analyzing' && (
              <View style={styles.actionsRow}>
                <Pressable
                  style={[styles.actionBtn, status === 'recording' && styles.actionBtnActive]}
                  onPress={status === 'recording' ? stopRecording : startRecording}
                >
                  {status === 'recording' ? (
                    <Square size={20} color="#fff" fill="#fff" />
                  ) : (
                    <Mic size={20} color="#A78BFA" />
                  )}
                </Pressable>

                <Pressable
                  style={[styles.sendBtn, !dreamText.trim() && styles.sendBtnDisabled]}
                  onPress={handleSubmitDream}
                  disabled={!dreamText.trim()}
                >
                  <Send size={20} color={dreamText.trim() ? "#0A0A0F" : "rgba(255,255,255,0.3)"} />
                </Pressable>
              </View>
            )}

            {/* Loading State */}
            {status === 'analyzing' && (
              <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.loadingContainer}>
                <View style={styles.loadingDots}>
                  {[0, 1, 2].map((i) => (
                    <MotiView
                      key={i}
                      from={{ opacity: 0.3, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'timing', duration: 600, delay: i * 200, loop: true }}
                      style={styles.loadingDot}
                    />
                  ))}
                </View>
              </MotiView>
            )}
          </MotiView>

          {/* Quick Actions */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
          >
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsRow}>
              <Pressable style={styles.quickActionCard} onPress={() => router.push("/(tabs)/journal")}>
                <View style={styles.quickActionIcon}>
                  <BookOpen size={20} color="#A78BFA" />
                </View>
                <Text style={styles.quickActionLabel}>Journal</Text>
              </Pressable>

              <Pressable style={styles.quickActionCard} onPress={() => router.push("/(tabs)/insights")}>
                <View style={styles.quickActionIcon}>
                  <Sparkles size={20} color="#A78BFA" />
                </View>
                <Text style={styles.quickActionLabel}>Insights</Text>
              </Pressable>
            </View>
          </MotiView>

        </ScrollView>
      </SafeAreaView>
    </SanctuaryBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  // Header
  header: { marginBottom: 24, backgroundColor: 'transparent' },
  greeting: { fontFamily: FONTS.body.regular, fontSize: 16, color: 'rgba(255,255,255,0.6)' },
  userName: { fontFamily: FONTS.heading.bold, fontSize: 28, color: '#fff' },
  // Main Card
  mainCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 24,
  },
  orbSection: { alignItems: 'center', marginBottom: 24, backgroundColor: 'transparent' },
  orbContainer: { marginBottom: 16 },
  orbOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#A78BFA',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  promptText: { fontFamily: FONTS.body.medium, fontSize: 20, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  // Input
  inputWrapper: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  textInput: { fontFamily: FONTS.body.regular, minHeight: 100, maxHeight: 160, padding: 16, fontSize: 16, color: '#fff' },
  // Actions
  actionsRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, backgroundColor: 'transparent' },
  actionBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionBtnActive: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  sendBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#A78BFA', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.1)' },
  // Loading
  loadingContainer: { alignItems: 'center', paddingVertical: 20, backgroundColor: 'transparent' },
  loadingDots: { flexDirection: 'row', gap: 8, backgroundColor: 'transparent' },
  loadingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#A78BFA' },
  // Quick Actions
  sectionTitle: { fontFamily: FONTS.body.semiBold, fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 12 },
  quickActionsRow: { flexDirection: 'row', gap: 12, backgroundColor: 'transparent' },
  quickActionCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionLabel: { fontFamily: FONTS.body.medium, fontSize: 13, color: 'rgba(255,255,255,0.7)' },
});
