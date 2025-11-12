export enum TodoStatus {
  BACKLOG = "backlog",
  TODO = "todo",
  IN_PROGRESS = "in-progress",
  DONE = "done",
  CANCELED = "canceled"
}

// Alias pour compatibilité (enum Prisma)
export const EnumTodoStatus = TodoStatus

// Labels pour UI
export const todoStatusNamed: Record<TodoStatus, string> = {
  [TodoStatus.BACKLOG]: "Backlog",
  [TodoStatus.TODO]: "To Do",
  [TodoStatus.IN_PROGRESS]: "In Progress",
  [TodoStatus.DONE]: "Done",
  [TodoStatus.CANCELED]: "Canceled"
}

export enum TodoPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high"
}

// Labels pour UI
export const todoPriorityNamed: Record<TodoPriority, string> = {
  [TodoPriority.LOW]: "Low",
  [TodoPriority.MEDIUM]: "Medium",
  [TodoPriority.HIGH]: "High"
}

// Tailwind classes pour status
export const statusClasses: Record<TodoStatus, string> = {
  [TodoStatus.BACKLOG]: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  [TodoStatus.TODO]: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  [TodoStatus.IN_PROGRESS]: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  [TodoStatus.DONE]: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  [TodoStatus.CANCELED]: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
}

// Tailwind classes pour priority
export const priorityClasses: Record<TodoPriority, string> = {
  [TodoPriority.LOW]: "text-gray-500",
  [TodoPriority.MEDIUM]: "text-yellow-500",
  [TodoPriority.HIGH]: "text-red-500"
}
