'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'done' | 'canceled'
export type TaskLabel = 'bug' | 'feature' | 'documentation'
export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskAssignee = 'claude' | 'user'

export interface TaskFilters {
  status?: TaskStatus | TaskStatus[]
  label?: TaskLabel | TaskLabel[]
  priority?: TaskPriority | TaskPriority[]
  assignee?: TaskAssignee | TaskAssignee[]
}

export interface CreateTaskData {
  title: string
  description?: string
  status?: TaskStatus
  label?: TaskLabel
  priority?: TaskPriority
  assignee?: TaskAssignee
}

export interface UpdateTaskData {
  title?: string
  description?: string
  status?: TaskStatus
  label?: TaskLabel
  priority?: TaskPriority
  assignee?: TaskAssignee
}

/**
 * Get all tasks with optional filters
 */
export async function getTasks(filters?: TaskFilters) {
  try {
    const where: any = {}

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

    const tasks = await prisma.taskManager.findMany({
      where,
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

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
    const task = await prisma.taskManager.create({
      data: {
        title: data.title,
        status: data.status || 'todo',
        label: data.label || 'feature',
        priority: data.priority || 'medium',
        assignee: data.assignee || 'claude'
      }
    })

    revalidatePath('/dashboard/apps/tasks')
    return { success: true, data: task }
  } catch (error) {
    console.error('[createTask] Error:', error)
    return { success: false, error: 'Failed to create task' }
  }
}

/**
 * Update an existing task
 */
export async function updateTask(id: string, data: UpdateTaskData) {
  try {
    const task = await prisma.taskManager.update({
      where: { id },
      data
    })

    revalidatePath('/dashboard/apps/tasks')
    return { success: true, data: task }
  } catch (error) {
    console.error('[updateTask] Error:', error)
    return { success: false, error: 'Failed to update task' }
  }
}

/**
 * Delete a single task
 */
export async function deleteTask(id: string) {
  try {
    await prisma.taskManager.delete({
      where: { id }
    })

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
    const result = await prisma.taskManager.deleteMany({
      where: {
        id: { in: ids }
      }
    })

    revalidatePath('/dashboard/apps/tasks')
    return { success: true, count: result.count }
  } catch (error) {
    console.error('[bulkDeleteTasks] Error:', error)
    return { success: false, error: 'Failed to delete tasks' }
  }
}
