import 'package:convex_flutter/convex_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lumi_mobile/core/config/convex_config.dart';

final convexClientProvider = Provider<ConvexClient>((ref) {
  return ConvexClient(ConvexConfig.url);
});

final dreamsStreamProvider = StreamProvider<List<dynamic>>((ref) {
  final client = ref.watch(convexClientProvider);
  return client.subscribe("dreams:getDreams", {"userId": "guest_traveler"});
});

final dreamStreakProvider = FutureProvider<int>((ref) async {
  // Shortcut for now: just return the count of total dreams as a simulated streak
  // In a real app, this would be a Convex query
  final client = ref.watch(convexClientProvider);
  final dreams = await client.query("dreams:getDreams", {"userId": "guest_traveler"});
  return dreams.length;
});
