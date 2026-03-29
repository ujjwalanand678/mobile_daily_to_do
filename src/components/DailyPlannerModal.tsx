import React, { useState, useEffect } from 'react';
import { View, Text as RNText, TouchableOpacity, Modal, StyleSheet, ScrollView, Animated } from 'react-native';
import { Task } from '../types';
import { useTheme } from '../theme/theme';
import { formatDateForDisplay } from '../utils/nlp';
import { TimeEstimateManager } from '../utils/timeEstimates';
import * as Haptics from 'expo-haptics';

interface DailyPlannerModalProps {
  visible: boolean;
  onClose: () => void;
  todayTasks: Task[];
  overdueTasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export const DailyPlannerModal: React.FC<DailyPlannerModalProps> = ({
  visible,
  onClose,
  todayTasks,
  overdueTasks,
  onUpdateTask,
}) => {
  const theme = useTheme();
  const [processedTasks, setProcessedTasks] = useState<Set<string>>(new Set());
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleDeferToTomorrow = async (taskId: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // Set to 9 AM tomorrow
    
    await onUpdateTask(taskId, { dueDate: tomorrow });
    setProcessedTasks(prev => new Set(prev).add(taskId));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCommitToToday = async (taskId: string) => {
    // Keep the task for today, just mark as processed
    setProcessedTasks(prev => new Set(prev).add(taskId));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleClose = () => {
    setProcessedTasks(new Set());
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.colors.error;
      case 'med': return theme.colors.warning;
      case 'low': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  };

  const allTasks = [...overdueTasks, ...todayTasks];
  const remainingTasks = allTasks.filter(task => !processedTasks.has(task.id));
  const allProcessed = processedTasks.size === allTasks.length;

  // Smart planning calculations
  const availableTime = TimeEstimateManager.getAvailableWorkingTime(new Date());
  const totalEstimatedTime = TimeEstimateManager.getTotalEstimatedTime(remainingTasks);
  const suggestedTasks = TimeEstimateManager.suggestTaskOrder(remainingTasks);
  const tasksThatFit = TimeEstimateManager.getTasksThatFit(remainingTasks, availableTime);
  const canFitAll = TimeEstimateManager.canFitInTime(remainingTasks, availableTime);

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      paddingTop: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
      maxHeight: '85%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    closeButton: {
      fontSize: 24,
      color: theme.colors.textSecondary,
      padding: theme.spacing.xs,
    },
    content: {
      flex: 1,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    taskCard: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderLeftWidth: 4,
    },
    taskCardOverdue: {
      borderLeftColor: theme.colors.error,
    },
    taskCardToday: {
      borderLeftColor: theme.colors.primary,
    },
    taskHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.xs,
    },
    taskTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      flex: 1,
    },
    priorityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginLeft: theme.spacing.sm,
    },
    taskMeta: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    taskNotes: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    actionButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
    },
    deferButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    commitButton: {
      backgroundColor: theme.colors.primary,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    deferButtonText: {
      color: theme.colors.text,
    },
    commitButtonText: {
      color: 'white',
    },
    completedButton: {
      backgroundColor: theme.colors.success,
    },
    completedButtonText: {
      color: 'white',
    },
    footer: {
      marginTop: theme.spacing.lg,
    },
    doneButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
    },
    doneButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={{ flex: 1 }} 
          onPress={handleClose}
          activeOpacity={1}
        />
        <Animated.View 
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.header}>
            <RNText style={styles.title}>Daily Planner</RNText>
            <TouchableOpacity onPress={handleClose}>
              <RNText style={styles.closeButton}>×</RNText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Smart Planning Summary */}
            {remainingTasks.length > 0 && (
              <View style={styles.section}>
                <RNText style={styles.sectionTitle}>📊 Smart Planning</RNText>
                <View style={[styles.taskCard, { backgroundColor: theme.colors.background }]}>
                  <RNText style={styles.taskTitle}>Today's Overview</RNText>
                  <RNText style={styles.taskMeta}>
                    Available time: {TimeEstimateManager.formatDuration(availableTime)}
                  </RNText>
                  <RNText style={styles.taskMeta}>
                    Total estimated: {TimeEstimateManager.formatDuration(totalEstimatedTime)}
                  </RNText>
                  <RNText style={[
                    styles.taskMeta,
                    { color: canFitAll ? theme.colors.success : theme.colors.warning }
                  ]}>
                    {canFitAll ? '✅ All tasks fit in your schedule!' : '⚠️ Some tasks may need to be deferred'}
                  </RNText>
                </View>
              </View>
            )}

            {remainingTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <RNText style={styles.emptyText}>
                  {allProcessed ? 'All tasks planned! Great job! 🎉' : 'No tasks to plan for today.'}
                </RNText>
              </View>
            ) : (
              <>
                {overdueTasks.length > 0 && (
                  <View style={styles.section}>
                    <RNText style={styles.sectionTitle}>🔴 Overdue Tasks</RNText>
                    {suggestedTasks
                      .filter(task => overdueTasks.some(ot => ot.id === task.id))
                      .filter(task => !processedTasks.has(task.id))
                      .map((task) => (
                        <View key={task.id} style={[styles.taskCard, styles.taskCardOverdue]}>
                          <View style={styles.taskHeader}>
                            <RNText style={styles.taskTitle}>{task.title}</RNText>
                            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
                          </View>
                          {task.dueDate && (
                            <RNText style={styles.taskMeta}>
                              Due: {formatDateForDisplay(task.dueDate)}
                            </RNText>
                          )}
                          {task.estimatedDuration && (
                            <RNText style={styles.taskMeta}>
                              ⏱️ Estimated: {TimeEstimateManager.formatDuration(task.estimatedDuration)}
                            </RNText>
                          )}
                          {task.notes && (
                            <RNText style={styles.taskNotes}>{task.notes}</RNText>
                          )}
                          <View style={styles.actionsContainer}>
                            <TouchableOpacity
                              style={[styles.actionButton, styles.deferButton]}
                              onPress={() => handleDeferToTomorrow(task.id)}
                            >
                              <RNText style={styles.deferButtonText}>Defer</RNText>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.actionButton, styles.commitButton]}
                              onPress={() => handleCommitToToday(task.id)}
                            >
                              <RNText style={styles.commitButtonText}>Commit</RNText>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                  </View>
                )}

                {todayTasks.length > 0 && (
                  <View style={styles.section}>
                    <RNText style={styles.sectionTitle}>📅 Today's Tasks</RNText>
                    {suggestedTasks
                      .filter(task => todayTasks.some(tt => tt.id === task.id))
                      .filter(task => !processedTasks.has(task.id))
                      .map((task) => (
                        <View key={task.id} style={[styles.taskCard, styles.taskCardToday]}>
                          <View style={styles.taskHeader}>
                            <RNText style={styles.taskTitle}>{task.title}</RNText>
                            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
                          </View>
                          {task.dueDate && (
                            <RNText style={styles.taskMeta}>
                              Due: {formatDateForDisplay(task.dueDate)}
                            </RNText>
                          )}
                          {task.estimatedDuration && (
                            <RNText style={styles.taskMeta}>
                              ⏱️ Estimated: {TimeEstimateManager.formatDuration(task.estimatedDuration)}
                            </RNText>
                          )}
                          {task.notes && (
                            <RNText style={styles.taskNotes}>{task.notes}</RNText>
                          )}
                          <View style={styles.actionsContainer}>
                            <TouchableOpacity
                              style={[styles.actionButton, styles.deferButton]}
                              onPress={() => handleDeferToTomorrow(task.id)}
                            >
                              <RNText style={styles.deferButtonText}>Defer</RNText>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.actionButton, styles.commitButton]}
                              onPress={() => handleCommitToToday(task.id)}
                            >
                              <RNText style={styles.commitButtonText}>Keep</RNText>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                  </View>
                )}
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
              <RNText style={styles.doneButtonText}>
                {allProcessed ? 'Done' : `Skip (${remainingTasks.length} remaining)`}
              </RNText>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
