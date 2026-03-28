import React, { useCallback } from 'react';
import { View, Text as RNText, StyleSheet, Animated } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Task, Priority } from '../types';
import { useTheme } from '../theme/theme';
import * as Haptics from 'expo-haptics';

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  drag?: () => void;
  isActive?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onComplete, 
  onDelete, 
  drag, 
  isActive 
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onDelete(task.id);
    swipeableRef.current?.close();
  }, [task.id, onDelete]);

  const renderRightActions = (progress: Animated.AnimatedAddition) => {
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

  const renderLeftActions = (progress: Animated.AnimatedAddition) => {
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
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
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
        </RectButton>
      </View>
    </Swipeable>
  );
};
