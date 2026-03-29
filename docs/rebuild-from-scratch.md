# Rebuild From Scratch Guide

## Overview

This guide provides step-by-step instructions to completely rebuild the Daily To-Do application from scratch. Follow these instructions in order to recreate the exact same application with all features and functionality.

## Prerequisites

### Development Environment Setup

#### Required Software
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Expo CLI**: Latest version
- **Git**: For version control
- **Code Editor**: VS Code recommended with extensions:
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint

#### Platform-Specific Requirements
- **iOS Development**: macOS with Xcode 14+
- **Android Development**: Android Studio with Android SDK
- **Web Development**: Modern web browser (Chrome, Firefox, Safari)

#### Account Setup
- **Expo Account**: Free account at expo.dev
- **Google Cloud Console**: For Google Drive API setup
- **Google Play Console** (optional): For Android distribution
- **Apple Developer Account** (optional): For iOS distribution

---

## Step 1: Project Initialization

### Create New Expo Project

```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Create new React Native project with TypeScript
npx create-expo-app daily-to-do --template blank-typescript

# Navigate to project directory
cd daily-to-do

# Install project dependencies
npm install

# Start development server to verify setup
npm start
```

### Configure Project Metadata

**Update `app.json`**:
```json
{
  "expo": {
    "name": "Daily To-Do",
    "slug": "daily_to_do",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundImage": "./assets/android-icon-background.png",
        "monochromeImage": "./assets/android-icon-monochrome.png"
      },
      "predictiveBackGestureEnabled": false,
      "package": "com.yourcompany.daily_to_do"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

**Update `package.json`**:
```json
{
  "name": "daily_to_do",
  "version": "1.0.0",
  "main": "index.ts",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  }
}
```

### Configure TypeScript

**Update `tsconfig.json`**:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  }
}
```

---

## Step 2: Install Dependencies

### Core Dependencies

```bash
# State Management
npm install zustand

# Navigation
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# Gestures and Animations
npm install react-native-gesture-handler react-native-reanimated
npm install react-native-draggable-flatlist

# Storage
npm install react-native-mmkv

# Notifications and Haptics
npm install expo-notifications expo-haptics

# SVG Support
npm install react-native-svg

# Google Sign-In
npm install @react-native-google-signin/google-signin

# Web Support
npm install react-native-web
```

### Development Dependencies

```bash
# TypeScript Types
npm install --save-dev @types/react @types/react-native
```

### Verify Installation

```bash
# Clear Metro cache
npx expo start --clear

# Test on all platforms
npm start
# Press 'i' for iOS
# Press 'a' for Android
# Press 'w' for web
```

---

## Step 3: Setup Folder Structure

### Create Directory Structure

```bash
# Create main directories
mkdir -p src/{components,screens,navigation,services,store,theme,types,utils}

# Create assets directory
mkdir -p assets

# Create docs directory
mkdir -p docs
```

### Create Initial Files

```bash
# Create empty index files for proper exports
touch src/types/index.ts
touch src/theme/theme.ts
touch src/store/useAppStore.ts
touch src/navigation/AppNavigator.tsx

# Create screen files
touch src/screens/HomeScreen.tsx
touch src/screens/PomodoroScreen.tsx
touch src/screens/CalendarScreen.tsx
touch src/screens/SettingsScreen.tsx

# Create component files
touch src/components/TaskItem.tsx
touch src/components/FloatingActionButton.tsx
touch src/components/QuickAddModal.tsx
touch src/components/SmartLists.tsx
touch src/components/DailyPlannerModal.tsx
touch src/components/SyncSettings.tsx

# Create utility files
touch src/utils/notifications.ts
touch src/utils/googleDriveSync.ts
touch src/utils/nlp.ts
touch src/utils/dailyPlanner.ts
touch src/utils/testStorage.ts

# Create service files
touch src/services/syncService.ts
```

---

