import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lumi_mobile/core/theme/lumi_theme.dart';

class AnalysisScreen extends ConsumerStatefulWidget {
  final String dreamTranscript;

  const AnalysisScreen({super.key, required this.dreamTranscript});

  @override
  ConsumerState<AnalysisScreen> createState() => _AnalysisScreenState();
}

class _AnalysisScreenState extends ConsumerState<AnalysisScreen>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _progressController;
  late Animation<double> _pulseAnimation;

  int _currentStep = 0;
  final List<String> _steps = [
    'Receiving your dream...',
    'Transcribing whispers...',
    'Weaving patterns...',
    'Consulting the stars...',
    'Lumi is reflecting...',
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);

    _progressController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 12),
    )..forward();

    _pulseAnimation = Tween<double>(begin: 0.9, end: 1.1).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    // Simulate progress steps
    _simulateProgress();
  }

  void _simulateProgress() async {
    for (int i = 0; i < _steps.length; i++) {
      await Future.delayed(Duration(milliseconds: 2000 + (i * 300)));
      if (mounted) {
        setState(() => _currentStep = i);
      }
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _progressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: LumiTheme.background,
      body: Stack(
        children: [
          // Animated background
          _buildAnimatedBackground(),

          // Content
          SafeArea(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(flex: 2),

                // Lumi Avatar
                ScaleTransition(
                  scale: _pulseAnimation,
                  child: Container(
                    height: 150,
                    width: 150,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          LumiTheme.primary.withOpacity(0.3),
                          LumiTheme.primary.withOpacity(0.1),
                        ],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: LumiTheme.primary.withOpacity(0.3),
                          blurRadius: 50,
                          spreadRadius: 20,
                        ),
                      ],
                    ),
                    child: const Center(
                      child: Text(
                        '🌙',
                        style: TextStyle(fontSize: 64),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 48),

                // Current Step
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 500),
                  child: Text(
                    _steps[_currentStep],
                    key: ValueKey(_currentStep),
                    style: LumiTheme.textTheme.displayMedium,
                    textAlign: TextAlign.center,
                  ),
                ),

                const SizedBox(height: 24),

                // Progress Dots
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(_steps.length, (index) {
                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      height: 8,
                      width: index <= _currentStep ? 24 : 8,
                      decoration: BoxDecoration(
                        color: index <= _currentStep
                            ? LumiTheme.primary
                            : LumiTheme.surface,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    );
                  }),
                ),

                const SizedBox(height: 48),

                // Preview of transcript
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 32),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: LumiTheme.surface.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: Colors.white.withOpacity(0.1),
                      width: 1,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.format_quote_rounded,
                            size: 18,
                            color: LumiTheme.accent,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Your words',
                            style: LumiTheme.textTheme.bodyMedium?.copyWith(
                              color: LumiTheme.accent,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        widget.dreamTranscript.length > 150
                            ? '${widget.dreamTranscript.substring(0, 150)}...'
                            : widget.dreamTranscript,
                        style: LumiTheme.textTheme.bodyLarge?.copyWith(
                          color: Colors.white.withOpacity(0.7),
                          fontStyle: FontStyle.italic,
                          height: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),

                const Spacer(flex: 3),

                // Cancel Button
                GestureDetector(
                  onTap: () {
                    HapticFeedback.lightImpact();
                    Navigator.of(context).pop();
                  },
                  child: Text(
                    'Cancel',
                    style: LumiTheme.textTheme.bodyLarge?.copyWith(
                      color: Colors.white.withOpacity(0.4),
                    ),
                  ),
                ),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnimatedBackground() {
    return AnimatedBuilder(
      animation: _pulseAnimation,
      builder: (context, child) {
        return Stack(
          children: [
            Positioned(
              top: -100 * _pulseAnimation.value,
              left: -100,
              child: Container(
                height: 400,
                width: 400,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      LumiTheme.primary.withOpacity(0.1 * _pulseAnimation.value),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: -100,
              right: -100 * _pulseAnimation.value,
              child: Container(
                height: 350,
                width: 350,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      LumiTheme.accent.withOpacity(0.08 * _pulseAnimation.value),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}
