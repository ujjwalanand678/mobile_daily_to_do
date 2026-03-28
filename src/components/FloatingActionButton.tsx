import React from 'react';
import { View, StyleSheet, Animated, Text as RNText } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useTheme } from '../theme/theme';

interface FloatingActionButtonProps {
  onPress: () => void;
  visible?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ 
  onPress, 
  visible = true 
}) => {
  const theme = useTheme();
  const scale = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(scale, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible, scale]);

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: theme.spacing.xl,
      right: theme.spacing.md,
      zIndex: 1000,
    },
    button: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    buttonText: {
      color: 'white',
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 24,
      textAlign: 'center',
    },
  });

  return (
    <Animated.View style={[
      styles.container,
      {
        transform: [{ scale }],
        opacity: visible ? 1 : 0,
      }
    ]}>
      <RectButton style={styles.button} onPress={onPress}>
        <RNText style={styles.buttonText}>+</RNText>
      </RectButton>
    </Animated.View>
  );
};