## Step 4: Setup Type Definitions

### Create Core Types (`src/types/index.ts`)

```typescript
export type Priority = 'low' | 'med' | 'high';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  isCompleted: boolean;
  dueDate?: Date;
  priority: Priority;
  folderId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  notificationId?: string;
  timeSpent?: number;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppState {
  tasks: Task[];
  folders: Folder[];
  tags: Tag[];
}
```

---

## Step 5: Setup Theme System

### Create Theme Configuration (`src/theme/theme.ts`)

```typescript
import { useColorScheme } from 'react-native';

export interface Theme {
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    error: string;
    warning: string;
    shadow: string;
    overlay: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

const lightTheme: Theme = {
  colors: {
    background: '#F2F2F7',
    surface: '#FFFFFF',
    primary: '#007AFF',
    secondary: '#5856D6',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#E5E5EA',
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  shadows: {
    sm: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    lg: '0px 4px 16px rgba(0, 0, 0, 0.15)',
  },
};

const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    background: '#000000',
    surface: '#1C1C1E',
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    success: '#30D158',
    error: '#FF453A',
    warning: '#FF9F0A',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

export const useTheme = (): Theme => {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
};

export { lightTheme, darkTheme };
```

---

## Step 6: Setup State Management

### Create Zustand Store (`src/store/useAppStore.ts`)

```typescript
import { create } from 'zustand';
import { Platform } from 'react-native';
import { Task, Folder, Tag, AppState } from '../types';
import { NotificationManager } from '../utils/notifications';
import { SyncService } from '../services/syncService';

// Storage implementation
let storage: {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
};

if (Platform.OS === 'web') {
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
  const initialState = loadState();
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
      
      let notificationId = currentTask?.notificationId;
      if (updates.dueDate && currentTask?.dueDate !== updates.dueDate) {
        notificationId = await NotificationManager.rescheduleNotification(
          updates.title || currentTask?.title || 'Task',
          updates.dueDate,
          taskId,
          currentTask?.notificationId
        );
      } else if (!updates.dueDate && currentTask?.notificationId) {
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

    requestNotificationPermissions: async () => {
      return await NotificationManager.requestPermissions();
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

    // Sync actions
    signInWithGoogle: async () => {
      const success = await SyncService.signIn();
      if (success) {
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
```

---

## Step 7: Create Utility Functions

### Notification Manager (`src/utils/notifications.ts`)

```typescript
import { Platform } from 'react-native';

// Mock notifications for web environment
const mockNotifications = {
  setNotificationHandler: async () => {},
  requestPermissionsAsync: async () => ({ status: 'granted' }),
  scheduleNotificationAsync: async () => 'mock-notification-id',
  cancelScheduledNotificationAsync: async () => {},
};

let Notifications: any;
try {
  Notifications = Platform.OS === 'web' 
    ? mockNotifications 
    : eval('require')('expo-notifications');
} catch (error) {
  console.log('expo-notifications not available, using mock');
  Notifications = mockNotifications;
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationManager {
  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web, using mock');
      return true;
    }

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  static async scheduleNotification(
    taskTitle: string,
    scheduledDate: Date,
    taskId: string
  ): Promise<string | null> {
    if (Platform.OS === 'web') {
      console.log(`Mock: Scheduling notification for "${taskTitle}" at ${scheduledDate}`);
      return 'mock-notification-id';
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Reminder',
          body: taskTitle,
          data: { taskId },
          sound: 'default',
        },
        trigger: {
          date: scheduledDate,
        },
      });

      console.log(`Notification scheduled: ${notificationId} for task: ${taskTitle}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  static async cancelNotification(notificationId: string): Promise<void> {
    if (Platform.OS === 'web') {
      console.log(`Mock: Cancelling notification ${notificationId}`);
      return;
    }

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`Notification cancelled: ${notificationId}`);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  static async rescheduleNotification(
    taskTitle: string,
    scheduledDate: Date,
    taskId: string,
    oldNotificationId?: string
  ): Promise<string | null> {
    if (oldNotificationId) {
      await this.cancelNotification(oldNotificationId);
    }
    return this.scheduleNotification(taskTitle, scheduledDate, taskId);
  }
}

