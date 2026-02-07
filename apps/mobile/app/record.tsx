import React, { useState } from "react";
import { StyleSheet, Pressable, TextInput, ScrollView, Keyboard, View, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/Themed";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { SanctuaryBackground } from "@/components/SanctuaryUI/Background";
import { MotiView, MotiText, AnimatePresence } from "moti";
import { Send, Sparkles, BookOpen, ArrowLeft, PenLine } from "lucide-react-native";
import { useRouter } from "expo-router";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import * as Haptics from "expo-haptics";
import { FONTS } from "@/constants/Theme";

export default function RecordScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const { user: clerkUser } = useUser();

  const [dreamText, setDreamText] = useState(__DEV__ ? "I was flying over a beautiful forest at night. The moon was bright and I felt completely free. Suddenly I started falling towards a lake but woke up before hitting the water." : "");
  const [status, setStatus] = useState<"idle" | "writing" | "analyzing" | "completed">(__DEV__ && dreamText ? "writing" : "idle");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loadingMessage, setLoadingMessage] = useState("Lumi is interpreting the symbols...");

  const saveDream = useMutation(api.dreams.saveDream);
  const analyzeDream = useAction(api.ai.analyzeDream);
  const generateDreamImage = useAction(api.ai.generateDreamImage);

  const handleTextChange = (text: string) => {
    setDreamText(text);
    if (text.length > 0) setStatus('writing');
    else setStatus('idle');
  };

  const handleSubmitDream = async () => {
    if (!dreamText.trim() || !userId) return;

    Keyboard.dismiss();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStatus("analyzing");

    try {
      const dreamId = await saveDream({
        userId,
        text: dreamText.trim(),
        createdAt: selectedDate.getTime()
      });
      const dreamTextCopy = dreamText.trim();

      // Trigger analysis and image generation in background
      // We do not await these so navigation is instant
      analyzeDream({ dreamId, text: dreamTextCopy });
      generateDreamImage({ dreamId, dreamText: dreamTextCopy });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showSuccessToast("Dream preserved");

      // Instant navigation
      router.replace({ pathname: '/dream/[id]', params: { id: dreamId } });
      setStatus("idle");
      setDreamText("");

    } catch (e) {
      showErrorToast("Failed to save dream");
      setStatus("idle");
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

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
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <ArrowLeft size={24} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Record Dream</Text>
              <Text style={styles.subtitle}>Let your subconscious speak</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Main Recording Card */}
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20 }}
            style={styles.mainCard}
          >
            {/* Visual Center */}
            <View style={styles.orbSection}>
              <MotiView
                animate={{
                  scale: status === 'analyzing' ? [1, 1.2, 1] : 1,
                  rotate: status === 'analyzing' ? '360deg' : '0deg',
                }}
                transition={{
                  type: 'timing',
                  duration: status === 'analyzing' ? 3000 : 0,
                  loop: status === 'analyzing',
                }}
                style={styles.orbContainer}
              >
                <View style={styles.orbOuter}>
                  <BlurView intensity={20} tint="light" style={styles.orbInnerBlur}>
                    <PenLine size={32} color="#A78BFA" />
                  </BlurView>
                </View>
              </MotiView>

              <AnimatePresence>
                <MotiText
                  key={status}
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={styles.promptText}
                >
                  {status === 'analyzing' ? "Weaving your patterns..." :
                    status === 'writing' ? "Lumi is listening..." :
                      "Write your dream fragments"}
                </MotiText>
              </AnimatePresence>
            </View>

            {/* Transcription Area */}
            {status !== 'analyzing' && (
              <View style={styles.inputWrapper}>
                {/* Date Selection */}
                <View style={styles.dateSelector}>
                  <Text style={styles.dateLabel}>Dream Night</Text>
                  <View style={styles.dateTabs}>
                    {[
                      { label: 'Tonight', date: new Date() },
                      { label: 'Yesterday', date: new Date(Date.now() - 86400000) },
                      { label: '2 nights ago', date: new Date(Date.now() - 172800000) },
                    ].map((d, i) => {
                      const isSel = selectedDate.toDateString() === d.date.toDateString();
                      return (
                        <TouchableOpacity
                          key={i}
                          onPress={() => {
                            Haptics.selectionAsync();
                            setSelectedDate(d.date);
                          }}
                          style={[styles.dateTab, isSel && styles.dateTabActive]}
                        >
                          <Text style={[styles.dateTabText, isSel && styles.dateTabTextActive]}>
                            {d.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.inputHeader}>
                  <PenLine size={16} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.inputLabel}>Transcribe Memory</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Tell Lumi what you saw... describe the setting, the feelings, and the people from your dream."
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  multiline
                  value={dreamText}
                  onChangeText={handleTextChange}
                  editable={true}
                  autoFocus={true}
                />
              </View>
            )}

            {/* Submission */}
            <AnimatePresence>
              {status !== 'analyzing' && dreamText.trim().length > 10 && (
                <MotiView
                  from={{ opacity: 0, translateY: 10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: 10 }}
                  style={styles.submissionRow}
                >
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmitDream}
                  >
                    <Text style={styles.submitButtonText}>Preserve & Interpret</Text>
                    <Sparkles size={18} color="#030014" />
                  </TouchableOpacity>
                </MotiView>
              )}
            </AnimatePresence>

            {/* Loading State */}
            {status === 'analyzing' && (
              <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.loadingContainer}>
                <Text style={styles.loadingText}>{loadingMessage}</Text>
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

          {/* Guidance removed */}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: 'transparent',
    paddingTop: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    fontFamily: FONTS.heading.bold,
    fontSize: 32,
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FONTS.body.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  // Main Card
  mainCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 24,
  },
  orbSection: { alignItems: 'center', marginBottom: 32, backgroundColor: 'transparent' },
  orbContainer: { marginBottom: 20 },
  orbOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  orbInnerBlur: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  promptText: {
    fontFamily: FONTS.heading.semiBold,
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  // Input
  inputWrapper: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  inputLabel: {
    fontFamily: FONTS.body.bold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  textInput: {
    fontFamily: FONTS.body.regular,
    minHeight: 180,
    maxHeight: 280,
    padding: 20,
    fontSize: 17,
    color: '#fff',
    lineHeight: 26,
  },
  // Date Selector
  dateSelector: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  dateLabel: {
    fontFamily: FONTS.body.bold,
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  dateTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  dateTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dateTabActive: {
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  dateTabText: {
    fontFamily: FONTS.body.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  dateTabTextActive: {
    color: '#A78BFA',
  },
  // Submission
  submissionRow: {
    marginTop: 24,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#A78BFA',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  submitButtonText: {
    fontFamily: FONTS.body.bold,
    fontSize: 16,
    color: '#030014',
  },
  // Loading
  loadingContainer: { alignItems: 'center', paddingVertical: 40, backgroundColor: 'transparent' },
  loadingText: {
    fontFamily: FONTS.body.medium,
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  loadingDots: { flexDirection: 'row', gap: 8, backgroundColor: 'transparent' },
  loadingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#A78BFA' },
  // Guidance
  guidanceCard: {
    backgroundColor: 'rgba(167, 139, 250, 0.05)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.1)',
  },
  guidanceTitle: {
    fontFamily: FONTS.body.bold,
    fontSize: 16,
    color: '#A78BFA',
    marginBottom: 12,
  },
  guidanceList: {
    backgroundColor: 'transparent',
    gap: 8,
  },
  guidanceItem: {
    fontFamily: FONTS.body.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 20,
  },
});
