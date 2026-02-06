/**
 * Lumi Design System
 * EcoCalm-inspired dark theme with purple accents
 */

// Typography System
export const FONTS = {
    heading: {
        regular: 'Playfair',
        semiBold: 'Playfair-SemiBold',
        bold: 'Playfair-Bold',
    },
    body: {
        regular: 'Nunito',
        medium: 'Nunito-Medium',
        semiBold: 'Nunito-SemiBold',
        bold: 'Nunito-Bold',
    },
} as const;

export const TYPOGRAPHY = {
    // Headings (Playfair Display)
    h1: { fontFamily: FONTS.heading.bold, fontSize: 32, lineHeight: 40 },
    h2: { fontFamily: FONTS.heading.semiBold, fontSize: 28, lineHeight: 36 },
    h3: { fontFamily: FONTS.heading.semiBold, fontSize: 24, lineHeight: 32 },
    h4: { fontFamily: FONTS.heading.regular, fontSize: 20, lineHeight: 28 },
    // Body (Nunito)
    body: { fontFamily: FONTS.body.regular, fontSize: 16, lineHeight: 24 },
    bodyMedium: { fontFamily: FONTS.body.medium, fontSize: 16, lineHeight: 24 },
    bodySemiBold: { fontFamily: FONTS.body.semiBold, fontSize: 16, lineHeight: 24 },
    bodySmall: { fontFamily: FONTS.body.regular, fontSize: 14, lineHeight: 20 },
    caption: { fontFamily: FONTS.body.regular, fontSize: 12, lineHeight: 16 },
    label: { fontFamily: FONTS.body.semiBold, fontSize: 13, lineHeight: 18, letterSpacing: 0.5 },
    button: { fontFamily: FONTS.body.bold, fontSize: 16, lineHeight: 24 },
} as const;

// Primary Purple Palette (replaces green #A78BFA)
export const PURPLE = {
    primary: '#A78BFA',       // Main accent (vibrant purple)
    glow: '#8B5CF6',          // For shadows and glows
    soft: '#C4B5FD',          // Lighter purple for subtle highlights
    muted: 'rgba(167, 139, 250, 0.2)', // For backgrounds with alpha
    dark: '#7C3AED',          // Darker purple for depth
} as const;

// Background System (Dark theme)
export const BACKGROUND = {
    base: '#0A0A0F',          // Deepest black with slight blue
    card: '#141420',          // Card/surface color
    elevated: '#1C1C2E',      // Elevated surfaces
    overlay: 'rgba(10, 10, 15, 0.9)', // Modal overlays
} as const;

// Text Colors
export const TEXT = {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    muted: 'rgba(255, 255, 255, 0.5)',
    disabled: 'rgba(255, 255, 255, 0.3)',
} as const;

// Semantic Colors
export const SEMANTIC = {
    success: '#34D399',       // Green for positive
    warning: '#FBBF24',       // Amber for warnings
    error: '#F87171',         // Red for errors
    info: '#60A5FA',          // Blue for info
} as const;

// Sentiment Colors (for dream analysis)
export const SENTIMENT = {
    positive: '#34D399',
    neutral: '#A78BFA',       // Purple for neutral (matches brand)
    negative: '#F87171',
    mixed: '#FBBF24',
} as const;

// Border & Divider
export const BORDER = {
    subtle: 'rgba(255, 255, 255, 0.08)',
    default: 'rgba(255, 255, 255, 0.12)',
    focus: PURPLE.primary,
} as const;

// Shadows (for elevated elements)
export const SHADOW = {
    purple: {
        shadowColor: PURPLE.glow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
    },
    dark: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
} as const;

// Gradient Presets
export const GRADIENTS = {
    purpleGlow: [PURPLE.dark, 'transparent'] as const,
    cardSurface: [BACKGROUND.elevated, BACKGROUND.card] as const,
} as const;

// Component-specific tokens
export const COMPONENTS = {
    button: {
        primary: {
            background: PURPLE.primary,
            text: '#0A0A0F',
        },
        secondary: {
            background: 'rgba(255, 255, 255, 0.08)',
            text: TEXT.primary,
        },
    },
    input: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: BORDER.subtle,
        focusBorder: PURPLE.primary,
        placeholder: TEXT.muted,
    },
    card: {
        background: BACKGROUND.card,
        border: BORDER.subtle,
        borderRadius: 16,
    },
    tabBar: {
        background: BACKGROUND.elevated,
        activeColor: PURPLE.primary,
        inactiveColor: TEXT.muted,
    },
} as const;

// Legacy alias (for gradual migration)
export const PRIMARY_ACCENT = PURPLE.primary;

// Default export for convenience
export default {
    FONTS,
    TYPOGRAPHY,
    PURPLE,
    BACKGROUND,
    TEXT,
    SEMANTIC,
    SENTIMENT,
    BORDER,
    SHADOW,
    GRADIENTS,
    COMPONENTS,
    PRIMARY_ACCENT,
};
