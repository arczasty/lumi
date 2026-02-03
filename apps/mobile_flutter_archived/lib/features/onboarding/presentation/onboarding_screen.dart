import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lumi_mobile/core/theme/lumi_theme.dart';
import 'package:lumi_mobile/core/navigation/app_shell.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen>
    with TickerProviderStateMixin {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  final TextEditingController _nameController = TextEditingController();

  late AnimationController _fadeController;
  late AnimationController _pulseController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat(reverse: true);

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _fadeController, curve: Curves.easeInOut),
    );
    _pulseAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _fadeController.forward();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _pulseController.dispose();
    _pageController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  void _nextPage() {
    HapticFeedback.lightImpact();
    if (_currentPage < 2) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOut,
      );
    } else {
      // Navigate to main app with bottom nav
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (_, __, ___) => const AppShell(),
          transitionDuration: const Duration(milliseconds: 800),
          transitionsBuilder: (_, animation, __, child) {
            return FadeTransition(opacity: animation, child: child);
          },
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: LumiTheme.background,
      body: Stack(
        children: [
          // Animated Background Aurora
          _buildAuroraBackground(),

          // Page Content
          PageView(
            controller: _pageController,
            physics: const NeverScrollableScrollPhysics(),
            onPageChanged: (page) => setState(() => _currentPage = page),
            children: [
              _buildArrivalPage(),
              _buildMeetLumiPage(),
              _buildPactPage(),
            ],
          ),

          // Page Indicator
          Positioned(
            bottom: 120,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(3, (index) {
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  height: 8,
                  width: _currentPage == index ? 24 : 8,
                  decoration: BoxDecoration(
                    color: _currentPage == index
                        ? LumiTheme.primary
                        : LumiTheme.primary.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(4),
                  ),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAuroraBackground() {
    return AnimatedBuilder(
      animation: _pulseAnimation,
      builder: (context, child) {
        return Stack(
          children: [
            Positioned(
              top: -150 * _pulseAnimation.value,
              left: -100,
              child: Container(
                height: 400,
                width: 400,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      LumiTheme.primary.withOpacity(0.15 * _pulseAnimation.value),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: -100,
              right: -150 * _pulseAnimation.value,
              child: Container(
                height: 350,
                width: 350,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      LumiTheme.accent.withOpacity(0.1 * _pulseAnimation.value),
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

  Widget _buildArrivalPage() {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              // Glowing Orb
              ScaleTransition(
                scale: _pulseAnimation,
                child: Container(
                  height: 120,
                  width: 120,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        LumiTheme.primary,
                        LumiTheme.primary.withOpacity(0.3),
                      ],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: LumiTheme.primary.withOpacity(0.5),
                        blurRadius: 60,
                        spreadRadius: 20,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 48),
              Text(
                "Welcome to Lumi",
                style: LumiTheme.textTheme.displayLarge,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Text(
                "Your sanctuary for the subconscious.\nA place where dreams find meaning.",
                style: LumiTheme.textTheme.bodyLarge?.copyWith(
                  color: Colors.white.withOpacity(0.7),
                  height: 1.6,
                ),
                textAlign: TextAlign.center,
              ),
              const Spacer(),
              _buildContinueButton("Enter"),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMeetLumiPage() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Spacer(),
            // Lumi Character (placeholder - will be Rive)
            ScaleTransition(
              scale: _pulseAnimation,
              child: Container(
                height: 180,
                width: 180,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: LumiTheme.surface,
                  border: Border.all(
                    color: LumiTheme.primary.withOpacity(0.5),
                    width: 2,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: LumiTheme.primary.withOpacity(0.3),
                      blurRadius: 40,
                      spreadRadius: 10,
                    ),
                  ],
                ),
                child: Center(
                  child: Text(
                    "✨",
                    style: TextStyle(fontSize: 64),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 48),
            Text(
              "I am Lumi",
              style: LumiTheme.textTheme.displayLarge,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            Text(
              "A gentle spirit guide here to help you\nexplore the depths of your dreams.\n\nTogether, we'll uncover patterns,\nsymbols, and hidden meanings.",
              style: LumiTheme.textTheme.bodyLarge?.copyWith(
                color: Colors.white.withOpacity(0.7),
                height: 1.6,
              ),
              textAlign: TextAlign.center,
            ),
            const Spacer(),
            _buildContinueButton("Continue"),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildPactPage() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Spacer(),
            Text(
              "The Dreamer's Pact",
              style: LumiTheme.textTheme.displayLarge,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            Text(
              "What shall I call you, dreamer?",
              style: LumiTheme.textTheme.bodyLarge?.copyWith(
                color: Colors.white.withOpacity(0.7),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            // Name Input
            Container(
              decoration: BoxDecoration(
                color: LumiTheme.surface.withOpacity(0.5),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: LumiTheme.primary.withOpacity(0.3),
                  width: 1,
                ),
              ),
              child: TextField(
                controller: _nameController,
                textAlign: TextAlign.center,
                style: LumiTheme.textTheme.displayMedium,
                decoration: InputDecoration(
                  hintText: "Your dream name...",
                  hintStyle: LumiTheme.textTheme.bodyLarge?.copyWith(
                    color: Colors.white.withOpacity(0.3),
                  ),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.all(20),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              "Your dreams are sacred.\nThey stay between us, always.",
              style: LumiTheme.textTheme.bodyMedium?.copyWith(
                color: Colors.white.withOpacity(0.5),
                fontStyle: FontStyle.italic,
              ),
              textAlign: TextAlign.center,
            ),
            const Spacer(),
            _buildContinueButton("Begin Journey"),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildContinueButton(String text) {
    return GestureDetector(
      onTap: _nextPage,
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
          text,
          textAlign: TextAlign.center,
          style: LumiTheme.textTheme.bodyLarge?.copyWith(
            color: LumiTheme.background,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}
