import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text as RNText, StyleSheet, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/theme';
import { GlassCard } from '../components/GlassCard';
import { AnalyticsManager } from '../utils/analytics';

interface StatCardProps {
  value: string | number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

function StatCard({ value, label, icon, color }: StatCardProps) {
  const theme = useTheme();
  const countAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(countAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <GlassCard style={{ flex: 1 }} padded>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <View style={{
          width: 32, height: 32, borderRadius: 10,
          backgroundColor: color + '22',
          alignItems: 'center', justifyContent: 'center',
          marginRight: 8,
        }}>
          <Ionicons name={icon} size={17} color={color} />
        </View>
      </View>
      <RNText style={{ fontSize: 28, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.5 }}>
        {value}
      </RNText>
      <RNText style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 2, fontWeight: '500' }}>
        {label}
      </RNText>
    </GlassCard>
  );
}

export const AnalyticsScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { tasks } = useAppStore();

  const analytics = useMemo(() => {
    return {
      tasksCompletedToday: AnalyticsManager.getTasksCompletedToday(tasks),
      weeklyData: AnalyticsManager.getWeeklyCompletionData(tasks),
      insights: AnalyticsManager.getProductivityInsights(tasks),
      productivityScore: AnalyticsManager.getProductivityScore(tasks),
      priorityDistribution: AnalyticsManager.getTaskDistributionByPriority(tasks),
      statusDistribution: AnalyticsManager.getTaskDistributionByStatus(tasks),
      avgRate: String(AnalyticsManager.getAverageCompletionRate(tasks)),
    };
  }, [tasks]);

  const maxCompleted = Math.max(...analytics.weeklyData.map(d => d.completed), 1);

  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.colors.success;
    if (score >= 60) return theme.colors.warning;
    return theme.colors.error;
  };

  const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { flex: 1 },
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
    subtitle: {
      fontSize: theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    content: { paddingHorizontal: theme.spacing.lg },
    sectionTitle: {
      fontSize: theme.typography.titleMedium,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    section: { marginBottom: theme.spacing.xl },
    statsGrid: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    scoreCard: { alignItems: 'center', padding: theme.spacing.xl },
    scoreCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    scoreValue: {
      fontSize: 42,
      fontWeight: '900',
      letterSpacing: -1,
    },
    scoreLabel: {
      fontSize: theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    chartBars: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 100,
      gap: 6,
      paddingTop: theme.spacing.sm,
    },
    chartBar: { flex: 1, alignItems: 'center' },
    barLabel: { fontSize: 10, color: theme.colors.textSecondary, marginTop: 4, fontWeight: '500' },
    barCount: { fontSize: 10, color: theme.colors.text, fontWeight: '700', marginBottom: 2 },
    insightRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    insightText: {
      fontSize: theme.typography.bodyMedium,
      color: theme.colors.text,
      fontWeight: '500',
      flex: 1,
    },
  });

  return (
    <LinearGradient
      colors={[theme.colors.backgroundGradientStart, theme.colors.backgroundGradientEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: theme.spacing.xxl + 60 }}>
        {/* Header */}
        <View style={styles.header}>
          <RNText style={styles.title}>Analytics</RNText>
          <RNText style={styles.subtitle}>Your productivity at a glance</RNText>
        </View>

        <View style={styles.content}>
          {/* Productivity Score */}
          <View style={styles.section}>
            <RNText style={styles.sectionTitle}>Productivity Score</RNText>
            <GlassCard>
              <View style={styles.scoreCard}>
                <LinearGradient
                  colors={[getScoreColor(analytics.productivityScore) + '33', getScoreColor(analytics.productivityScore) + '11']}
                  style={styles.scoreCircle}
                >
                  <RNText style={[styles.scoreValue, { color: getScoreColor(analytics.productivityScore) }]}>
                    {analytics.productivityScore}
                  </RNText>
                </LinearGradient>
                <RNText style={styles.scoreLabel}>Overall productivity score</RNText>
              </View>
            </GlassCard>
          </View>

          {/* Stats Grid */}
          <View style={styles.section}>
            <RNText style={styles.sectionTitle}>Today's Overview</RNText>
            <View style={styles.statsGrid}>
              <StatCard value={analytics.tasksCompletedToday.length} label="Completed" icon="checkmark-done-outline" color={theme.colors.success} />
              <StatCard value={analytics.insights.focusTimeToday} label="Focus Time" icon="time-outline" color={theme.colors.primary} />
            </View>
            <View style={styles.statsGrid}>
              <StatCard value={analytics.insights.streakDays} label="Day Streak" icon="flame-outline" color={theme.colors.warning} />
              <StatCard value={analytics.insights.averageTasksPerDay} label="Daily Avg" icon="trending-up-outline" color={theme.colors.secondary} />
            </View>
          </View>

          {/* Weekly Chart */}
          <View style={styles.section}>
            <RNText style={styles.sectionTitle}>Last 7 Days</RNText>
            <GlassCard padded>
              <View style={styles.chartBars}>
                {analytics.weeklyData.map((day, index) => {
                  const barHeight = maxCompleted > 0 ? Math.max((day.completed / maxCompleted) * 80, day.completed > 0 ? 8 : 0) : 0;
                  return (
                    <View key={index} style={styles.chartBar}>
                      <RNText style={styles.barCount}>{day.completed > 0 ? day.completed : ''}</RNText>
                      <LinearGradient
                        colors={[theme.colors.primaryGradientStart, theme.colors.primaryGradientEnd]}
                        style={{
                          width: '100%',
                          height: barHeight,
                          borderRadius: 6,
                          minHeight: day.completed > 0 ? 8 : 0,
                          opacity: day.completed > 0 ? 1 : 0,
                        }}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                      />
                      <RNText style={styles.barLabel}>{day.day?.slice(0, 3)}</RNText>
                    </View>
                  );
                })}
              </View>
            </GlassCard>
          </View>

          {/* Insights */}
          <View style={styles.section}>
            <RNText style={styles.sectionTitle}>Insights</RNText>
            <GlassCard padded>
              <View style={[styles.insightRow, { borderBottomWidth: 0 }]}>
                <Ionicons name="trophy-outline" size={20} color={theme.colors.warning} />
                <RNText style={styles.insightText}>
                  Most productive: {analytics.insights.mostProductiveDay}
                </RNText>
              </View>
              <View style={styles.insightRow}>
                <Ionicons name="analytics-outline" size={20} color={theme.colors.primary} />
                <RNText style={styles.insightText}>
                  {analytics.insights.totalTasksCompleted} tasks completed total
                </RNText>
              </View>
              <View style={[styles.insightRow, { borderBottomWidth: 0 }]}>
                <Ionicons name="flag-outline" size={20} color={theme.colors.success} />
                <RNText style={styles.insightText}>
                  {analytics.avgRate}% average completion rate
                </RNText>
              </View>
            </GlassCard>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};
