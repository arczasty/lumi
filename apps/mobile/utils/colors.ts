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
      return { bg: "rgba(186, 242, 187, 0.2)", text: "#A78BFA" }; // Green
    case "bliss":
      return { bg: "rgba(244, 224, 77, 0.2)", text: "#F4E04D" }; // Gold
    case "negative":
      return { bg: "rgba(239, 68, 68, 0.2)", text: "#EF4444" }; // Red
    case "anxiety":
      return { bg: "rgba(251, 146, 60, 0.2)", text: "#FB923C" }; // Orange
    case "neutral":
    default:
      return { bg: "rgba(156, 163, 175, 0.2)", text: "#9CA3AF" }; // Gray
  }
}
