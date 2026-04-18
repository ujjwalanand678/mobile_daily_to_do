export interface ThemeColors {
  // Backgrounds
  background: string;
  backgroundGradientStart: string;
  backgroundGradientEnd: string;
  // Surfaces
  surface: string;
  surfaceSolid: string;
  // Primary
  primary: string;
  primaryGradientStart: string;
  primaryGradientEnd: string;
  // Secondary
  secondary: string;
  // Text
  text: string;
  textSecondary: string;
  // Borders
  border: string;
  glassBorder: string;
  // Semantic
  success: string;
  error: string;
  warning: string;
  // Utility
  shadow: string;
  overlay: string;
  tabBar: string;
}

export const light: ThemeColors = {
  // Backgrounds
  background: '#F0F2FF',
  backgroundGradientStart: '#EEF2FF',
  backgroundGradientEnd: '#F5F0FF',
  // Surfaces
  surface: 'rgba(255, 255, 255, 0.75)',
  surfaceSolid: '#FFFFFF',
  // Primary
  primary: '#6366F1',
  primaryGradientStart: '#6366F1',
  primaryGradientEnd: '#8B5CF6',
  // Secondary
  secondary: '#06B6D4',
  // Text
  text: '#1E1B4B',
  textSecondary: '#6B7280',
  // Borders
  border: 'rgba(99, 102, 241, 0.15)',
  glassBorder: 'rgba(255, 255, 255, 0.7)',
  // Semantic
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  // Utility
  shadow: 'rgba(99, 102, 241, 0.2)',
  overlay: 'rgba(14, 13, 38, 0.6)',
  tabBar: 'rgba(255, 255, 255, 0.9)',
};

export const dark: ThemeColors = {
  // Backgrounds
  background: '#0A0A14',
  backgroundGradientStart: '#0D0D1E',
  backgroundGradientEnd: '#12091A',
  // Surfaces
  surface: 'rgba(255, 255, 255, 0.07)',
  surfaceSolid: '#161626',
  // Primary
  primary: '#818CF8',
  primaryGradientStart: '#6366F1',
  primaryGradientEnd: '#A78BFA',
  // Secondary
  secondary: '#22D3EE',
  // Text
  text: '#F0F4FF',
  textSecondary: '#94A3B8',
  // Borders
  border: 'rgba(255, 255, 255, 0.1)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  // Semantic
  success: '#34D399',
  error: '#F87171',
  warning: '#FBBF24',
  // Utility
  shadow: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.78)',
  tabBar: 'rgba(10, 10, 22, 0.92)',
};
