import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lumi_mobile/core/theme/lumi_theme.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: LumiTheme.background,
      body: Stack(
        children: [
          // Background glow
          Positioned(
            top: -150,
            left: -100,
            child: Container(
              height: 350,
              width: 350,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    LumiTheme.accent.withOpacity(0.08),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Row(
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
                      const SizedBox(width: 16),
                      Text(
                        'Settings',
                        style: LumiTheme.textTheme.displayLarge,
                      ),
                    ],
                  ),
                ),

                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    children: [
                      // Profile Section
                      _buildSectionHeader('Profile'),
                      _buildProfileCard(),
                      const SizedBox(height: 24),

                      // Preferences Section
                      _buildSectionHeader('Preferences'),
                      _buildSettingsTile(
                        icon: Icons.notifications_rounded,
                        title: 'Notifications',
                        subtitle: 'Gentle dream reminders',
                        trailing: Switch(
                          value: true,
                          activeColor: LumiTheme.primary,
                          onChanged: (value) {},
                        ),
                      ),
                      _buildSettingsTile(
                        icon: Icons.bedtime_rounded,
                        title: 'Sleep Schedule',
                        subtitle: '10:30 PM - 7:00 AM',
                        onTap: () {},
                      ),
                      _buildSettingsTile(
                        icon: Icons.mic_rounded,
                        title: 'Voice Settings',
                        subtitle: 'Whisper sensitivity',
                        onTap: () {},
                      ),
                      const SizedBox(height: 24),

                      // Data Section
                      _buildSectionHeader('Data & Privacy'),
                      _buildSettingsTile(
                        icon: Icons.cloud_download_rounded,
                        title: 'Export Dreams',
                        subtitle: 'Download your journal',
                        onTap: () {},
                      ),
                      _buildSettingsTile(
                        icon: Icons.shield_rounded,
                        title: 'Privacy',
                        subtitle: 'Your data stays with you',
                        onTap: () {},
                      ),
                      _buildSettingsTile(
                        icon: Icons.delete_outline_rounded,
                        title: 'Clear All Data',
                        subtitle: 'Start fresh',
                        isDestructive: true,
                        onTap: () {},
                      ),
                      const SizedBox(height: 24),

                      // About Section
                      _buildSectionHeader('About'),
                      _buildSettingsTile(
                        icon: Icons.auto_awesome,
                        title: 'About Lumi',
                        subtitle: 'Version 0.1.0',
                        onTap: () {},
                      ),
                      _buildSettingsTile(
                        icon: Icons.help_outline_rounded,
                        title: 'Help & Support',
                        subtitle: 'Get in touch',
                        onTap: () {},
                      ),

                      const SizedBox(height: 100),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          color: Colors.white.withOpacity(0.4),
          fontSize: 12,
          fontWeight: FontWeight.w600,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildProfileCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            LumiTheme.surface.withOpacity(0.6),
            LumiTheme.surface.withOpacity(0.3),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: LumiTheme.primary.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          // Avatar
          Container(
            height: 60,
            width: 60,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  LumiTheme.primary.withOpacity(0.3),
                  LumiTheme.primary.withOpacity(0.1),
                ],
              ),
              border: Border.all(
                color: LumiTheme.primary.withOpacity(0.5),
                width: 2,
              ),
            ),
            child: const Center(
              child: Text(
                '✨',
                style: TextStyle(fontSize: 24),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Dreamer',
                  style: LumiTheme.textTheme.displayMedium?.copyWith(
                    fontSize: 18,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '23 dreams · 7 day streak',
                  style: LumiTheme.textTheme.bodyMedium?.copyWith(
                    color: Colors.white.withOpacity(0.5),
                  ),
                ),
              ],
            ),
          ),
          Icon(
            Icons.chevron_right_rounded,
            color: Colors.white.withOpacity(0.3),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsTile({
    required IconData icon,
    required String title,
    required String subtitle,
    Widget? trailing,
    VoidCallback? onTap,
    bool isDestructive = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: LumiTheme.surface.withOpacity(0.3),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: isDestructive
                    ? Colors.red.withOpacity(0.1)
                    : LumiTheme.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                color: isDestructive ? Colors.red.shade300 : LumiTheme.primary,
                size: 20,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      color: isDestructive ? Colors.red.shade300 : Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.4),
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
            trailing ??
                Icon(
                  Icons.chevron_right_rounded,
                  color: Colors.white.withOpacity(0.3),
                ),
          ],
        ),
      ),
    );
  }
}
