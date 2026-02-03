import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lumi_mobile/core/theme/lumi_theme.dart';
import 'package:lumi_mobile/features/dream/presentation/dream_state.dart';

class RecordingScreen extends ConsumerStatefulWidget {
  const RecordingScreen({super.key});

  @override
  ConsumerState<RecordingScreen> createState() => _RecordingScreenState();
}

class _RecordingScreenState extends ConsumerState<RecordingScreen>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _waveController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);

    _waveController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat();

    _pulseAnimation = Tween<double>(begin: 0.95, end: 1.05).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _waveController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final dreamState = ref.watch(dreamControllerProvider);
    final isRecording = dreamState.status == RecordingState.recording;
    final isAnalyzing = dreamState.status == RecordingState.analyzing;

    return Scaffold(
      backgroundColor: LumiTheme.background,
      body: Stack(
        children: [
          // Animated Aurora Background
          _buildAuroraBackground(isRecording),

          // Floating Particles
          if (isRecording) _buildParticles(),

          // Main Content
          SafeArea(
            child: Column(
              children: [
                const SizedBox(height: 60),
                
                // Lumi Mascot Area
                _buildMascotArea(isRecording, isAnalyzing),

                const SizedBox(height: 32),

                // Status Text
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  child: Text(
                    isAnalyzing
                        ? "Weaving your dream..."
                        : isRecording
                            ? "I'm listening..."
                            : "Hold to share your dream",
                    key: ValueKey(dreamState.status),
                    style: LumiTheme.textTheme.displayMedium?.copyWith(
                      color: Colors.white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                
                const SizedBox(height: 8),
                
                Text(
                  isRecording ? "Release when finished" : "Whisper mode active",
                  style: LumiTheme.textTheme.bodyMedium?.copyWith(
                    color: Colors.white.withOpacity(0.5),
                  ),
                ),

                const Spacer(),

                // The Recording Orb
                _buildRecordingOrb(isRecording),

                const SizedBox(height: 40),

                // Recent Dreams Preview
                _buildRecentDreamsHint(),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAuroraBackground(bool isRecording) {
    return AnimatedBuilder(
      animation: _pulseAnimation,
      builder: (context, child) {
        return Stack(
          children: [
            // Top glow
            Positioned(
              top: isRecording ? -50 : -150,
              left: -100,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 500),
                height: 400,
                width: 400,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      LumiTheme.primary.withOpacity(
                        isRecording ? 0.25 * _pulseAnimation.value : 0.1,
                      ),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
            // Bottom right glow
            Positioned(
              bottom: -100,
              right: -100,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 500),
                height: 300,
                width: 300,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      LumiTheme.accent.withOpacity(
                        isRecording ? 0.15 * _pulseAnimation.value : 0.05,
                      ),
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

  Widget _buildParticles() {
    return AnimatedBuilder(
      animation: _waveController,
      builder: (context, child) {
        return CustomPaint(
          size: Size.infinite,
          painter: _ParticlePainter(_waveController.value),
        );
      },
    );
  }

  Widget _buildMascotArea(bool isRecording, bool isAnalyzing) {
    return ScaleTransition(
      scale: _pulseAnimation,
      child: Container(
        height: 160,
        width: 160,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: LumiTheme.surface.withOpacity(0.3),
          border: Border.all(
            color: isRecording
                ? LumiTheme.primary.withOpacity(0.6)
                : LumiTheme.primary.withOpacity(0.2),
            width: 2,
          ),
          boxShadow: [
            BoxShadow(
              color: LumiTheme.primary.withOpacity(isRecording ? 0.4 : 0.1),
              blurRadius: isRecording ? 50 : 20,
              spreadRadius: isRecording ? 10 : 0,
            ),
          ],
        ),
        child: Center(
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 300),
            child: isAnalyzing
                ? const CircularProgressIndicator(
                    color: LumiTheme.primary,
                    strokeWidth: 2,
                  )
                : Text(
                    isRecording ? "🌙" : "✨",
                    key: ValueKey(isRecording),
                    style: const TextStyle(fontSize: 56),
                  ),
          ),
        ),
      ),
    );
  }

  Widget _buildRecordingOrb(bool isRecording) {
    return GestureDetector(
      onLongPressStart: (_) {
        HapticFeedback.mediumImpact();
        ref.read(dreamControllerProvider.notifier).startRecording();
      },
      onLongPressEnd: (_) {
        HapticFeedback.lightImpact();
        ref.read(dreamControllerProvider.notifier).stopRecording();
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: isRecording ? 100 : 80,
        width: isRecording ? 100 : 80,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: isRecording
                ? [LumiTheme.primary, LumiTheme.primary.withOpacity(0.7)]
                : [LumiTheme.surface, LumiTheme.surface.withOpacity(0.8)],
          ),
          border: Border.all(
            color: isRecording
                ? LumiTheme.primary
                : Colors.white.withOpacity(0.2),
            width: 2,
          ),
          boxShadow: [
            BoxShadow(
              color: isRecording
                  ? LumiTheme.primary.withOpacity(0.5)
                  : Colors.black.withOpacity(0.3),
              blurRadius: isRecording ? 30 : 15,
              spreadRadius: isRecording ? 5 : 0,
            ),
          ],
        ),
        child: Icon(
          isRecording ? Icons.mic : Icons.mic_none_rounded,
          color: isRecording ? LumiTheme.background : Colors.white,
          size: isRecording ? 36 : 28,
        ),
      ),
    );
  }

  Widget _buildRecentDreamsHint() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 32),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: LumiTheme.surface.withOpacity(0.3),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.white.withOpacity(0.1),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.auto_awesome,
            color: LumiTheme.accent,
            size: 18,
          ),
          const SizedBox(width: 8),
          Text(
            "View your dream journal",
            style: LumiTheme.textTheme.bodyMedium?.copyWith(
              color: Colors.white.withOpacity(0.7),
            ),
          ),
          const SizedBox(width: 8),
          Icon(
            Icons.arrow_forward_ios,
            color: Colors.white.withOpacity(0.5),
            size: 14,
          ),
        ],
      ),
    );
  }
}

class _ParticlePainter extends CustomPainter {
  final double progress;
  final Random _random = Random(42); // Fixed seed for consistent particles

  _ParticlePainter(this.progress);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = LumiTheme.primary.withOpacity(0.3);

    for (int i = 0; i < 20; i++) {
      final x = _random.nextDouble() * size.width;
      final baseY = _random.nextDouble() * size.height;
      final y = (baseY - progress * 100) % size.height;
      final radius = _random.nextDouble() * 3 + 1;

      canvas.drawCircle(Offset(x, y), radius, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
