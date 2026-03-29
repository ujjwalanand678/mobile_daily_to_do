import React, { useMemo } from 'react';
import { View, Text as RNText, StyleSheet, ScrollView } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/theme';
import { AnalyticsManager } from '../utils/analytics';

export const AnalyticsScreen: React.FC = () => {
  const theme = useTheme();
  const { tasks } = useAppStore();

  const analytics = useMemo(() => {
    const tasksCompletedToday = AnalyticsManager.getTasksCompletedToday(tasks);
    const weeklyData = AnalyticsManager.getWeeklyCompletionData(tasks);
    const insights = AnalyticsManager.getProductivityInsights(tasks);
    const productivityScore = AnalyticsManager.getProductivityScore(tasks);
    const priorityDistribution = AnalyticsManager.getTaskDistributionByPriority(tasks);
    const statusDistribution = AnalyticsManager.getTaskDistributionByStatus(tasks);

    return {
      tasksCompletedToday,
      weeklyData,
      insights,
      productivityScore,
      priorityDistribution,
      statusDistribution,
    };
  }, [tasks]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.colors.success;
    if (score >= 60) return theme.colors.warning;
    return theme.colors.error;
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '🔥';
    if (score >= 60) return '📈';
    return '📊';
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    scoreCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    scoreEmoji: {
      fontSize: 48,
      marginBottom: theme.spacing.sm,
    },
    scoreValue: {
      fontSize: 36,
      fontWeight: 'bold',
      color: getScoreColor(analytics.productivityScore),
      marginBottom: theme.spacing.sm,
    },
    scoreLabel: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    statCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      flex: 1,
      minWidth: '45%',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    statLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    weeklyChart: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    chartTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    chartTotal: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    chartBars: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      height: 120,
      paddingHorizontal: theme.spacing.sm,
    },
    chartBar: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: theme.spacing.xs,
    },
    bar: {
      width: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.xs,
    },
    barLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    barValue: {
      fontSize: 10,
      color: theme.colors.text,
      fontWeight: '500',
    },
    distributionGrid: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    distributionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    distributionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    distributionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    distributionLabel: {
      fontSize: 14,
      color: theme.colors.text,
    },
    distributionValue: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.colors.background,
      borderRadius: 4,
      overflow: 'hidden',
      marginTop: theme.spacing.xs,
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
  });

  const maxCompleted = Math.max(...analytics.weeklyData.map(d => d.completed), 1);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <RNText style={styles.title}>Analytics</RNText>
        <RNText style={styles.subtitle}>Track your productivity</RNText>
      </View>

      <View style={styles.content}>
        {/* Productivity Score */}
        <View style={styles.section}>
          <RNText style={styles.sectionTitle}>Productivity Score</RNText>
          <View style={styles.scoreCard}>
            <RNText style={styles.scoreEmoji}>{getScoreEmoji(analytics.productivityScore)}</RNText>
            <RNText style={styles.scoreValue}>{analytics.productivityScore}%</RNText>
            <RNText style={styles.scoreLabel}>Overall productivity</RNText>
          </View>
        </View>

        {/* Key Stats */}
        <View style={styles.section}>
          <RNText style={styles.sectionTitle}>Today's Overview</RNText>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <RNText style={styles.statValue}>{analytics.tasksCompletedToday.length}</RNText>
              <RNText style={styles.statLabel}>Tasks Completed</RNText>
            </View>
            <View style={styles.statCard}>
              <RNText style={styles.statValue}>{analytics.insights.focusTimeToday}</RNText>
              <RNText style={styles.statLabel}>Focus Time</RNText>
            </View>
            <View style={styles.statCard}>
              <RNText style={styles.statValue}>{analytics.insights.streakDays}</RNText>
              <RNText style={styles.statLabel}>Day Streak</RNText>
            </View>
            <View style={styles.statCard}>
              <RNText style={styles.statValue}>{analytics.insights.averageTasksPerDay}</RNText>
              <RNText style={styles.statLabel}>Daily Average</RNText>
            </View>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.section}>
          <RNText style={styles.sectionTitle}>Weekly Progress</RNText>
          <View style={styles.weeklyChart}>
            <View style={styles.chartHeader}>
              <RNText style={styles.chartTitle}>Last 7 Days</RNText>
              <RNText style={styles.chartTotal}>
                {analytics.weeklyData.reduce((sum, day) => sum + day.completed, 0)} tasks completed
              </RNText>
            </View>
            <View style={styles.chartBars}>
              {analytics.weeklyData.map((day, index) => {
                const barHeight = maxCompleted > 0 ? (day.completed / maxCompleted) * 100 : 0;
                return (
                  <View key={index} style={styles.chartBar}>
                    <RNText style={styles.barValue}>{day.completed}</RNText>
                    <View 
                      style={[
                        styles.bar, 
                        { height: `${barHeight}%` }
                      ]} 
                    />
                    <RNText style={styles.barLabel}>{day.day}</RNText>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Distribution */}
        <View style={styles.section}>
          <RNText style={styles.sectionTitle}>Task Distribution</RNText>
          <View style={styles.distributionGrid}>
            <View style={styles.distributionCard}>
              <RNText style={styles.distributionTitle}>By Priority</RNText>
              <View style={styles.distributionItem}>
                <RNText style={styles.distributionLabel}>High</RNText>
                <RNText style={styles.distributionValue}>{analytics.priorityDistribution.high}</RNText>
              </View>
              <View style={styles.distributionItem}>
                <RNText style={styles.distributionLabel}>Medium</RNText>
                <RNText style={styles.distributionValue}>{analytics.priorityDistribution.med}</RNText>
              </View>
              <View style={styles.distributionItem}>
                <RNText style={styles.distributionLabel}>Low</RNText>
                <RNText style={styles.distributionValue}>{analytics.priorityDistribution.low}</RNText>
              </View>
            </View>
            
            <View style={styles.distributionCard}>
              <RNText style={styles.distributionTitle}>By Status</RNText>
              <View style={styles.distributionItem}>
                <RNText style={styles.distributionLabel}>Completed</RNText>
                <RNText style={styles.distributionValue}>{analytics.statusDistribution.completed}</RNText>
              </View>
              <View style={styles.distributionItem}>
                <RNText style={styles.distributionLabel}>Pending</RNText>
                <RNText style={styles.distributionValue}>{analytics.statusDistribution.pending}</RNText>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${tasks.length > 0 ? (analytics.statusDistribution.completed / tasks.length) * 100 : 0}%`,
                      backgroundColor: theme.colors.success 
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
        </View>

        {/* Insights */}
        <View style={styles.section}>
          <RNText style={styles.sectionTitle}>Insights</RNText>
          <View style={styles.statCard}>
            <RNText style={styles.statLabel}>🏆 Most productive day: {analytics.insights.mostProductiveDay}</RNText>
            <RNText style={styles.statLabel}>📊 Total tasks completed: {analytics.insights.totalTasksCompleted}</RNText>
            <RNText style={styles.statLabel}>🎯 Average completion rate: {AnalyticsManager.getAverageCompletionRate(tasks)}%</RNText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
