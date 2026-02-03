import React, { useState } from "react";
import { StyleSheet, Pressable, Dimensions, Platform, TextInput, KeyboardAvoidingView, ActivityIndicator, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "@/components/Themed";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { LumiMascot } from "@/components/LumiMascot";
import { SanctuaryBackground } from "@/components/SanctuaryUI/Background";
import { useTheme } from "@react-navigation/native";
import { MotiView, MotiText } from "moti";
import { LucideSettings, LucideSparkles, LucideSend, LucideX } from "lucide-react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";

const { width } = Dimensions.get("window");

export default function RecordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { userId } = useAuth();

  const [dreamText, setDreamText] = useState("");
  const [status, setStatus] = useState<"idle" | "writing" | "analyzing" | "completed">("idle");
  const [isFocused, setIsFocused] = useState(false);

  const saveDream = useMutation(api.dreams.saveDream);
  const analyzeDream = useAction(api.ai.analyzeDream);

  async function submitDream() {
    if (!dreamText.trim()) return;
    Keyboard.dismiss();
    setStatus("analyzing");

    try {
      // 1. Save Dream Text
      const dreamId = await saveDream({
        userId: userId ?? "guest_legacy_id", // Fallback for demo
        text: dreamText,
      });

      // 2. Trigger Analysis
      await analyzeDream({
        dreamId,
        text: dreamText
      });

      // 3. Navigate
      router.push(`/dream/${dreamId}`);

      // Reset
      setDreamText("");
      setStatus("idle");
    } catch (e) {
      console.error("Submission failed", e);
      setStatus("idle");
      // TODO: Show toast
    }
  }

  return (
    <SanctuaryBackground>
      <SafeAreaView style={styles.safeArea}>

        {/* Header */}
        <BlurView intensity={20} tint="dark" style={styles.glassHeader}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Lumi</Text>
          </View>
          <Pressable
            onPress={() => router.push("/settings")}
            style={styles.actionButton}
          >
            <LucideSettings color="rgba(255,255,255,0.6)" size={24} />
          </Pressable>
        </BlurView>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardContainer}
        >
          <View style={styles.centerContent}>

            {/* Mascot State */}
            <MotiView
              animate={{
                scale: isFocused ? 0.6 : 1,
                opacity: status === 'analyzing' ? 0.5 : 1
              }}
              transition={{ type: 'timing', duration: 500 }}
              style={styles.mascotContainer}
            >
              <LumiMascot
                isListening={status === 'analyzing'} // Pulse when analyzing
                amplitude={status === 'analyzing' ? 0.5 : 0}
              />
            </MotiView>

            {/* Status Label */}
            <MotiText
              animate={{ opacity: isFocused ? 0 : 1 }}
              style={styles.promptText}
            >
              {status === 'analyzing' ? "Consulting the stars..." : "Share your reflection"}
            </MotiText>

            {/* Text Composer */}
            {status !== 'analyzing' && (
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                style={styles.inputContainer}
              >
                <BlurView intensity={30} tint="dark" style={styles.inputBlur}>
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="I was floating above a glass city..."
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    multiline
                    value={dreamText}
                    onChangeText={(t) => {
                      setDreamText(t);
                      if (t.length > 0) setStatus('writing');
                      else setStatus('idle');
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />

                  {/* Actions Bar inside Input */}
                  <View style={styles.inputActions}>
                    {dreamText.length > 0 && (
                      <Pressable
                        style={styles.clearButton}
                        onPress={() => setDreamText("")}
                      >
                        <LucideX size={16} color="rgba(255,255,255,0.4)" />
                      </Pressable>
                    )}
                    <View style={{ flex: 1 }} />
                    <Pressable
                      style={[
                        styles.sendButton,
                        { backgroundColor: dreamText.length > 0 ? colors.primary : 'rgba(255,255,255,0.1)' }
                      ]}
                      disabled={dreamText.length === 0}
                      onPress={submitDream}
                    >
                      <LucideSend size={20} color={dreamText.length > 0 ? '#030014' : 'rgba(255,255,255,0.2)'} />
                    </Pressable>
                  </View>
                </BlurView>
              </MotiView>
            )}

            {/* Loading State */}
            {status === 'analyzing' && (
              <ActivityIndicator size="large" color="#BAF2BB" style={{ marginTop: 40 }} />
            )}

          </View>
        </KeyboardAvoidingView>

      </SafeAreaView>
    </SanctuaryBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  glassHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  actionButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  keyboardContainer: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  mascotContainer: {
    marginBottom: 30,
  },
  promptText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    letterSpacing: 0.5,
    marginBottom: 40,
    textAlign: 'center',
    opacity: 0.8,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 500,
  },
  inputBlur: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(3,0,20,0.4)',
  },
  textInput: {
    padding: 24,
    fontSize: 18,
    lineHeight: 28,
    minHeight: 150,
    maxHeight: 300,
    textAlignVertical: 'top',
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  clearButton: {
    padding: 10,
  },
  sendButton: {
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
