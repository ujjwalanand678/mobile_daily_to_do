import React, { useEffect, useState, useRef } from 'react';
import { View, Text as RNText, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/theme';
import { FONT_OPTIONS, FontOption } from '../theme/fonts';
import { GlassCard } from '../components/GlassCard';
import { SyncSettings } from '../components/SyncSettings';
import { useAppStore } from '../store/useAppStore';
import { ThemePreference, FontPreference } from '../types';
import { formatRelativeTime } from '../utils/time';

type ThemeOption = { label: string; value: ThemePreference; icon: keyof typeof Ionicons.glyphMap };

const THEME_OPTIONS: ThemeOption[] = [
  { label: 'Light', value: 'light', icon: 'sunny-outline' },
  { label: 'System', value: 'system', icon: 'phone-portrait-outline' },
  { label: 'Dark', value: 'dark', icon: 'moon-outline' },
];

function ThemeOptionButton({
  option,
  isActive,
  onPress,
}: {
  option: ThemeOption;
  isActive: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.95)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isActive ? 1 : 0.95,
      useNativeDriver: true,
      tension: 280,
      friction: 12,
    }).start();
  }, [isActive]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ flex: 1 }}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {isActive ? (
          <LinearGradient
            colors={[theme.colors.primaryGradientStart, theme.colors.primaryGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles_static.themeOptionInner}
          >
            <Ionicons name={option.icon} size={18} color="#FFFFFF" />
            <RNText style={[styles_static.themeOptionLabel, { color: '#FFFFFF' }]}>{option.label}</RNText>
          </LinearGradient>
        ) : (
          <View style={[styles_static.themeOptionInner, { backgroundColor: 'transparent' }]}>
            <Ionicons name={option.icon} size={18} color={theme.colors.textSecondary} />
            <RNText style={[styles_static.themeOptionLabel, { color: theme.colors.textSecondary }]}>{option.label}</RNText>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles_static = StyleSheet.create({
  themeOptionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  themeOptionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  fontCard: {
    width: 90,
    height: 80,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  fontCardSample: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 4,
  },
  fontCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { themePreference, setThemePreference, fontPreference, setFontPreference, lastSyncedAt } = useAppStore();
  const [relativeTime, setRelativeTime] = useState(formatRelativeTime(lastSyncedAt));

  useEffect(() => {
    setRelativeTime(formatRelativeTime(lastSyncedAt));
    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime(lastSyncedAt));
    }, 30000);
    return () => clearInterval(interval);
  }, [lastSyncedAt]);

  const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
      paddingTop: insets.top + theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.displayMedium,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: -0.5,
    },
    scroll: { flex: 1 },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl + 60,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.titleMedium,
      fontWeight: '700',
      color: theme.colors.text,
    },
    themeToggleRow: {
      flexDirection: 'row',
      gap: 4,
    },
    syncRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.xs,
    },
    syncLabel: {
      fontSize: theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
    syncTime: {
      fontSize: theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
    },
    appInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    appInfoLabel: {
      fontSize: theme.typography.bodyMedium,
      color: theme.colors.text,
      fontWeight: '500',
    },
    appInfoValue: {
      fontSize: theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
  });

  return (
    <LinearGradient
      colors={[theme.colors.backgroundGradientStart, theme.colors.backgroundGradientEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <RNText style={styles.title}>Settings</RNText>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Theme Section */}
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette-outline" size={20} color={theme.colors.primary} />
            <RNText style={styles.sectionTitle}>Appearance</RNText>
          </View>
          <GlassCard padded>
            <View style={styles.themeToggleRow}>
              {THEME_OPTIONS.map(option => (
                <ThemeOptionButton
                  key={option.value}
                  option={option}
                  isActive={themePreference === option.value}
                  onPress={() => setThemePreference(option.value)}
                />
              ))}
            </View>
          </GlassCard>

          {/* Font Style Section */}
          <View style={styles.sectionHeader}>
            <Ionicons name="text-outline" size={20} color={theme.colors.primary} />
            <RNText style={styles.sectionTitle}>Font Style</RNText>
          </View>
          <GlassCard padded>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
              {FONT_OPTIONS.map((option) => {
                const isActive = (fontPreference ?? 'system') === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    activeOpacity={0.8}
                    onPress={() => setFontPreference(option.key)}
                  >
                    {isActive ? (
                      <LinearGradient
                        colors={[theme.colors.primaryGradientStart, theme.colors.primaryGradientEnd]}
                        style={styles_static.fontCard}
                      >
                        <RNText
                          style={[
                            styles_static.fontCardSample,
                            { color: '#FFFFFF', fontFamily: option.fontFamily },
                          ]}
                        >
                          {option.sampleText}
                        </RNText>
                        <RNText style={[styles_static.fontCardLabel, { color: 'rgba(255,255,255,0.85)' }]}>
                          {option.label}
                        </RNText>
                      </LinearGradient>
                    ) : (
                      <View
                        style={[
                          styles_static.fontCard,
                          { backgroundColor: theme.colors.border },
                        ]}
                      >
                        <RNText
                          style={[
                            styles_static.fontCardSample,
                            { color: theme.colors.text, fontFamily: option.fontFamily },
                          ]}
                        >
                          {option.sampleText}
                        </RNText>
                        <RNText style={[styles_static.fontCardLabel, { color: theme.colors.textSecondary }]}>
                          {option.label}
                        </RNText>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </GlassCard>

          {/* Google Drive Sync */}
          <View style={styles.sectionHeader}>
            <Ionicons name="cloud-outline" size={20} color={theme.colors.primary} />
            <RNText style={styles.sectionTitle}>Cloud Sync</RNText>
          </View>
          <GlassCard padded={false}>
            <SyncSettings />
          </GlassCard>
          {lastSyncedAt && (
            <RNText style={[styles.syncLabel, { marginTop: 6, textAlign: 'center' }]}>
              Last synced: {relativeTime}
            </RNText>
          )}

          {/* App Info */}
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
            <RNText style={styles.sectionTitle}>About</RNText>
          </View>
          <GlassCard padded>
            <View style={[styles.appInfoRow]}>
              <RNText style={styles.appInfoLabel}>App Name</RNText>
              <RNText style={styles.appInfoValue}>Daily To-Do</RNText>
            </View>
            <View style={[styles.appInfoRow]}>
              <RNText style={styles.appInfoLabel}>Version</RNText>
              <RNText style={styles.appInfoValue}>1.0.0</RNText>
            </View>
            <View style={[styles.appInfoRow, { borderBottomWidth: 0 }]}>
              <RNText style={styles.appInfoLabel}>SDK</RNText>
              <RNText style={styles.appInfoValue}>Expo 55</RNText>
            </View>
          </GlassCard>

        </View>
      </ScrollView>
    </LinearGradient>
  );
};
