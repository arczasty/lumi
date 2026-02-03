import React from "react";
import { StyleSheet, Dimensions } from "react-native";
import { View } from "@/components/Themed";
import { MotiView } from "moti";
import { useTheme } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export const DreamCardSkeleton = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.skeletonCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header Row */}
      <View style={styles.skeletonHeader}>
        <MotiView
          from={{ opacity: 0.3 }}
          animate={{ opacity: 0.6 }}
          transition={{
            type: "timing",
            duration: 1000,
            loop: true,
          }}
          style={[styles.skeletonDateBadge, { backgroundColor: colors.border }]}
        />
        <MotiView
          from={{ opacity: 0.3 }}
          animate={{ opacity: 0.6 }}
          transition={{
            type: "timing",
            duration: 1000,
            loop: true,
            delay: 200,
          }}
          style={[styles.skeletonSentimentBadge, { backgroundColor: colors.border }]}
        />
      </View>

      {/* Dream Text Lines */}
      <View style={styles.skeletonTextContainer}>
        <MotiView
          from={{ opacity: 0.3 }}
          animate={{ opacity: 0.6 }}
          transition={{
            type: "timing",
            duration: 1000,
            loop: true,
            delay: 100,
          }}
          style={[styles.skeletonTextLine, styles.skeletonTextLineFull, { backgroundColor: colors.border }]}
        />
        <MotiView
          from={{ opacity: 0.3 }}
          animate={{ opacity: 0.6 }}
          transition={{
            type: "timing",
            duration: 1000,
            loop: true,
            delay: 200,
          }}
          style={[styles.skeletonTextLine, styles.skeletonTextLineFull, { backgroundColor: colors.border }]}
        />
        <MotiView
          from={{ opacity: 0.3 }}
          animate={{ opacity: 0.6 }}
          transition={{
            type: "timing",
            duration: 1000,
            loop: true,
            delay: 300,
          }}
          style={[styles.skeletonTextLine, styles.skeletonTextLineHalf, { backgroundColor: colors.border }]}
        />
      </View>

      {/* Symbol Badges */}
      <View style={styles.skeletonSymbolsRow}>
        {[0, 1, 2].map((i) => (
          <MotiView
            key={i}
            from={{ opacity: 0.3 }}
            animate={{ opacity: 0.6 }}
            transition={{
              type: "timing",
              duration: 1000,
              loop: true,
              delay: 400 + i * 100,
            }}
            style={[styles.skeletonSymbol, { backgroundColor: colors.border }]}
          />
        ))}
      </View>
    </View>
  );
};

export const DreamListSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <DreamCardSkeleton key={i} />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  skeletonCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
  },
  skeletonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  skeletonDateBadge: {
    width: 100,
    height: 16,
    borderRadius: 8,
  },
  skeletonSentimentBadge: {
    width: 80,
    height: 24,
    borderRadius: 12,
  },
  skeletonTextContainer: {
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  skeletonTextLine: {
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonTextLineFull: {
    width: "100%",
  },
  skeletonTextLineHalf: {
    width: "70%",
  },
  skeletonSymbolsRow: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "transparent",
  },
  skeletonSymbol: {
    width: 60,
    height: 28,
    borderRadius: 8,
  },
});
