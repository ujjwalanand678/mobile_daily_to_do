import React, { useCallback } from 'react';
import { View, Text as RNText, TouchableOpacity, StyleSheet } from 'react-native';
import { Task } from '../types';
import { useTheme } from '../theme/theme';
import { TimeEstimateManager } from '../utils/timeEstimates';
import * as Haptics from 'expo-haptics';

interface DraggableTaskItemProps {
  task: Task;
  onLongPress?: () => void;
  onPress?: () => void;
  isDragging?: boolean;
  isActive?: boolean;
}

export const DraggableTaskItem: React.FC<DraggableTaskItemProps> = ({
  task,
  onLongPress,
  onPress,
  isDragging = false,
  isActive = false,
}) => {
  const theme = useTheme();

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress?.();
  }, [onLongPress]);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'high': return theme.colors.error;
      case 'med': return theme.colors.warning;
      case 'low': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  }, [theme.colors]);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.sm,
      marginHorizontal: theme.spacing.xs,
      marginVertical: theme.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      opacity: isDragging ? 0.8 : 1,
    },
    containerActive: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    title: {
      flex: 1,
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    priorityDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginLeft: theme.spacing.xs,
    },
    metaContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    metaText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    durationText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    dragHandle: {
      position: 'absolute',
      left: 4,
      top: '50%',
      transform: [{ translateY: -12 }],
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.containerActive]}
      onPress={onPress}
      onLongPress={handleLongPress}
      delayLongPress={500}
    >
      <View style={styles.header}>
        <RNText style={styles.title} numberOfLines={2}>
          {task.title}
        </RNText>
        <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
      </View>
      
      <View style={styles.metaContainer}>
        {task.estimatedDuration && (
          <RNText style={styles.durationText}>
            ⏱️ {TimeEstimateManager.formatDuration(task.estimatedDuration)}
          </RNText>
        )}
        {task.scheduledTime && (
          <RNText style={styles.metaText}>
            {`📅 ${new Date(task.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          </RNText>
        )}
      </View>
      
      <RNText style={styles.dragHandle}>⋮⋮</RNText>
    </TouchableOpacity>
  );
};
