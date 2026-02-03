import React, { useState, useEffect } from "react";
import { StyleSheet, Pressable, Dimensions, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "@/components/Themed";
import { Audio } from "expo-av";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth, SignedIn, SignedOut, useOAuth } from "@clerk/clerk-expo";
import { LumiMascot } from "@/components/LumiMascot";
import { useTheme } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { MotiView, MotiText } from "moti";
import { LucideMic, LucideSparkles, LucideMoon, LucideSettings } from "lucide-react-native";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function RecordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [status, setStatus] = useState<"idle" | "recording" | "analyzing" | "error">("idle");
  const [amplitude, setAmplitude] = useState(0);

  // NOTE: For UI Demo, we are bypassing the Auth Wall.
  // In production, wrap content in <SignedIn> or redirect to Onboarding.

  async function startRecording() {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setStatus("recording");
      // Mock amplitude for animation
      const interval = setInterval(() => {
        setAmplitude(Math.random());
      }, 100);

      // In real implementation: Audio.Recording.createAsync...
    } catch (err) {
      console.error("Failed to start recording", err);
      setStatus("error");
    }
  }

  async function stopRecording() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStatus("analyzing");
    setRecording(null);
    setAmplitude(0);

    // Mock analysis delay
    setTimeout(() => {
      router.push("/dream/mock-id"); // Navigate to detail
      setStatus("idle");
    }, 2000);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Background Ambience */}
      <MotiView
        from={{ opacity: 0.1, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1.2 }}
        transition={{ type: "timing", duration: 4000, loop: true }}
        style={[styles.orb, { top: -150, right: -150, backgroundColor: colors.primary }]}
      />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.push("/settings")}>
          <LucideSettings color="rgba(255,255,255,0.4)" size={24} />
        </Pressable>
      </View>

      {/* Main Touch Canvas */}
      <Pressable
        style={styles.touchCanvas}
        onPressIn={startRecording}
        onPressOut={stopRecording}
      >
        <View style={styles.centerContent}>
          <LumiMascot isListening={status === "recording"} amplitude={amplitude} />

          <MotiText
            key={status}
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={[styles.statusText, { color: colors.text }]}
          >
            {status === "recording"
              ? "I'm listening..."
              : status === "analyzing"
                ? "Weaving patterns..."
                : "Hold anywhere to whisper"}
          </MotiText>

          <MotiText
            from={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            style={[styles.subText, { color: colors.text }]}
          >
            {status === "idle" && "Tap into the subconscious"}
          </MotiText>
        </View>

        {/* Visual Cue for Touch */}
        {status === 'idle' && (
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ loop: true, type: 'timing', duration: 1500 }}
            style={styles.rippleCue}
          />
        )}
      </Pressable>

      {/* Bottom Hint */}
      <View style={styles.hintContainer}>
        <LucideMoon size={16} color={colors.notification} />
        <Text style={[styles.hintText, { color: colors.text }]}>Sanctuary Active</Text>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 10,
    zIndex: 10,
  },
  touchCanvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  centerContent: {
    alignItems: 'center',
    zIndex: 5,
  },
  statusText: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 40,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  subText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
    opacity: 0.6,
  },
  spacer: {
    height: 60,
  },
  orb: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  hintContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    pointerEvents: 'none',
  },
  hintText: {
    marginLeft: 8,
    fontSize: 14,
    opacity: 0.6,
  },
  rippleCue: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  }
});
