/**
 * Get color for sentiment badge based on sentiment value
 */
export function getSentimentColor(sentiment?: string): { bg: string; text: string } {
  if (!sentiment) {
    return { bg: "rgba(156, 163, 175, 0.2)", text: "#9CA3AF" }; // Gray (Neutral)
  }

  const normalizedSentiment = sentiment.toLowerCase();

  switch (normalizedSentiment) {
    case "positive":
      return { bg: "rgba(34, 197, 94, 0.15)", text: "#4ADE80" };
    case "bliss":
      return { bg: "rgba(244, 224, 77, 0.15)", text: "#F4E04D" };
    case "negative":
    case "fear":
      return { bg: "rgba(239, 68, 68, 0.25)", text: "#FF6B6B" }; // More intense for Fear
    case "anxiety":
      return { bg: "rgba(251, 146, 60, 0.15)", text: "#FB923C" };
    case "calm":
      return { bg: "rgba(45, 212, 191, 0.15)", text: "#2DD4BF" };
    case "vivid":
      return { bg: "rgba(167, 139, 250, 0.15)", text: "#A78BFA" };
    case "neutral":
    default:
      return { bg: "rgba(156, 163, 175, 0.15)", text: "#9CA3AF" };
  }
}
