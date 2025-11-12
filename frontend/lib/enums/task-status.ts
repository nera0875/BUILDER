import type { Task, TaskStatus } from "@/lib/types/task";

export const TASK_STATUS_MAP = {
  backlog: { title: "Backlog", order: 0, color: "gray" },
  todo: { title: "To Do", order: 1, color: "blue" },
  "in-progress": { title: "In Progress", order: 2, color: "yellow" },
  done: { title: "Done", order: 3, color: "green" },
  canceled: { title: "Canceled", order: 4, color: "red" }
} as const;

export function groupTasksByStatus(tasks: Task[]) {
  return tasks.reduce((acc, task) => {
    if (!acc[task.status]) acc[task.status] = [];
    acc[task.status].push(task);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);
}

export const statusClasses = {
  backlog: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  todo: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "in-progress": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  done: "bg-green-500/10 text-green-700 dark:text-green-400",
  canceled: "bg-red-500/10 text-red-700 dark:text-red-400"
};
