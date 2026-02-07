import React, { useState, useMemo } from "react";
import { StyleSheet, FlatList, Dimensions, Platform, Pressable, View, TouchableOpacity } from "react-native";
import { Text } from "@/components/Themed";
import { SanctuaryBackground } from "@/components/SanctuaryUI/Background";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useTheme } from "@react-navigation/native";
import { MotiView } from "moti";
import { BookOpen, Calendar, Sparkles, Image as LucideImage, Plus } from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { DreamListSkeleton } from "@/components/LoadingSkeleton";
import { getSentimentColor } from "@/utils/colors";
import { Moon } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { FONTS } from "@/constants/Theme";

const { width } = Dimensions.get("window");

export default function JournalScreen() {
  const { colors } = useTheme();
  const { userId } = useAuth();
  const { user: clerkUser } = useUser();
  const router = useRouter();
  const dreams = useQuery(api.dreams.getDreams, userId ? { userId } : "skip");
  const convexUser = useQuery(api.users.getUser, userId ? { userId } : "skip");

  const firstName = clerkUser?.firstName || "Dreamer";

  const [filter, setFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');

  const filteredDreams = useMemo(() => {
    return dreams || [];
  }, [dreams]);

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
            <BlurView intensity={20} tint="dark" style={[styles.imageContainer, styles.imagePlaceholder]}>
              <LucideImage size={32} color={colors.text} opacity={0.2} />
              <Text style={[styles.placeholderText, { color: colors.text }]}>
                Generating artwork...
              </Text>
            </BlurView>
          )}

          <View style={styles.cardHeader}>
            <View style={styles.dateContainer}>
              <Calendar size={14} color={colors.text} opacity={0.5} />
              <Text style={[styles.dateText, { color: colors.text }]}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {item.sentiment && (
              <View style={[
                styles.sentimentBadge,
                { backgroundColor: sentimentColors.bg, borderColor: sentimentColors.text + '40', borderWidth: 1 }
              ]}>
                <Text style={[styles.sentimentText, { color: sentimentColors.text }]}>{item.sentiment.toUpperCase()}</Text>
              </View>
            )}
          </View>

          <Text style={[styles.dreamText, { color: colors.text }]} numberOfLines={3}>
            {item.text || "Lumi is weaving your patterns..."}
          </Text>

          {item.lumi_quote && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={styles.quoteRow}
            >
              <Moon size={14} color="#A78BFA" opacity={0.6} />
              <Text style={styles.quoteRowText}>
                "{item.lumi_quote}"
              </Text>
            </MotiView>
          )}
        </MotiView>
      </Pressable>
    );
  };

  const renderHeader = () => {
    const lastDream = dreams?.[0];
    const streak = convexUser?.streak || 0;
    const lastEntryDate = convexUser?.lastEntryDate;
    const isToday = lastEntryDate && new Date(lastEntryDate).toDateString() === new Date().toDateString();

    const getTimeGreeting = () => {
      const hours = new Date().getHours();
      if (hours < 12) return "Good morning";
      if (hours < 17) return "Good afternoon";
      return "Good evening";
    };

    return (
      <View style={{ marginBottom: 28 }}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.text }]}>Dream Journal</Text>
          </View>

          <MotiView
            from={{ opacity: 0, translateX: -10 }}
            animate={{ opacity: 1, translateX: 0 }}
            style={styles.greetingSection}
          >
            <Text style={[styles.greeting, { color: colors.text }]}>
              {getTimeGreeting()}, <Text style={{ fontFamily: FONTS.heading.bold }}>{firstName}</Text> ✨
            </Text>
            <Text style={[styles.statusMessage, { color: colors.text }]}>
              {isToday ? (
                streak === 1
                  ? "You've begun your connection to the stars today. Keep this light burning."
                  : streak > 1
                    ? `You've held your connection to the stars for ${streak} nights in a row. Amazing dedication.`
                    : "Your journey starts here. Record your first dream to connect with the stars."
              ) : (
                streak > 0
                  ? `Your connection to the stars is fading. Recording a dream today will keep your ${streak}-night streak alive.`
                  : "The stars missed your light today. Capture your recent journey before it fades."
              )}
            </Text>
          </MotiView>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/record");
            }}
            style={[styles.fullCreateButton, { backgroundColor: 'rgba(167, 139, 250, 0.1)' }]}
          >
            <Plus size={18} color="#A78BFA" />
            <Text style={styles.fullCreateButtonText}>Log New Dream</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SanctuaryBackground>
      <SafeAreaView style={styles.container}>
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
          style={{ flex: 1 }}
        >
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
                    router.push("/record");
                  }}
                >
                  <Plus size={20} color="#030014" />
                  <Text style={styles.ctaButtonText}>Record Your First Dream</Text>
                </Pressable>
              </MotiView>
            </View>
          ) : (
            <FlatList
              data={filteredDreams}
              keyExtractor={(item) => item._id}
              renderItem={renderDreamItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={renderHeader}
            />
          )}
        </MotiView>
      </SafeAreaView>
    </SanctuaryBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
    backgroundColor: "transparent",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  createButtonText: {
    fontFamily: FONTS.body.bold,
    fontSize: 14,
    color: "#030014",
  },
  greeting: {
    fontFamily: FONTS.body.regular,
    fontSize: 16,
    opacity: 0.6,
  },
  userName: {
    fontFamily: FONTS.heading.bold,
    fontSize: 28,
    marginBottom: 4,
  },
  titleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greetingSection: {
    marginBottom: 20,
  },
  statusMessage: {
    fontFamily: FONTS.body.regular,
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.7,
    marginTop: 4,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 20,
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusLabel: {
    fontFamily: FONTS.body.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusValue: {
    fontFamily: FONTS.body.bold,
    fontSize: 13,
    color: '#A78BFA',
  },
  title: {
    fontFamily: FONTS.heading.bold,
    fontSize: 32,
    color: '#fff',
    letterSpacing: -0.5,
  },
  filterAndActionRow: {
    gap: 16,
  },
  fullCreateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  fullCreateButtonText: {
    fontFamily: FONTS.body.bold,
    fontSize: 15,
    color: '#A78BFA',
  },
  quoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 10,
    opacity: 0.8,
  },
  quoteRowText: {
    fontFamily: FONTS.body.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
    flex: 1,
  },
  subtitle: {
    fontFamily: FONTS.body.regular,
    fontSize: 14,
    opacity: 0.5,
    marginTop: 2,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  filterText: {
    fontFamily: FONTS.body.semiBold,
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    backgroundColor: "transparent",
  },
  dreamCard: {
    padding: 0,
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  imageContainer: {
    width: '100%',
    height: 220,
    backgroundColor: 'rgba(26, 27, 65, 0.3)',
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
    fontSize: 32,
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
