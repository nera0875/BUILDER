export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  label: TaskLabel;
  priority: TaskPriority;
  assignee?: string | null;
  dueDate?: Date | null;
  progress: number;
  attachments: number;
  comments: number;
  users: TaskUser[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskUser {
  name: string;
  src?: string;
  fallback?: string;
}

export type TaskStatus = "backlog" | "todo" | "in-progress" | "done" | "canceled";
export type TaskLabel = "bug" | "feature" | "documentation";
export type TaskPriority = "low" | "medium" | "high";
