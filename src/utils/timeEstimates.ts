import { Task } from '../types';

export class TimeEstimateManager {
  
  /**
   * Format minutes to human readable format (e.g., "1h 30m", "45m")
   */
  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Parse duration string to minutes
   */
  static parseDuration(duration: string): number | null {
    const cleanDuration = duration.toLowerCase().trim();
    
    // Match patterns like "1h", "30m", "1h 30m", "1.5h"
    const hourMatch = cleanDuration.match(/(\d+(?:\.\d+)?)\s*h/);
    const minuteMatch = cleanDuration.match(/(\d+)\s*m/);
    
    let totalMinutes = 0;
    
    if (hourMatch) {
      const hours = parseFloat(hourMatch[1]);
      totalMinutes += Math.round(hours * 60);
    }
    
    if (minuteMatch) {
      totalMinutes += parseInt(minuteMatch[1]);
    }
    
    // If no explicit unit, assume minutes
    if (!hourMatch && !minuteMatch) {
      const numericMatch = cleanDuration.match(/(\d+(?:\.\d+)?)/);
      if (numericMatch) {
        const value = parseFloat(numericMatch[1]);
        totalMinutes = value > 10 ? Math.round(value) : Math.round(value * 60); // Assume hours if >10
      }
    }
    
    return totalMinutes > 0 ? totalMinutes : null;
  }

  /**
   * Calculate total estimated time for a list of tasks
   */
  static getTotalEstimatedTime(tasks: Task[]): number {
    return tasks.reduce((total, task) => {
      return total + (task.estimatedDuration || 0);
    }, 0);
  }

  /**
   * Calculate total time spent for a list of tasks
   */
  static getTotalTimeSpent(tasks: Task[]): number {
    return tasks.reduce((total, task) => {
      return total + (task.timeSpent || 0);
    }, 0);
  }

  /**
   * Get tasks for a specific date
   */
  static getTasksForDate(tasks: Task[], date: Date): Task[] {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    return tasks.filter(task => {
      if (!task.dueDate || task.isCompleted) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate >= targetDate && taskDate < nextDate;
    });
  }

  /**
   * Get today's tasks with time estimates
   */
  static getTodayTasksWithEstimates(tasks: Task[]): Task[] {
    return this.getTasksForDate(tasks, new Date()).filter(task => task.estimatedDuration);
  }

  /**
   * Calculate available working time for today (9 AM - 6 PM by default)
   */
  static getAvailableWorkingTime(date: Date = new Date(), startHour: number = 9, endHour: number = 18): number {
    const now = new Date();
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startTime = new Date(today);
    startTime.setHours(startHour, 0, 0, 0);
    const endTime = new Date(today);
    endTime.setHours(endHour, 0, 0, 0);
    
    // If it's today and past start time, calculate remaining time
    if (date.toDateString() === now.toDateString() && now > startTime) {
      const remainingMinutes = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / (1000 * 60)));
      return remainingMinutes;
    }
    
    // Full day availability
    return (endHour - startHour) * 60;
  }

  /**
   * Suggest optimal task order based on priority and estimated time
   */
  static suggestTaskOrder(tasks: Task[]): Task[] {
    return tasks.sort((a, b) => {
      // First by priority
      const priorityOrder = { high: 0, med: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by estimated duration (shorter tasks first for quick wins)
      const aDuration = a.estimatedDuration || 0;
      const bDuration = b.estimatedDuration || 0;
      return aDuration - bDuration;
    });
  }

  /**
   * Check if tasks can fit within available time
   */
  static canFitInTime(tasks: Task[], availableMinutes: number): boolean {
    const totalEstimated = this.getTotalEstimatedTime(tasks);
    return totalEstimated <= availableMinutes;
  }

  /**
   * Get tasks that can fit within available time
   */
  static getTasksThatFit(tasks: Task[], availableMinutes: number): Task[] {
    const sortedTasks = this.suggestTaskOrder(tasks);
    const fittingTasks: Task[] = [];
    let totalTime = 0;
    
    for (const task of sortedTasks) {
      if (task.estimatedDuration) {
        if (totalTime + task.estimatedDuration <= availableMinutes) {
          fittingTasks.push(task);
          totalTime += task.estimatedDuration;
        } else {
          break;
        }
      }
    }
    
    return fittingTasks;
  }

  /**
   * Calculate Pomodoro sessions from estimated duration
   */
  static calculatePomodoroSessions(estimatedMinutes: number, sessionLength: number = 25): number {
    if (!estimatedMinutes) return 1;
    return Math.max(1, Math.ceil(estimatedMinutes / sessionLength));
  }

  /**
   * Get time estimate suggestions based on task title and similar tasks
   */
  static suggestTimeEstimate(taskTitle: string, allTasks: Task[]): number | null {
    // Simple keyword-based suggestions
    const keywords = {
      quick: 15,
      brief: 15,
      short: 15,
      call: 30,
      email: 15,
      meeting: 60,
      review: 30,
      plan: 45,
      research: 90,
      write: 60,
      design: 120,
      code: 120,
      test: 60,
      fix: 45,
      deploy: 30,
      learn: 90,
      read: 45,
    };

    const title = taskTitle.toLowerCase();
    for (const [keyword, minutes] of Object.entries(keywords)) {
      if (title.includes(keyword)) {
        return minutes;
      }
    }

    // Find similar tasks and use their average
    const similarTasks = allTasks.filter(t => 
      t.estimatedDuration && 
      t.title.toLowerCase().includes(title.split(' ')[0])
    );

    if (similarTasks.length > 0) {
      const avgDuration = similarTasks.reduce((sum, t) => sum + (t.estimatedDuration || 0), 0) / similarTasks.length;
      return Math.round(avgDuration);
    }

    return null;
  }

  /**
   * Migrate old tasks to include estimatedDuration field (backward compatibility)
   */
  static migrateTask(task: any): Task {
    return {
      ...task,
      estimatedDuration: task.estimatedDuration || undefined,
    };
  }
}
