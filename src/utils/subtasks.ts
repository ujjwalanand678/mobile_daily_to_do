import { Task, Subtask } from '../types';

export class SubtaskManager {
  
  /**
   * Add a subtask to a task
   */
  static addSubtask(task: Task, title: string): Task {
    const newSubtask: Subtask = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      ...task,
      subtasks: [...(task.subtasks || []), newSubtask],
      updatedAt: new Date(),
    };
  }

  /**
   * Toggle a subtask's completion status
   */
  static toggleSubtask(task: Task, subtaskId: string): Task {
    if (!task.subtasks) return task;

    const updatedSubtasks = task.subtasks.map(subtask =>
      subtask.id === subtaskId
        ? { ...subtask, isCompleted: !subtask.isCompleted, updatedAt: new Date() }
        : subtask
    );

    // Check if all subtasks are completed
    const allSubtasksCompleted = updatedSubtasks.length > 0 && 
      updatedSubtasks.every(subtask => subtask.isCompleted);

    return {
      ...task,
      subtasks: updatedSubtasks,
      isCompleted: allSubtasksCompleted,
      updatedAt: new Date(),
    };
  }

  /**
   * Delete a subtask
   */
  static deleteSubtask(task: Task, subtaskId: string): Task {
    if (!task.subtasks) return task;

    const updatedSubtasks = task.subtasks.filter(subtask => subtask.id !== subtaskId);

    return {
      ...task,
      subtasks: updatedSubtasks,
      updatedAt: new Date(),
    };
  }

  /**
   * Update a subtask's title
   */
  static updateSubtask(task: Task, subtaskId: string, title: string): Task {
    if (!task.subtasks) return task;

    const updatedSubtasks = task.subtasks.map(subtask =>
      subtask.id === subtaskId
        ? { ...subtask, title: title.trim(), updatedAt: new Date() }
        : subtask
    );

    return {
      ...task,
      subtasks: updatedSubtasks,
      updatedAt: new Date(),
    };
  }

  /**
   * Get completion percentage for a task's subtasks
   */
  static getCompletionPercentage(task: Task): number {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    
    const completedCount = task.subtasks.filter(subtask => subtask.isCompleted).length;
    return Math.round((completedCount / task.subtasks.length) * 100);
  }

  /**
   * Get count of completed subtasks
   */
  static getCompletedCount(task: Task): number {
    if (!task.subtasks) return 0;
    return task.subtasks.filter(subtask => subtask.isCompleted).length;
  }

  /**
   * Get total count of subtasks
   */
  static getTotalCount(task: Task): number {
    return task.subtasks?.length || 0;
  }

  /**
   * Check if a task has any subtasks
   */
  static hasSubtasks(task: Task): boolean {
    return !!(task.subtasks && task.subtasks.length > 0);
  }

  /**
   * Migrate old tasks to include subtasks field (backward compatibility)
   */
  static migrateTask(task: any): Task {
    return {
      ...task,
      subtasks: task.subtasks || [],
    };
  }

  /**
   * Reorder subtasks
   */
  static reorderSubtasks(task: Task, fromIndex: number, toIndex: number): Task {
    if (!task.subtasks) return task;

    const newSubtasks = [...task.subtasks];
    const [movedSubtask] = newSubtasks.splice(fromIndex, 1);
    newSubtasks.splice(toIndex, 0, movedSubtask);

    return {
      ...task,
      subtasks: newSubtasks,
      updatedAt: new Date(),
    };
  }
}
