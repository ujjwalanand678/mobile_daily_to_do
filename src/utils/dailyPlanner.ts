import { Platform } from 'react-native';
import { Task } from '../types';

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
    id: 'daily-planner',
    encryptionKey: undefined,
  });
  storage = {
    getString: (key: string) => mmkv.getString(key),
    set: (key: string, value: string) => mmkv.set(key, value),
    delete: (key: string) => mmkv.delete(key),
  };
}

export class DailyPlannerUtils {
  private static readonly LAST_OPEN_KEY = 'daily_planner_last_open';
  private static readonly DAILY_PLANNER_SHOWN_KEY = 'daily_planner_shown';

  static isFirstOpenToday(): boolean {
    const lastOpen = storage.getString(this.LAST_OPEN_KEY);
    const today = new Date().toDateString();
    
    if (!lastOpen || lastOpen !== today) {
      // Update the last open date
      storage.set(this.LAST_OPEN_KEY, today);
      return true;
    }
    
    return false;
  }

  static shouldShowDailyPlanner(): boolean {
    // Only show if it's the first open today AND we haven't shown it today
    const isFirstOpen = this.isFirstOpenToday();
    const alreadyShown = storage.getString(this.DAILY_PLANNER_SHOWN_KEY) === new Date().toDateString();
    
    if (isFirstOpen && !alreadyShown) {
      storage.set(this.DAILY_PLANNER_SHOWN_KEY, new Date().toDateString());
      return true;
    }
    
    return false;
  }

  static getTodayTasks(tasks: Task[]): Task[] {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return tasks.filter(task => {
      if (task.isCompleted) return false;
      if (!task.dueDate) return false;
      
      const taskDate = new Date(task.dueDate.getFullYear(), task.dueDate.getMonth(), task.dueDate.getDate());
      return taskDate.getTime() === today.getTime();
    });
  }

  static getOverdueTasks(tasks: Task[]): Task[] {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return tasks.filter(task => {
      if (task.isCompleted) return false;
      if (!task.dueDate) return false;
      
      const taskDate = new Date(task.dueDate.getFullYear(), task.dueDate.getMonth(), task.dueDate.getDate());
      return taskDate.getTime() < today.getTime();
    });
  }

  static deferTaskToTomorrow(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // Set to 9 AM tomorrow
    return tomorrow;
  }

  static resetDailyPlanner(): void {
    storage.delete(this.DAILY_PLANNER_SHOWN_KEY);
  }
}
