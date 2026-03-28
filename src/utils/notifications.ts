import { Platform } from 'react-native';

// Mock notifications for web environment
const mockNotifications = {
  setNotificationHandler: async () => {},
  requestPermissionsAsync: async () => ({ status: 'granted' }),
  scheduleNotificationAsync: async () => 'mock-notification-id',
  cancelScheduledNotificationAsync: async () => {},
};

// Try to import expo-notifications, fallback to mock for web
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

export interface ScheduledNotification {
  id: string;
  taskTitle: string;
  scheduledDate: Date;
}

export class NotificationManager {
  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web, using mock');
      return true; // Return true for web to avoid blocking functionality
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
    // Cancel old notification if it exists
    if (oldNotificationId) {
      await this.cancelNotification(oldNotificationId);
    }

    // Schedule new notification
    return this.scheduleNotification(taskTitle, scheduledDate, taskId);
  }
}

// Utility function to check if a date is in the future
export const isFutureDate = (date: Date): boolean => {
  return date.getTime() > Date.now();
};
