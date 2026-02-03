import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lumi_mobile/core/theme/lumi_theme.dart';

/// A premium cozy notification that slides in from the top
class LumiToast {
  static void show(
    BuildContext context, {
    required String message,
    String? subtitle,
    IconData icon = Icons.auto_awesome,
    Duration duration = const Duration(seconds: 3),
    bool isSuccess = true,
  }) {
    final overlay = Overlay.of(context);

    late final OverlayEntry overlayEntry;
    late final AnimationController controller;

    controller = AnimationController(
      vsync: Navigator.of(context),
      duration: const Duration(milliseconds: 400),
    );

    final slideAnimation = Tween<Offset>(
      begin: const Offset(0, -1),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: controller,
      curve: Curves.easeOutCubic,
    ));

    overlayEntry = OverlayEntry(
      builder: (context) => Positioned(
        top: MediaQuery.of(context).padding.top + 16,
        left: 24,
        right: 24,
        child: SlideTransition(
          position: slideAnimation,
          child: _ToastWidget(
            message: message,
            subtitle: subtitle,
            icon: icon,
            isSuccess: isSuccess,
          ),
        ),
      ),
    );

    overlay.insert(overlayEntry);
    controller.forward();
    HapticFeedback.lightImpact();

    Future.delayed(duration, () {
      controller.reverse().then((_) {
        overlayEntry.remove();
        controller.dispose();
      });
    });
  }
}

class _ToastWidget extends StatelessWidget {
  final String message;
  final String? subtitle;
  final IconData icon;
  final bool isSuccess;

  const _ToastWidget({
    required this.message,
    this.subtitle,
    required this.icon,
    required this.isSuccess,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: LumiTheme.surface.withOpacity(0.95),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: (isSuccess ? LumiTheme.primary : Colors.red.shade300)
                .withOpacity(0.3),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: (isSuccess ? LumiTheme.primary : Colors.red.shade300)
                    .withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                color: isSuccess ? LumiTheme.primary : Colors.red.shade300,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    message,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      subtitle!,
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.6),
                        fontSize: 13,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Animated button with glow effect for primary actions
class GlowButton extends StatefulWidget {
  final String label;
  final IconData? icon;
  final VoidCallback onTap;
  final bool isLoading;

  const GlowButton({
    super.key,
    required this.label,
    this.icon,
    required this.onTap,
    this.isLoading = false,
  });

  @override
  State<GlowButton> createState() => _GlowButtonState();
}

class _GlowButtonState extends State<GlowButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _glowAnimation;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);

    _glowAnimation = Tween<double>(begin: 0.3, end: 0.6).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) {
        setState(() => _isPressed = false);
        HapticFeedback.mediumImpact();
        widget.onTap();
      },
      onTapCancel: () => setState(() => _isPressed = false),
      child: AnimatedBuilder(
        animation: _glowAnimation,
        builder: (context, child) {
          return AnimatedContainer(
            duration: const Duration(milliseconds: 100),
            transform: Matrix4.identity()..scale(_isPressed ? 0.95 : 1.0),
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 18),
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
                  color: LumiTheme.primary.withOpacity(_glowAnimation.value),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: widget.isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      color: LumiTheme.background,
                      strokeWidth: 2,
                    ),
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (widget.icon != null) ...[
                        Icon(
                          widget.icon,
                          color: LumiTheme.background,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                      ],
                      Text(
                        widget.label,
                        style: TextStyle(
                          color: LumiTheme.background,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
          );
        },
      ),
    );
  }
}

/// Glassmorphism card widget
class GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets padding;
  final double borderRadius;
  final Color? borderColor;

  const GlassCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(20),
    this.borderRadius = 20,
    this.borderColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: LumiTheme.surface.withOpacity(0.4),
        borderRadius: BorderRadius.circular(borderRadius),
        border: Border.all(
          color: borderColor ?? Colors.white.withOpacity(0.1),
          width: 1,
        ),
      ),
      child: child,
    );
  }
}

/// Shimmer loading effect widget
class ShimmerLoading extends StatefulWidget {
  final double height;
  final double width;
  final double borderRadius;

  const ShimmerLoading({
    super.key,
    required this.height,
    this.width = double.infinity,
    this.borderRadius = 12,
  });

  @override
  State<ShimmerLoading> createState() => _ShimmerLoadingState();
}

class _ShimmerLoadingState extends State<ShimmerLoading>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _shimmerAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();

    _shimmerAnimation = Tween<double>(begin: -1, end: 2).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _shimmerAnimation,
      builder: (context, child) {
        return Container(
          height: widget.height,
          width: widget.width,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(widget.borderRadius),
            gradient: LinearGradient(
              begin: Alignment(_shimmerAnimation.value - 1, 0),
              end: Alignment(_shimmerAnimation.value, 0),
              colors: [
                LumiTheme.surface.withOpacity(0.3),
                LumiTheme.surface.withOpacity(0.5),
                LumiTheme.surface.withOpacity(0.3),
              ],
            ),
          ),
        );
      },
    );
  }
}
