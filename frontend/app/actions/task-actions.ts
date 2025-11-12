'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import type { TaskStatus, TaskLabel, TaskPriority } from '@/lib/types/task'

// Zod validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['backlog', 'todo', 'in-progress', 'done', 'canceled']).default('todo'),
  label: z.enum(['bug', 'feature', 'documentation']).default('feature'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  assignee: z.string().optional(),
  dueDate: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
  attachments: z.number().default(0),
  comments: z.number().default(0),
})

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['backlog', 'todo', 'in-progress', 'done', 'canceled']).optional(),
  label: z.enum(['bug', 'feature', 'documentation']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignee: z.string().optional(),
  dueDate: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  attachments: z.number().optional(),
  comments: z.number().optional(),
  order: z.number().optional(),
})

// Filter types
export interface TaskFilters {
  status?: TaskStatus | TaskStatus[]
  label?: TaskLabel | TaskLabel[]
  priority?: TaskPriority | TaskPriority[]
  assignee?: string | string[]
  groupByStatus?: boolean // For Kanban view
}

export interface CreateTaskData {
  title: string
  description?: string
  status?: TaskStatus
  label?: TaskLabel
  priority?: TaskPriority
  assignee?: string
  dueDate?: string
  progress?: number
  attachments?: number
  comments?: number
}

export interface UpdateTaskData {
  title?: string
  description?: string
  status?: TaskStatus
  label?: TaskLabel
  priority?: TaskPriority
  assignee?: string
  dueDate?: string
  progress?: number
  attachments?: number
  comments?: number
  order?: number
}

export interface TaskReorderUpdate {
  id: string
  status?: TaskStatus
  order: number
}

/**
 * Get all tasks with optional filters
 * @param filters - Optional filters (status, label, priority, assignee)
 * @param groupByStatus - If true, returns tasks grouped by status (for Kanban view)
 */
export async function getTasks(filters?: TaskFilters) {
  try {
    const where: any = {}

    // Apply filters
    if (filters?.status) {
      where.status = Array.isArray(filters.status)
        ? { in: filters.status }
        : filters.status
    }

    if (filters?.label) {
      where.label = Array.isArray(filters.label)
        ? { in: filters.label }
        : filters.label
    }

    if (filters?.priority) {
      where.priority = Array.isArray(filters.priority)
        ? { in: filters.priority }
        : filters.priority
    }

    if (filters?.assignee) {
      where.assignee = Array.isArray(filters.assignee)
        ? { in: filters.assignee }
        : filters.assignee
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // Group by status for Kanban view if requested
    if (filters?.groupByStatus) {
      const grouped = {
        backlog: tasks.filter(t => t.status === 'backlog'),
        todo: tasks.filter(t => t.status === 'todo'),
        'in-progress': tasks.filter(t => t.status === 'in-progress'),
        done: tasks.filter(t => t.status === 'done'),
        canceled: tasks.filter(t => t.status === 'canceled'),
      }
      return { success: true, data: grouped }
    }

    return { success: true, data: tasks }
  } catch (error) {
    console.error('[getTasks] Error:', error)
    return { success: false, error: 'Failed to fetch tasks' }
  }
}

/**
 * Create a new task
 */
export async function createTask(data: CreateTaskData) {
  try {
    const validated = createTaskSchema.parse(data)

    // Get the highest order value for the status
    const lastTask = await prisma.task.findFirst({
      where: { status: validated.status },
      orderBy: { order: 'desc' },
    })

    const newOrder = lastTask ? lastTask.order + 1 : 0

    const task = await prisma.task.create({
      data: {
        ...validated,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        order: newOrder,
      },
    })

    revalidatePath('/dashboard/apps/kanban')
    revalidatePath('/dashboard/apps/tasks')
    return { success: true, data: task }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error('[createTask] Error:', error)
    return { success: false, error: 'Failed to create task' }
  }
}

/**
 * Update an existing task
 */
export async function updateTask(id: string, data: UpdateTaskData) {
  try {
    const validated = updateTaskSchema.parse(data)

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...validated,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
      },
    })

    revalidatePath('/dashboard/apps/kanban')
    revalidatePath('/dashboard/apps/tasks')
    return { success: true, data: task }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error('[updateTask] Error:', error)
    return { success: false, error: 'Failed to update task' }
  }
}

/**
 * Delete a single task
 */
export async function deleteTask(id: string) {
  try {
    await prisma.task.delete({
      where: { id }
    })

    revalidatePath('/dashboard/apps/kanban')
    revalidatePath('/dashboard/apps/tasks')
    return { success: true }
  } catch (error) {
    console.error('[deleteTask] Error:', error)
    return { success: false, error: 'Failed to delete task' }
  }
}

/**
 * Delete multiple tasks by IDs
 */
export async function bulkDeleteTasks(ids: string[]) {
  try {
    const result = await prisma.task.deleteMany({
      where: {
        id: { in: ids }
      }
    })

    revalidatePath('/dashboard/apps/kanban')
    revalidatePath('/dashboard/apps/tasks')
    return { success: true, count: result.count }
  } catch (error) {
    console.error('[bulkDeleteTasks] Error:', error)
    return { success: false, error: 'Failed to delete tasks' }
  }
}

/**
 * Reorder tasks (for Kanban drag & drop)
 * Updates task status and order in a single transaction
 */
export async function reorderTasks(updates: TaskReorderUpdate[]) {
  try {
    await prisma.$transaction(
      updates.map(update =>
        prisma.task.update({
          where: { id: update.id },
          data: {
            status: update.status,
            order: update.order,
          },
        })
      )
    )

    revalidatePath('/dashboard/apps/kanban')
    revalidatePath('/dashboard/apps/tasks')
    return { success: true }
  } catch (error) {
    console.error('[reorderTasks] Error:', error)
    return { success: false, error: 'Failed to reorder tasks' }
  }
}
