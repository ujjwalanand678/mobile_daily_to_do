import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Text as RNText, ScrollView, StyleSheet, TextInput, TouchableOpacity, Animated, Platform } from 'react-native';
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

export const HomeScreen: React.FC = () => {
  const theme = useTheme();
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
    updateSubtask
  } = useAppStore();
  
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedSmartList, setSelectedSmartList] = useState<SmartListType>('inbox');
  const [showDailyPlanner, setShowDailyPlanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Undo snackbar state
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [lastDeletedTaskId, setLastDeletedTaskId] = useState<string | null>(null);
  const snackbarAnim = useRef(new Animated.Value(0)).current;
  const deletionTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Request notification permissions on mount
  useEffect(() => {
    requestNotificationPermissions();
    
    // Check for recurring instances that need to be created
    checkAndCreateRecurringInstances();
    
    // Check if we should show daily planner
    if (DailyPlannerUtils.shouldShowDailyPlanner()) {
      const todayTasks = DailyPlannerUtils.getTodayTasks(tasks);
      const overdueTasks = DailyPlannerUtils.getOverdueTasks(tasks);
      
      if (todayTasks.length > 0 || overdueTasks.length > 0) {
        setShowDailyPlanner(true);
      }
    }

    // Cleanup timers on unmount
    return () => {
      Object.values(deletionTimers.current).forEach(clearTimeout);
    };
  }, [requestNotificationPermissions, tasks, checkAndCreateRecurringInstances]);

  // Handle Snackbar animations and timeouts
  useEffect(() => {
    const latestPendingId = tasksPendingDeletion[tasksPendingDeletion.length - 1];
    
    if (latestPendingId && latestPendingId !== lastDeletedTaskId) {
      setLastDeletedTaskId(latestPendingId);
      setShowSnackbar(true);
      
      // Animate in
      Animated.spring(snackbarAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

      // Set permanent deletion timer (4 seconds)
      const timer = setTimeout(() => {
        permanentlyDeleteTask(latestPendingId);
        if (tasksPendingDeletion.length <= 1) {
          hideSnackbar();
        }
      }, 4000);
      
      deletionTimers.current[latestPendingId] = timer;
    }
  }, [tasksPendingDeletion, permanentlyDeleteTask]);

  const hideSnackbar = useCallback(() => {
    Animated.timing(snackbarAnim, {
      toValue: 0,
      duration: 200,
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
    // First, filter out tasks pending deletion
    const availableTasks = tasks.filter(task => !tasksPendingDeletion.includes(task.id));

    // If searching, ignore smart lists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return availableTasks.filter(task => 
        task.title.toLowerCase().includes(query) || 
        task.notes?.toLowerCase().includes(query)
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
    const tasks = getFilteredTasks();
    return tasks.sort((a, b) => {
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

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    console.log(`Reorder task from index ${fromIndex} to ${toIndex}`);
  }, []);

  const renderTask = useCallback(({ item, drag, isActive }: any) => (
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
  ), [toggleTask, deleteTask, addSubtask, toggleSubtask, updateSubtask, deleteSubtask]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.md,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      height: 44,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
    },
    listContainer: {
      flex: 1,
      paddingBottom: theme.spacing.xxl,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    snackbar: {
      position: 'absolute',
      bottom: theme.spacing.xl * 2,
      left: theme.spacing.lg,
      right: theme.spacing.lg,
      backgroundColor: '#323232',
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      ...Platform.select({
        web: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
        },
        default: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        },
      }),
    },
    snackbarText: {
      color: '#FFFFFF',
      fontSize: 14,
    },
    undoButton: {
      padding: theme.spacing.xs,
    },
    undoText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
      fontSize: 14,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <RNText style={styles.title}>Daily To-Do</RNText>
      </View>

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {!searchQuery && (
        <SmartLists
          selectedList={selectedSmartList}
          onListChange={setSelectedSmartList}
          inboxCount={smartListCounts.inbox}
          todayCount={smartListCounts.today}
          upcomingCount={smartListCounts.upcoming}
        />
      )}

      {filteredTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <RNText style={styles.emptyTitle}>
            {searchQuery ? 'No results found' : 'No tasks yet'}
          </RNText>
          <RNText style={styles.emptyText}>
            {searchQuery 
              ? 'Try adjusting your search query'
              : 'Tap the + button to add your first task and start organizing your day!'}
          </RNText>
        </View>
      ) : (
        <DraggableFlatList
          style={styles.listContainer}
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          onDragEnd={({ from, to }) => handleReorder(from, to)}
          activationDistance={20}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
        />
      )}

      {showSnackbar && (
        <Animated.View style={[styles.snackbar, { opacity: snackbarAnim, transform: [{ translateY: snackbarAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <RNText style={styles.snackbarText}>Task deleted</RNText>
          <TouchableOpacity style={styles.undoButton} onPress={handleUndo}>
            <RNText style={styles.undoText}>UNDO</RNText>
          </TouchableOpacity>
        </Animated.View>
      )}

      <FloatingActionButton
        visible={true}
        onPress={() => setShowQuickAdd(true)}
      />

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
    </View>
  );
};
