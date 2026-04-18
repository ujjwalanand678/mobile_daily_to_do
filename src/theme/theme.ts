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
    full: number;
  };
  typography: {
    displayLarge: number;
    displayMedium: number;
    titleLarge: number;
    titleMedium: number;
    bodyLarge: number;
    bodyMedium: number;
    bodySmall: number;
    labelMedium: number;
  };
  glassmorphism: {
    blurAmount: number;
    lightTint: 'light' | 'dark' | 'default' | 'extraLight' | 'prominent' | 'regular' | 'systemChromeMaterial' | 'systemChromeMaterialDark' | 'systemChromeMaterialLight' | 'systemMaterial' | 'systemMaterialDark' | 'systemMaterialLight' | 'systemThickMaterial' | 'systemThickMaterialDark' | 'systemThickMaterialLight' | 'systemThinMaterial' | 'systemThinMaterialDark' | 'systemThinMaterialLight' | 'systemUltraThinMaterial' | 'systemUltraThinMaterialDark' | 'systemUltraThinMaterialLight';
    darkTint: 'light' | 'dark' | 'default' | 'extraLight' | 'prominent' | 'regular' | 'systemChromeMaterial' | 'systemChromeMaterialDark' | 'systemChromeMaterialLight' | 'systemMaterial' | 'systemMaterialDark' | 'systemMaterialLight' | 'systemThickMaterial' | 'systemThickMaterialDark' | 'systemThickMaterialLight' | 'systemThinMaterial' | 'systemThinMaterialDark' | 'systemThinMaterialLight' | 'systemUltraThinMaterial' | 'systemUltraThinMaterialDark' | 'systemUltraThinMaterialLight';
  };
  shadows: {
    sm: object;
    md: object;
    lg: object;
  };
  isDark: boolean;
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
    md: 14,
    lg: 20,
    xl: 28,
    full: 9999,
  },
  typography: {
    displayLarge: 36,
    displayMedium: 28,
    titleLarge: 22,
    titleMedium: 18,
    bodyLarge: 16,
    bodyMedium: 14,
    bodySmall: 12,
    labelMedium: 13,
  },
  glassmorphism: {
    blurAmount: 20,
    lightTint: 'light' as const,
    darkTint: 'dark' as const,
  },
};

export const lightTheme: Theme = {
  ...baseTheme,
  colors: light,
  shadows: {
    sm: {
      shadowColor: light.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 6,
      elevation: 3,
    },
    md: {
      shadowColor: light.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 6,
    },
    lg: {
      shadowColor: light.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 24,
      elevation: 12,
    },
  },
  isDark: false,
};

export const darkTheme: Theme = {
  ...baseTheme,
  colors: dark,
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 3,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 6,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius: 24,
      elevation: 12,
    },
  },
  isDark: true,
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
  const systemColorScheme = useColorScheme();
  const themePreference = useAppStore((state) => state.themePreference);

  if (themePreference === 'light') return lightTheme;
  if (themePreference === 'dark') return darkTheme;

  return systemColorScheme === 'dark' ? darkTheme : lightTheme;
};

export { light, dark };
