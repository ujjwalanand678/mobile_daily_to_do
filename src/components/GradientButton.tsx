import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, ViewStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/theme';

type GradientButtonVariant = 'primary' | 'danger' | 'secondary' | 'outline';
type GradientButtonSize = 'sm' | 'md' | 'lg';

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  variant?: GradientButtonVariant;
  size?: GradientButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  label,
  onPress,
  icon,
  iconPosition = 'left',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  fullWidth = false,
}) => {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 13, iconSize: 16, gap: 4 },
    md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 15, iconSize: 18, gap: 6 },
    lg: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 17, iconSize: 20, gap: 8 },
  }[size];

  const getGradient = (): readonly [string, string] => {
    switch (variant) {
      case 'primary':
        return [theme.colors.primaryGradientStart, theme.colors.primaryGradientEnd] as const;
      case 'danger':
        return [theme.colors.error, '#DC2626'] as const;
      case 'secondary':
        return [theme.colors.secondary, '#0891B2'] as const;
      case 'outline':
        return ['transparent', 'transparent'] as const;
    }
  };

  const getTextColor = () => {
    if (variant === 'outline') return theme.colors.primary;
    return '#FFFFFF';
  };

  const getIconColor = () => {
    if (variant === 'outline') return theme.colors.primary;
    return '#FFFFFF';
  };

  const styles = StyleSheet.create({
    wrapper: {
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      alignSelf: fullWidth ? 'stretch' : 'auto',
      opacity: disabled ? 0.5 : 1,
      ...(variant === 'outline' ? {
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
      } : {}),
      ...(theme.shadows.md as object),
    },
    gradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: sizeStyles.paddingVertical,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      gap: sizeStyles.gap,
    },
    label: {
      fontSize: sizeStyles.fontSize,
      fontWeight: '700',
      letterSpacing: 0.3,
      color: getTextColor(),
    },
  });

  const iconEl = icon ? (
    <Ionicons name={icon} size={sizeStyles.iconSize} color={getIconColor()} />
  ) : null;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
      >
        <LinearGradient
          colors={getGradient()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.wrapper, styles.gradient]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              {iconPosition === 'left' && iconEl}
              <Text style={styles.label}>{label}</Text>
              {iconPosition === 'right' && iconEl}
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};
