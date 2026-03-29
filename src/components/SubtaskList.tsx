import React, { useState } from 'react';
import { View, Text as RNText, TouchableOpacity, TextInput, StyleSheet, Animated } from 'react-native';
import { Task, Subtask } from '../types';
import { useTheme } from '../theme/theme';
import { SubtaskManager } from '../utils/subtasks';
import { SubtaskItem } from './SubtaskItem';
import * as Haptics from 'expo-haptics';

interface SubtaskListProps {
  task: Task;
  onTaskUpdate: (updatedTask: Task) => void;
  onAddSubtask: (title: string) => void;
  onToggleSubtask: (subtaskId: string) => void;
  onUpdateSubtask: (subtaskId: string, title: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
}

export const SubtaskList: React.FC<SubtaskListProps> = ({
  task,
  onTaskUpdate,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
}) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onAddSubtask(newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setShowAddForm(false);
    }
  };

  const handleToggleExpand = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(!isExpanded);
  };

  const handleEditToggle = (subtaskId: string) => {
    setEditingSubtaskId(subtaskId);
  };

  const completionPercentage = SubtaskManager.getCompletionPercentage(task);
  const completedCount = SubtaskManager.getCompletedCount(task);
  const totalCount = SubtaskManager.getTotalCount(task);

  const styles = StyleSheet.create({
    container: {
      marginTop: theme.spacing.sm,
      marginHorizontal: theme.spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    expandButton: {
      fontSize: 16,
      marginRight: theme.spacing.sm,
      color: theme.colors.textSecondary,
    },
    headerText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    progressText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    addButton: {
      fontSize: 16,
      color: theme.colors.primary,
      padding: theme.spacing.xs,
    },
    subtasksContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    addFormContainer: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    input: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
    },
    addButtonForm: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: 'bold',
      padding: theme.spacing.sm,
    },
    cancelButton: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      padding: theme.spacing.sm,
    },
    emptyState: {
      padding: theme.spacing.lg,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
    },
  });

  if (!SubtaskManager.hasSubtasks(task) && !showAddForm) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.header} onPress={() => setShowAddForm(true)}>
          <View style={styles.headerLeft}>
            <RNText style={styles.addButton}>+ Add subtask</RNText>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={handleToggleExpand}>
        <View style={styles.headerLeft}>
          <RNText style={styles.expandButton}>
            {isExpanded ? '▼' : '▶'}
          </RNText>
          <RNText style={styles.headerText}>
            Subtasks ({completedCount}/{totalCount})
          </RNText>
        </View>
        <View style={styles.headerRight}>
          {totalCount > 0 && (
            <RNText style={styles.progressText}>
              {completionPercentage}%
            </RNText>
          )}
          <TouchableOpacity onPress={() => setShowAddForm(!showAddForm)}>
            <RNText style={styles.addButton}>+</RNText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.subtasksContainer}>
          {SubtaskManager.hasSubtasks(task) ? (
            task.subtasks?.map((subtask, index) => (
              <SubtaskItem
                key={subtask.id}
                subtask={subtask}
                onToggle={onToggleSubtask}
                onUpdate={onUpdateSubtask}
                onDelete={onDeleteSubtask}
                isEditing={editingSubtaskId === subtask.id}
                onEditToggle={() => handleEditToggle(subtask.id)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <RNText style={styles.emptyText}>No subtasks yet</RNText>
            </View>
          )}

          {showAddForm && (
            <View style={styles.addFormContainer}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Add a subtask..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={newSubtaskTitle}
                  onChangeText={setNewSubtaskTitle}
                  onSubmitEditing={handleAddSubtask}
                  autoFocus
                />
                <TouchableOpacity onPress={handleAddSubtask}>
                  <RNText style={styles.addButtonForm}>Add</RNText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  setShowAddForm(false);
                  setNewSubtaskTitle('');
                }}>
                  <RNText style={styles.cancelButton}>Cancel</RNText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};
