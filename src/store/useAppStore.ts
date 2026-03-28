import { create } from 'zustand';
import { Platform } from 'react-native';
import { Task, Folder, Tag, AppState } from '../types';
import { NotificationManager } from '../utils/notifications';
import { SyncService } from '../services/syncService';

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
    return storedData ? JSON.parse(storedData) : {
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
    };
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
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'notificationId'>) => void;
  toggleTask: (taskId: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  requestNotificationPermissions: () => Promise<boolean>;
  
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
}

export const useAppStore = create<AppStore>((set, get) => {
  // Load initial state from MMKV
  const initialState = loadState();
  
  // Initialize sync service on app start
  SyncService.initialize();
  
  return {
    ...initialState,

    // Task actions
    addTask: async (taskData) => {
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Schedule notification if dueDate is set
      let notificationId: string | undefined;
      if (newTask.dueDate) {
        notificationId = await NotificationManager.scheduleNotification(
          newTask.title,
          newTask.dueDate,
          newTask.id
        );
      }

      const taskWithNotification = { ...newTask, notificationId };
      
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
        const newState = {
          ...state,
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, isCompleted: !task.isCompleted, updatedAt: new Date() }
              : task
          ),
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
        notificationId = await NotificationManager.rescheduleNotification(
          updates.title || currentTask?.title || 'Task',
          updates.dueDate,
          taskId,
          currentTask?.notificationId
        );
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
              ? { ...task, ...updates, updatedAt: new Date(), notificationId }
              : task
          ),
        };
        saveState(newState);
        return newState;
      });
    },

    deleteTask: async (taskId) => {
      const task = get().tasks.find(t => t.id === taskId);
      
      // Cancel notification if it exists
      if (task?.notificationId) {
        await NotificationManager.cancelNotification(task.notificationId);
      }
      
      set((state) => {
        const newState = {
          ...state,
          tasks: state.tasks.filter((task) => task.id !== taskId),
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
      
      if (result === 'downloaded') {
        // Reload state from Drive
        const remoteState = await SyncService.downloadFromDrive();
        if (remoteState) {
          set(remoteState);
          saveState(remoteState);
        }
      }
      
      return result;
    },
  };
});
