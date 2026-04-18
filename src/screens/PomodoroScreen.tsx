import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text as RNText, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useAppStore } from '../store/useAppStore';
import { Task } from '../types';
import { useTheme } from '../theme/theme';
import { GlassCard } from '../components/GlassCard';
import { GradientButton } from '../components/GradientButton';
import * as Haptics from 'expo-haptics';

const POMODORO_MINUTES = 25;
const CIRCLE_RADIUS = 100;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export const PomodoroScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { tasks, updateTask } = useAppStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [timeLeft, setTimeLeft] = useState(POMODORO_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const todayTasks = tasks.filter(task => {
    if (task.isCompleted) return false;
    if (!task.dueDate) return true; // include undated tasks too
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate >= today && taskDate < tomorrow;
  }).slice(0, 5);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            completeSession();
            return POMODORO_MINUTES * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    const progress = 1 - timeLeft / (POMODORO_MINUTES * 60);
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [timeLeft]);

  const completeSession = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (selectedTask) {
      updateTask(selectedTask.id, { timeSpent: (selectedTask.timeSpent || 0) + POMODORO_MINUTES });
    }
    setSessionCount(prev => prev + 1);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.3, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [selectedTask, updateTask]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(POMODORO_MINUTES * 60);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Derived progress value for SVG
  const progressRatio = 1 - timeLeft / (POMODORO_MINUTES * 60);
  const strokeDashoffset = CIRCUMFERENCE * (1 - progressRatio);

  const getProgressColor = () => {
    if (progressRatio < 0.5) return theme.colors.success;
    if (progressRatio < 0.75) return theme.colors.warning;
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
    timerSection: {
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
    },
    svgWrapper: {
      position: 'relative',
      width: 240,
      height: 240,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    timerTextWrapper: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    timerText: {
      fontSize: 52,
      fontWeight: '800',
      color: theme.colors.text,
      fontVariant: ['tabular-nums'],
      letterSpacing: -1,
    },
    phaseText: {
      fontSize: theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      marginTop: 2,
    },
    sessionDots: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: theme.spacing.lg,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    controls: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    taskSection: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.xxl,
    },
    sectionTitle: {
      fontSize: theme.typography.titleMedium,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    taskCard: {
      marginBottom: theme.spacing.sm,
    },
    taskRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    taskTitle: {
      flex: 1,
      fontSize: theme.typography.bodyLarge,
      color: theme.colors.text,
      fontWeight: '500',
    },
    taskMeta: {
      fontSize: theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: 3,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
      gap: theme.spacing.md,
    },
    emptyText: {
      fontSize: theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
  });

  return (
    <LinearGradient
      colors={[theme.colors.backgroundGradientStart, theme.colors.backgroundGradientEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <RNText style={styles.title}>Focus Timer</RNText>
          <RNText style={styles.subtitle}>
            {sessionCount > 0 ? `${sessionCount} session${sessionCount > 1 ? 's' : ''} completed today` : 'Ready to focus?'}
          </RNText>
        </View>

        {/* Timer Circle */}
        <View style={styles.timerSection}>
          <Animated.View style={[styles.svgWrapper, { opacity: fadeAnim }]}>
            <Svg width={240} height={240}>
              {/* Track */}
              <Circle
                cx={120}
                cy={120}
                r={CIRCLE_RADIUS}
                stroke={theme.colors.border}
                strokeWidth={10}
                fill="none"
              />
              {/* Progress arc */}
              <Circle
                cx={120}
                cy={120}
                r={CIRCLE_RADIUS}
                stroke={getProgressColor()}
                strokeWidth={10}
                fill="none"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin="120, 120"
              />
            </Svg>
            <View style={styles.timerTextWrapper}>
              <RNText style={styles.timerText}>{formatTime(timeLeft)}</RNText>
              <RNText style={styles.phaseText}>
                {isRunning ? 'Focusing' : 'Ready'}
              </RNText>
            </View>
          </Animated.View>

          {/* Session dots */}
          <View style={styles.sessionDots}>
            {Array.from({ length: Math.min(sessionCount % 4 === 0 && sessionCount > 0 ? 4 : sessionCount % 4, 4) }).map((_, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
            ))}
            {Array.from({ length: 4 - (sessionCount % 4 === 0 && sessionCount > 0 ? 4 : sessionCount % 4) }).map((_, i) => (
              <View key={`empty-${i}`} style={[styles.dot, { backgroundColor: theme.colors.border }]} />
            ))}
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <GradientButton
            label={isRunning ? 'Pause' : 'Start Focus'}
            icon={isRunning ? 'pause' : 'play'}
            onPress={toggleTimer}
            disabled={!selectedTask}
            fullWidth={false}
            size="lg"
          />
          <GradientButton
            label="Reset"
            icon="refresh"
            onPress={resetTimer}
            variant="outline"
            size="lg"
          />
        </View>

        {/* Task Selector */}
        <View style={styles.taskSection}>
          <RNText style={styles.sectionTitle}>Select Task to Focus On</RNText>

          {todayTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-done-circle-outline" size={48} color={theme.colors.primary} />
              <RNText style={styles.emptyText}>
                No tasks available.{'\n'}Add tasks to start a focused session.
              </RNText>
            </View>
          ) : (
            todayTasks.map(task => (
              <GlassCard
                key={task.id}
                style={[
                  styles.taskCard,
                  ...(selectedTask?.id === task.id
                    ? [{ borderColor: theme.colors.primary, borderWidth: 2 }]
                    : []),
                ]}
                padded
              >
                <TouchableOpacity
                  style={styles.taskRow}
                  onPress={() => {
                    setSelectedTask(task);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Ionicons
                    name={selectedTask?.id === task.id ? 'radio-button-on' : 'radio-button-off'}
                    size={22}
                    color={selectedTask?.id === task.id ? theme.colors.primary : theme.colors.textSecondary}
                  />
                  <View style={{ flex: 1 }}>
                    <RNText style={styles.taskTitle}>{task.title}</RNText>
                    {task.timeSpent ? (
                      <RNText style={styles.taskMeta}>
                        <Ionicons name="time-outline" size={11} color={theme.colors.textSecondary} />
                        {' '}{task.timeSpent} min spent
                      </RNText>
                    ) : null}
                  </View>
                </TouchableOpacity>
              </GlassCard>
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};
