import React, { useState, useEffect } from 'react';
import { View, Text as RNText, TextInput, Modal, StyleSheet, TouchableOpacity, Animated, ScrollView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
  allTasks?: any[];
}

const PRIORITY_CONFIG: Record<Priority, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  low:  { label: 'Low',  icon: 'arrow-down-outline', color: '#10B981' },
  med:  { label: 'Med',  icon: 'remove-outline',     color: '#F59E0B' },
  high: { label: 'High', icon: 'arrow-up-outline',   color: '#EF4444' },
};

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  visible,
  onClose,
  onAddTask,
  folders,
  tags,
  allTasks,
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

  const slideAnim = React.useRef(new Animated.Value(600)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 180, friction: 18 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 600, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

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
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId],
    );
  };

  const sheetBgColor = theme.isDark ? 'rgba(16, 14, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)';
  const tint = theme.isDark ? theme.glassmorphism.darkTint : theme.glassmorphism.lightTint;

  const styles = StyleSheet.create({
    root: { flex: 1 },
    overlay: { flex: 1, justifyContent: 'flex-end' },
    sheet: {
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      overflow: 'hidden',
      maxHeight: '92%',
      backgroundColor: sheetBgColor,
    },
    handle: {
      width: 40, height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
      alignSelf: 'center',
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    headerTitle: { fontSize: 22, fontWeight: '800', color: theme.colors.text },
    input: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.md,
      marginHorizontal: theme.spacing.lg,
    },
    notesInput: { height: 72, textAlignVertical: 'top' },
    sectionTitle: {
      fontSize: 11, fontWeight: '700',
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    priorityRow: {
      flexDirection: 'row', gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    priorityBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 5, paddingVertical: 10, borderRadius: theme.borderRadius.md, borderWidth: 1.5,
    },
    priorityBtnText: { fontSize: 13, fontWeight: '700' },
    datePreview: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: theme.colors.primary + '22',
      borderRadius: theme.borderRadius.sm,
      paddingVertical: 8, paddingHorizontal: theme.spacing.md,
      marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md,
    },
    datePreviewText: { color: theme.colors.primary, fontSize: 12, fontWeight: '600' },
    chipRow: {
      flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.lg,
    },
    chip: {
      paddingVertical: 6, paddingHorizontal: 12,
      borderRadius: 20, borderWidth: 1,
      flexDirection: 'row', alignItems: 'center', gap: 4,
    },
    chipText: { fontSize: 13, fontWeight: '600' },
    recurrenceBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      borderWidth: 1, borderColor: theme.colors.border,
      marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.lg,
    },
    addBtnWrapper: { paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.xxl },
    addBtn: {
      borderRadius: theme.borderRadius.md,
      paddingVertical: 16,
      alignItems: 'center', justifyContent: 'center',
      flexDirection: 'row', gap: theme.spacing.sm,
    },
    addBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  });

  const sheetContent = (
    <>
      <View style={styles.handle} />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="add-circle-outline" size={22} color={theme.colors.primary} />
          <RNText style={styles.headerTitle}>New Task</RNText>
        </View>
        <TouchableOpacity onPress={handleClose}>
          <Ionicons name="close-circle" size={26} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <TextInput
          style={styles.input}
          placeholder="What needs to be done?"
          placeholderTextColor={theme.colors.textSecondary}
          value={title}
          onChangeText={setTitle}
          autoFocus
        />

        {/* Date preview */}
        {showDatePreview && parsedDueDate && (
          <View style={styles.datePreview}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.primary} />
            <RNText style={styles.datePreviewText}>{formatDateForDisplay(parsedDueDate)}</RNText>
          </View>
        )}

        {/* Notes */}
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Add notes…"
          placeholderTextColor={theme.colors.textSecondary}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        {/* Priority */}
        <RNText style={styles.sectionTitle}>Priority</RNText>
        <View style={styles.priorityRow}>
          {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(([key, cfg]) => {
            const isActive = priority === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.priorityBtn,
                  { backgroundColor: isActive ? cfg.color + '22' : theme.colors.surface, borderColor: isActive ? cfg.color : theme.colors.border },
                ]}
                onPress={() => setPriority(key)}
              >
                <Ionicons name={cfg.icon} size={14} color={isActive ? cfg.color : theme.colors.textSecondary} />
                <RNText style={[styles.priorityBtnText, { color: isActive ? cfg.color : theme.colors.textSecondary }]}>{cfg.label}</RNText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Folder */}
        <RNText style={styles.sectionTitle}>Folder</RNText>
        <View style={styles.chipRow}>
          {folders.map((folder: Folder) => {
            const isActive = selectedFolderId === folder.id;
            return (
              <TouchableOpacity
                key={folder.id}
                style={[styles.chip, { backgroundColor: isActive ? theme.colors.primary + '22' : theme.colors.surface, borderColor: isActive ? theme.colors.primary : theme.colors.border }]}
                onPress={() => setSelectedFolderId(folder.id)}
              >
                <Ionicons name="folder-outline" size={13} color={isActive ? theme.colors.primary : theme.colors.textSecondary} />
                <RNText style={[styles.chipText, { color: isActive ? theme.colors.primary : theme.colors.text }]}>{folder.name}</RNText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tags */}
        {tags.length > 0 && (
          <>
            <RNText style={styles.sectionTitle}>Tags</RNText>
            <View style={styles.chipRow}>
              {tags.map((tag: Tag) => {
                const isActive = selectedTagIds.includes(tag.id);
                return (
                  <TouchableOpacity
                    key={tag.id}
                    style={[styles.chip, { backgroundColor: isActive ? tag.color + '33' : theme.colors.surface, borderColor: isActive ? tag.color : theme.colors.border }]}
                    onPress={() => toggleTag(tag.id)}
                  >
                    <Ionicons name="pricetag-outline" size={12} color={isActive ? tag.color : theme.colors.textSecondary} />
                    <RNText style={[styles.chipText, { color: isActive ? tag.color : theme.colors.text }]}>{tag.name}</RNText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Time estimate */}
        <TimeEstimateInput value={estimatedDuration} onChange={setEstimatedDuration} taskTitle={title} allTasks={allTasks} />

        {/* Recurrence */}
        <RNText style={styles.sectionTitle}>Repeat</RNText>
        <TouchableOpacity style={styles.recurrenceBtn} onPress={() => setShowRecurrenceSelector(true)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="repeat-outline" size={18} color={recurrence ? theme.colors.primary : theme.colors.textSecondary} />
            <RNText style={{ fontSize: 15, color: recurrence ? theme.colors.primary : theme.colors.text, fontWeight: '500' }}>
              {recurrence ? RecurrenceManager.getRecurrenceDescription(recurrence) : 'No repeat'}
            </RNText>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        {/* Add Button */}
        <View style={styles.addBtnWrapper}>
          <TouchableOpacity onPress={handleAdd} disabled={!title.trim()} activeOpacity={0.85}>
            <LinearGradient
              colors={[theme.colors.primaryGradientStart, theme.colors.primaryGradientEnd]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.addBtn, { opacity: title.trim() ? 1 : 0.5 }]}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFF" />
              <RNText style={styles.addBtnText}>Add Task</RNText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[styles.root, { opacity: fadeAnim }]}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={20} tint={tint} style={styles.overlay}>
            <TouchableOpacity style={{ flex: 1 }} onPress={handleClose} activeOpacity={1} />
            <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
              {sheetContent}
            </Animated.View>
          </BlurView>
        ) : (
          <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
            <TouchableOpacity style={{ flex: 1 }} onPress={handleClose} activeOpacity={1} />
            <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
              {sheetContent}
            </Animated.View>
          </View>
        )}
      </Animated.View>

      <RecurrenceSelector
        visible={showRecurrenceSelector}
        onClose={() => setShowRecurrenceSelector(false)}
        onSelect={setRecurrence}
        currentRecurrence={recurrence}
      />
    </Modal>
  );
};
