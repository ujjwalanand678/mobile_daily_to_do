import { create } from 'zustand';
import { Platform } from 'react-native';
import { Task, Folder, Tag, AppState, FontPreference } from '../types';
import { NotificationManager } from '../utils/notifications';
import { SyncService } from '../services/syncService';
import { RecurrenceManager } from '../utils/recurrence';
import { SubtaskManager } from '../utils/subtasks';
import { TimeEstimateManager } from '../utils/timeEstimates';
import { CalendarSchedulingManager } from '../utils/calendarScheduling';

// Storage implementation that works for both native and web
let storage: {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
};

if (Platform.OS === 'web') {
  // Web fallback using localStorage
  storage = {
    getString: (key: string) => {
      try {
        return localStorage.getItem(key) || undefined;
      } catch {
        return undefined;
      }
    },
    set: (key: string, value: string) => {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('localStorage error:', error);
      }
    },
    delete: (key: string) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('localStorage error:', error);
      }
    },
  };
} else {
  // Native MMKV
  const { MMKV } = require('react-native-mmkv');
  const mmkv = new MMKV({
    id: 'app-storage',
    encryptionKey: undefined,
  });
  storage = {
    getString: (key: string) => mmkv.getString(key),
    set: (key: string, value: string) => mmkv.set(key, value),
    delete: (key: string) => mmkv.delete(key),
  };
}