export const isFutureDate = (date: Date): boolean => {
  return date.getTime() > Date.now();
};
```

### Natural Language Processing (`src/utils/nlp.ts`)

```typescript
export interface ParsedDateTime {
  date: Date;
  cleanedText: string;
}

export class DateParser {
  static parseDateTime(text: string): ParsedDateTime | null {
    const cleanedText = text.trim();
    const lowerText = cleanedText.toLowerCase();
    
    // Today patterns
    const todayPatterns = [
      /\b(today)\b/,
      /\b(hari ini)\b/,
    ];
    
    // Tomorrow patterns
    const tomorrowPatterns = [
      /\b(tomorrow)\b/,
      /\b(besok)\b/,
    ];
    
    // Time patterns
    const timePatterns = [
      /(\d{1,2})\s*?(am|pm)/i,
      /(\d{1,2}):(\d{2})\s*?(am|pm)?/i,
      /(\d{1,2})\s*?(o'clock)/i,
    ];
    
    // Date patterns
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
      /(\d{1,2})-(\d{1,2})-(\d{4})/,
      /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2})(?:st|nd|rd|th)?/i,
    ];
    
    let targetDate = new Date();
    let hasDate = false;
    let hasTime = false;
    
    // Check for today/tomorrow
    for (const pattern of todayPatterns) {
      if (pattern.test(lowerText)) {
        hasDate = true;
        targetDate = new Date();
        break;
      }
    }
    
    if (!hasDate) {
      for (const pattern of tomorrowPatterns) {
        if (pattern.test(lowerText)) {
          hasDate = true;
          targetDate = new Date();
          targetDate.setDate(targetDate.getDate() + 1);
          break;
        }
      }
    }
    
    // Check for time patterns
    for (const pattern of timePatterns) {
      const match = cleanedText.match(pattern);
      if (match) {
        hasTime = true;
        const time = this.parseTime(match[0]);
        if (time) {
          targetDate.setHours(time.hours, time.minutes, 0, 0);
        }
        break;
      }
    }
    
    // Check for date patterns
    for (const pattern of datePatterns) {
      const match = cleanedText.match(pattern);
      if (match) {
        hasDate = true;
        const date = this.parseDate(match[0]);
        if (date) {
          targetDate = date;
          if (hasTime) {
            const time = this.extractTimeFromText(cleanedText);
            if (time) {
              targetDate.setHours(time.hours, time.minutes, 0, 0);
            }
          }
        }
        break;
      }
    }
    
    // If we found a date or time, return the result
    if (hasDate || hasTime) {
      // Ensure the date is in the future
      if (targetDate.getTime() <= Date.now()) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      
      return {
        date: targetDate,
        cleanedText: this.removeDateTimeFromText(cleanedText),
      };
    }
    
    return null;
  }
  
  private static parseTime(timeText: string): { hours: number; minutes: number } | null {
    const timeMatch = timeText.match(/(\d{1,2})\s*?:(\d{2})\s*?(am|pm)?/i) ||
                       timeText.match(/(\d{1,2})\s*?(am|pm)/i);
    
    if (!timeMatch) return null;
    
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const period = timeMatch[3]?.toLowerCase();
    
    if (period === 'pm' && hours < 12) {
      hours += 12;
    } else if (period === 'am' && hours === 12) {
      hours = 0;
    }
    
    return { hours, minutes };
  }
  
  private static parseDate(dateText: string): Date | null {
    const date = new Date(dateText);
    return isNaN(date.getTime()) ? null : date;
  }
  
  private static extractTimeFromText(text: string): { hours: number; minutes: number } | null {
    const timePatterns = [
      /(\d{1,2})\s*?(am|pm)/i,
      /(\d{1,2}):(\d{2})\s*?(am|pm)?/i,
    ];
    
    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        return this.parseTime(match[0]);
      }
    }
    
    return null;
  }
  
  private static removeDateTimeFromText(text: string): string {
    const patterns = [
      /\b(today|tomorrow|hari ini|besok)\b/gi,
      /\b(at|@)\s+\d{1,2}(:\d{2})?\s*(am|pm)?\b/gi,
      /\b\d{1,2}(:\d{2})?\s*(am|pm)?\b/gi,
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
      /\b\d{1,2}-\d{1,2}-\d{4}\b/g,
      /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2}(?:st|nd|rd|th)?\b/gi,
    ];
    
    let cleanedText = text;
    for (const pattern of patterns) {
      cleanedText = cleanedText.replace(pattern, '').trim();
    }
    
    // Clean up extra spaces
    cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
    
    return cleanedText;
  }
}

