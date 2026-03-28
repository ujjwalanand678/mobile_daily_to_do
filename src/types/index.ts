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
  timeSpent?: number; // in minutes
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
