export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  shadow: string;
  overlay: string;
}

export const light: ThemeColors = {
  background: '#F2F2F7',
  surface: '#FFFFFF',
  primary: '#007AFF',
  secondary: '#5856D6',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#E5E5EA',
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const dark: ThemeColors = {
  background: '#121212', // Deep gray
  surface: '#1E1E1E',   // Slightly lighter gray
  primary: '#0A84FF',
  secondary: '#5E5CE6',
  text: '#FFFFFF',
  textSecondary: '#A1A1A6',
  border: '#2C2C2E',
  success: '#30D158',
  error: '#FF453A',
  warning: '#FF9F0A',
  shadow: 'rgba(0, 0, 0, 0.4)',
  overlay: 'rgba(0, 0, 0, 0.8)',
};
