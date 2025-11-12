export enum EnumTodoPriority {
  High = "high",
  Medium = "medium",
  Low = "low",
}

export enum EnumTodoStatus {
  Backlog = "backlog",
  Todo = "todo",
  InProgress = "in-progress",
  Done = "done",
  Canceled = "canceled",
}

export type TodoPriority = `${EnumTodoPriority}`;
export type TodoStatus = `${EnumTodoStatus}`;
export type FilterTab = "all" | TodoStatus;
export type ViewMode = "list" | "grid";

export interface Comment {
  id: string;
  text: string;
  createdAt: Date;
}

export interface TodoFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  assignedTo: string[];
  comments: Comment[];
  status: TodoStatus;
  priority: TodoPriority;
  createdAt: Date;
  dueDate?: Date | null;
  reminderDate?: Date | null;
  files?: TodoFile[];
  subTasks?: SubTask[];
  starred: boolean;
}

export interface TodoPosition {
  id: string;
  position: number;
}

// Styling constants
export const priorityClasses: Record<EnumTodoPriority, string> = {
  [EnumTodoPriority.High]:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  [EnumTodoPriority.Medium]:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  [EnumTodoPriority.Low]:
    "bg-gray-200 text-green-800 dark:bg-gray-700 dark:text-gray-200",
};

export const priorityDotColors: Record<EnumTodoPriority, string> = {
  [EnumTodoPriority.High]: "bg-red-500",
  [EnumTodoPriority.Medium]: "bg-yellow-500",
  [EnumTodoPriority.Low]: "bg-gray-400",
};

export const statusClasses: Record<EnumTodoStatus, string> = {
  [EnumTodoStatus.Backlog]:
    "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
  [EnumTodoStatus.Todo]:
    "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
  [EnumTodoStatus.InProgress]:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  [EnumTodoStatus.Done]:
    "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
  [EnumTodoStatus.Canceled]:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export const todoStatusNamed: Record<EnumTodoStatus, string> = {
  [EnumTodoStatus.Backlog]: "Backlog",
  [EnumTodoStatus.Todo]: "To Do",
  [EnumTodoStatus.InProgress]: "In Progress",
  [EnumTodoStatus.Done]: "Done",
  [EnumTodoStatus.Canceled]: "Canceled",
};

export const statusDotColors: Record<EnumTodoStatus, string> = {
  [EnumTodoStatus.Backlog]: "bg-gray-500",
  [EnumTodoStatus.Todo]: "bg-blue-500",
  [EnumTodoStatus.InProgress]: "bg-purple-500",
  [EnumTodoStatus.Done]: "bg-green-500",
  [EnumTodoStatus.Canceled]: "bg-red-500",
};
