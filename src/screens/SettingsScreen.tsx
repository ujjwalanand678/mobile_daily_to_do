import React, { useEffect, useState } from 'react';
import { View, Text as RNText, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/theme';
import { SyncSettings } from '../components/SyncSettings';
import { useAppStore } from '../store/useAppStore';
import { ThemePreference } from '../types';
import { formatRelativeTime } from '../utils/time';

export const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const { themePreference, setThemePreference, lastSyncedAt } = useAppStore();
  const [relativeTime, setRelativeTime] = useState(formatRelativeTime(lastSyncedAt));

  // Update relative time periodically
  useEffect(() => {
    setRelativeTime(formatRelativeTime(lastSyncedAt));
    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime(lastSyncedAt));
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [lastSyncedAt]);

  const themes: { label: string; value: ThemePreference }[] = [
    { label: 'System', value: 'system' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
    },
    header: {
      padding: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.md,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    section: {
      marginTop: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    themeContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    themeButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      borderRadius: theme.borderRadius.sm,
    },
    activeThemeButton: {
      backgroundColor: theme.colors.primary,
    },
    themeButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    activeThemeButtonText: {
      color: '#FFFFFF',
    },
    syncIndicator: {
      marginTop: theme.spacing.md,
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <RNText style={styles.title}>Settings</RNText>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <RNText style={styles.sectionTitle}>App Theme</RNText>
          <View style={styles.themeContainer}>
            {themes.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[
                  styles.themeButton,
                  themePreference === t.value && styles.activeThemeButton,
                ]}
                onPress={() => setThemePreference(t.value)}
              >
                <RNText
                  style={[
                    styles.themeButtonText,
                    themePreference === t.value && styles.activeThemeButtonText,
                  ]}
                >
                  {t.label}
                </RNText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SyncSettings />
          {lastSyncedAt && (
            <RNText style={styles.syncIndicator}>
              Last synced: {relativeTime}
            </RNText>
          )}
        </View>
      </ScrollView>
    </View>
  );
};