export const formatDateForDisplay = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  };
  return date.toLocaleDateString('en-US', options);
};
```

---

## Step 8: Create Sync Services

### Google Drive Sync Engine (`src/utils/googleDriveSync.ts`)

```typescript
import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export interface SyncMetadata {
  lastSyncTime: number;
  deviceId: string;
  appVersion: string;
}

export interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
}

export class GoogleDriveSyncEngine {
  private static readonly APP_DATA_FILE = 'daily_todo_backup.json';
  private static readonly METADATA_FILE = 'sync_metadata.json';
  
  static async configure(): Promise<void> {
    if (Platform.OS === 'web') {
      console.log('Google Sign-In not supported on web');
      return;
    }

    GoogleSignin.configure({
      webClientId: 'your-web-client-id.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      iosClientId: 'your-ios-client-id.apps.googleusercontent.com',
    });
  }

  static async signIn(): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('Google Sign-In not supported on web');
      return false;
    }

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      const hasRequiredScope = userInfo.user.scopes?.includes('https://www.googleapis.com/auth/drive.appdata');
      
      if (!hasRequiredScope) {
        console.log('Requesting additional permissions...');
        await GoogleSignin.signOut();
        await GoogleSignin.signInWithScopes(['https://www.googleapis.com/auth/drive.appdata']);
      }
      
      return true;
    } catch (error) {
      console.error('Google Sign-In error:', error);
      return false;
    }
  }

  static async signOut(): Promise<void> {
    if (Platform.OS === 'web') return;
    
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Google Sign-Out error:', error);
    }
  }

  static async isSignedIn(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    
    try {
      return await GoogleSignin.isSignedIn();
    } catch (error) {
      console.error('Check sign-in status error:', error);
      return false;
    }
  }

  static async getAccessToken(): Promise<string | null> {
    if (Platform.OS === 'web') return null;
    
    try {
      const userInfo = await GoogleSignin.getTokens();
      return userInfo.accessToken;
    } catch (error) {
      console.error('Get access token error:', error);
      return null;
    }
  }

  private static async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const accessToken = await this.getAccessToken();
    
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }

  static async uploadToDrive(data: string): Promise<void> {
    if (Platform.OS === 'web') {
      console.log('Mock: Uploading to Google Drive');
      return;
    }

    try {
      const existingFile = await this.findFile(this.APP_DATA_FILE);
      
      const metadata = {
        name: this.APP_DATA_FILE,
        parents: ['appDataFolder'],
      };

      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', new Blob([data], { type: 'application/json' }));

      let url = 'https://www.googleapis.com/upload/drive/v3/files';
      let method = 'POST';

      if (existingFile) {
        url = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}`;
        method = 'PATCH';
        formData.delete('parents');
      }

      const accessToken = await this.getAccessToken();
      if (!accessToken) throw new Error('No access token');

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      console.log('Successfully uploaded to Google Drive');
    } catch (error) {
      console.error('Upload to Drive error:', error);
      throw error;
    }
  }

  static async downloadFromDrive(): Promise<string | null> {
    if (Platform.OS === 'web') {
      console.log('Mock: Downloading from Google Drive');
      return null;
    }

    try {
      const file = await this.findFile(this.APP_DATA_FILE);
      
      if (!file) {
        console.log('No backup file found in Drive');
        return null;
      }

      const response = await this.makeRequest(
        `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`
      );

      const data = await response.text();
      console.log('Successfully downloaded from Google Drive');
      return data;
    } catch (error) {
      console.error('Download from Drive error:', error);
      return null;
    }
  }

  private static async findFile(fileName: string): Promise<DriveFile | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) return null;

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and trashed=false and 'appDataFolder' in parents&fields=id,name,modifiedTime,size`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.files && data.files.length > 0) {
        return data.files[0];
      }
      
      return null;
    } catch (error) {
      console.error('Find file error:', error);
      return null;
    }
  }

  static async shouldSync(): Promise<boolean> {
    const isSignedIn = await this.isSignedIn();
    if (!isSignedIn) return false;

    const driveMetadata = await this.findFile(this.APP_DATA_FILE);
    const localMetadata = await this.getLocalMetadata();

    if (!driveMetadata && !localMetadata) {
      return true;
    }

    if (!driveMetadata && localMetadata) {
      return true;
    }

    if (driveMetadata && !localMetadata) {
      return true;
    }

    if (driveMetadata && localMetadata) {
      const driveTime = new Date(driveMetadata.modifiedTime).getTime();
      const localTime = localMetadata.lastSyncTime;
      
      return Math.abs(driveTime - localTime) > 60000; // 1 minute threshold
    }

    return false;
  }

  static async performSync(localData: string): Promise<'uploaded' | 'downloaded' | 'no_action'> {
    const driveMetadata = await this.findFile(this.APP_DATA_FILE);
    const localMetadata = await this.getLocalMetadata();

    if (!driveMetadata && !localMetadata) {
      await this.uploadToDrive(localData);
      await this.saveLocalMetadata({
        lastSyncTime: Date.now(),
        deviceId: this.generateDeviceId(),
        appVersion: '1.0.0',
      });
      return 'uploaded';
    }

    if (!driveMetadata && localMetadata) {
      await this.uploadToDrive(localData);
      await this.saveLocalMetadata({
        ...localMetadata,
        lastSyncTime: Date.now(),
      });
      return 'uploaded';
    }

    if (driveMetadata && !localMetadata) {
      const remoteData = await this.downloadFromDrive();
      if (remoteData) {
        await this.saveLocalMetadata({
          lastSyncTime: new Date(driveMetadata.modifiedTime).getTime(),
          deviceId: this.generateDeviceId(),
          appVersion: '1.0.0',
        });
        return 'downloaded';
      }
    }

    if (driveMetadata && localMetadata) {
      const driveTime = new Date(driveMetadata.modifiedTime).getTime();
      const localTime = localMetadata.lastSyncTime;

      if (driveTime > localTime) {
        const remoteData = await this.downloadFromDrive();
        if (remoteData) {
          await this.saveLocalMetadata({
            lastSyncTime: driveTime,
            deviceId: this.generateDeviceId(),
            appVersion: '1.0.0',
          });
          return 'downloaded';
        }
      } else if (localTime > driveTime) {
        await this.uploadToDrive(localData);
        await this.saveLocalMetadata({
          ...localMetadata,
          lastSyncTime: Date.now(),
        });
        return 'uploaded';
      }
    }

    return 'no_action';
  }

  private static getStorage() {
    if (Platform.OS === 'web') {
      return {
        getString: (key: string) => localStorage.getItem(key) || undefined,
        set: (key: string, value: string) => localStorage.setItem(key, value),
        delete: (key: string) => localStorage.removeItem(key),
      };
    } else {
      const { MMKV } = require('react-native-mmkv');
      return new MMKV({ id: 'google-drive-sync' });
    }
  }

  static async getLocalMetadata(): Promise<SyncMetadata | null> {
    try {
      const storage = this.getStorage();
      const metadata = storage.getString(this.METADATA_FILE);
      return metadata ? JSON.parse(metadata) : null;
    } catch (error) {
      console.error('Get local metadata error:', error);
      return null;
    }
  }

  static async saveLocalMetadata(metadata: SyncMetadata): Promise<void> {
    try {
      const storage = this.getStorage();
      storage.set(this.METADATA_FILE, JSON.stringify(metadata));
    } catch (error) {
      console.error('Save local metadata error:', error);
    }
  }

  static generateDeviceId(): string {
    const random = Math.random().toString(36).substring(2);
    const timestamp = Date.now().toString(36);
    return `${random}-${timestamp}`;
  }
}
```

### Sync Service (`src/services/syncService.ts`)

```typescript
import { Platform } from 'react-native';
import { GoogleDriveSyncEngine } from '../utils/googleDriveSync';
import { AppState } from '../types';

