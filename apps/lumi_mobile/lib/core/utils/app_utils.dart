import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lumi_mobile/core/theme/lumi_theme.dart';

/// User preferences and settings provider for the app
class UserPreferences {
  final String dreamName;
  final bool notificationsEnabled;
  final String sleepTimeStart;
  final String sleepTimeEnd;
  final bool whisperModeEnabled;
  final bool hasSeenOnboarding;

  const UserPreferences({
    this.dreamName = 'Dreamer',
    this.notificationsEnabled = true,
    this.sleepTimeStart = '22:30',
    this.sleepTimeEnd = '07:00',
    this.whisperModeEnabled = true,
    this.hasSeenOnboarding = false,
  });

  UserPreferences copyWith({
    String? dreamName,
    bool? notificationsEnabled,
    String? sleepTimeStart,
    String? sleepTimeEnd,
    bool? whisperModeEnabled,
    bool? hasSeenOnboarding,
  }) {
    return UserPreferences(
      dreamName: dreamName ?? this.dreamName,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      sleepTimeStart: sleepTimeStart ?? this.sleepTimeStart,
      sleepTimeEnd: sleepTimeEnd ?? this.sleepTimeEnd,
      whisperModeEnabled: whisperModeEnabled ?? this.whisperModeEnabled,
      hasSeenOnboarding: hasSeenOnboarding ?? this.hasSeenOnboarding,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'dreamName': dreamName,
      'notificationsEnabled': notificationsEnabled,
      'sleepTimeStart': sleepTimeStart,
      'sleepTimeEnd': sleepTimeEnd,
      'whisperModeEnabled': whisperModeEnabled,
      'hasSeenOnboarding': hasSeenOnboarding,
    };
  }

  factory UserPreferences.fromJson(Map<String, dynamic> json) {
    return UserPreferences(
      dreamName: json['dreamName'] ?? 'Dreamer',
      notificationsEnabled: json['notificationsEnabled'] ?? true,
      sleepTimeStart: json['sleepTimeStart'] ?? '22:30',
      sleepTimeEnd: json['sleepTimeEnd'] ?? '07:00',
      whisperModeEnabled: json['whisperModeEnabled'] ?? true,
      hasSeenOnboarding: json['hasSeenOnboarding'] ?? false,
    );
  }
}

/// Permission request screen with beautiful UI
class PermissionRequestScreen extends StatelessWidget {
  final VoidCallback onGranted;
  final VoidCallback onDenied;

  const PermissionRequestScreen({
    super.key,
    required this.onGranted,
    required this.onDenied,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: LumiTheme.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),

              // Microphone Icon
              Container(
                height: 120,
                width: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      LumiTheme.primary.withOpacity(0.2),
                      LumiTheme.primary.withOpacity(0.05),
                    ],
                  ),
                  border: Border.all(
                    color: LumiTheme.primary.withOpacity(0.3),
                    width: 2,
                  ),
                ),
                child: const Center(
                  child: Icon(
                    Icons.mic_rounded,
                    size: 56,
                    color: LumiTheme.primary,
                  ),
                ),
              ),

              const SizedBox(height: 48),

              Text(
                'Lumi Needs to Listen',
                style: LumiTheme.textTheme.displayLarge,
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 16),

              Text(
                'To capture your dream whispers, Lumi needs access to your microphone.\n\nYour voice stays private and is processed securely.',
                style: LumiTheme.textTheme.bodyLarge?.copyWith(
                  color: Colors.white.withOpacity(0.7),
                  height: 1.6,
                ),
                textAlign: TextAlign.center,
              ),

              const Spacer(),

              // Grant Access Button
              GestureDetector(
                onTap: () {
                  HapticFeedback.mediumImpact();
                  onGranted();
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        LumiTheme.primary,
                        LumiTheme.primary.withOpacity(0.8),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: LumiTheme.primary.withOpacity(0.4),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Text(
                    'Grant Access',
                    textAlign: TextAlign.center,
                    style: LumiTheme.textTheme.bodyLarge?.copyWith(
                      color: LumiTheme.background,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Skip Button
              GestureDetector(
                onTap: () {
                  HapticFeedback.lightImpact();
                  onDenied();
                },
                child: Text(
                  'Maybe Later',
                  style: LumiTheme.textTheme.bodyMedium?.copyWith(
                    color: Colors.white.withOpacity(0.4),
                  ),
                ),
              ),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}

/// Stats overview widget for the home screen
class StatsOverview extends StatelessWidget {
  final int dreamCount;
  final int streak;
  final int symbolCount;

  const StatsOverview({
    super.key,
    required this.dreamCount,
    required this.streak,
    required this.symbolCount,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: LumiTheme.surface.withOpacity(0.3),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Colors.white.withOpacity(0.1),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildStatItem(
            value: dreamCount.toString(),
            label: 'Dreams',
            icon: Icons.nights_stay_rounded,
          ),
          Container(
            height: 40,
            width: 1,
            color: Colors.white.withOpacity(0.1),
          ),
          _buildStatItem(
            value: streak.toString(),
            label: 'Day Streak',
            icon: Icons.local_fire_department_rounded,
          ),
          Container(
            height: 40,
            width: 1,
            color: Colors.white.withOpacity(0.1),
          ),
          _buildStatItem(
            value: symbolCount.toString(),
            label: 'Symbols',
            icon: Icons.auto_awesome,
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem({
    required String value,
    required String label,
    required IconData icon,
  }) {
    return Column(
      children: [
        Icon(
          icon,
          color: LumiTheme.accent,
          size: 20,
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: TextStyle(
            color: Colors.white,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withOpacity(0.5),
            fontSize: 12,
          ),
        ),
      ],
    );
  }
}

/// Animated typing text widget for Lumi responses
class AnimatedTypingText extends StatefulWidget {
  final String text;
  final Duration duration;
  final TextStyle? style;

  const AnimatedTypingText({
    super.key,
    required this.text,
    this.duration = const Duration(milliseconds: 50),
    this.style,
  });

  @override
  State<AnimatedTypingText> createState() => _AnimatedTypingTextState();
}

class _AnimatedTypingTextState extends State<AnimatedTypingText> {
  String _displayText = '';
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _startTyping();
  }

  void _startTyping() async {
    while (_currentIndex < widget.text.length && mounted) {
      await Future.delayed(widget.duration);
      if (mounted) {
        setState(() {
          _currentIndex++;
          _displayText = widget.text.substring(0, _currentIndex);
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Text(
      _displayText,
      style: widget.style ?? LumiTheme.textTheme.bodyLarge,
    );
  }
}
