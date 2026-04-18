import React, { useCallback } from 'react';
import { View, Text as RNText, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Ionicons } from '@expo/vector-icons';
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

const PRIORITY_CONFIG: Record<Priority, { color: string; label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  high: { color: '#EF4444', label: 'HIGH', icon: 'arrow-up' },
  med:  { color: '#F59E0B', label: 'MED',  icon: 'remove' },
  low:  { color: '#10B981', label: 'LOW',  icon: 'arrow-down' },
};

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onComplete,
  onDelete,
  drag,
  isActive,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
}) => {
  const theme = useTheme();
  const swipeableRef = React.useRef<Swipeable>(null);
  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.med;

  const handleComplete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete(task.id);
    swipeableRef.current?.close();
  }, [task.id, onComplete]);

  const handleDelete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onDelete(task.id);
    swipeableRef.current?.close();
  }, [task.id, onDelete]);

  const renderRightActions = (progress: any) => {
    const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
    return (
      <View style={[swipeStyles.actionContainer, { backgroundColor: theme.colors.success }]}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="checkmark-circle" size={28} color="#FFF" />
        </Animated.View>
      </View>
    );
  };

  const renderLeftActions = (progress: any) => {
    const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
    return (
      <View style={[swipeStyles.actionContainer, { backgroundColor: theme.colors.error }]}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash-outline" size={26} color="#FFF" />
        </Animated.View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      opacity: isActive ? 0.75 : 1,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...(theme.shadows.sm as object),
    },
    priorityStripe: {
      width: 4,
      alignSelf: 'stretch',
      backgroundColor: priority.color,
      borderTopLeftRadius: theme.borderRadius.md,
      borderBottomLeftRadius: theme.borderRadius.md,
    },
    taskContent: {
      flex: 1,
      padding: theme.spacing.md,
    },
    taskHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: task.isCompleted ? theme.colors.success : theme.colors.border,
      backgroundColor: task.isCompleted ? theme.colors.success : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1,
    },
    titleWrapper: { flex: 1 },
    taskTitle: {
      fontSize: theme.typography.bodyLarge,
      fontWeight: '600',
      color: task.isCompleted ? theme.colors.textSecondary : theme.colors.text,
      textDecorationLine: task.isCompleted ? 'line-through' : 'none',
      lineHeight: 22,
    },
    priorityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      backgroundColor: priority.color + '22',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    priorityBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: priority.color,
      letterSpacing: 0.5,
    },
    meta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xs,
      paddingLeft: 30,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    metaText: {
      fontSize: theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    taskNotes: {
      fontSize: theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
      paddingLeft: 30,
      lineHeight: 18,
    },
    dragHandle: {
      paddingLeft: theme.spacing.xs,
      paddingTop: 2,
    },
    row: { flexDirection: 'row', alignItems: 'stretch' },
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
        <View style={styles.row}>
          {/* Priority stripe */}
          <View style={styles.priorityStripe} />

          {/* Content */}
          <RectButton style={styles.taskContent} onPress={() => {}}>
            <View style={styles.taskHeader}>
              {/* Checkbox */}
              <TouchableOpacity style={styles.checkbox} onPress={handleComplete}>
                {task.isCompleted && (
                  <Ionicons name="checkmark" size={13} color="#FFF" />
                )}
              </TouchableOpacity>

              {/* Title + priority badge */}
              <View style={styles.titleWrapper}>
                <RNText style={styles.taskTitle}>{task.title}</RNText>
              </View>

              {/* Priority badge */}
              <View style={styles.priorityBadge}>
                <Ionicons name={priority.icon} size={9} color={priority.color} />
                <RNText style={styles.priorityBadgeText}>{priority.label}</RNText>
              </View>

              {/* Drag handle */}
              {drag && (
                <TouchableOpacity onLongPress={drag} style={styles.dragHandle}>
                  <Ionicons name="menu-outline" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Notes */}
            {task.notes ? (
              <RNText style={styles.taskNotes} numberOfLines={2}>{task.notes}</RNText>
            ) : null}

            {/* Meta row */}
            {(task.estimatedDuration || task.recurrence || task.dueDate) && (
              <View style={styles.meta}>
                {task.estimatedDuration ? (
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={11} color={theme.colors.textSecondary} />
                    <RNText style={styles.metaText}>
                      {TimeEstimateManager.formatDuration(task.estimatedDuration)}
                      {task.timeSpent ? ` · ✓${TimeEstimateManager.formatDuration(task.timeSpent)}` : ''}
                    </RNText>
                  </View>
                ) : null}
                {task.recurrence && !task.isRecurringInstance ? (
                  <View style={styles.metaItem}>
                    <Ionicons name="repeat-outline" size={11} color={theme.colors.primary} />
                    <RNText style={[styles.metaText, { color: theme.colors.primary }]}>
                      {RecurrenceManager.getRecurrenceDescription(task.recurrence)}
                    </RNText>
                  </View>
                ) : null}
                {task.isRecurringInstance ? (
                  <View style={styles.metaItem}>
                    <Ionicons name="sync-outline" size={11} color={theme.colors.primary} />
                    <RNText style={[styles.metaText, { color: theme.colors.primary }]}>recurring</RNText>
                  </View>
                ) : null}
              </View>
            )}

            {/* Subtasks */}
            {(SubtaskManager.hasSubtasks(task) || onAddSubtask) && (
              <SubtaskList
                task={task}
                onTaskUpdate={() => {}}
                onAddSubtask={(t) => onAddSubtask?.(task.id, t)}
                onToggleSubtask={(id) => onToggleSubtask?.(task.id, id)}
                onUpdateSubtask={(id, t) => onUpdateSubtask?.(task.id, id, t)}
                onDeleteSubtask={(id) => onDeleteSubtask?.(task.id, id)}
              />
            )}
          </RectButton>
        </View>
      </View>
    </Swipeable>
  );
};

const swipeStyles = StyleSheet.create({
  actionContainer: {
    width: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
