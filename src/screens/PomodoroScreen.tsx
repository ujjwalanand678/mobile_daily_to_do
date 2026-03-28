import React, { useState, useEffect, useCallback } from 'react';
import { View, Text as RNText, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { Task } from '../types';
import { useTheme } from '../theme/theme';
import * as Haptics from 'expo-haptics';

const POMODORO_MINUTES = 25;

export const PomodoroScreen: React.FC = () => {
  const theme = useTheme();
  const { tasks, updateTask } = useAppStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [timeLeft, setTimeLeft] = useState(POMODORO_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  
  // Animation for the timer circle
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  // Get today's tasks for selection
  const todayTasks = tasks.filter(task => {
    if (task.isCompleted) return false;
    if (!task.dueDate) return false;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const taskDate = new Date(task.dueDate.getFullYear(), task.dueDate.getMonth(), task.dueDate.getDate());
    return taskDate.getTime() === today.getTime();
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
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
    // Update progress animation
    const progress = 1 - timeLeft / (POMODORO_MINUTES * 60);
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [timeLeft, progressAnim]);

  const completeSession = useCallback(async () => {
    // Haptic feedback
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Update task time spent
    if (selectedTask) {
      const currentSpent = selectedTask.timeSpent || 0;
      updateTask(selectedTask.id, {
        timeSpent: currentSpent + POMODORO_MINUTES,
      });
    }
    
    // Increment session count
    setSessionCount(prev => prev + 1);
    
    // Fade animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = (): string => {
    const progress = timeLeft / (POMODORO_MINUTES * 60);
    if (progress > 0.5) return theme.colors.success;
    if (progress > 0.25) return theme.colors.warning;
    return theme.colors.error;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg,
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    sessionCount: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    timerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    timerCircle: {
      width: 250,
      height: 250,
      borderRadius: 125,
      borderWidth: 8,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    timerText: {
      fontSize: 48,
      fontWeight: 'bold',
      color: theme.colors.text,
      fontFamily: 'monospace',
    },
    taskSelector: {
      marginBottom: theme.spacing.xl,
    },
    taskSelectorTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    taskButton: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    taskButtonSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '20',
    },
    taskButtonText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    taskTimeSpent: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    controlsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: theme.spacing.lg,
    },
    controlButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      minWidth: 120,
      alignItems: 'center',
    },
    controlButtonSecondary: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    controlButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: 'white',
    },
    controlButtonTextSecondary: {
      color: theme.colors.text,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 18,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <RNText style={styles.title}>Pomodoro Timer</RNText>
        <RNText style={styles.sessionCount}>Sessions completed: {sessionCount}</RNText>
      </View>

      {todayTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <RNText style={styles.emptyText}>
            No tasks scheduled for today.{'\n'}
            Add some tasks with due dates to use the Pomodoro timer.
          </RNText>
        </View>
      ) : (
        <>
          <View style={styles.taskSelector}>
            <RNText style={styles.taskSelectorTitle}>Select a task to focus on:</RNText>
            {todayTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskButton,
                  selectedTask?.id === task.id && styles.taskButtonSelected,
                ]}
                onPress={() => {
                  setSelectedTask(task);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <RNText style={styles.taskButtonText}>{task.title}</RNText>
                {task.timeSpent && (
                  <RNText style={styles.taskTimeSpent}>
                    Time spent: {task.timeSpent} minutes
                  </RNText>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.timerContainer}>
            <Animated.View style={[
              styles.timerCircle,
              { borderColor: getProgressColor() },
              { opacity: fadeAnim }
            ]}>
              <RNText style={styles.timerText}>{formatTime(timeLeft)}</RNText>
            </Animated.View>

            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  !selectedTask && styles.controlButtonSecondary,
                ]}
                onPress={toggleTimer}
                disabled={!selectedTask}
              >
                <RNText style={[
                  styles.controlButtonText,
                  !selectedTask && styles.controlButtonTextSecondary,
                ]}>
                  {isRunning ? 'Pause' : 'Start'}
                </RNText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.controlButton, styles.controlButtonSecondary]}
                onPress={resetTimer}
              >
                <RNText style={styles.controlButtonTextSecondary}>Reset</RNText>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
};
