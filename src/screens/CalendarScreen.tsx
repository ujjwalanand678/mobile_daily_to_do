import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/theme';
import { TaskItem } from '../components/TaskItem';
import { CalendarSchedulingManager } from '../utils/calendarScheduling';
import { TimeSlot } from '../components/TimeSlot';

export const CalendarScreen: React.FC = () => {
  const theme = useTheme();
  const { 
    tasks, 
    toggleTask, 
    deleteTask,
    scheduleTask,
    unscheduleTask,
    rescheduleTask,
    autoScheduleTasks
  } = useAppStore();
  
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewMode, setViewMode] = useState<'calendar' | 'schedule'>('schedule');

  // Helper to format date as YYYY-MM-DD for the calendar
  const formatDateForCalendar = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};

    tasks.forEach((task) => {
      if (task.dueDate && !task.isCompleted) {
        const dateStr = formatDateForCalendar(new Date(task.dueDate));
        
        if (!marks[dateStr]) {
          marks[dateStr] = { marked: true, dots: [] };
        }

        // Add a dot representing the task priority
        const dotColor = task.priority === 'high' 
          ? theme.colors.error 
          : task.priority === 'med' 
            ? theme.colors.warning 
            : theme.colors.success;

        // Avoid adding too many dots for the same priority
        if (marks[dateStr].dots.length < 3) {
           marks[dateStr].dots.push({ key: task.id, color: dotColor });
        }
      }
    });

    // Mark the selected date
    if (marks[selectedDate]) {
      marks[selectedDate] = { 
        ...marks[selectedDate], 
        selected: true, 
        selectedColor: theme.colors.primary 
      };
    } else {
      marks[selectedDate] = { 
        selected: true, 
        selectedColor: theme.colors.primary 
      };
    }

    return marks;
  }, [tasks, selectedDate, theme.colors]);

  const tasksForSelectedDate = useMemo(() => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      return formatDateForCalendar(new Date(task.dueDate)) === selectedDate;
    });
  }, [tasks, selectedDate]);

  // Calendar scheduling data
  const selectedDateObj = useMemo(() => new Date(selectedDate), [selectedDate]);
  const timeSlots = useMemo(() => 
    CalendarSchedulingManager.generateTimeSlots(selectedDateObj), 
    [selectedDateObj]
  );
  const tasksByTimeSlots = useMemo(() => 
    CalendarSchedulingManager.getTasksByTimeSlots(tasks, selectedDateObj), 
    [tasks, selectedDateObj]
  );

  const handleAutoSchedule = () => {
    autoScheduleTasks(selectedDateObj);
  };

  const handleTaskPress = (task: Task) => {
    // Could show task details or options
  };

  const handleTaskLongPress = (task: Task) => {
    // Could enable drag mode or show options
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    viewToggle: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.xs,
      marginTop: theme.spacing.md,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
    },
    toggleButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    toggleText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    toggleTextActive: {
      color: 'white',
    },
    autoScheduleButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      alignItems: 'center',
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    autoScheduleText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
    calendar: {
      marginBottom: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginHorizontal: theme.spacing.md,
      ...Platform.select({
        web: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
        default: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        },
      }),
    },
    listHeader: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    listHeaderTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xxl,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'schedule' && styles.toggleButtonActive,
            ]}
            onPress={() => setViewMode('schedule')}
          >
            <Text style={[
              styles.toggleText,
              viewMode === 'schedule' && styles.toggleTextActive,
            ]}>
              Schedule
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'calendar' && styles.toggleButtonActive,
            ]}
            onPress={() => setViewMode('calendar')}
          >
            <Text style={[
              styles.toggleText,
              viewMode === 'calendar' && styles.toggleTextActive,
            ]}>
              Calendar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'schedule' ? (
        <ScrollView>
          <TouchableOpacity style={styles.autoScheduleButton} onPress={handleAutoSchedule}>
            <Text style={styles.autoScheduleText}>🪄 Auto-Schedule Tasks</Text>
          </TouchableOpacity>
          
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
          <Calendar
            style={styles.calendar}
            current={selectedDate}
            onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            markingType={'multi-dot'}
            theme={{
              backgroundColor: theme.colors.surface,
              calendarBackground: theme.colors.surface,
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
              textDayFontWeight: '400',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12,
            }}
          />

          <View style={styles.listHeader}>
            <Text style={styles.listHeaderTitle}>
              Tasks for {new Date(selectedDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>

          <FlatList
            data={tasksForSelectedDate}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskItem
                task={item}
                onComplete={toggleTask}
                onDelete={deleteTask}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No tasks for this day</Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
          />
        </>
      )}
    </View>
  );
};
