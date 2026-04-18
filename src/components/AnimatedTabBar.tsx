import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Platform, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/theme';

type TabConfig = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  label: string;
};

const TAB_CONFIG: TabConfig[] = [
  { name: 'Home',      icon: 'home-outline',      activeIcon: 'home',      label: 'Home' },
  { name: 'Pomodoro',  icon: 'timer-outline',     activeIcon: 'timer',     label: 'Focus' },
  { name: 'Calendar',  icon: 'calendar-outline',  activeIcon: 'calendar',  label: 'Calendar' },
  { name: 'Analytics', icon: 'bar-chart-outline', activeIcon: 'bar-chart', label: 'Stats' },
  { name: 'Settings',  icon: 'settings-outline',  activeIcon: 'settings',  label: 'Settings' },
];

function TabItem({
  config,
  isActive,
  onPress,
}: {
  config: TabConfig;
  isActive: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(isActive ? 1.1 : 1)).current;
  const dotAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isActive ? 1.12 : 1,
        useNativeDriver: true,
        tension: 280,
        friction: 12,
      }),
      Animated.timing(dotAnim, {
        toValue: isActive ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive]);

  const activeColor = theme.colors.primary;
  const inactiveColor = theme.colors.textSecondary;

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.tabIconContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Ionicons
          name={isActive ? config.activeIcon : config.icon}
          size={24}
          color={isActive ? activeColor : inactiveColor}
        />
      </Animated.View>
      <Text
        style={[
          styles.tabLabel,
          { color: isActive ? activeColor : inactiveColor },
          isActive && styles.tabLabelActive,
        ]}
        numberOfLines={1}
      >
        {config.label}
      </Text>
      <Animated.View
        style={[
          styles.activeDot,
          {
            backgroundColor: activeColor,
            opacity: dotAnim,
            transform: [{ scaleX: dotAnim }],
          },
        ]}
      />
    </TouchableOpacity>
  );
}

export function AnimatedTabBar({ state, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tint = theme.isDark ? theme.glassmorphism.darkTint : theme.glassmorphism.lightTint;

  const TabBarContent = (
    <View style={styles.tabRow}>
      {state.routes.map((route, index) => {
        const config = TAB_CONFIG.find(t => t.name === route.name) ?? TAB_CONFIG[0];
        const isActive = state.index === index;

        return (
          <TabItem
            key={route.key}
            config={config}
            isActive={isActive}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isActive && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
          />
        );
      })}
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom + 4,
          borderTopColor: theme.colors.border,
        },
      ]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={theme.glassmorphism.blurAmount}
          tint={tint}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.tabBar }]} />
      )}
      <View style={[styles.topBorder, { backgroundColor: theme.colors.border }]} />
      {TabBarContent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderTopWidth: 0,
  },
  topBorder: {
    height: StyleSheet.hairlineWidth,
  },
  tabRow: {
    flexDirection: 'row',
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 4,
    minHeight: 56,
  },
  tabIconContainer: {
    marginBottom: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  activeDot: {
    marginTop: 4,
    width: 18,
    height: 3,
    borderRadius: 2,
  },
});
