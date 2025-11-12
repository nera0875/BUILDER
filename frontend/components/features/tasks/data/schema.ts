import { z } from "zod"

// Task schema matching Prisma TaskManager model
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(["backlog", "todo", "in-progress", "done", "canceled"]),
  label: z.enum(["bug", "feature", "documentation"]),
  priority: z.enum(["low", "medium", "high"]),
  createdAt: z.date().optional()
})

export type Task = z.infer<typeof taskSchema>

// Type exports for form state management
export type TaskStatus = "backlog" | "todo" | "in-progress" | "done" | "canceled"
export type TaskPriority = "low" | "medium" | "high"
export type TaskLabel = "bug" | "feature" | "documentation"