export class SyncService {
  private static readonly SYNC_KEY = 'app-storage';
  
  static async initialize(): Promise<void> {
    if (Platform.OS === 'web') {
      console.log('Sync service not available on web');
      return;
    }

    try {
      await GoogleDriveSyncEngine.configure();
    } catch (error) {
      console.error('Failed to configure Google Drive sync:', error);
    }
  }

  static async signIn(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    
    try {
      return await GoogleDriveSyncEngine.signIn();
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      return false;
    }
  }

  static async signOut(): Promise<void> {
    if (Platform.OS === 'web') return;
    
    try {
      await GoogleDriveSyncEngine.signOut();
    } catch (error) {
      console.error('Google Sign-Out failed:', error);
    }
  }

  static async isSignedIn(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    
    try {
      return await GoogleDriveSyncEngine.isSignedIn();
    } catch (error) {
      console.error('Check sign-in status failed:', error);
      return false;
    }
  }

  static async syncWithDrive(localState: AppState): Promise<'uploaded' | 'downloaded' | 'no_action' | 'error'> {
    if (Platform.OS === 'web') {
      console.log('Mock: Sync with Google Drive');
      return 'no_action';
    }

    try {
      const shouldSync = await GoogleDriveSyncEngine.shouldSync();
      if (!shouldSync) {
        return 'no_action';
      }

      const serializedState = JSON.stringify(localState);
      const result = await GoogleDriveSyncEngine.performSync(serializedState);
      
      console.log(`Sync result: ${result}`);
      return result;
    } catch (error) {
      console.error('Sync with Drive failed:', error);
      return 'error';
    }
  }

