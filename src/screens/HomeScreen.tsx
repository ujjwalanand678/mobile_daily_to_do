import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Text as RNText, StyleSheet, TextInput, TouchableOpacity, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { useAppStore } from '../store/useAppStore';
import { Priority, Task, RecurrenceRule } from '../types';
import { useTheme } from '../theme/theme';
import { TaskItem } from '../components/TaskItem';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { QuickAddModal } from '../components/QuickAddModal';
import { SmartLists } from '../components/SmartLists';
import { DailyPlannerModal } from '../components/DailyPlannerModal';
import { DailyPlannerUtils } from '../utils/dailyPlanner';

type SmartListType = 'inbox' | 'today' | 'upcoming';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning 👋';
  if (hour < 17) return 'Good Afternoon 🌤';
  return 'Good Evening 🌙';
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const {
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    undoDeleteTask,
    permanentlyDeleteTask,
    tasksPendingDeletion,
    folders,
    tags,
    requestNotificationPermissions,
    updateTask,
    checkAndCreateRecurringInstances,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    updateSubtask,
  } = useAppStore();

  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedSmartList, setSelectedSmartList] = useState<SmartListType>('inbox');
  const [showDailyPlanner, setShowDailyPlanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // Undo snackbar state
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [lastDeletedTaskId, setLastDeletedTaskId] = useState<string | null>(null);
  const snackbarAnim = useRef(new Animated.Value(0)).current;
  const deletionTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    requestNotificationPermissions();
    checkAndCreateRecurringInstances();

    if (DailyPlannerUtils.shouldShowDailyPlanner()) {
      const todayTasks = DailyPlannerUtils.getTodayTasks(tasks);
      const overdueTasks = DailyPlannerUtils.getOverdueTasks(tasks);
      if (todayTasks.length > 0 || overdueTasks.length > 0) {
        setShowDailyPlanner(true);
      }
    }

    return () => {
      Object.values(deletionTimers.current).forEach(clearTimeout);
    };
  }, [requestNotificationPermissions, checkAndCreateRecurringInstances]);

  useEffect(() => {
    const latestPendingId = tasksPendingDeletion[tasksPendingDeletion.length - 1];
    if (latestPendingId && latestPendingId !== lastDeletedTaskId) {
      setLastDeletedTaskId(latestPendingId);
      setShowSnackbar(true);

      Animated.spring(snackbarAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 12,
      }).start();

      const timer = setTimeout(() => {
        permanentlyDeleteTask(latestPendingId);
        if (tasksPendingDeletion.length <= 1) hideSnackbar();
      }, 4000);

      deletionTimers.current[latestPendingId] = timer;
    }
  }, [tasksPendingDeletion, permanentlyDeleteTask]);

  const hideSnackbar = useCallback(() => {
    Animated.timing(snackbarAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowSnackbar(false);
      setLastDeletedTaskId(null);
    });
  }, [snackbarAnim]);

  const handleUndo = useCallback(() => {
    if (lastDeletedTaskId) {
      clearTimeout(deletionTimers.current[lastDeletedTaskId]);
      delete deletionTimers.current[lastDeletedTaskId];
      undoDeleteTask(lastDeletedTaskId);
      hideSnackbar();
    }
  }, [lastDeletedTaskId, undoDeleteTask, hideSnackbar]);

  const handleAddTask = async (taskData: {
    title: string;
    notes?: string;
    priority: Priority;
    folderId: string;
    tags: string[];
    dueDate?: Date;
    recurrence?: RecurrenceRule;
    estimatedDuration?: number;
  }) => {
    await addTask(taskData);
  };

  const getFilteredTasks = useCallback(() => {
    const availableTasks = tasks.filter(task => !tasksPendingDeletion.includes(task.id));

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return availableTasks.filter(
        task =>
          task.title.toLowerCase().includes(query) ||
          task.notes?.toLowerCase().includes(query),
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (selectedSmartList) {
      case 'inbox':
        return availableTasks.filter(task => !task.dueDate && !task.isCompleted);
      case 'today':
        return availableTasks.filter(task => {
          if (!task.dueDate || task.isCompleted) return false;
          const taskDate = new Date(task.dueDate);
          return taskDate >= today && taskDate < tomorrow;
        });
      case 'upcoming':
        return availableTasks.filter(task => {
          if (!task.dueDate || task.isCompleted) return false;
          const taskDate = new Date(task.dueDate);
          return taskDate >= tomorrow;
        });
      default:
        return availableTasks.filter(task => !task.isCompleted);
    }
  }, [tasks, selectedSmartList, searchQuery, tasksPendingDeletion]);

  const filteredTasks = useMemo(() => {
    const t = getFilteredTasks();
    return t.sort((a, b) => {
      const priorityOrder = { high: 0, med: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [getFilteredTasks]);

  const smartListCounts = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const availableTasks = tasks.filter(task => !tasksPendingDeletion.includes(task.id));
    return {
      inbox: availableTasks.filter(task => !task.dueDate && !task.isCompleted).length,
      today: availableTasks.filter(task => {
        if (!task.dueDate || task.isCompleted) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate >= today && taskDate < tomorrow;
      }).length,
      upcoming: availableTasks.filter(task => {
        if (!task.dueDate || task.isCompleted) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate >= tomorrow;
      }).length,
    };
  }, [tasks, tasksPendingDeletion]);

  const renderTask = useCallback(
    ({ item, drag, isActive }: any) => (
      <TaskItem
        task={item}
        onComplete={toggleTask}
        onDelete={deleteTask}
        drag={drag}
        isActive={isActive}
        onAddSubtask={addSubtask}
        onToggleSubtask={toggleSubtask}
        onUpdateSubtask={updateSubtask}
        onDeleteSubtask={deleteSubtask}
      />
    ),
    [toggleTask, deleteTask, addSubtask, toggleSubtask, updateSubtask, deleteSubtask],
  );

  const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: insets.top + theme.spacing.md,
      paddingBottom: theme.spacing.md,
    },
    greeting: {
      fontSize: theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      fontWeight: '500',
      marginBottom: 2,
      letterSpacing: 0.2,
    },
    dateText: {
      fontSize: theme.typography.displayMedium,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: -0.5,
    },
    searchBarWrapper: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: searchFocused ? theme.colors.primary : theme.colors.border,
      backgroundColor: theme.colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      height: 48,
      ...(theme.shadows.sm as object),
    },
    searchIcon: { marginRight: theme.spacing.sm },
    searchInput: {
      flex: 1,
      fontSize: theme.typography.bodyLarge,
      color: theme.colors.text,
    },
    listContainer: {
      flex: 1,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: theme.spacing.xxl,
    },
    emptyIconWrapper: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    emptyTitle: {
      fontSize: theme.typography.titleLarge,
      fontWeight: '800',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    snackbar: {
      position: 'absolute',
      bottom: theme.spacing.xl + 8,
      left: theme.spacing.lg,
      right: theme.spacing.lg,
      backgroundColor: theme.isDark ? '#1E1E2E' : '#1E1B4B',
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...(theme.shadows.lg as object),
    },
    snackbarText: { color: '#FFFFFF', fontSize: theme.typography.bodyMedium, fontWeight: '500' },
    undoText: { color: theme.colors.primary, fontWeight: '800', fontSize: theme.typography.bodyMedium },
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
        <RNText style={styles.greeting}>{getGreeting()}</RNText>
        <RNText style={styles.dateText}>{getFormattedDate()}</RNText>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarWrapper}>
        <Ionicons
          name="search-outline"
          size={19}
          color={searchFocused ? theme.colors.primary : theme.colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks…"
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && Platform.OS === 'android' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Smart Lists */}
      {!searchQuery && (
        <SmartLists
          selectedList={selectedSmartList}
          onListChange={setSelectedSmartList}
          inboxCount={smartListCounts.inbox}
          todayCount={smartListCounts.today}
          upcomingCount={smartListCounts.upcoming}
        />
      )}

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrapper}>
            <Ionicons
              name={searchQuery ? 'search-outline' : 'checkmark-done-outline'}
              size={36}
              color={theme.colors.primary}
            />
          </View>
          <RNText style={styles.emptyTitle}>
            {searchQuery ? 'No results' : 'All clear!'}
          </RNText>
          <RNText style={styles.emptyText}>
            {searchQuery
              ? 'Try a different search term'
              : 'Tap + to add your first task and start owning your day'}
          </RNText>
        </View>
      ) : (
        <DraggableFlatList
          style={styles.listContainer}
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={item => item.id}
          onDragEnd={() => {}}
          activationDistance={20}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: theme.spacing.xxl + 60 }}
        />
      )}

      {/* Undo Snackbar */}
      {showSnackbar && (
        <Animated.View
          style={[
            styles.snackbar,
            {
              opacity: snackbarAnim,
              transform: [
                {
                  translateY: snackbarAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <RNText style={styles.snackbarText}>Task deleted</RNText>
          <TouchableOpacity onPress={handleUndo}>
            <RNText style={styles.undoText}>UNDO</RNText>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* FAB */}
      <FloatingActionButton visible onPress={() => setShowQuickAdd(true)} />

      {/* Modals */}
      <QuickAddModal
        visible={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onAddTask={handleAddTask}
        folders={folders}
        tags={tags}
        allTasks={tasks}
      />
      <DailyPlannerModal
        visible={showDailyPlanner}
        onClose={() => setShowDailyPlanner(false)}
        todayTasks={DailyPlannerUtils.getTodayTasks(tasks)}
        overdueTasks={DailyPlannerUtils.getOverdueTasks(tasks)}
        onUpdateTask={updateTask}
      />
    </LinearGradient>
  );
};
