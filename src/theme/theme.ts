import { useColorScheme } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { ThemeColors, light, dark } from './colors';

export interface Theme {
  colors: ThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

const baseTheme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  shadows: {
    sm: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    lg: '0px 4px 16px rgba(0, 0, 0, 0.15)',
  },
};

export const lightTheme: Theme = {
  ...baseTheme,
  colors: light,
};

export const darkTheme: Theme = {
  ...baseTheme,
  colors: dark,
};

/**
 * Hook to get the current theme's color palette based on user preference and system settings.
 */
export const useThemeColors = (): ThemeColors => {
  const systemColorScheme = useColorScheme();
  const themePreference = useAppStore((state) => state.themePreference);

  if (themePreference === 'light') return light;
  if (themePreference === 'dark') return dark;
  
  // Default to system preference
  return systemColorScheme === 'dark' ? dark : light;
};

/**
 * Hook to get the full theme object.
 */
export const useTheme = (): Theme => {
  const colors = useThemeColors();
  const theme = colors === dark ? darkTheme : lightTheme;
  return theme;
};

export { light, dark };
