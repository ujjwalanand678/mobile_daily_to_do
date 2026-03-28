import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text as RNText, ScrollView, StyleSheet } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { useAppStore } from '../store/useAppStore';
import { Priority, Task } from '../types';
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
  const { tasks, addTask, toggleTask, deleteTask, folders, tags, requestNotificationPermissions, updateTask } = useAppStore();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedSmartList, setSelectedSmartList] = useState<SmartListType>('inbox');
  const [showDailyPlanner, setShowDailyPlanner] = useState(false);

  // Request notification permissions on mount
  useEffect(() => {
    requestNotificationPermissions();
    
    // Check if we should show daily planner
    if (DailyPlannerUtils.shouldShowDailyPlanner()) {
      const todayTasks = DailyPlannerUtils.getTodayTasks(tasks);
      const overdueTasks = DailyPlannerUtils.getOverdueTasks(tasks);
      
      if (todayTasks.length > 0 || overdueTasks.length > 0) {
        setShowDailyPlanner(true);
      }
    }
  }, [requestNotificationPermissions, tasks]);

  const handleAddTask = async (taskData: { title: string; notes?: string; priority: Priority; folderId: string; tags: string[]; dueDate?: Date }) => {
    await addTask(taskData);
  };

  const getFilteredTasks = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (selectedSmartList) {
      case 'inbox':
        return tasks.filter(task => !task.dueDate && !task.isCompleted);
      case 'today':
        return tasks.filter(task => {
          if (!task.dueDate || task.isCompleted) return false;
          const taskDate = new Date(task.dueDate);
          return taskDate >= today && taskDate < tomorrow;
        });
      case 'upcoming':
        return tasks.filter(task => {
          if (!task.dueDate || task.isCompleted) return false;
          const taskDate = new Date(task.dueDate);
          return taskDate >= tomorrow;
        });
      default:
        return tasks.filter(task => !task.isCompleted);
    }
  }, [tasks, selectedSmartList]);

  const filteredTasks = useMemo(() => {
    const tasks = getFilteredTasks();
    return tasks.sort((a, b) => {
      // Sort by priority first
      const priorityOrder = { high: 0, med: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [getFilteredTasks]);

  const smartListCounts = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      inbox: tasks.filter(task => !task.dueDate && !task.isCompleted).length,
      today: tasks.filter(task => {
        if (!task.dueDate || task.isCompleted) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate >= today && taskDate < tomorrow;
      }).length,
      upcoming: tasks.filter(task => {
        if (!task.dueDate || task.isCompleted) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate >= tomorrow;
      }).length,
    };
  }, [tasks]);

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    // For now, we'll just log the reorder. In a real app, you'd update the store
    console.log(`Reorder task from index ${fromIndex} to ${toIndex}`);
  }, []);

  const renderTask = useCallback((item: { item: Task; index: number; drag: () => void; isActive: boolean }) => (
    <TaskItem
      task={item.item}
      onComplete={toggleTask}
      onDelete={deleteTask}
      drag={item.drag}
      isActive={item.isActive}
    />
  ), [toggleTask, deleteTask]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    taskCount: {
      fontSize: 16,
      color: theme.colors.textSecondary,
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
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <RNText style={styles.title}>Daily To-Do</RNText>
        <RNText style={styles.taskCount}>
          {tasks.filter(t => !t.isCompleted).length} active • {tasks.length} total
        </RNText>
      </View>

      <SmartLists
        selectedList={selectedSmartList}
        onListChange={setSelectedSmartList}
        inboxCount={smartListCounts.inbox}
        todayCount={smartListCounts.today}
        upcomingCount={smartListCounts.upcoming}
      />

      {filteredTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <RNText style={styles.emptyTitle}>No tasks yet</RNText>
          <RNText style={styles.emptyText}>
            Tap the + button to add your first task and start organizing your day!
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
