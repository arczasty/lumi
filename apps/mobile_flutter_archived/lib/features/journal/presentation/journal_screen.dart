import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:lumi_mobile/core/theme/lumi_theme.dart';
import 'package:lumi_mobile/core/data/convex_provider.dart';
import 'package:lumi_mobile/features/settings/presentation/settings_screen.dart';

class JournalScreen extends ConsumerStatefulWidget {
  const JournalScreen({super.key});

  @override
  ConsumerState<JournalScreen> createState() => _JournalScreenState();
}

class _JournalScreenState extends ConsumerState<JournalScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _fadeController;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..forward();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }

  Color _getSentimentColor(String? sentiment) {
    switch (sentiment) {
      case 'Bliss':
        return const Color(0xFF64DFDF);
      case 'Positive':
        return LumiTheme.primary;
      case 'Anxiety':
        return const Color(0xFFFF6B6B);
      case 'Negative':
        return const Color(0xFFE76F51);
      default:
        return Colors.white.withOpacity(0.5);
    }
  }

  @override
  Widget build(BuildContext context) {
    final dreamsAsync = ref.watch(dreamsStreamProvider);
    final streakAsync = ref.watch(dreamStreakProvider);

    return Scaffold(
      backgroundColor: LumiTheme.background,
      body: Stack(
        children: [
          // Background glow
          Positioned(
            top: -200,
            right: -100,
            child: Container(
              height: 400,
              width: 400,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    LumiTheme.primary.withOpacity(0.08),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Content
          SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Dream Journal',
                            style: LumiTheme.textTheme.displayLarge,
                          ),
                          const SizedBox(height: 4),
                          dreamsAsync.when(
                            data: (dreams) => Text(
                              '${dreams.length} dreams recorded',
                              style: LumiTheme.textTheme.bodyMedium?.copyWith(
                                color: Colors.white.withOpacity(0.5),
                              ),
                            ),
                            loading: () => const SizedBox.shrink(),
                            error: (_, __) => const SizedBox.shrink(),
                          ),
                        ],
                      ),
                      // Settings button
                      GestureDetector(
                        onTap: () {
                          HapticFeedback.lightImpact();
                          Navigator.of(context).push(
                            PageRouteBuilder(
                              pageBuilder: (_, __, ___) => const SettingsScreen(),
                              transitionDuration: const Duration(milliseconds: 300),
                              transitionsBuilder: (_, animation, __, child) {
                                return SlideTransition(
                                  position: Tween<Offset>(
                                    begin: const Offset(1, 0),
                                    end: Offset.zero,
                                  ).animate(CurvedAnimation(
                                    parent: animation,
                                    curve: Curves.easeOutCubic,
                                  )),
                                  child: child,
                                );
                              },
                            ),
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: LumiTheme.surface.withOpacity(0.5),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            Icons.tune_rounded,
                            color: Colors.white.withOpacity(0.7),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Stats Row
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: Row(
                    children: [
                      _buildStatCard(
                        streakAsync.maybeWhen(data: (s) => s.toString(), orElse: () => '0'), 
                        'Day Streak', 
                        Icons.local_fire_department_rounded
                      ),
                      const SizedBox(width: 12),
                      _buildStatCard('23', 'Symbols', Icons.auto_awesome),
                      const SizedBox(width: 12),
                      _buildStatCard('4', 'Patterns', Icons.insights_rounded),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Dreams List
                Expanded(
                  child: dreamsAsync.when(
                    data: (dreams) {
                      if (dreams.isEmpty) {
                        return Center(
                          child: Text(
                            "Your journal is empty.\nShare your first dream with Lumi.",
                            textAlign: TextAlign.center,
                            style: LumiTheme.textTheme.bodyLarge?.copyWith(
                              color: Colors.white.withOpacity(0.3),
                            ),
                          ),
                        );
                      }
                      return ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        itemCount: dreams.length,
                        itemBuilder: (context, index) {
                          final dream = dreams[index];
                          return FadeTransition(
                            opacity: CurvedAnimation(
                              parent: _fadeController,
                              curve: Interval(
                                index * 0.1,
                                (index * 0.1) + 0.4,
                                curve: Curves.easeOut,
                              ),
                            ),
                            child: _buildDreamCard(dream),
                          );
                        },
                      );
                    },
                    loading: () => const Center(child: CircularProgressIndicator()),
                    error: (e, _) => Center(child: Text("Error: $e")),
                  ),
                ),
                
                const SizedBox(height: 24),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String value, String label, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: LumiTheme.surface.withOpacity(0.4),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: Colors.white.withOpacity(0.1),
            width: 1,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: LumiTheme.accent,
              size: 20,
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: LumiTheme.textTheme.displayMedium?.copyWith(
                fontSize: 20,
              ),
            ),
            Text(
              label,
              style: LumiTheme.textTheme.bodyMedium?.copyWith(
                color: Colors.white.withOpacity(0.5),
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDreamCard(dynamic dream) {
    final createdAt = dream['createdAt'] as int;
    final date = DateTime.fromMillisecondsSinceEpoch(createdAt);
    final dateStr = DateFormat('MMMM d, yyyy').format(date);
    final sentiment = dream['sentiment'] as String?;
    final symbols = (dream['symbols'] as List<dynamic>?)?.cast<String>() ?? [];
    final text = dream['text'] as String;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: LumiTheme.surface.withOpacity(0.4),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Colors.white.withOpacity(0.1),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  text.length > 30 ? '${text.substring(0, 30)}...' : (text.isEmpty ? "Dream Analysis..." : text),
                  style: LumiTheme.textTheme.displayMedium?.copyWith(
                    fontSize: 18,
                  ),
                ),
              ),
              if (sentiment != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getSentimentColor(sentiment).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    sentiment,
                    style: TextStyle(
                      color: _getSentimentColor(sentiment),
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),

          // Date
          Text(
            dateStr,
            style: LumiTheme.textTheme.bodyMedium?.copyWith(
              color: Colors.white.withOpacity(0.4),
            ),
          ),
          const SizedBox(height: 12),

          // Preview
          Text(
            text.isEmpty ? "Lumi is weaving your patterns..." : text,
            style: LumiTheme.textTheme.bodyLarge?.copyWith(
              color: Colors.white.withOpacity(0.7),
              height: 1.5,
              fontStyle: text.isEmpty ? FontStyle.italic : FontStyle.normal,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          
          if (symbols.isNotEmpty) ...[
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: symbols.map((symbol) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: LumiTheme.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: LumiTheme.primary.withOpacity(0.3),
                      width: 1,
                    ),
                  ),
                  child: Text(
                    symbol,
                    style: TextStyle(
                      color: LumiTheme.primary,
                      fontSize: 12,
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ],
      ),
    );
  }
}
