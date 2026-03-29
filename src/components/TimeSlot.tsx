import React, { useCallback } from 'react';
import { View, Text as RNText, TouchableOpacity, StyleSheet } from 'react-native';
import { Task } from '../types';
import { useTheme } from '../theme/theme';
import { CalendarSchedulingManager } from '../utils/calendarScheduling';
import { DraggableTaskItem } from './DraggableTaskItem';

interface TimeSlotProps {
  time: Date;
  label: string;
  tasks: Task[];
  onTaskPress?: (task: Task) => void;
  onTaskLongPress?: (task: Task) => void;
  onDrop?: (taskId: string, slotTime: Date) => void;
  isDropTarget?: boolean;
  allTasks?: Task[];
}

export const TimeSlot: React.FC<TimeSlotProps> = ({
  time,
  label,
  tasks,
  onTaskPress,
  onTaskLongPress,
  onDrop,
  isDropTarget = false,
  allTasks = [],
}) => {
  const theme = useTheme();

  const handleSlotPress = useCallback(() => {
    // Could show available tasks to schedule here
  }, []);

  const isAvailable = CalendarSchedulingManager.isTimeSlotAvailable(allTasks, time);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.xs,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: isDropTarget ? theme.colors.primary : theme.colors.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    timeLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    statusIndicator: {
      fontSize: 12,
      color: isAvailable ? theme.colors.success : theme.colors.warning,
      fontWeight: '500',
    },
    tasksContainer: {
      padding: theme.spacing.sm,
      minHeight: 60,
    },
    emptySlot: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
    },
    emptyText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
    },
    dropTargetOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.primary,
      opacity: 0.1,
      borderRadius: theme.borderRadius.md,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <RNText style={styles.timeLabel}>{label}</RNText>
        <RNText style={styles.statusIndicator}>
          {isAvailable ? 'Available' : `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`}
        </RNText>
      </View>

      <TouchableOpacity 
        style={styles.tasksContainer}
        onPress={handleSlotPress}
        disabled={tasks.length > 0}
      >
        {tasks.length === 0 ? (
          <View style={styles.emptySlot}>
            <RNText style={styles.emptyText}>
              {isAvailable ? 'Tap to add task' : 'Unavailable'}
            </RNText>
          </View>
        ) : (
          tasks.map((task) => (
            <DraggableTaskItem
              key={task.id}
              task={task}
              onPress={() => onTaskPress?.(task)}
              onLongPress={() => onTaskLongPress?.(task)}
            />
          ))
        )}
      </TouchableOpacity>

      {isDropTarget && (
        <View style={styles.dropTargetOverlay} />
      )}
    </View>
  );
};
