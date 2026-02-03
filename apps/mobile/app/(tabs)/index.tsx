import React, { useState, useEffect } from "react";
import { StyleSheet, Pressable, Dimensions, Platform } from "react-native";
import { Text, View } from "@/components/Themed";
import { Audio } from "expo-av";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth, SignedIn, SignedOut, useOAuth } from "@clerk/clerk-expo";
import { LumiMascot } from "@/components/LumiMascot";
import { useTheme } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { MotiView, MotiText } from "moti";
import { LucideMic, LucideSparkles, LucideMoon } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function RecordScreen() {
  const { colors } = useTheme();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [status, setStatus] = useState<"idle" | "recording" | "analyzing" | "error">("idle");
  const [amplitude, setAmplitude] = useState(0);

  const generateUploadUrl = useMutation(api.dreams.generateUploadUrl);
  const saveDream = useMutation(api.dreams.saveDream);
  const transcribeAndAnalyze = useAction(api.ai.transcribeAndAnalyze);
  const { userId } = useAuth();

  // OAuth Hooks
  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: "oauth_google" });

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  const onSignInPress = async () => {
    try {
      const { createdSessionId, setActive } = await startGoogleFlow();
      if (createdSessionId && setActive) {
        setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  };

  async function startRecording() {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: ".m4a",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: ".m4a",
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {}
      });
      setRecording(recording);
      setStatus("recording");

      recording.setOnRecordingStatusUpdate((status) => {
        if (status.metering) {
          const normalized = (status.metering + 160) / 160;
          setAmplitude(normalized);
        }
      });
    } catch (err) {
      console.error("Failed to start recording", err);
      setStatus("error");
    }
  }

  async function stopRecording() {
    if (!recording) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStatus("analyzing");
    setRecording(null);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    if (uri && userId) {
      try {
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(uri);
        const blob = await response.blob();

        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": "audio/m4a" },
          body: blob,
        });

        const { storageId } = await uploadResponse.json();

        const dreamId = await saveDream({
          userId: userId,
          audioStorageId: storageId,
        });

        await transcribeAndAnalyze({
          dreamId,
          storageId,
        });

        setStatus("idle");
      } catch (err) {
        console.error("Analysis failed", err);
        setStatus("error");
      }
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MotiView
        from={{ opacity: 0.1, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1.2 }}
        transition={{ type: "timing", duration: 4000, loop: true }}
        style={[styles.orb, { top: -100, right: -100, backgroundColor: colors.primary }]}
      />

      <SignedIn>
        <View style={styles.content}>
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
                : "Hold to share your dream"}
          </MotiText>

          <MotiText
            from={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            style={[styles.subText, { color: colors.text }]}
          >
            {status === "recording" ? "Release when finished" : "A digital sanctuary for your mind"}
          </MotiText>

          <View style={styles.spacer} />

          <Pressable
            onLongPress={startRecording}
            onPressOut={() => {
              if (status === "recording") stopRecording();
            }}
            style={({ pressed }) => [
              styles.recordButton,
              {
                backgroundColor: status === "recording" ? colors.primary : colors.card,
                borderColor: colors.primary,
                transform: [{ scale: pressed ? 0.9 : 1 }],
              },
            ]}
          >
            {status === "analyzing" ? (
              <LucideSparkles color={colors.background} size={32} />
            ) : (
              <LucideMic color={status === "recording" ? colors.background : colors.primary} size={32} />
            )}
          </Pressable>

          <View style={styles.hintContainer}>
            <LucideMoon size={16} color={colors.notification} />
            <Text style={[styles.hintText, { color: colors.text }]}>Whisper mode active</Text>
          </View>
        </View>
      </SignedIn>

      <SignedOut>
        <View style={styles.authContainer}>
          <LucideSparkles color={colors.primary} size={64} style={{ marginBottom: 24 }} />
          <Text style={styles.authTitle}>Enter the Sanctuary</Text>
          <Text style={styles.authSub}>Your dreams deserve a sacred space. Sign in to begin your journey.</Text>
          <View style={styles.authButtonContainer}>
            <Pressable onPress={onSignInPress} style={[styles.clerkMockButton, { backgroundColor: colors.primary }]}>
              <Text style={[styles.clerkMockButtonText, { color: colors.background }]}>Sign In with Google</Text>
            </Pressable>
          </View>
        </View>
      </SignedOut>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    backgroundColor: "transparent",
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
  },
  recordButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
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
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hintText: {
    marginLeft: 8,
    fontSize: 14,
    opacity: 0.6,
  },
  authContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    backgroundColor: "transparent",
  },
  authTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  authSub: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 40,
  },
  authButtonContainer: {
    width: "100%",
  },
  clerkMockButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  clerkMockButtonText: {
    fontSize: 18,
    fontWeight: "700",
  },
});
