import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:lumi_mobile/core/data/dream_model.dart';

/// Repository for storing and retrieving dreams
class DreamRepository {
  static const String _dreamsKey = 'lumi_dreams';

  /// Save a dream to local storage
  Future<void> saveDream(Dream dream) async {
    final prefs = await SharedPreferences.getInstance();
    final dreams = await getAllDreams();
    dreams.insert(0, dream); // Add to beginning (most recent first)
    
    final jsonList = dreams.map((d) => d.toJson()).toList();
    await prefs.setString(_dreamsKey, jsonEncode(jsonList));
  }

  /// Get all dreams from local storage
  Future<List<Dream>> getAllDreams() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_dreamsKey);
    
    if (jsonString == null) return [];
    
    final List<dynamic> jsonList = jsonDecode(jsonString);
    return jsonList.map((json) => Dream.fromJson(json)).toList();
  }

  /// Get a single dream by ID
  Future<Dream?> getDreamById(String id) async {
    final dreams = await getAllDreams();
    try {
      return dreams.firstWhere((d) => d.id == id);
    } catch (_) {
      return null;
    }
  }

  /// Update an existing dream
  Future<void> updateDream(Dream dream) async {
    final prefs = await SharedPreferences.getInstance();
    final dreams = await getAllDreams();
    final index = dreams.indexWhere((d) => d.id == dream.id);
    
    if (index != -1) {
      dreams[index] = dream;
      final jsonList = dreams.map((d) => d.toJson()).toList();
      await prefs.setString(_dreamsKey, jsonEncode(jsonList));
    }
  }

  /// Delete a dream
  Future<void> deleteDream(String id) async {
    final prefs = await SharedPreferences.getInstance();
    final dreams = await getAllDreams();
    dreams.removeWhere((d) => d.id == id);
    
    final jsonList = dreams.map((d) => d.toJson()).toList();
    await prefs.setString(_dreamsKey, jsonEncode(jsonList));
  }

  /// Clear all dreams
  Future<void> clearAllDreams() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_dreamsKey);
  }

  /// Get dream count
  Future<int> getDreamCount() async {
    final dreams = await getAllDreams();
    return dreams.length;
  }

  /// Get dreams from the last N days
  Future<List<Dream>> getRecentDreams(int days) async {
    final dreams = await getAllDreams();
    final cutoff = DateTime.now().subtract(Duration(days: days));
    return dreams.where((d) => d.createdAt.isAfter(cutoff)).toList();
  }

  /// Calculate streak (consecutive days with dreams)
  Future<int> calculateStreak() async {
    final dreams = await getAllDreams();
    if (dreams.isEmpty) return 0;

    int streak = 0;
    DateTime currentDate = DateTime.now();

    // Check if there's a dream today
    final today = DateTime(currentDate.year, currentDate.month, currentDate.day);
    bool hasDreamToday = dreams.any((d) {
      final dreamDate = DateTime(d.createdAt.year, d.createdAt.month, d.createdAt.day);
      return dreamDate == today;
    });

    if (!hasDreamToday) {
      // Check yesterday
      final yesterday = today.subtract(const Duration(days: 1));
      bool hasDreamYesterday = dreams.any((d) {
        final dreamDate = DateTime(d.createdAt.year, d.createdAt.month, d.createdAt.day);
        return dreamDate == yesterday;
      });
      if (!hasDreamYesterday) return 0;
      currentDate = yesterday;
    }

    // Count consecutive days
    DateTime checkDate = DateTime(currentDate.year, currentDate.month, currentDate.day);
    while (true) {
      bool hasDream = dreams.any((d) {
        final dreamDate = DateTime(d.createdAt.year, d.createdAt.month, d.createdAt.day);
        return dreamDate == checkDate;
      });

      if (hasDream) {
        streak++;
        checkDate = checkDate.subtract(const Duration(days: 1));
      } else {
        break;
      }
    }

    return streak;
  }

  /// Get all unique symbols across dreams
  Future<List<String>> getAllSymbols() async {
    final dreams = await getAllDreams();
    final symbols = <String>{};
    for (final dream in dreams) {
      symbols.addAll(dream.symbols);
    }
    return symbols.toList();
  }
}

/// Provider for DreamRepository
final dreamRepositoryProvider = Provider<DreamRepository>((ref) {
  return DreamRepository();
});

/// Provider for all dreams
final dreamsProvider = FutureProvider<List<Dream>>((ref) async {
  final repository = ref.watch(dreamRepositoryProvider);
  return repository.getAllDreams();
});

/// Provider for dream streak
final dreamStreakProvider = FutureProvider<int>((ref) async {
  final repository = ref.watch(dreamRepositoryProvider);
  return repository.calculateStreak();
});
