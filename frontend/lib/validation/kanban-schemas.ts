import { z } from "zod";

// Priority enum
export const PriorityEnum = z.enum(["low", "medium", "high", "urgent"]);
export type Priority = z.infer<typeof PriorityEnum>;

// Status enum for columns
export const StatusEnum = z.enum(["todo", "in-progress", "in-review", "done"]);
export type Status = z.infer<typeof StatusEnum>;

// Create task schema
export const createTaskSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z.string()
    .max(2000, "Description must be less than 2000 characters")
    .optional(),
  priority: PriorityEnum.default("medium"),
  dueDate: z.coerce.date().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  columnId: z.string().min(1, "Column ID is required"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

// Update task schema (all fields optional)
export const updateTaskSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters")
    .optional(),
  description: z.string()
    .max(2000, "Description must be less than 2000 characters")
    .optional()
    .nullable(),
  priority: PriorityEnum.optional(),
  dueDate: z.coerce.date().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  status: StatusEnum.optional(),
}).strict();

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

// Reorder tasks within/between columns schema
export const reorderTaskSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  sourceColumnId: z.string().min(1, "Source column ID is required"),
  targetColumnId: z.string().min(1, "Target column ID is required"),
  sourceOrder: z.number().int().nonnegative(),
  targetOrder: z.number().int().nonnegative(),
});

export type ReorderTaskInput = z.infer<typeof reorderTaskSchema>;

// Bulk update tasks schema (e.g., move multiple tasks to a column)
export const bulkUpdateTasksSchema = z.object({
  taskIds: z.array(z.string().min(1)).min(1, "At least one task ID is required"),
  updates: updateTaskSchema,
});

export type BulkUpdateTasksInput = z.infer<typeof bulkUpdateTasksSchema>;

// Create column schema
export const createColumnSchema = z.object({
  title: z.string()
    .min(1, "Column title is required")
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, "Invalid color format")
    .optional(),
  order: z.number().int().nonnegative().optional(),
  boardId: z.string().min(1, "Board ID is required"),
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>;

// Update column schema
export const updateColumnSchema = z.object({
  title: z.string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be less than 100 characters")
    .optional(),
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .nullable(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, "Invalid color format")
    .optional()
    .nullable(),
}).strict();

export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;

// Create board schema
export const createBoardSchema = z.object({
  title: z.string()
    .min(1, "Board title is required")
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z.string()
    .max(2000, "Description must be less than 2000 characters")
    .optional(),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;

// Update board schema
export const updateBoardSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters")
    .optional(),
  description: z.string()
    .max(2000, "Description must be less than 2000 characters")
    .optional()
    .nullable(),
}).strict();

export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;

// Schema for task filters
export const taskFilterSchema = z.object({
  priority: PriorityEnum.optional(),
  status: StatusEnum.optional(),
  assigneeId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dueDateRange: z.object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  }).optional(),
}).strict();

export type TaskFilter = z.infer<typeof taskFilterSchema>;

// Export all types for easier access
export const KanbanSchemas = {
  createTask: createTaskSchema,
  updateTask: updateTaskSchema,
  reorderTask: reorderTaskSchema,
  bulkUpdateTasks: bulkUpdateTasksSchema,
  createColumn: createColumnSchema,
  updateColumn: updateColumnSchema,
  createBoard: createBoardSchema,
  updateBoard: updateBoardSchema,
  taskFilter: taskFilterSchema,
} as const;
