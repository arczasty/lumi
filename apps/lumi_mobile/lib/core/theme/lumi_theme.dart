import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class LumiTheme {
  // Colors
  static const Color background = Color(0xFF1A1B41); // Twilight Indigo
  static const Color primary = Color(0xFFBAF2BB);    // Bioluminescent Teal
  static const Color accent = Color(0xFFF4E04D);     // Candlelight
  static const Color surface = Color(0xFF25265E);    // Lighter Indigo for cards
  
  // Text Styles
  static TextTheme get textTheme {
    return TextTheme(
      displayLarge: GoogleFonts.newsreader(
        fontSize: 32,
        fontWeight: FontWeight.bold,
        color: primary,
      ),
      displayMedium: GoogleFonts.newsreader(
        fontSize: 24,
        fontWeight: FontWeight.w600,
        color: Colors.white,
      ),
      bodyLarge: GoogleFonts.inter(
        fontSize: 16,
        color: Colors.white.withOpacity(0.9),
      ),
      bodyMedium: GoogleFonts.inter(
        fontSize: 14,
        color: Colors.white.withOpacity(0.7),
      ),
    );
  }

  // ThemeData
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      primaryColor: primary,
      colorScheme: ColorScheme.dark(
        primary: primary,
        secondary: accent,
        surface: surface,
      ),
      textTheme: textTheme,
      // Cozy Glassmorphism Card Style
      cardTheme: CardThemeData(
        color: surface.withOpacity(0.6),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: BorderSide(
            color: Colors.white.withOpacity(0.1),
            width: 1,
          ),
        ),
      ),
    );
  }
}
