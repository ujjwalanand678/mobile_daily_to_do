# Updated Type Definitions - Daily To-Do App v2.0

## Overview
This document outlines all the updated type definitions for the enhanced Daily To-Do application with recurring tasks, subtasks, time estimates, calendar scheduling, and productivity analytics.

## Core Types

### Priority
```typescript
export type Priority = 'low' | 'med' | 'high';
```

### Theme Preference
```typescript
export type ThemePreference = 'system' | 'light' | 'dark';
```

## New Types Added

### Recurrence Types
```typescript
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'custom' | 'weekdays';

export interface RecurrenceRule {
  type: RecurrenceType;
  interval?: number; // For custom intervals (e.g., every 3 days)
  weekdays?: number[]; // 0-6 (Sunday-Saturday), only used with 'weekdays' type
  endDate?: Date; // Optional end date for recurrence
}
```

### Subtask Type
```typescript
export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Updated Core Interfaces

### Task Interface (Enhanced)
```typescript
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
  
  // NEW FIELDS
  estimatedDuration?: number; // in minutes
  recurrence?: RecurrenceRule;
  isRecurringInstance?: boolean; // True if this is an instance of a recurring task
  parentRecurringTaskId?: string; // Reference to the original recurring task
  subtasks?: Subtask[]; // Array of subtasks
  scheduledTime?: Date; // Specific time slot for calendar scheduling
}
```

### Folder Interface (Unchanged)
```typescript
export interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Tag Interface (Unchanged)
```typescript
export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### App State Interface (Unchanged)
```typescript
export interface AppState {
  tasks: Task[];
  folders: Folder[];
  tags: Tag[];
  themePreference: ThemePreference;
  lastSyncedAt?: string; // ISO timestamp
}
```

## Component Props Types

### QuickAddModal Props
```typescript
interface QuickAddModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTask: (task: { 
    title: string; 
    notes?: string; 
    priority: Priority; 
    folderId: string; 
    tags: string[]; 
    dueDate?: Date;
    recurrence?: RecurrenceRule; // NEW
    estimatedDuration?: number; // NEW
  }) => void;
  folders: Folder[];
  tags: Tag[];
  allTasks?: Task[]; // NEW - For time estimate suggestions
}
```

### TaskItem Props
```typescript
interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  drag?: () => void;
  isActive?: boolean;
  // NEW - Subtask handlers
  onAddSubtask?: (taskId: string, title: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onUpdateSubtask?: (taskId: string, subtaskId: string, title: string) => void;
  onDeleteSubtask?: (taskId: string, subtaskId: string) => void;
}
```

### RecurrenceSelector Props
```typescript
interface RecurrenceSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (recurrence: RecurrenceRule | undefined) => void;
  currentRecurrence?: RecurrenceRule;
}
```

### TimeEstimateInput Props
```typescript
interface TimeEstimateInputProps {
  value?: number; // in minutes
  onChange: (minutes: number | undefined) => void;
  taskTitle?: string;
  allTasks?: Task[]; // For suggestions
  placeholder?: string;
}
```

### SubtaskItem Props
```typescript
interface SubtaskItemProps {
  subtask: Subtask;
  onToggle: (subtaskId: string) => void;
  onUpdate: (subtaskId: string, title: string) => void;
  onDelete: (subtaskId: string) => void;
  isEditing?: boolean;
  onEditToggle?: () => void;
}
```

### SubtaskList Props
```typescript
interface SubtaskListProps {
  task: Task;
  onTaskUpdate: (updatedTask: Task) => void;
  onAddSubtask: (title: string) => void;
  onToggleSubtask: (subtaskId: string) => void;
  onUpdateSubtask: (subtaskId: string, title: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
}
```

### TimeSlot Props
```typescript
interface TimeSlotProps {
  time: Date;
  label: string;
  tasks: Task[];
  onTaskPress?: (task: Task) => void;
  onTaskLongPress?: (task: Task) => void;
  onDrop?: (taskId: string, slotTime: Date) => void;
  isDropTarget?: boolean;
  allTasks?: Task[];
}
```

### DraggableTaskItem Props
```typescript
interface DraggableTaskItemProps {
  task: Task;
  onLongPress?: () => void;
  onPress?: () => void;
  isDragging?: boolean;
  isActive?: boolean;
}
```

## Store Interface Types

### AppStore Interface (Enhanced)
```typescript
interface AppStore extends AppState {
  // UI logic state (non-persistent)
  tasksPendingDeletion: string[];

  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'notificationId' | 'isCompleted'>) => void;
  toggleTask: (taskId: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  undoDeleteTask: (taskId: string) => void;
  permanentlyDeleteTask: (taskId: string) => void;
  requestNotificationPermissions: () => Promise<boolean>;
  
  // NEW - Recurring task actions
  createRecurringInstance: (taskId: string) => void;
  checkAndCreateRecurringInstances: () => void;
  
  // NEW - Subtask actions
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  updateSubtask: (taskId: string, subtaskId: string, title: string) => void;
  reorderSubtasks: (taskId: string, fromIndex: number, toIndex: number) => void;
  
  // NEW - Calendar scheduling actions
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
}
```

## Utility Manager Types

### RecurrenceManager Methods
```typescript
export class RecurrenceManager {
  static getNextOccurrence(task: Task): Date | null;
  static createNextInstance(task: Task): Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'notificationId' | 'isCompleted'> | null;
  static shouldRecurToday(task: Task): boolean;
  static getInstancesToCreate(tasks: Task[]): Task[];
  static getRecurrenceDescription(recurrence: RecurrenceRule): string;
  static migrateTask(task: any): Task;
}
```

### SubtaskManager Methods
```typescript
export class SubtaskManager {
  static addSubtask(task: Task, title: string): Task;
  static toggleSubtask(task: Task, subtaskId: string): Task;
  static deleteSubtask(task: Task, subtaskId: string): Task;
  static updateSubtask(task: Task, subtaskId: string, title: string): Task;
  static getCompletionPercentage(task: Task): number;
  static getCompletedCount(task: Task): number;
  static getTotalCount(task: Task): number;
  static hasSubtasks(task: Task): boolean;
  static migrateTask(task: any): Task;
  static reorderSubtasks(task: Task, fromIndex: number, toIndex: number): Task;
}
```

### TimeEstimateManager Methods
```typescript
export class TimeEstimateManager {
  static formatDuration(minutes: number): string;
  static parseDuration(duration: string): number | null;
  static getTotalEstimatedTime(tasks: Task[]): number;
  static getTotalTimeSpent(tasks: Task[]): number;
  static getTasksForDate(tasks: Task[], date: Date): Task[];
  static getTodayTasksWithEstimates(tasks: Task[]): Task[];
  static getAvailableWorkingTime(date?: Date, startHour?: number, endHour?: number): number;
  static suggestTaskOrder(tasks: Task[]): Task[];
  static canFitInTime(tasks: Task[], availableMinutes: number): boolean;
  static getTasksThatFit(tasks: Task[], availableMinutes: number): Task[];
  static calculatePomodoroSessions(estimatedMinutes: number, sessionLength?: number): number;
  static suggestTimeEstimate(taskTitle: string, allTasks: Task[]): number | null;
  static migrateTask(task: any): Task;
}
```

### CalendarSchedulingManager Methods
```typescript
export class CalendarSchedulingManager {
  static generateTimeSlots(date: Date): { time: Date; label: string }[];
  static formatTimeSlot(startTime: Date, endTime: Date): string;
  static formatTime(date: Date): string;
  static getTasksForTimeSlot(tasks: Task[], slotTime: Date): Task[];
  static isTimeSlotAvailable(tasks: Task[], slotTime: Date, excludeTaskId?: string): boolean;
  static findAvailableSlots(tasks: Task[], date: Date, duration?: number): Date[];
  static scheduleTask(task: Task, slotTime: Date): Task;
  static unscheduleTask(task: Task): Task;
  static rescheduleTask(task: Task, newSlotTime: Date): Task;
  static getTasksForDate(tasks: Task[], date: Date): Task[];
  static getTasksByTimeSlots(tasks: Task[], date: Date): { slot: { time: Date; label: string }; tasks: Task[] }[];
  static hasConflictingTasks(task: Task, tasks: Task[]): boolean;
  static getConflictingTasks(task: Task, tasks: Task[]): Task[];
  static autoScheduleTasks(tasks: Task[], date: Date): Task[];
  static migrateTask(task: any): Task;
}
```

### AnalyticsManager Methods
```typescript
export class AnalyticsManager {
  static getTasksCompletedToday(tasks: Task[]): Task[];
  static getTasksCompletedLastWeek(tasks: Task[]): Task[];
  static getCompletionRate(tasks: Task[], startDate: Date, endDate: Date): number;
  static getWeeklyCompletionData(tasks: Task[]): { day: string; completed: number; total: number }[];
  static getTotalFocusTime(tasks: Task[]): number;
  static getTodayFocusTime(tasks: Task[]): number;
  static getCurrentStreak(tasks: Task[]): number;
  static getAverageCompletionRate(tasks: Task[]): number;
  static getProductivityInsights(tasks: Task[]): {
    mostProductiveDay: string;
    averageTasksPerDay: number;
    totalTasksCompleted: number;
    focusTimeToday: string;
    streakDays: number;
  };
  static formatDuration(minutes: number): string;
  static getTaskDistributionByPriority(tasks: Task[]): { high: number; med: number; low: number };
  static getTaskDistributionByStatus(tasks: Task[]): { completed: number; pending: number };
  static getProductivityScore(tasks: Task[]): number;
}
```

## Migration Types

### Migration Function Types
```typescript
type MigrationFunction = (task: any) => Task;

// Applied in sequence:
// 1. RecurrenceManager.migrateTask
// 2. SubtaskManager.migrateTask  
// 3. TimeEstimateManager.migrateTask
// 4. CalendarSchedulingManager.migrateTask
```

## Usage Examples

### Creating a Recurring Task
```typescript
const recurringTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'notificationId' | 'isCompleted'> = {
  title: "Weekly Team Meeting",
  priority: 'high',
  folderId: 'default',
  tags: [],
  estimatedDuration: 60,
  recurrence: {
    type: 'weekly',
    interval: 1,
  },
  dueDate: new Date('2024-01-08T09:00:00'),
};
```

### Creating a Task with Subtasks
```typescript
const taskWithSubtasks = {
  title: "Project Launch",
  priority: 'high',
  folderId: 'default',
  tags: [],
  estimatedDuration: 120,
  subtasks: [
    {
      id: 'sub1',
      title: 'Final testing',
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'sub2', 
      title: 'Documentation',
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};
```

### Creating a Scheduled Task
```typescript
const scheduledTask = {
  title: "Client Call",
  priority: 'med',
  folderId: 'default',
  tags: [],
  estimatedDuration: 30,
  scheduledTime: new Date('2024-01-08T14:00:00'),
};
```

## Type Safety

All new features maintain full TypeScript type safety with:
- Strict typing for all new interfaces
- Generic type parameters where appropriate
- Union types for flexible configurations
- Optional properties for backward compatibility

## Backward Compatibility

The type system ensures backward compatibility by:
- Making all new fields optional
- Providing default values in migration functions
- Supporting existing data structures
- Graceful handling of missing properties
