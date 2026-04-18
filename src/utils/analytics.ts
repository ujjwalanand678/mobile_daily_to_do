import { Task } from '../types';

export class AnalyticsManager {
  
  /**
   * Get tasks completed today
   */
  static getTasksCompletedToday(tasks: Task[]): Task[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return tasks.filter(task => 
      task.isCompleted && 
      task.updatedAt >= today && 
      task.updatedAt < tomorrow
    );
  }

  /**
   * Get tasks completed in the last 7 days
   */
  static getTasksCompletedLastWeek(tasks: Task[]): Task[] {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    return tasks.filter(task => 
      task.isCompleted && 
      task.updatedAt >= weekAgo
    );
  }

  /**
   * Get completion rate for a date range
   */
  static getCompletionRate(tasks: Task[], startDate: Date, endDate: Date): number {
    const tasksInRange = tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate >= startDate && taskDate <= endDate;
    });

    if (tasksInRange.length === 0) return 0;
    
    const completedTasks = tasksInRange.filter(task => task.isCompleted);
    return Math.round((completedTasks.length / tasksInRange.length) * 100);
  }

  /**
   * Get weekly completion data for graph
   */
  static getWeeklyCompletionData(tasks: Task[]): { day: string; completed: number; total: number }[] {
    const data = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate >= date && taskDate < nextDate;
      });

      const completedTasks = dayTasks.filter(task => task.isCompleted);
      
      data.push({
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        completed: completedTasks.length,
        total: dayTasks.length,
      });
    }

    return data;
  }

  /**
   * Get total focus time from Pomodoro sessions
   */
  static getTotalFocusTime(tasks: Task[]): number {
    return tasks.reduce((total, task) => {
      return total + (task.timeSpent || 0);
    }, 0);
  }

  /**
   * Get focus time for today
   */
  static getTodayFocusTime(tasks: Task[]): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return tasks
      .filter(task => 
        task.timeSpent && 
        task.updatedAt >= today && 
        task.updatedAt < tomorrow
      )
      .reduce((total, task) => total + (task.timeSpent || 0), 0);
  }

  /**
   * Calculate current streak
   */
  static getCurrentStreak(tasks: Task[]): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let checkDate = new Date(today);

    while (true) {
      const nextDate = new Date(checkDate);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate >= checkDate && taskDate < nextDate;
      });

      const hasCompletedTask = dayTasks.some(task => task.isCompleted);
      
      if (hasCompletedTask) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Get average completion rate
   */
  static getAverageCompletionRate(tasks: Task[]): number {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const recentTasks = tasks.filter(task => 
      task.dueDate && new Date(task.dueDate) >= last30Days
    );

    if (recentTasks.length === 0) return 0;
    
    const completedTasks = recentTasks.filter(task => task.isCompleted);
    return Math.round((completedTasks.length / recentTasks.length) * 100);
  }

  /**
   * Get productivity insights
   */
  static getProductivityInsights(tasks: Task[]): {
    mostProductiveDay: string;
    averageTasksPerDay: number;
    totalTasksCompleted: number;
    focusTimeToday: string;
    streakDays: number;
  } {
    const weeklyData = this.getWeeklyCompletionData(tasks);
    const mostProductiveDay = weeklyData.reduce((max, day) => 
      day.completed > max.completed ? day : max
    , weeklyData[0])?.day || 'None';

    const last7Days = this.getTasksCompletedLastWeek(tasks);
    const averageTasksPerDay = Math.round(last7Days.length / 7);

    const totalTasksCompleted = tasks.filter(task => task.isCompleted).length;
    
    const focusTimeToday = this.getTodayFocusTime(tasks);
    const focusTimeTodayFormatted = this.formatDuration(focusTimeToday);

    const streakDays = this.getCurrentStreak(tasks);

    return {
      mostProductiveDay,
      averageTasksPerDay,
      totalTasksCompleted,
      focusTimeToday: focusTimeTodayFormatted,
      streakDays,
    };
  }

  /**
   * Format duration in minutes to human readable format
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
   * Get task distribution by priority
   */
  static getTaskDistributionByPriority(tasks: Task[]): {
    high: number;
    med: number;
    low: number;
  } {
    const distribution = { high: 0, med: 0, low: 0 };
    
    tasks.forEach(task => {
      if (task.priority in distribution) {
        distribution[task.priority as keyof typeof distribution]++;
      }
    });

    return distribution;
  }

  /**
   * Get task distribution by completion status
   */
  static getTaskDistributionByStatus(tasks: Task[]): {
    completed: number;
    pending: number;
  } {
    const completed = tasks.filter(task => task.isCompleted).length;
    const pending = tasks.length - completed;

    return { completed, pending };
  }

  /**
   * Get productivity score (0-100)
   */
  static getProductivityScore(tasks: Task[]): number {
    const insights = this.getProductivityInsights(tasks);
    const completionRate = this.getAverageCompletionRate(tasks);
    
    // Calculate score based on multiple factors
    let score = 0;
    
    // Completion rate (40% weight)
    score += (completionRate / 100) * 40;
    
    // Streak (20% weight)
    score += Math.min(insights.streakDays / 7, 1) * 20;
    
    // Daily average (20% weight)
    score += Math.min(insights.averageTasksPerDay / 5, 1) * 20;
    
    // Focus time (20% weight)
    const focusHours = this.getTodayFocusTime(tasks) / 60;
    score += Math.min(focusHours / 4, 1) * 20;
    
    return Math.round(score);
  }
}
