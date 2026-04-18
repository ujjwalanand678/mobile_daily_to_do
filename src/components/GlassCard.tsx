import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: (ViewStyle | undefined)[] | ViewStyle;
  padded?: boolean;
  intensity?: number;
  borderRadius?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  padded = true,
  intensity,
  borderRadius,
}) => {
  const theme = useTheme();
  const blurIntensity = intensity ?? theme.glassmorphism.blurAmount;
  const tint = theme.isDark ? theme.glassmorphism.darkTint : theme.glassmorphism.lightTint;
  const radius = borderRadius ?? theme.borderRadius.lg;

  const styles = StyleSheet.create({
    wrapper: {
      borderRadius: radius,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.glassBorder,
      ...(theme.shadows.md as object),
    },
    blur: {
      flex: 1,
    },
    fallback: {
      backgroundColor: theme.colors.surface,
    },
    content: {
      ...(padded ? { padding: theme.spacing.md } : {}),
    },
  });

  // Android BlurView has limited support; use semi-transparent fallback for older APIs
  if (Platform.OS === 'android') {
    return (
      <View style={[styles.wrapper, { backgroundColor: theme.colors.surface }, style]}>
        <View style={[styles.content]}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, style]}>
      <BlurView
        intensity={blurIntensity}
        tint={tint}
        style={[styles.blur]}
      >
        <View style={styles.content}>
          {children}
        </View>
      </BlurView>
    </View>
  );
};
