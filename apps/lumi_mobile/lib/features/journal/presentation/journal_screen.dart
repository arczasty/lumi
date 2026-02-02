import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lumi_mobile/core/theme/lumi_theme.dart';
import 'package:lumi_mobile/features/settings/presentation/settings_screen.dart';

class JournalScreen extends ConsumerStatefulWidget {
  const JournalScreen({super.key});

  @override
  ConsumerState<JournalScreen> createState() => _JournalScreenState();
}

class _JournalScreenState extends ConsumerState<JournalScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _fadeController;

  // Mock dream data (will be replaced with actual data later)
  final List<Map<String, dynamic>> _mockDreams = [
    {
      'id': '1',
      'title': 'Flying Over Mountains',
      'date': DateTime.now().subtract(const Duration(days: 1)),
      'sentiment': 'Bliss',
      'symbols': ['Wings', 'Freedom', 'Heights'],
      'preview': 'I was soaring through clouds, feeling completely free...',
      'lumiResponse': 'Your dream speaks of liberation and transcendence.',
    },
    {
      'id': '2', 
      'title': 'The Endless Library',
      'date': DateTime.now().subtract(const Duration(days: 3)),
      'sentiment': 'Neutral',
      'symbols': ['Books', 'Knowledge', 'Search'],
      'preview': 'Wandering through infinite aisles of ancient books...',
      'lumiResponse': 'A quest for understanding resonates within you.',
    },
    {
      'id': '3',
      'title': 'Ocean Depths',
      'date': DateTime.now().subtract(const Duration(days: 5)),
      'sentiment': 'Anxiety',
      'symbols': ['Water', 'Darkness', 'Pressure'],
      'preview': 'Sinking deeper into dark waters, unable to breathe...',
      'lumiResponse': 'Subconscious fears are seeking acknowledgment.',
    },
    {
      'id': '4',
      'title': 'Garden of Light',
      'date': DateTime.now().subtract(const Duration(days: 7)),
      'sentiment': 'Positive',
      'symbols': ['Flowers', 'Sunlight', 'Growth'],
      'preview': 'Walking through a garden where every flower glowed...',
      'lumiResponse': 'Personal growth and new beginnings bloom within.',
    },
  ];

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

  Color _getSentimentColor(String sentiment) {
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
                          Text(
                            '${_mockDreams.length} dreams recorded',
                            style: LumiTheme.textTheme.bodyMedium?.copyWith(
                              color: Colors.white.withOpacity(0.5),
                            ),
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
                      _buildStatCard('7', 'Day Streak', Icons.local_fire_department_rounded),
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
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    itemCount: _mockDreams.length,
                    itemBuilder: (context, index) {
                      final dream = _mockDreams[index];
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
                  ),
                ),
                
                // Bottom padding for scrolling past last item
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

  Widget _buildDreamCard(Map<String, dynamic> dream) {
    final date = dream['date'] as DateTime;
    final daysDiff = DateTime.now().difference(date).inDays;
    final dateStr = daysDiff == 0
        ? 'Today'
        : daysDiff == 1
            ? 'Yesterday'
            : '$daysDiff days ago';

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
                  dream['title'],
                  style: LumiTheme.textTheme.displayMedium?.copyWith(
                    fontSize: 18,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: _getSentimentColor(dream['sentiment']).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  dream['sentiment'],
                  style: TextStyle(
                    color: _getSentimentColor(dream['sentiment']),
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
            dream['preview'],
            style: LumiTheme.textTheme.bodyLarge?.copyWith(
              color: Colors.white.withOpacity(0.7),
              height: 1.5,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 16),

          // Symbols
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: (dream['symbols'] as List<String>).map((symbol) {
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
      ),
    );
  }
}
