import { Task } from '../types';

export class CalendarSchedulingManager {
  
  /**
   * Generate time slots for a given date (30-minute intervals from 8 AM to 8 PM)
   */
  static generateTimeSlots(date: Date): { time: Date; label: string }[] {
    const slots = [];
    const startOfDay = new Date(date);
    startOfDay.setHours(8, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(20, 0, 0, 0);

    const currentTime = new Date(startOfDay);
    while (currentTime < endOfDay) {
      const endTime = new Date(currentTime);
      endTime.setMinutes(currentTime.getMinutes() + 30);
      
      slots.push({
        time: new Date(currentTime),
        label: this.formatTimeSlot(currentTime, endTime),
      });
      
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    return slots;
  }

  /**
   * Format time slot for display (e.g., "9:00 - 9:30 AM")
   */
  static formatTimeSlot(startTime: Date, endTime: Date): string {
    return `${this.formatTime(startTime)} - ${this.formatTime(endTime)}`;
  }

  /**
   * Format time for display (e.g., "9:00 AM")
   */
  static formatTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${period}`;
  }

  /**
   * Get tasks scheduled for a specific time slot
   */
  static getTasksForTimeSlot(tasks: Task[], slotTime: Date): Task[] {
    const slotStart = new Date(slotTime);
    const slotEnd = new Date(slotTime);
    slotEnd.setMinutes(slotEnd.getMinutes() + 30);

    return tasks.filter(task => {
      if (!task.scheduledTime) return false;
      
      const taskTime = new Date(task.scheduledTime);
      return taskTime >= slotStart && taskTime < slotEnd;
    });
  }

  /**
   * Check if a time slot is available for a task
   */
  static isTimeSlotAvailable(tasks: Task[], slotTime: Date, excludeTaskId?: string): boolean {
    const tasksInSlot = this.getTasksForTimeSlot(tasks, slotTime);
    
    if (excludeTaskId) {
      return tasksInSlot.every(task => task.id === excludeTaskId);
    }
    
    return tasksInSlot.length === 0;
  }

  /**
   * Find available time slots for a task
   */
  static findAvailableSlots(tasks: Task[], date: Date, duration: number = 30): Date[] {
    const slots = this.generateTimeSlots(date);
    const availableSlots: Date[] = [];
    
    // Calculate how many consecutive slots needed
    const slotsNeeded = Math.ceil(duration / 30);
    
    for (let i = 0; i <= slots.length - slotsNeeded; i++) {
      let isAvailable = true;
      
      // Check each slot in the required duration
      for (let j = 0; j < slotsNeeded; j++) {
        if (!this.isTimeSlotAvailable(tasks, slots[i + j].time)) {
          isAvailable = false;
          break;
        }
      }
      
      if (isAvailable) {
        availableSlots.push(slots[i].time);
      }
    }
    
    return availableSlots;
  }

  /**
   * Schedule a task in a specific time slot
   */
  static scheduleTask(task: Task, slotTime: Date): Task {
    return {
      ...task,
      scheduledTime: new Date(slotTime),
      updatedAt: new Date(),
    };
  }

  /**
   * Unschedule a task (remove scheduled time)
   */
  static unscheduleTask(task: Task): Task {
    return {
      ...task,
      scheduledTime: undefined,
      updatedAt: new Date(),
    };
  }

  /**
   * Reschedule a task to a different time slot
   */
  static rescheduleTask(task: Task, newSlotTime: Date): Task {
    return {
      ...task,
      scheduledTime: new Date(newSlotTime),
      updatedAt: new Date(),
    };
  }

  /**
   * Get tasks scheduled for a specific date
   */
  static getTasksForDate(tasks: Task[], date: Date): Task[] {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return tasks.filter(task => {
      if (!task.scheduledTime) return false;
      const taskTime = new Date(task.scheduledTime);
      return taskTime >= startOfDay && taskTime <= endOfDay;
    });
  }

  /**
   * Get scheduled tasks grouped by time slots
   */
  static getTasksByTimeSlots(tasks: Task[], date: Date): { slot: { time: Date; label: string }; tasks: Task[] }[] {
    const slots = this.generateTimeSlots(date);
    const scheduledTasks = this.getTasksForDate(tasks, date);
    
    return slots.map(slot => ({
      slot,
      tasks: this.getTasksForTimeSlot(scheduledTasks, slot.time),
    }));
  }

  /**
   * Check if a task conflicts with other tasks in a time slot
   */
  static hasConflictingTasks(task: Task, tasks: Task[]): boolean {
    if (!task.scheduledTime) return false;
    
    const tasksInSlot = this.getTasksForTimeSlot(tasks, task.scheduledTime);
    return tasksInSlot.some(t => t.id !== task.id);
  }

  /**
   * Get conflicting tasks for a given task
   */
  static getConflictingTasks(task: Task, tasks: Task[]): Task[] {
    if (!task.scheduledTime) return [];
    
    const tasksInSlot = this.getTasksForTimeSlot(tasks, task.scheduledTime);
    return tasksInSlot.filter(t => t.id !== task.id);
  }

  /**
   * Auto-schedule unscheduled tasks for a day
   */
  static autoScheduleTasks(tasks: Task[], date: Date): Task[] {
    const unscheduledTasks = tasks.filter(task => 
      !task.scheduledTime && 
      task.dueDate && 
      this.isSameDay(task.dueDate, date) &&
      task.estimatedDuration
    );

    const scheduledTasks = tasks.filter(task => task.scheduledTime);
    let updatedTasks = [...scheduledTasks];

    // Sort by priority and duration
    const sortedTasks = unscheduledTasks.sort((a, b) => {
      const priorityOrder = { high: 0, med: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      const aDuration = a.estimatedDuration || 0;
      const bDuration = b.estimatedDuration || 0;
      return aDuration - bDuration;
    });

    for (const task of sortedTasks) {
      const availableSlots = this.findAvailableSlots(updatedTasks, date, task.estimatedDuration);
      
      if (availableSlots.length > 0) {
        const scheduledTask = this.scheduleTask(task, availableSlots[0]);
        updatedTasks.push(scheduledTask);
      }
    }

    return updatedTasks;
  }

  /**
   * Check if two dates are the same day
   */
  private static isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * Migrate old tasks to include scheduledTime field (backward compatibility)
   */
  static migrateTask(task: any): Task {
    return {
      ...task,
      scheduledTime: task.scheduledTime || undefined,
    };
  }
}
