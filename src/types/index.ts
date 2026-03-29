export type Priority = 'low' | 'med' | 'high';

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'custom' | 'weekdays';

export interface RecurrenceRule {
  type: RecurrenceType;
  interval?: number; // For custom intervals (e.g., every 3 days)
  weekdays?: number[]; // 0-6 (Sunday-Saturday), only used with 'weekdays' type
  endDate?: Date; // Optional end date for recurrence
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
  timeSpent?: number; // in minutes
  estimatedDuration?: number; // in minutes
  recurrence?: RecurrenceRule; // New field for recurring tasks
  isRecurringInstance?: boolean; // True if this is an instance of a recurring task
  parentRecurringTaskId?: string; // Reference to the original recurring task
  subtasks?: Subtask[]; // Array of subtasks
  scheduledTime?: Date; // Specific time slot for calendar scheduling
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

export type ThemePreference = 'system' | 'light' | 'dark';

export interface AppState {
  tasks: Task[];
  folders: Folder[];
  tags: Tag[];
  themePreference: ThemePreference;
  lastSyncedAt?: string; // ISO timestamp
}
