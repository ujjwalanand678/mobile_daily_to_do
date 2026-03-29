import React, { useState, useCallback } from 'react';
import { View, Text as RNText, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Subtask } from '../types';
import { useTheme } from '../theme/theme';
import * as Haptics from 'expo-haptics';

interface SubtaskItemProps {
  subtask: Subtask;
  onToggle: (subtaskId: string) => void;
  onUpdate: (subtaskId: string, title: string) => void;
  onDelete: (subtaskId: string) => void;
  isEditing?: boolean;
  onEditToggle?: () => void;
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({
  subtask,
  onToggle,
  onUpdate,
  onDelete,
  isEditing = false,
  onEditToggle,
}) => {
  const theme = useTheme();
  const [editTitle, setEditTitle] = useState(subtask.title);
  const [isEditingLocal, setIsEditingLocal] = useState(isEditing);

  const handleToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(subtask.id);
  }, [subtask.id, onToggle]);

  const handleEdit = useCallback(() => {
    setIsEditingLocal(true);
    onEditToggle?.();
  }, [onEditToggle]);

  const handleSave = useCallback(() => {
    if (editTitle.trim() && editTitle !== subtask.title) {
      onUpdate(subtask.id, editTitle.trim());
    }
    setIsEditingLocal(false);
  }, [editTitle, subtask.id, subtask.title, onUpdate]);

  const handleCancel = useCallback(() => {
    setEditTitle(subtask.title);
    setIsEditingLocal(false);
  }, [subtask.title]);

  const handleDelete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete(subtask.id);
  }, [subtask.id, onDelete]);

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.xs,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.border,
      marginRight: theme.spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    checkboxText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
    },
    contentContainer: {
      flex: 1,
    },
    title: {
      fontSize: 14,
      color: theme.colors.text,
      flex: 1,
    },
    titleCompleted: {
      textDecorationLine: 'line-through',
      color: theme.colors.textSecondary,
    },
    input: {
      fontSize: 14,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      flex: 1,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    actionButton: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      padding: theme.spacing.xs,
    },
    deleteButton: {
      color: theme.colors.error,
    },
  });

  if (isEditingLocal) {
    return (
      <View style={styles.container}>
        <View style={styles.checkbox} />
        <View style={styles.contentContainer}>
          <TextInput
            style={styles.input}
            value={editTitle}
            onChangeText={setEditTitle}
            onSubmitEditing={handleSave}
            autoFocus
            multiline
            blurOnSubmit={false}
          />
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleSave}>
            <RNText style={[styles.actionButton, { color: theme.colors.primary }]}>✓</RNText>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCancel}>
            <RNText style={styles.actionButton}>×</RNText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.checkbox,
          subtask.isCompleted && styles.checkboxChecked,
        ]}
        onPress={handleToggle}
      >
        {subtask.isCompleted && (
          <RNText style={styles.checkboxText}>✓</RNText>
        )}
      </TouchableOpacity>
      <View style={styles.contentContainer}>
        <RNText style={[
          styles.title,
          subtask.isCompleted && styles.titleCompleted,
        ]}>
          {subtask.title}
        </RNText>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleEdit}>
          <RNText style={styles.actionButton}>✏️</RNText>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete}>
          <RNText style={[styles.actionButton, styles.deleteButton]}>🗑️</RNText>
        </TouchableOpacity>
      </View>
    </View>
  );
};
