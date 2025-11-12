'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Zod validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  columnId: z.string().cuid(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().optional(),
})

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  columnId: z.string().cuid().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional(),
  completed: z.boolean().optional(),
})

const createColumnSchema = z.object({
  title: z.string().min(1, 'Column title is required'),
})

// Get all tasks with their columns
export async function getTasks() {
  try {
    const tasks = await prisma.kanbanTask.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    return { success: true, data: tasks }
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return { success: false, error: 'Failed to fetch tasks' }
  }
}

// Get all columns with their tasks
export async function getColumns() {
  try {
    const columns = await prisma.kanbanColumn.findMany({
      include: {
        tasks: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    })
    return { success: true, data: columns }
  } catch (error) {
    console.error('Error fetching columns:', error)
    return { success: false, error: 'Failed to fetch columns' }
  }
}

// Create new task
export async function createTask(data: z.infer<typeof createTaskSchema>) {
  try {
    const validated = createTaskSchema.parse(data)

    // Get the highest order value in the column
    const lastTask = await prisma.kanbanTask.findFirst({
      where: { columnId: validated.columnId },
      orderBy: { order: 'desc' },
    })

    const newOrder = lastTask ? lastTask.order + 1 : 0

    const task = await prisma.kanbanTask.create({
      data: {
        ...validated,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        order: newOrder,
      },
      include: {
        column: true,
      },
    })

    revalidatePath('/dashboard/apps/kanban')
    return { success: true, data: task }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error('Error creating task:', error)
    return { success: false, error: 'Failed to create task' }
  }
}

// Update task
export async function updateTask(id: string, data: z.infer<typeof updateTaskSchema>) {
  try {
    const validated = updateTaskSchema.parse(data)

    const task = await prisma.kanbanTask.update({
      where: { id },
      data: {
        ...validated,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
      },
      include: {
        column: true,
      },
    })

    revalidatePath('/dashboard/apps/kanban')
    return { success: true, data: task }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error('Error updating task:', error)
    return { success: false, error: 'Failed to update task' }
  }
}

// Delete task
export async function deleteTask(id: string) {
  try {
    await prisma.kanbanTask.delete({
      where: { id },
    })

    revalidatePath('/dashboard/apps/kanban')
    return { success: true }
  } catch (error) {
    console.error('Error deleting task:', error)
    return { success: false, error: 'Failed to delete task' }
  }
}

// Reorder tasks within a column
export async function reorderTasks(columnId: string, taskIds: string[]) {
  try {
    // Update each task's order based on the new array position
    await prisma.$transaction(
      taskIds.map((taskId, index) =>
        prisma.kanbanTask.update({
          where: { id: taskId },
          data: {
            order: index,
            columnId: columnId,
          },
        })
      )
    )

    revalidatePath('/dashboard/apps/kanban')
    return { success: true }
  } catch (error) {
    console.error('Error reordering tasks:', error)
    return { success: false, error: 'Failed to reorder tasks' }
  }
}

// Create new column
export async function createColumn(title: string) {
  try {
    const validated = createColumnSchema.parse({ title })

    // Get the highest order value
    const lastColumn = await prisma.kanbanColumn.findFirst({
      orderBy: { order: 'desc' },
    })

    const newOrder = lastColumn ? lastColumn.order + 1 : 0

    const column = await prisma.kanbanColumn.create({
      data: {
        title: validated.title,
        order: newOrder,
      },
      include: {
        tasks: true,
      },
    })

    revalidatePath('/dashboard/apps/kanban')
    return { success: true, data: column }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error('Error creating column:', error)
    return { success: false, error: 'Failed to create column' }
  }
}

// Delete column (and all its tasks)
export async function deleteColumn(id: string) {
  try {
    await prisma.kanbanColumn.delete({
      where: { id },
    })

    revalidatePath('/dashboard/apps/kanban')
    return { success: true }
  } catch (error) {
    console.error('Error deleting column:', error)
    return { success: false, error: 'Failed to delete column' }
  }
}

// Update column title
export async function updateColumn(id: string, title: string) {
  try {
    const validated = createColumnSchema.parse({ title })

    const column = await prisma.kanbanColumn.update({
      where: { id },
      data: { title: validated.title },
      include: {
        tasks: true,
      },
    })

    revalidatePath('/dashboard/apps/kanban')
    return { success: true, data: column }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error('Error updating column:', error)
    return { success: false, error: 'Failed to update column' }
  }
}
