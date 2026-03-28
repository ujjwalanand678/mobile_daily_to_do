import React from 'react';
import { View, Text as RNText, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme/theme';
import { SyncSettings } from '../components/SyncSettings';

export const SettingsScreen: React.FC = () => {
  const theme = useTheme();

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
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <RNText style={styles.title}>Settings</RNText>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <SyncSettings />
      </ScrollView>
    </View>
  );
};
