import { Task, RecurrenceRule, RecurrenceType } from '../types';

export class RecurrenceManager {
  
  /**
   * Calculate the next occurrence date for a recurring task
   */
  static getNextOccurrence(task: Task): Date | null {
    if (!task.recurrence || !task.dueDate) return null;

    const { recurrence } = task;
    const currentDate = new Date(task.dueDate);
    
    switch (recurrence.type) {
      case 'daily':
        return this.addDays(currentDate, recurrence.interval || 1);
      
      case 'weekly':
        return this.addDays(currentDate, (recurrence.interval || 1) * 7);
      
      case 'monthly':
        return this.addMonths(currentDate, recurrence.interval || 1);
      
      case 'weekdays':
        return this.getNextWeekday(currentDate, recurrence.weekdays || [1, 2, 3, 4, 5]);
      
      case 'custom':
        return this.addDays(currentDate, recurrence.interval || 1);
      
      default:
        return null;
    }
  }

  /**
   * Create the next instance of a recurring task
   */
  static createNextInstance(task: Task): Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'notificationId' | 'isCompleted'> | null {
    const nextDueDate = this.getNextOccurrence(task);
    if (!nextDueDate) return null;

    // Check if next occurrence is beyond the end date
    if (task.recurrence?.endDate && nextDueDate > task.recurrence.endDate) {
      return null;
    }

    return {
      title: task.title,
      notes: task.notes,
      dueDate: nextDueDate,
      priority: task.priority,
      folderId: task.folderId,
      tags: task.tags,
      timeSpent: task.timeSpent,
      recurrence: task.recurrence,
      isRecurringInstance: true,
      parentRecurringTaskId: task.parentRecurringTaskId || task.id,
    };
  }

  /**
   * Check if a task should recur today
   */
  static shouldRecurToday(task: Task): boolean {
    if (!task.recurrence || !task.dueDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);

    return taskDate.getTime() === today.getTime();
  }

  /**
   * Get all recurring instances that need to be created for today
   */
  static getInstancesToCreate(tasks: Task[]): Task[] {
    const instances: Task[] = [];
    
    tasks.forEach(task => {
      if (task.recurrence && !task.isRecurringInstance) {
        const nextInstance = this.createNextInstance(task);
        if (nextInstance && this.shouldRecurToday(task)) {
          instances.push({
            ...nextInstance,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            isCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    });

    return instances;
  }

  /**
   * Add days to a date
   */
  private static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Add months to a date
   */
  private static addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  /**
   * Get the next weekday occurrence
   */
  private static getNextWeekday(date: Date, weekdays: number[]): Date {
    const result = new Date(date);
    let daysToAdd = 1;
    
    while (daysToAdd <= 7) {
      const nextDate = this.addDays(result, daysToAdd);
      const dayOfWeek = nextDate.getDay();
      
      if (weekdays.includes(dayOfWeek)) {
        return nextDate;
      }
      
      daysToAdd++;
    }
    
    return this.addDays(result, 7); // Fallback to next week
  }

  /**
   * Get human readable recurrence description
   */
  static getRecurrenceDescription(recurrence: RecurrenceRule): string {
    switch (recurrence.type) {
      case 'daily':
        return recurrence.interval && recurrence.interval > 1 
          ? `Every ${recurrence.interval} days`
          : 'Daily';
      
      case 'weekly':
        return recurrence.interval && recurrence.interval > 1 
          ? `Every ${recurrence.interval} weeks`
          : 'Weekly';
      
      case 'monthly':
        return recurrence.interval && recurrence.interval > 1 
          ? `Every ${recurrence.interval} months`
          : 'Monthly';
      
      case 'weekdays':
        return 'Weekdays (Mon-Fri)';
      
      case 'custom':
        return recurrence.interval && recurrence.interval > 1 
          ? `Every ${recurrence.interval} days`
          : 'Custom';
      
      default:
        return 'No recurrence';
    }
  }

  /**
   * Migrate old tasks to add recurrence fields (backward compatibility)
   */
  static migrateTask(task: any): Task {
    return {
      ...task,
      recurrence: task.recurrence || undefined,
      isRecurringInstance: task.isRecurringInstance || false,
      parentRecurringTaskId: task.parentRecurringTaskId || undefined,
    };
  }
}