  static async downloadFromDrive(): Promise<AppState | null> {
    if (Platform.OS === 'web') {
      console.log('Mock: Download from Google Drive');
      return null;
    }

    try {
      const data = await GoogleDriveSyncEngine.downloadFromDrive();
      if (data) {
        return JSON.parse(data) as AppState;
      }
      return null;
    } catch (error) {
      console.error('Download from Drive failed:', error);
      return null;
    }
  }

  static async uploadToDrive(state: AppState): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('Mock: Upload to Google Drive');
      return true;
    }

    try {
      const serializedState = JSON.stringify(state);
      await GoogleDriveSyncEngine.uploadToDrive(serializedState);
      return true;
    } catch (error) {
      console.error('Upload to Drive failed:', error);
      return false;
    }
  }

  static async performBackgroundSync(): Promise<void> {
    if (Platform.OS === 'web') return;
    
    try {
      const isSignedIn = await this.isSignedIn();
      if (!isSignedIn) return;

      const localState = await this.getLocalState();
      if (!localState) return;

      const result = await this.syncWithDrive(localState);
      
      if (result === 'downloaded') {
        const remoteState = await this.downloadFromDrive();
        if (remoteState) {
          await this.saveLocalState(remoteState);
          console.log('Background sync: Downloaded and applied remote state');
        }
      }
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  private static getStorage() {
    if (Platform.OS === 'web') {
      return {
        getString: (key: string) => localStorage.getItem(key) || undefined,
        set: (key: string, value: string) => localStorage.setItem(key, value),
        delete: (key: string) => localStorage.removeItem(key),
      };
    } else {
      const { MMKV } = require('react-native-mmkv');
      return new MMKV();
    }
  }

  static async getLocalState(): Promise<AppState | null> {
    try {
      const storage = this.getStorage();
      const data = storage.getString(this.SYNC_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Get local state failed:', error);
      return null;
    }
  }

  static async saveLocalState(state: AppState): Promise<void> {
    try {
      const storage = this.getStorage();
      storage.set(this.SYNC_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Save local state failed:', error);
    }
  }
}
```

---

## Step 9: Create Navigation

### App Navigator (`src/navigation/AppNavigator.tsx`)

```typescript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { HomeScreen } from '../screens/HomeScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PomodoroScreen } from '../screens/PomodoroScreen';

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
          }}
        />
        <Tab.Screen 
          name="Pomodoro" 
          component={PomodoroScreen}
          options={{
            tabBarLabel: 'Pomodoro',
          }}
        />
        <Tab.Screen 
          name="Calendar" 
          component={CalendarScreen}
          options={{
            tabBarLabel: 'Calendar',
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
```

---

## Step 10: Create Screens

### Home Screen (`src/screens/HomeScreen.tsx`)

```typescript
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

  useEffect(() => {
    requestNotificationPermissions();
    
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
```

### Other Screens (Create similar implementations for PomodoroScreen, CalendarScreen, SettingsScreen)

---

## Step 11: Create Components

### Task Item Component (`src/components/TaskItem.tsx`)

```typescript
import React, { useCallback } from 'react';
import { View, Text as RNText, StyleSheet, Animated } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Task, Priority } from '../types';
import { useTheme } from '../theme/theme';
import * as Haptics from 'expo-haptics';

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  drag?: () => void;
  isActive?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onComplete, 
  onDelete, 
  drag, 
  isActive 
}) => {
  const theme = useTheme();
  const swipeableRef = React.useRef<Swipeable>(null);

  const getPriorityColor = useCallback((priority: Priority) => {
    switch (priority) {
      case 'high': return theme.colors.error;
      case 'med': return theme.colors.warning;
      case 'low': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  }, [theme.colors]);

  const handleComplete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete(task.id);
    swipeableRef.current?.close();
  }, [task.id, onComplete]);

  const handleDelete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onDelete(task.id);
    swipeableRef.current?.close();
  }, [task.id, onDelete]);

  const renderRightActions = (progress: Animated.AnimatedAddition) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <View style={[styles.actionContainer, { backgroundColor: theme.colors.success }]}>
        <Animated.View style={[styles.actionButton, { transform: [{ scale }] }]}>
          <RNText style={styles.actionText}>✓</RNText>
        </Animated.View>
      </View>
    );
  };

  const renderLeftActions = (progress: Animated.AnimatedAddition) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <View style={[styles.actionContainer, { backgroundColor: theme.colors.error }]}>
        <Animated.View style={[styles.actionButton, { transform: [{ scale }] }]}>
          <RNText style={styles.actionText}>🗑</RNText>
        </Animated.View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.md,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      overflow: 'hidden',
      opacity: isActive ? 0.8 : 1,
    },
    taskContent: {
      padding: theme.spacing.md,
    },
    taskHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    taskTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginLeft: theme.spacing.sm,
    },
    completedTask: {
      textDecorationLine: 'line-through',
      color: theme.colors.textSecondary,
    },
    priorityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginLeft: theme.spacing.sm,
    },
    taskNotes: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.lg,
      marginTop: theme.spacing.xs,
    },
    actionContainer: {
      width: 80,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionText: {
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
    },
  });

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      onSwipeableRightOpen={handleComplete}
      onSwipeableLeftOpen={handleDelete}
      friction={2}
      rightThreshold={40}
      leftThreshold={40}
    >
      <View style={styles.container}>
        <RectButton style={styles.taskContent} onPress={() => {}}>
          <View style={styles.taskHeader}>
            <RNText style={[
              styles.taskTitle,
              task.isCompleted && styles.completedTask
            ]}>
              {task.title}
            </RNText>
            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
          </View>
          
          {task.notes && (
            <RNText style={styles.taskNotes}>{task.notes}</RNText>
          )}
        </RectButton>
      </View>
    </Swipeable>
  );
};
```

### Create remaining components following the same pattern

---

## Step 12: Update Main App File

### Update App.tsx

```typescript
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}
```

---

## Step 13: Google Drive Setup

### Google Cloud Console Configuration

1. **Create Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project: "Daily To-Do App"

2. **Enable APIs**
   - Enable Google Drive API
   - Enable Google Sign-In API

3. **Create OAuth Credentials**
   - Go to Credentials → Create Credentials → OAuth client ID
   - Application type: Web application
   - Add authorized redirect URI
   - Note down Client ID

4. **Configure App**
   - Update `googleDriveSync.ts` with your client IDs:
   ```typescript
   GoogleSignin.configure({
     webClientId: 'your-web-client-id.apps.googleusercontent.com',
     iosClientId: 'your-ios-client-id.apps.googleusercontent.com',
   });
   ```

---

## Step 14: Testing and Verification

### Run Application

```bash
# Start development server
npm start

