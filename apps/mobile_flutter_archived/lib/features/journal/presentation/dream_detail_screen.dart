import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lumi_mobile/core/theme/lumi_theme.dart';
import 'package:lumi_mobile/core/data/dream_model.dart';

class DreamDetailScreen extends ConsumerWidget {
  final Dream dream;

  const DreamDetailScreen({super.key, required this.dream});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: LumiTheme.background,
      body: Stack(
        children: [
          // Background effects
          _buildBackground(),

          // Content
          SafeArea(
            child: Column(
              children: [
                // Header
                _buildHeader(context),

                // Main content
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Title and date
                        Text(
                          dream.title,
                          style: LumiTheme.textTheme.displayLarge,
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(
                              Icons.calendar_today_rounded,
                              size: 14,
                              color: Colors.white.withOpacity(0.4),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              dream.formattedDate,
                              style: LumiTheme.textTheme.bodyMedium?.copyWith(
                                color: Colors.white.withOpacity(0.4),
                              ),
                            ),
                            const SizedBox(width: 16),
                            _buildSentimentBadge(),
                          ],
                        ),

                        const SizedBox(height: 32),

                        // Lumi's Response Card
                        _buildLumiResponseCard(),

                        const SizedBox(height: 24),

                        // Dream Transcript
                        _buildSection(
                          'Your Dream',
                          Icons.nights_stay_rounded,
                          child: Text(
                            dream.transcript,
                            style: LumiTheme.textTheme.bodyLarge?.copyWith(
                              color: Colors.white.withOpacity(0.8),
                              height: 1.7,
                            ),
                          ),
                        ),

                        const SizedBox(height: 24),

                        // Symbols
                        _buildSection(
                          'Symbols Detected',
                          Icons.auto_awesome,
                          child: Wrap(
                            spacing: 10,
                            runSpacing: 10,
                            children: dream.symbols.map((symbol) {
                              return _buildSymbolChip(symbol);
                            }).toList(),
                          ),
                        ),

                        const SizedBox(height: 100),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Bottom Actions
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    LumiTheme.background.withOpacity(0),
                    LumiTheme.background,
                  ],
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: _buildActionButton(
                      icon: Icons.play_arrow_rounded,
                      label: 'Play Audio',
                      onTap: () {
                        // TODO: Play audio
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildActionButton(
                      icon: Icons.share_rounded,
                      label: 'Share',
                      isPrimary: true,
                      onTap: () {
                        // TODO: Share
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBackground() {
    return Stack(
      children: [
        Positioned(
          top: -100,
          right: -50,
          child: Container(
            height: 300,
            width: 300,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  Color(dream.sentiment.colorValue).withOpacity(0.1),
                  Colors.transparent,
                ],
              ),
            ),
          ),
        ),
        Positioned(
          bottom: -50,
          left: -100,
          child: Container(
            height: 250,
            width: 250,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  LumiTheme.primary.withOpacity(0.05),
                  Colors.transparent,
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          GestureDetector(
            onTap: () {
              HapticFeedback.lightImpact();
              Navigator.of(context).pop();
            },
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: LumiTheme.surface.withOpacity(0.5),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                Icons.arrow_back_rounded,
                color: Colors.white,
              ),
            ),
          ),
          Row(
            children: [
              GestureDetector(
                onTap: () {
                  HapticFeedback.lightImpact();
                  // TODO: Edit dream
                },
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: LumiTheme.surface.withOpacity(0.5),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    Icons.edit_rounded,
                    color: Colors.white.withOpacity(0.7),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () {
                  HapticFeedback.lightImpact();
                  // TODO: Delete dream
                },
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: LumiTheme.surface.withOpacity(0.5),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    Icons.delete_outline_rounded,
                    color: Colors.red.shade300,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSentimentBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: Color(dream.sentiment.colorValue).withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        dream.sentiment.displayName,
        style: TextStyle(
          color: Color(dream.sentiment.colorValue),
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildLumiResponseCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            LumiTheme.primary.withOpacity(0.15),
            LumiTheme.primary.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: LumiTheme.primary.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: LumiTheme.primary.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Text(
                  '✨',
                  style: TextStyle(fontSize: 20),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                'Lumi\'s Insight',
                style: LumiTheme.textTheme.displayMedium?.copyWith(
                  fontSize: 16,
                  color: LumiTheme.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            dream.lumiResponse,
            style: LumiTheme.textTheme.bodyLarge?.copyWith(
              color: Colors.white.withOpacity(0.9),
              height: 1.6,
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection(String title, IconData icon, {required Widget child}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(
              icon,
              size: 18,
              color: LumiTheme.accent,
            ),
            const SizedBox(width: 8),
            Text(
              title,
              style: LumiTheme.textTheme.displayMedium?.copyWith(
                fontSize: 16,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        child,
      ],
    );
  }

  Widget _buildSymbolChip(String symbol) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: LumiTheme.surface.withOpacity(0.5),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: LumiTheme.primary.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.tag_rounded,
            size: 14,
            color: LumiTheme.primary,
          ),
          const SizedBox(width: 6),
          Text(
            symbol,
            style: TextStyle(
              color: Colors.white.withOpacity(0.8),
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    bool isPrimary = false,
  }) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: isPrimary ? LumiTheme.primary : LumiTheme.surface,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: isPrimary ? LumiTheme.background : Colors.white,
              size: 20,
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                color: isPrimary ? LumiTheme.background : Colors.white,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
