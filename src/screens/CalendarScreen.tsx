import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/theme';
import { TaskItem } from '../components/TaskItem';
import { GlassCard } from '../components/GlassCard';
import { GradientButton } from '../components/GradientButton';
import { CalendarSchedulingManager } from '../utils/calendarScheduling';
import { TimeSlot } from '../components/TimeSlot';
import { Task } from '../types';

export const CalendarScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const {
    tasks,
    toggleTask,
    deleteTask,
    autoScheduleTasks,
  } = useAppStore();

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewMode, setViewMode] = useState<'calendar' | 'schedule'>('schedule');

  const formatDateForCalendar = (date: Date) => date.toISOString().split('T')[0];

  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};
    tasks.forEach(task => {
      if (task.dueDate && !task.isCompleted) {
        const dateStr = formatDateForCalendar(new Date(task.dueDate));
        if (!marks[dateStr]) marks[dateStr] = { marked: true, dots: [] };
        const dotColor = task.priority === 'high' ? theme.colors.error
          : task.priority === 'med' ? theme.colors.warning : theme.colors.success;
        if (marks[dateStr].dots.length < 3) {
          marks[dateStr].dots.push({ key: task.id, color: dotColor });
        }
      }
    });
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: theme.colors.primary,
    };
    return marks;
  }, [tasks, selectedDate, theme.colors]);

  const tasksForSelectedDate = useMemo(() => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return formatDateForCalendar(new Date(task.dueDate)) === selectedDate;
    });
  }, [tasks, selectedDate]);

  const selectedDateObj = useMemo(() => new Date(selectedDate), [selectedDate]);
  const tasksByTimeSlots = useMemo(() =>
    CalendarSchedulingManager.getTasksByTimeSlots(tasks, selectedDateObj),
    [tasks, selectedDateObj],
  );

  const handleTaskPress = (_task: Task) => {};
  const handleTaskLongPress = (_task: Task) => {};

  const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
      paddingTop: insets.top + theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
    },
    title: {
      fontSize: theme.typography.displayMedium,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: -0.5,
      marginBottom: theme.spacing.md,
    },
    toggleWrapper: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: 4,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    toggleBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      borderRadius: theme.borderRadius.sm,
      gap: 6,
    },
    toggleBtnActive: { backgroundColor: theme.colors.primary },
    toggleText: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },
    toggleTextActive: { color: '#FFFFFF' },
    calendarWrapper: {
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    listHeader: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    listHeaderTitle: {
      fontSize: theme.typography.titleMedium,
      fontWeight: '700',
      color: theme.colors.text,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
      gap: theme.spacing.md,
    },
    emptyText: {
      fontSize: theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    autoScheduleWrapper: {
      paddingHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
  });

  return (
    <LinearGradient
      colors={[theme.colors.backgroundGradientStart, theme.colors.backgroundGradientEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        {/* View Toggle */}
        <View style={styles.toggleWrapper}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'schedule' && styles.toggleBtnActive]}
            onPress={() => setViewMode('schedule')}
          >
            <Ionicons
              name="time-outline"
              size={15}
              color={viewMode === 'schedule' ? '#FFF' : theme.colors.textSecondary}
            />
            <Text style={[styles.toggleText, viewMode === 'schedule' && styles.toggleTextActive]}>
              Schedule
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'calendar' && styles.toggleBtnActive]}
            onPress={() => setViewMode('calendar')}
          >
            <Ionicons
              name="calendar-outline"
              size={15}
              color={viewMode === 'calendar' ? '#FFF' : theme.colors.textSecondary}
            />
            <Text style={[styles.toggleText, viewMode === 'calendar' && styles.toggleTextActive]}>
              Calendar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'schedule' ? (
        <ScrollView showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: theme.spacing.xxl + 60 }}>
          <View style={styles.autoScheduleWrapper}>
            <GradientButton
              label="Auto-Schedule Tasks"
              icon="sparkles"
              onPress={() => autoScheduleTasks(selectedDateObj)}
              fullWidth
            />
          </View>
          {tasksByTimeSlots.map(({ slot, tasks: slotTasks }) => (
            <TimeSlot
              key={slot.time.toISOString()}
              time={slot.time}
              label={slot.label}
              tasks={slotTasks}
              onTaskPress={handleTaskPress}
              onTaskLongPress={handleTaskLongPress}
              allTasks={tasks}
            />
          ))}
        </ScrollView>
      ) : (
        <>
          <View style={styles.calendarWrapper}>
            <Calendar
              current={selectedDate}
              onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
              markedDates={markedDates}
              markingType={'multi-dot'}
              theme={{
                backgroundColor: theme.isDark ? theme.colors.surfaceSolid : '#FFFFFF',
                calendarBackground: theme.isDark ? theme.colors.surfaceSolid : '#FFFFFF',
                textSectionTitleColor: theme.colors.textSecondary,
                selectedDayBackgroundColor: theme.colors.primary,
                selectedDayTextColor: '#ffffff',
                todayTextColor: theme.colors.primary,
                dayTextColor: theme.colors.text,
                textDisabledColor: theme.colors.border,
                dotColor: theme.colors.primary,
                selectedDotColor: '#ffffff',
                arrowColor: theme.colors.primary,
                monthTextColor: theme.colors.text,
                indicatorColor: theme.colors.primary,
                textDayFontWeight: '500',
                textMonthFontWeight: '700',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 12,
              }}
            />
          </View>

          <View style={styles.listHeader}>
            <Text style={styles.listHeaderTitle}>
              {new Date(selectedDate).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
              })}
            </Text>
          </View>

          <FlatList
            data={tasksForSelectedDate}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TaskItem task={item} onComplete={toggleTask} onDelete={deleteTask} />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={40} color={theme.colors.primary} />
                <Text style={styles.emptyText}>No tasks scheduled for this day</Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: theme.spacing.xxl + 60 }}
          />
        </>
      )}
    </LinearGradient>
  );
};
