/// Dream data model
class Dream {
  final String id;
  final String title;
  final String transcript;
  final DateTime createdAt;
  final DreamSentiment sentiment;
  final List<String> symbols;
  final String lumiResponse;
  final bool safetyFlag;
  final String? audioPath;

  const Dream({
    required this.id,
    required this.title,
    required this.transcript,
    required this.createdAt,
    required this.sentiment,
    required this.symbols,
    required this.lumiResponse,
    this.safetyFlag = false,
    this.audioPath,
  });

  /// Create from JSON (for local storage or API response)
  factory Dream.fromJson(Map<String, dynamic> json) {
    return Dream(
      id: json['id'] as String,
      title: json['title'] as String,
      transcript: json['transcript'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      sentiment: DreamSentiment.fromString(json['sentiment'] as String),
      symbols: List<String>.from(json['symbols'] as List),
      lumiResponse: json['lumiResponse'] as String,
      safetyFlag: json['safetyFlag'] as bool? ?? false,
      audioPath: json['audioPath'] as String?,
    );
  }

  /// Convert to JSON for storage
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'transcript': transcript,
      'createdAt': createdAt.toIso8601String(),
      'sentiment': sentiment.name,
      'symbols': symbols,
      'lumiResponse': lumiResponse,
      'safetyFlag': safetyFlag,
      'audioPath': audioPath,
    };
  }

  /// Get a preview of the transcript
  String get preview {
    if (transcript.length <= 100) return transcript;
    return '${transcript.substring(0, 100)}...';
  }

  /// Format the date for display
  String get formattedDate {
    final now = DateTime.now();
    final difference = now.difference(createdAt);

    if (difference.inDays == 0) return 'Today';
    if (difference.inDays == 1) return 'Yesterday';
    if (difference.inDays < 7) return '${difference.inDays} days ago';
    if (difference.inDays < 30) return '${(difference.inDays / 7).floor()} weeks ago';
    return '${createdAt.month}/${createdAt.day}/${createdAt.year}';
  }

  /// Create a copy with updated fields
  Dream copyWith({
    String? id,
    String? title,
    String? transcript,
    DateTime? createdAt,
    DreamSentiment? sentiment,
    List<String>? symbols,
    String? lumiResponse,
    bool? safetyFlag,
    String? audioPath,
  }) {
    return Dream(
      id: id ?? this.id,
      title: title ?? this.title,
      transcript: transcript ?? this.transcript,
      createdAt: createdAt ?? this.createdAt,
      sentiment: sentiment ?? this.sentiment,
      symbols: symbols ?? this.symbols,
      lumiResponse: lumiResponse ?? this.lumiResponse,
      safetyFlag: safetyFlag ?? this.safetyFlag,
      audioPath: audioPath ?? this.audioPath,
    );
  }
}

/// Sentiment classification for dreams
enum DreamSentiment {
  positive,
  negative,
  neutral,
  anxiety,
  bliss;

  static DreamSentiment fromString(String value) {
    return DreamSentiment.values.firstWhere(
      (e) => e.name.toLowerCase() == value.toLowerCase(),
      orElse: () => DreamSentiment.neutral,
    );
  }

  String get displayName {
    switch (this) {
      case DreamSentiment.positive:
        return 'Positive';
      case DreamSentiment.negative:
        return 'Negative';
      case DreamSentiment.neutral:
        return 'Neutral';
      case DreamSentiment.anxiety:
        return 'Anxiety';
      case DreamSentiment.bliss:
        return 'Bliss';
    }
  }

  /// Get color for sentiment badge
  int get colorValue {
    switch (this) {
      case DreamSentiment.positive:
        return 0xFFBAF2BB; // Bioluminescent Teal
      case DreamSentiment.negative:
        return 0xFFE76F51; // Coral Red
      case DreamSentiment.neutral:
        return 0xFF9CA3AF; // Gray
      case DreamSentiment.anxiety:
        return 0xFFFF6B6B; // Anxious Red
      case DreamSentiment.bliss:
        return 0xFF64DFDF; // Blissful Cyan
    }
  }
}
