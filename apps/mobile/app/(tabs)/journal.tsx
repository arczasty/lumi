import React from "react";
import { StyleSheet, FlatList, Dimensions, Platform, Pressable } from "react-native";
import { Text, View } from "@/components/Themed";
import { SanctuaryBackground } from "@/components/SanctuaryUI/Background";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { useTheme } from "@react-navigation/native";
import { MotiView } from "moti";
import { BookOpen, Calendar, Sparkles, Image as LucideImage, Plus } from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { DreamListSkeleton } from "@/components/LoadingSkeleton";
import { getSentimentColor } from "@/utils/colors";
import { Moon } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { LevelCard } from "@/components/Gamification/LevelCard";
import { FONTS } from "@/constants/Theme";

const { width } = Dimensions.get("window");

export default function JournalScreen() {
  const { colors } = useTheme();
  const { userId } = useAuth();
  const router = useRouter();
  const dreams = useQuery(api.dreams.getDreams, userId ? { userId } : "skip");
  const user = useQuery(api.users.getUser, userId ? { userId } : "skip");

  // Calculate XP Progress
  const currentLevel = user?.level ?? 1;
  const currentXp = user?.xp ?? 0;
  const nextLevelXp = currentLevel * 100;

  const handleCardPress = (dreamId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/dream/${dreamId}`);
  };

  const renderDreamItem = ({ item, index }: { item: any; index: number }) => {
    const sentimentColors = getSentimentColor(item.sentiment);

    return (
      <Pressable onPress={() => handleCardPress(item._id)}>
        <MotiView
          from={{ opacity: 0, translateY: 20, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: "spring", duration: 600, delay: index * 80 }}
          style={[styles.dreamCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          {/* Dream Image */}
          {item.imageUrl ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.dreamImage}
                contentFit="cover"
                transition={300}
              />
            </View>
          ) : (
            <View style={[styles.imageContainer, styles.imagePlaceholder, { backgroundColor: colors.border }]}>
              <LucideImage size={32} color={colors.text} opacity={0.2} />
              <Text style={[styles.placeholderText, { color: colors.text }]}>
                Generating artwork...
              </Text>
            </View>
          )}

          <View style={styles.cardHeader}>
            <View style={styles.dateContainer}>
              <Calendar size={14} color={colors.text} opacity={0.5} />
              <Text style={[styles.dateText, { color: colors.text }]}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {item.sentiment && (
              <View style={[styles.sentimentBadge, { backgroundColor: sentimentColors.bg }]}>
                <Text style={[styles.sentimentText, { color: sentimentColors.text }]}>{item.sentiment}</Text>
              </View>
            )}
          </View>

          <Text style={[styles.dreamText, { color: colors.text }]} numberOfLines={3}>
            {item.text || "Lumi is weaving your patterns..."}
          </Text>

          {item.symbols && item.symbols.length > 0 && (
            <View style={styles.symbolContainer}>
              {item.symbols.map((symbol: string, i: number) => (
                <View key={i} style={[styles.symbolBadge, { backgroundColor: colors.notification + "20" }]}>
                  <Text style={[styles.symbolText, { color: colors.notification }]}>{symbol}</Text>
                </View>
              ))}
            </View>
          )}

          {item.interpretation && (
            <View style={[styles.interpretationContainer, { borderTopColor: colors.border }]}>
              <Sparkles size={16} color={colors.primary} />
              <Text style={[styles.interpretationText, { color: colors.text }]} numberOfLines={2}>
                {item.interpretation}
              </Text>
            </View>
          )}
        </MotiView>
      </Pressable>
    );
  };

  const renderHeader = () => (
    <View style={{ marginBottom: 20 }}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Dream Journal</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          {dreams?.length ?? 0} reflections captured
        </Text>
      </View>
      <LevelCard level={currentLevel} xp={currentXp} nextLevelXp={nextLevelXp} />
    </View>
  );

  return (
    <SanctuaryBackground>
      <SafeAreaView style={styles.container}>

        {/* Show skeleton only during initial load when signed in */}
        {userId && dreams === undefined ? (
          <View style={styles.listContent}>
            <DreamListSkeleton count={3} />
          </View>
        ) : !userId || !dreams || dreams.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", duration: 800 }}
              style={styles.emptyIconContainer}
            >
              <Moon size={64} color="#A78BFA" strokeWidth={1.5} />
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 600, delay: 300 }}
            >
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Your Sanctuary Awaits
              </Text>
              <Text style={[styles.emptyText, { color: colors.text }]}>
                Begin your journey with Lumi by recording your first dream
              </Text>
            </MotiView>
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", duration: 500, delay: 600 }}
            >
              <Pressable
                style={[styles.ctaButton, { backgroundColor: "#A78BFA" }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push("/(tabs)");
                }}
              >
                <Plus size={20} color="#030014" />
                <Text style={styles.ctaButtonText}>Record Your First Dream</Text>
              </Pressable>
            </MotiView>
          </View>
        ) : (
          <FlatList
            data={dreams}
            keyExtractor={(item) => item._id}
            renderItem={renderDreamItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={renderHeader}
          />
        )}
      </SafeAreaView>
    </SanctuaryBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
    backgroundColor: "transparent",
  },
  title: {
    fontFamily: FONTS.heading.bold,
    fontSize: 34,
    color: '#fff',
  },
  subtitle: {
    fontFamily: FONTS.body.regular,
    fontSize: 16,
    opacity: 0.5,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    backgroundColor: "transparent",
  },
  dreamCard: {
    padding: 0,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#1A1B41',
  },
  dreamImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: FONTS.body.regular,
    marginTop: 8,
    fontSize: 12,
    opacity: 0.5,
    fontStyle: 'italic',
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "transparent",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  dateText: {
    fontFamily: FONTS.body.regular,
    fontSize: 12,
    marginLeft: 6,
    opacity: 0.6,
  },
  sentimentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sentimentText: {
    fontFamily: FONTS.body.bold,
    fontSize: 11,
    textTransform: "uppercase",
  },
  dreamText: {
    fontFamily: FONTS.body.regular,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  symbolContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
    backgroundColor: "transparent",
    paddingHorizontal: 20,
  },
  symbolBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  symbolText: {
    fontFamily: FONTS.body.semiBold,
    fontSize: 12,
  },
  interpretationContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    backgroundColor: "transparent",
    marginHorizontal: 20,
  },
  interpretationText: {
    fontFamily: FONTS.body.regular,
    fontSize: 13,
    marginLeft: 10,
    opacity: 0.8,
    fontStyle: "italic",
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
    paddingHorizontal: 40,
    backgroundColor: "transparent",
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontFamily: FONTS.heading.bold,
    fontSize: 28,
    color: '#fff',
    textAlign: "center",
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: FONTS.body.regular,
    fontSize: 16,
    textAlign: "center",
    opacity: 0.6,
    lineHeight: 24,
    marginBottom: 32,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
  ctaButtonText: {
    fontFamily: FONTS.body.semiBold,
    fontSize: 16,
    color: "#030014",
  },
});