# Test on different platforms
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Press 'w' for web browser
```

### Verification Checklist

- [ ] App launches successfully
- [ ] Navigation works between tabs
- [ ] Task creation works
- [ ] Task completion works
- [ ] Task deletion works
- [ ] Smart lists filter correctly
- [ ] Pomodoro timer functions
- [ ] Google Sign-In works
- [ ] Sync functionality works
- [ ] Notifications are scheduled
- [ ] Theme switching works
- [ ] Responsive design works

---

## Step 15: Build and Deployment

### Development Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for development
eas build --platform all --profile development
```

### Production Build

```bash
# Build for production
eas build --platform all --profile production

# Submit to app stores (optional)
eas submit --platform all
```

---

## Troubleshooting

### Common Issues

1. **Metro Cache Issues**
   ```bash
   npx expo start --clear
   ```

2. **Dependency Conflicts**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Google Sign-In Issues**
   - Verify client IDs are correct
   - Check OAuth consent screen configuration
   - Ensure proper SHA-1 fingerprints for Android

4. **iOS Build Issues**
   - Update Xcode to latest version
   - Clean build folder
   - Check iOS deployment target

5. **Android Build Issues**
   - Update Android SDK
   - Check Gradle wrapper version
   - Verify Android manifest permissions

### Debug Commands

```bash
# Check Expo diagnostics
npx expo doctor

# View logs
npx expo start --tunnel

# Clear cache
npx expo start --clear --reset-cache
```

---

## Final Verification

After completing all steps, you should have a fully functional Daily To-Do application with:

- ✅ Task management with CRUD operations
- ✅ Smart lists (Inbox, Today, Upcoming)
- ✅ Pomodoro timer with task tracking
- ✅ Google Drive synchronization
- ✅ Natural language date parsing
- ✅ Push notifications
- ✅ Theme support
- ✅ Cross-platform compatibility
- ✅ Gesture-based interactions
- ✅ Haptic feedback

The application should be ready for development, testing, and eventual deployment to app stores.
