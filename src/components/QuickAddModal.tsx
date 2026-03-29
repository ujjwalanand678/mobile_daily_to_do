import React, { useState, useEffect } from 'react';
import { View, Text as RNText, TextInput, Modal, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { Priority, Folder, Tag, RecurrenceRule } from '../types';
import { useTheme } from '../theme/theme';
import { DateParser, formatDateForDisplay } from '../utils/nlp';
import { RecurrenceManager } from '../utils/recurrence';
import { RecurrenceSelector } from './RecurrenceSelector';
import { TimeEstimateInput } from './TimeEstimateInput';

interface QuickAddModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTask: (task: { 
    title: string; 
    notes?: string; 
    priority: Priority; 
    folderId: string; 
    tags: string[]; 
    dueDate?: Date;
    recurrence?: RecurrenceRule;
    estimatedDuration?: number;
  }) => void;
  folders: Folder[];
  tags: Tag[];
  allTasks?: any[]; // For time estimate suggestions
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ 
  visible, 
  onClose, 
  onAddTask,
  folders,
  tags,
  allTasks
}) => {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('med');
  const [selectedFolderId, setSelectedFolderId] = useState('default');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [parsedDueDate, setParsedDueDate] = useState<Date | undefined>();
  const [showDatePreview, setShowDatePreview] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrenceRule | undefined>();
  const [showRecurrenceSelector, setShowRecurrenceSelector] = useState(false);
  const [estimatedDuration, setEstimatedDuration] = useState<number | undefined>();

  // Parse date/time from title as user types
  useEffect(() => {
    if (title.trim()) {
      const parsed = DateParser.parseDateTime(title);
      if (parsed) {
        setTitle(parsed.cleanedText);
        setParsedDueDate(parsed.date);
        setShowDatePreview(true);
      } else {
        setParsedDueDate(undefined);
        setShowDatePreview(false);
      }
    } else {
      setParsedDueDate(undefined);
      setShowDatePreview(false);
    }
  }, [title]);
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(100)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
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
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleAdd = () => {
    if (title.trim()) {
      onAddTask({
        title: title.trim(),
        notes: notes.trim() || undefined,
        priority,
        folderId: selectedFolderId,
        tags: selectedTagIds,
        dueDate: parsedDueDate,
        recurrence,
        estimatedDuration,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setTitle('');
    setNotes('');
    setPriority('med');
    setSelectedFolderId('default');
    setSelectedTagIds([]);
    setParsedDueDate(undefined);
    setShowDatePreview(false);
    setRecurrence(undefined);
    setShowRecurrenceSelector(false);
    setEstimatedDuration(undefined);
    onClose();
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case 'high': return theme.colors.error;
      case 'med': return theme.colors.warning;
      case 'low': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  };

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
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    closeButton: {
      fontSize: 24,
      color: theme.colors.textSecondary,
      padding: theme.spacing.xs,
    },
    input: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontSize: 16,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.md,
    },
    notesInput: {
      height: 80,
      textAlignVertical: 'top',
    },
    priorityContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg,
    },
    priorityButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      marginHorizontal: theme.spacing.xs,
    },
    priorityButtonActive: {
      borderWidth: 2,
    },
    priorityText: {
      fontSize: 14,
      fontWeight: '600',
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
    },
    addButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    folderContainer: {
      marginBottom: theme.spacing.lg,
    },
    folderButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      marginBottom: theme.spacing.xs,
    },
    folderButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    folderButtonInactive: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
    },
    folderText: {
      fontSize: 14,
      fontWeight: '500',
    },
    tagsContainer: {
      marginBottom: theme.spacing.lg,
    },
    tagButton: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      marginRight: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
    tagButtonActive: {
      backgroundColor: theme.colors.secondary,
      borderColor: theme.colors.secondary,
    },
    tagButtonInactive: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
    },
    tagText: {
      fontSize: 12,
      fontWeight: '500',
    },
    datePreview: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    datePreviewText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '500',
    },
    recurrenceContainer: {
      marginBottom: theme.spacing.lg,
    },
    recurrenceButton: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    recurrenceButtonActive: {
      backgroundColor: theme.colors.secondary,
      borderColor: theme.colors.secondary,
    },
    recurrenceText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    recurrenceTextActive: {
      color: 'white',
    },
    recurrenceDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    recurrenceDescriptionActive: {
      color: 'rgba(255, 255, 255, 0.8)',
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
            <RNText style={styles.title}>Quick Add Task</RNText>
            <TouchableOpacity onPress={handleClose}>
              <RNText style={styles.closeButton}>×</RNText>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              style={styles.input}
              placeholder="Task title (e.g., 'Call Mom tomorrow at 5pm')"
              placeholderTextColor={theme.colors.textSecondary}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />

            {/* Date Preview */}
            {showDatePreview && parsedDueDate && (
              <View style={styles.datePreview}>
                <RNText style={styles.datePreviewText}>
                  📅 {formatDateForDisplay(parsedDueDate)}
                </RNText>
              </View>
            )}

            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Notes (optional)"
              placeholderTextColor={theme.colors.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            {/* Priority Selection */}
            <View style={styles.priorityContainer}>
              {(['low', 'med', 'high'] as Priority[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityButton,
                    priority === p && {
                      backgroundColor: getPriorityColor(p),
                      borderColor: getPriorityColor(p),
                    },
                    priority !== p && {
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                    },
                    styles.priorityButtonActive,
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <RNText style={[
                    styles.priorityText,
                    { color: priority === p ? 'white' : theme.colors.text }
                  ]}>
                    {p.toUpperCase()}
                  </RNText>
                </TouchableOpacity>
              ))}
            </View>

            {/* Folder Selection */}
            <View style={styles.folderContainer}>
              <RNText style={styles.sectionTitle}>Folder</RNText>
              {folders.map((folder) => (
                <TouchableOpacity
                  key={folder.id}
                  style={[
                    styles.folderButton,
                    selectedFolderId === folder.id 
                      ? styles.folderButtonActive 
                      : styles.folderButtonInactive,
                  ]}
                  onPress={() => setSelectedFolderId(folder.id)}
                >
                  <RNText style={[
                    styles.folderText,
                    { 
                      color: selectedFolderId === folder.id 
                        ? 'white' 
                        : theme.colors.text 
                    }
                  ]}>
                    {folder.name}
                  </RNText>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tag Selection */}
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                <RNText style={styles.sectionTitle}>Tags</RNText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {tags.map((tag) => (
                    <TouchableOpacity
                      key={tag.id}
                      style={[
                        styles.tagButton,
                        selectedTagIds.includes(tag.id) 
                          ? styles.tagButtonActive 
                          : styles.tagButtonInactive,
                      ]}
                      onPress={() => toggleTag(tag.id)}
                    >
                      <RNText style={[
                        styles.tagText,
                        { 
                          color: selectedTagIds.includes(tag.id) 
                            ? 'white' 
                            : theme.colors.text 
                        }
                      ]}>
                        {tag.name}
                      </RNText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Time Estimate */}
            <TimeEstimateInput
              value={estimatedDuration}
              onChange={setEstimatedDuration}
              taskTitle={title}
              allTasks={allTasks}
            />

            {/* Recurrence Selection */}
            <View style={styles.recurrenceContainer}>
              <RNText style={styles.sectionTitle}>Repeat</RNText>
              <TouchableOpacity
                style={[
                  styles.recurrenceButton,
                  recurrence && styles.recurrenceButtonActive,
                ]}
                onPress={() => setShowRecurrenceSelector(true)}
              >
                <View>
                  <RNText style={[
                    styles.recurrenceText,
                    recurrence && styles.recurrenceTextActive,
                  ]}>
                    {recurrence ? RecurrenceManager.getRecurrenceDescription(recurrence) : 'No repeat'}
                  </RNText>
                  {recurrence && (
                    <RNText style={[
                      styles.recurrenceDescription,
                      styles.recurrenceDescriptionActive,
                    ]}>
                      Task will repeat automatically
                    </RNText>
                  )}
                </View>
                <RNText style={[
                  styles.recurrenceText,
                  recurrence && styles.recurrenceTextActive,
                ]}>
                  {recurrence ? '🔄' : '➕'}
                </RNText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <RNText style={styles.addButtonText}>Add Task</RNText>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </Animated.View>
      
      {/* Recurrence Selector Modal */}
      <RecurrenceSelector
        visible={showRecurrenceSelector}
        onClose={() => setShowRecurrenceSelector(false)}
        onSelect={setRecurrence}
        currentRecurrence={recurrence}
      />
    </Modal>
  );
};
