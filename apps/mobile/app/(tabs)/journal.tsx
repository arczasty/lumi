import React from "react";
import { StyleSheet, FlatList, Dimensions, Platform } from "react-native";
import { Text, View } from "@/components/Themed";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { useTheme } from "@react-navigation/native";
import { MotiView } from "moti";
import { LucideBookOpen, LucideCalendar, LucideSparkles } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function JournalScreen() {
  const { colors } = useTheme();
  const { userId } = useAuth();
  const dreams = useQuery(api.dreams.getDreams, userId ? { userId } : "skip");

  const renderDreamItem = ({ item, index }: { item: any; index: number }) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 500, delay: index * 100 }}
      style={[styles.dreamCard, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.dateContainer}>
          <LucideCalendar size={14} color={colors.text} opacity={0.5} />
          <Text style={[styles.dateText, { color: colors.text }]}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        {item.sentiment && (
          <View style={[styles.sentimentBadge, { backgroundColor: colors.primary + "20" }]}>
            <Text style={[styles.sentimentText, { color: colors.primary }]}>{item.sentiment}</Text>
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
          <LucideSparkles size={16} color={colors.primary} />
          <Text style={[styles.interpretationText, { color: colors.text }]} numberOfLines={2}>
            {item.interpretation}
          </Text>
        </View>
      )}
    </MotiView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Dream Journal</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          {dreams?.length ?? 0} reflections captured
        </Text>
      </View>

      {!dreams ? (
        <View style={styles.emptyContainer}>
          <LucideBookOpen size={48} color={colors.primary} opacity={0.2} />
          <Text style={[styles.emptyText, { color: colors.text }]}>Consulting the stars...</Text>
        </View>
      ) : dreams.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LucideBookOpen size={48} color={colors.primary} opacity={0.2} />
          <Text style={[styles.emptyText, { color: colors.text }]}>Your journal is a blank page.</Text>
          <Text style={[styles.emptySubText, { color: colors.text }]}>Record your first dream to begin.</Text>
        </View>
      ) : (
        <FlatList
          data={dreams}
          keyExtractor={(item) => item._id}
          renderItem={renderDreamItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
    fontSize: 34,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  subtitle: {
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
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  dateText: {
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
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  dreamText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  symbolContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  symbolBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  symbolText: {
    fontSize: 12,
    fontWeight: "600",
  },
  interpretationContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    backgroundColor: "transparent",
  },
  interpretationText: {
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
    backgroundColor: "transparent",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    opacity: 0.6,
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.4,
  },
});