const loadState = (): AppState => {
  try {
    const storedData = storage.getString('app-storage');
    const defaultState = {
      tasks: [],
      folders: [
        {
          id: 'default',
          name: 'My Tasks',
          color: '#007AFF',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      tags: [],
      themePreference: 'system' as const,
      fontPreference: 'system' as const,
    };
    
    if (!storedData) {
      return defaultState;
    }
    
    const parsedState = JSON.parse(storedData);
    
    // Migrate old tasks to include recurrence fields
    if (parsedState.tasks) {
      parsedState.tasks = parsedState.tasks.map((task: any) => {
        let migratedTask = RecurrenceManager.migrateTask(task);
        migratedTask = SubtaskManager.migrateTask(migratedTask);
        migratedTask = TimeEstimateManager.migrateTask(migratedTask);
        migratedTask = CalendarSchedulingManager.migrateTask(migratedTask);
        return migratedTask;
      });
    }
    
    return { ...defaultState, ...parsedState };
  } catch (error) {
    console.error('Error loading state:', error);
    return {
      tasks: [],
      folders: [
        {
          id: 'default',
          name: 'My Tasks',
          color: '#007AFF',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      tags: [],
      themePreference: 'system',
      fontPreference: 'system',
    };
  }
};

const saveState = (state: AppState): void => {
  try {
    storage.set('app-storage', JSON.stringify(state));
  } catch (error) {
    console.error('Error saving state:', error);
  }
};

interface AppStore extends AppState {
  // UI logic state (non-persistent)
  tasksPendingDeletion: string[];

  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'notificationId' | 'isCompleted'>) => void;
  toggleTask: (taskId: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void; // Soft delete
  undoDeleteTask: (taskId: string) => void;
  permanentlyDeleteTask: (taskId: string) => void;
  requestNotificationPermissions: () => Promise<boolean>;
  
  // Recurring task actions
  createRecurringInstance: (taskId: string) => void;
  checkAndCreateRecurringInstances: () => void;
  
  // Subtask actions
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  updateSubtask: (taskId: string, subtaskId: string, title: string) => void;
  reorderSubtasks: (taskId: string, fromIndex: number, toIndex: number) => void;
  
  // Calendar scheduling actions
  scheduleTask: (taskId: string, slotTime: Date) => void;
  unscheduleTask: (taskId: string) => void;
  rescheduleTask: (taskId: string, newSlotTime: Date) => void;
  autoScheduleTasks: (date: Date) => void;
  
  // Sync actions
  signInWithGoogle: () => Promise<boolean>;
  signOutFromGoogle: () => Promise<void>;
  isSignedInWithGoogle: () => Promise<boolean>;
  syncWithDrive: () => Promise<'uploaded' | 'downloaded' | 'no_action' | 'error'>;
  
  // Folder actions
  addFolder: (folder: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFolder: (folderId: string, updates: Partial<Folder>) => void;
  deleteFolder: (folderId: string) => void;
  
  // Tag actions
  addTag: (tag: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTag: (tagId: string, updates: Partial<Tag>) => void;
  deleteTag: (tagId: string) => void;

  // Theme actions
  setThemePreference: (preference: 'system' | 'light' | 'dark') => void;

  // Font actions
  setFontPreference: (preference: FontPreference) => void;
}

export const useAppStore = create<AppStore>((set, get) => {
  // Load initial state from MMKV
  const initialState = loadState();
  
  // Initialize sync service on app start
  SyncService.initialize();
  
  return {
    ...initialState,
    tasksPendingDeletion: [],

    // Task actions
    addTask: async (taskData) => {
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Schedule notification if dueDate is set
      let notificationId: string | undefined;
      if (newTask.dueDate) {
        notificationId = (await NotificationManager.scheduleNotification(
          newTask.title,
          newTask.dueDate,
          newTask.id
        )) || undefined;
      }

      const taskWithNotification = { ...newTask, notificationId: notificationId || undefined };
      
      set((state) => {
        const newState = { ...state, tasks: [...state.tasks, taskWithNotification] };
        saveState(newState);
        
        // Trigger background sync after state change
        SyncService.performBackgroundSync();
        
        return newState;
      });
    },

    toggleTask: (taskId) => {
      set((state) => {
        const task = state.tasks.find(t => t.id === taskId);
        const isCompleting = !task?.isCompleted;
        
        let updatedTasks = state.tasks.map((task) =>
          task.id === taskId
            ? { ...task, isCompleted: !task.isCompleted, updatedAt: new Date() }
            : task
        );

        // If completing a recurring task, create the next instance
        if (isCompleting && task?.recurrence && !task.isRecurringInstance) {
          const nextInstanceData = RecurrenceManager.createNextInstance(task);
          if (nextInstanceData) {
            const nextInstance: Task = {
              ...nextInstanceData,
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              isCompleted: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            updatedTasks = [...updatedTasks, nextInstance];
          }
        }

        const newState = {
          ...state,
          tasks: updatedTasks,
        };
        saveState(newState);
        return newState;
      });
    },

    updateTask: async (taskId, updates) => {
      const currentTask = get().tasks.find(t => t.id === taskId);
      
      // Handle notification rescheduling if dueDate changed
      let notificationId = currentTask?.notificationId;
      if (updates.dueDate && currentTask?.dueDate !== updates.dueDate) {
        notificationId = (await NotificationManager.rescheduleNotification(
          updates.title || currentTask?.title || 'Task',
          updates.dueDate,
          taskId,
          currentTask?.notificationId
        )) || undefined;
      } else if (!updates.dueDate && currentTask?.notificationId) {
        // Cancel notification if dueDate is removed
        await NotificationManager.cancelNotification(currentTask.notificationId);
        notificationId = undefined;
      }
      
      set((state) => {
        const newState = {
          ...state,
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, ...updates, updatedAt: new Date(), notificationId: notificationId || undefined }
              : task
          ),
        };
        saveState(newState);
        return newState;
      });
    },

    deleteTask: (taskId) => {
      set((state) => ({
        ...state,
        tasksPendingDeletion: [...state.tasksPendingDeletion, taskId],
      }));
    },

    undoDeleteTask: (taskId) => {
      set((state) => ({
        ...state,
        tasksPendingDeletion: state.tasksPendingDeletion.filter(id => id !== taskId),
      }));
    },

    permanentlyDeleteTask: async (taskId) => {
      const task = get().tasks.find(t => t.id === taskId);
      
      // Cancel notification if it exists
      if (task?.notificationId) {
        await NotificationManager.cancelNotification(task.notificationId);
      }
      
      set((state) => {
        const newState = {
          ...state,
          tasks: state.tasks.filter((t) => t.id !== taskId),
          tasksPendingDeletion: state.tasksPendingDeletion.filter(id => id !== taskId),
        };
        saveState(newState);
        return newState;
      });
    },

    // Folder actions
    addFolder: (folderData) => {
      const newFolder: Folder = {
        ...folderData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      set((state) => {
        const newState = { ...state, folders: [...state.folders, newFolder] };
        saveState(newState);
        return newState;
      });
    },

    updateFolder: (folderId, updates) => {
      set((state) => {
        const newState = {
          ...state,
          folders: state.folders.map((folder) =>
            folder.id === folderId
              ? { ...folder, ...updates, updatedAt: new Date() }
              : folder
          ),
        };
        saveState(newState);
        return newState;
      });
    },

    deleteFolder: (folderId) => {
      // Don't allow deleting the default folder
      if (folderId === 'default') return;
      
      set((state) => {
        const newState = {
          ...state,
          folders: state.folders.filter((folder) => folder.id !== folderId),
          tasks: state.tasks.map((task) =>
            task.folderId === folderId
              ? { ...task, folderId: 'default', updatedAt: new Date() }
              : task
          ),
        };
        saveState(newState);
        return newState;
      });
    },

    // Tag actions
    addTag: (tagData) => {
      const newTag: Tag = {
        ...tagData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      set((state) => {
        const newState = { ...state, tags: [...state.tags, newTag] };
        saveState(newState);
        return newState;
      });
    },

    updateTag: (tagId, updates) => {
      set((state) => {
        const newState = {
          ...state,
          tags: state.tags.map((tag) =>
            tag.id === tagId
              ? { ...tag, ...updates, updatedAt: new Date() }
              : tag
          ),
        };
        saveState(newState);
        return newState;
      });
    },

    deleteTag: (tagId) => {
      set((state) => {
        const newState = {
          ...state,
          tags: state.tags.filter((tag) => tag.id !== tagId),
          tasks: state.tasks.map((task) =>
            task.tags.includes(tagId)
              ? { ...task, tags: task.tags.filter(id => id !== tagId), updatedAt: new Date() }
              : task
          ),
        };
        saveState(newState);
        return newState;
      });
    },

    requestNotificationPermissions: async () => {
      return await NotificationManager.requestPermissions();
    },

    // Recurring task actions
    createRecurringInstance: (taskId) => {
      const task = get().tasks.find(t => t.id === taskId);
      if (!task?.recurrence || task.isRecurringInstance) return;

      const nextInstanceData = RecurrenceManager.createNextInstance(task);
      if (!nextInstanceData) return;

      const nextInstance: Task = {
        ...nextInstanceData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      set((state) => {
        const newState = { ...state, tasks: [...state.tasks, nextInstance] };
        saveState(newState);
        return newState;
      });
    },

    checkAndCreateRecurringInstances: () => {
      const currentState = get();
      const instancesToCreate = RecurrenceManager.getInstancesToCreate(currentState.tasks);
      
      if (instancesToCreate.length > 0) {
        set((state) => {
          const newState = { ...state, tasks: [...state.tasks, ...instancesToCreate] };
          saveState(newState);
          return newState;
        });
      }
    },

    // Subtask actions
    addSubtask: (taskId, title) => {
      set((state) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return state;

        const updatedTask = SubtaskManager.addSubtask(task, title);
        const newState = {
          ...state,
          tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t),
        };
        saveState(newState);
        return newState;
      });
    },

    toggleSubtask: (taskId, subtaskId) => {
      set((state) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return state;

        const updatedTask = SubtaskManager.toggleSubtask(task, subtaskId);
        const newState = {
          ...state,
          tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t),
        };
        saveState(newState);
        return newState;
      });
    },

    deleteSubtask: (taskId, subtaskId) => {
      set((state) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return state;

        const updatedTask = SubtaskManager.deleteSubtask(task, subtaskId);
        const newState = {
          ...state,
          tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t),
        };
        saveState(newState);
        return newState;
      });
    },

    updateSubtask: (taskId, subtaskId, title) => {
      set((state) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return state;

        const updatedTask = SubtaskManager.updateSubtask(task, subtaskId, title);
        const newState = {
          ...state,
          tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t),
        };
        saveState(newState);
        return newState;
      });
    },

    reorderSubtasks: (taskId, fromIndex, toIndex) => {
      set((state) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return state;

        const updatedTask = SubtaskManager.reorderSubtasks(task, fromIndex, toIndex);
        const newState = {
          ...state,
          tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t),
        };
        saveState(newState);
        return newState;
      });
    },

    // Calendar scheduling actions
    scheduleTask: (taskId, slotTime) => {
      set((state) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return state;

        const updatedTask = CalendarSchedulingManager.scheduleTask(task, slotTime);
        const newState = {
          ...state,
          tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t),
        };
        saveState(newState);
        return newState;
      });
    },

    unscheduleTask: (taskId) => {
      set((state) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return state;

        const updatedTask = CalendarSchedulingManager.unscheduleTask(task);
        const newState = {
          ...state,
          tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t),
        };
        saveState(newState);
        return newState;
      });
    },

    rescheduleTask: (taskId, newSlotTime) => {
      set((state) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return state;

        const updatedTask = CalendarSchedulingManager.rescheduleTask(task, newSlotTime);
        const newState = {
          ...state,
          tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t),
        };
        saveState(newState);
        return newState;
      });
    },

    autoScheduleTasks: (date) => {
      set((state) => {
        const autoScheduledTasks = CalendarSchedulingManager.autoScheduleTasks(state.tasks, date);
        const newState = {
          ...state,
          tasks: autoScheduledTasks,
        };
        saveState(newState);
        return newState;
      });
    },

    // Sync actions
    signInWithGoogle: async () => {
      const success = await SyncService.signIn();
      if (success) {
        // Trigger sync after successful sign-in
        const currentState = get();
        await SyncService.syncWithDrive(currentState);
      }
      return success;
    },

    signOutFromGoogle: async () => {
      await SyncService.signOut();
    },

    isSignedInWithGoogle: async () => {
      return await SyncService.isSignedIn();
    },

    syncWithDrive: async () => {
      const currentState = get();
      const result = await SyncService.syncWithDrive(currentState);
      
      if (result === 'uploaded' || result === 'downloaded' || result === 'no_action') {
        const timestamp = new Date().toISOString();
        set((state) => {
          const newState = { ...state, lastSyncedAt: timestamp };
          saveState(newState);
          return newState;
        });
        
        if (result === 'downloaded') {
          // Reload state from Drive
          const remoteState = await SyncService.downloadFromDrive();
          if (remoteState) {
            set({ ...remoteState, lastSyncedAt: timestamp });
            saveState({ ...remoteState, lastSyncedAt: timestamp });
          }
        }
      }
      
      return result;
    },
    
    setThemePreference: (preference) => {
      set((state) => {
        const newState = { ...state, themePreference: preference };
        saveState(newState);
        return newState;
      });
    },

    setFontPreference: (preference) => {
      set((state) => {
        const newState = { ...state, fontPreference: preference };
        saveState(newState);
        return newState;
      });
    },
  };
});
