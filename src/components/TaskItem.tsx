import React, { useCallback } from 'react';
import { View, Text as RNText, StyleSheet, Animated, Alert, Platform } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Task, Priority } from '../types';
import { useTheme } from '../theme/theme';
import * as Haptics from 'expo-haptics';
import { RecurrenceManager } from '../utils/recurrence';
import { SubtaskManager } from '../utils/subtasks';
import { TimeEstimateManager } from '../utils/timeEstimates';
import { SubtaskList } from './SubtaskList';

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  drag?: () => void;
  isActive?: boolean;
  onAddSubtask?: (taskId: string, title: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onUpdateSubtask?: (taskId: string, subtaskId: string, title: string) => void;
  onDeleteSubtask?: (taskId: string, subtaskId: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onComplete, 
  onDelete, 
  drag, 
  isActive,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask
}) => {
  const theme = useTheme();
  const swipeableRef = React.useRef<Swipeable>(null);

  const getPriorityColor = useCallback((priority: Priority) => {
    switch (priority) {
      case 'high': return theme.colors.error;
      case 'med': return theme.colors.warning;
      case 'low': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  }, [theme.colors]);

  const handleComplete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete(task.id);
    swipeableRef.current?.close();
  }, [task.id, onComplete]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => swipeableRef.current?.close(),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            onDelete(task.id);
            swipeableRef.current?.close();
          },
        },
      ],
      { cancelable: true }
    );
  }, [task.id, onDelete]);

  const handleAddSubtask = useCallback((title: string) => {
    onAddSubtask?.(task.id, title);
  }, [task.id, onAddSubtask]);

  const handleToggleSubtask = useCallback((subtaskId: string) => {
    onToggleSubtask?.(task.id, subtaskId);
  }, [task.id, onToggleSubtask]);

  const handleUpdateSubtask = useCallback((subtaskId: string, title: string) => {
    onUpdateSubtask?.(task.id, subtaskId, title);
  }, [task.id, onUpdateSubtask]);

  const handleDeleteSubtask = useCallback((subtaskId: string) => {
    onDeleteSubtask?.(task.id, subtaskId);
  }, [task.id, onDeleteSubtask]);

  const renderRightActions = (progress: any) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <View style={[styles.actionContainer, { backgroundColor: theme.colors.success }]}>
        <Animated.View style={[styles.actionButton, { transform: [{ scale }] }]}>
          <RNText style={styles.actionText}>✓</RNText>
        </Animated.View>
      </View>
    );
  };

  const renderLeftActions = (progress: any) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <View style={[styles.actionContainer, { backgroundColor: theme.colors.error }]}>
        <Animated.View style={[styles.actionButton, { transform: [{ scale }] }]}>
          <RNText style={styles.actionText}>🗑</RNText>
        </Animated.View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.md,
      ...Platform.select({
        web: {
          boxShadow: `0px 1px 4px ${theme.colors.shadow || 'rgba(0,0,0,0.1)'}`,
        },
        default: {
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        },
      }),
      overflow: 'hidden',
      opacity: isActive ? 0.8 : 1,
    },
    taskContent: {
      padding: theme.spacing.md,
    },
    taskHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    taskTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginLeft: theme.spacing.sm,
    },
    completedTask: {
      textDecorationLine: 'line-through',
      color: theme.colors.textSecondary,
    },
    priorityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginLeft: theme.spacing.sm,
    },
    taskNotes: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.lg,
      marginTop: theme.spacing.xs,
    },
    recurrenceIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xs,
      marginLeft: theme.spacing.lg,
    },
    recurrenceText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    timeEstimateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xs,
      marginLeft: theme.spacing.lg,
    },
    timeEstimateText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    timeSpentText: {
      fontSize: 12,
      color: theme.colors.success,
      fontWeight: '500',
      marginLeft: theme.spacing.sm,
    },
    actionContainer: {
      width: 80,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionText: {
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
    },
  });

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      onSwipeableRightOpen={handleComplete}
      onSwipeableLeftOpen={handleDelete}
      friction={2}
      rightThreshold={40}
      leftThreshold={40}
    >
      <View style={styles.container}>
        <RectButton style={styles.taskContent} onPress={() => {}}>
          <View style={styles.taskHeader}>
            <RNText style={[
              styles.taskTitle,
              task.isCompleted && styles.completedTask
            ]}>
              {task.title}
            </RNText>
            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
          </View>
          
          {task.notes && (
            <RNText style={styles.taskNotes}>{task.notes}</RNText>
          )}
          
          {/* Time Estimate */}
          {task.estimatedDuration && (
            <View style={styles.timeEstimateContainer}>
              <RNText style={styles.timeEstimateText}>
                ⏱️ {TimeEstimateManager.formatDuration(task.estimatedDuration)}
              </RNText>
              {task.timeSpent && (
                <RNText style={styles.timeSpentText}>
                  ✓ {TimeEstimateManager.formatDuration(task.timeSpent)}
                </RNText>
              )}
            </View>
          )}
          
          {/* Recurrence Indicator */}
          {task.recurrence && !task.isRecurringInstance && (
            <View style={styles.recurrenceIndicator}>
              <RNText style={styles.recurrenceText}>
                🔄 {RecurrenceManager.getRecurrenceDescription(task.recurrence)}
              </RNText>
            </View>
          )}
          
          {task.isRecurringInstance && (
            <View style={styles.recurrenceIndicator}>
              <RNText style={styles.recurrenceText}>
                🔁 Recurring instance
              </RNText>
            </View>
          )}

          {/* Subtasks */}
          {(SubtaskManager.hasSubtasks(task) || onAddSubtask) && (
            <SubtaskList
              task={task}
              onTaskUpdate={() => {}}
              onAddSubtask={handleAddSubtask}
              onToggleSubtask={handleToggleSubtask}
              onUpdateSubtask={handleUpdateSubtask}
              onDeleteSubtask={handleDeleteSubtask}
            />
          )}
        </RectButton>
      </View>
    </Swipeable>
  );
};
