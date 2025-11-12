'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Validation schemas
const todoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['backlog', 'todo', 'in-progress', 'done', 'canceled']).default('todo'),
  tags: z.array(z.string()).default([]),
})

const subtaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  completed: z.boolean().default(false),
})

export async function getTodos(filter?: {
  status?: string
  priority?: string
  completed?: boolean
}) {
  try {
    const where: any = {}

    if (filter?.status) {
      where.status = filter.status
    }

    if (filter?.priority) {
      where.priority = filter.priority
    }

    if (filter?.completed !== undefined) {
      where.completed = filter.completed
    }

    const todos = await prisma.todoItem.findMany({
      where,
      orderBy: [
        { completed: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return { success: true, data: todos }
  } catch (error) {
    console.error('Failed to fetch todos:', error)
    return { success: false, error: 'Failed to fetch todos' }
  }
}

export async function createTodo(data: z.infer<typeof todoSchema>) {
  try {
    const validated = todoSchema.parse(data)

    const todo = await prisma.todoItem.create({
      data: validated,
    })

    revalidatePath('/dashboard/apps/todo')
    return { success: true, data: todo }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error('Failed to create todo:', error)
    return { success: false, error: 'Failed to create todo' }
  }
}

export async function updateTodo(
  id: string,
  data: Partial<z.infer<typeof todoSchema>>
) {
  try {
    const todo = await prisma.todoItem.update({
      where: { id },
      data,
    })

    revalidatePath('/dashboard/apps/todo')
    return { success: true, data: todo }
  } catch (error) {
    console.error('Failed to update todo:', error)
    return { success: false, error: 'Failed to update todo' }
  }
}

export async function deleteTodo(id: string) {
  try {
    await prisma.todoItem.delete({
      where: { id },
    })

    revalidatePath('/dashboard/apps/todo')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete todo:', error)
    return { success: false, error: 'Failed to delete todo' }
  }
}

export async function toggleCompleted(id: string) {
  try {
    const todo = await prisma.todoItem.findUnique({
      where: { id },
    })

    if (!todo) {
      return { success: false, error: 'Todo not found' }
    }

    const updatedTodo = await prisma.todoItem.update({
      where: { id },
      data: {
        completed: !todo.completed,
        completedAt: !todo.completed ? new Date() : null,
      },
    })

    revalidatePath('/dashboard/apps/todo')
    return { success: true, data: updatedTodo }
  } catch (error) {
    console.error('Failed to toggle todo:', error)
    return { success: false, error: 'Failed to toggle todo' }
  }
}

export async function addSubtask(
  todoId: string,
  subtask: z.infer<typeof subtaskSchema>
) {
  try {
    const validated = subtaskSchema.parse(subtask)

    const todo = await prisma.todoItem.findUnique({
      where: { id: todoId },
    })

    if (!todo) {
      return { success: false, error: 'Todo not found' }
    }

    const currentSubtasks = Array.isArray(todo.subtasks) ? todo.subtasks : []
    const updatedSubtasks = [...currentSubtasks, validated]

    const updatedTodo = await prisma.todoItem.update({
      where: { id: todoId },
      data: {
        subtasks: updatedSubtasks as any,
      },
    })

    revalidatePath('/dashboard/apps/todo')
    return { success: true, data: updatedTodo }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error('Failed to add subtask:', error)
    return { success: false, error: 'Failed to add subtask' }
  }
}

export async function updateSubtask(
  todoId: string,
  subtaskId: string,
  updates: Partial<z.infer<typeof subtaskSchema>>
) {
  try {
    const todo = await prisma.todoItem.findUnique({
      where: { id: todoId },
    })

    if (!todo) {
      return { success: false, error: 'Todo not found' }
    }

    const currentSubtasks = Array.isArray(todo.subtasks) ? todo.subtasks : []
    const updatedSubtasks = currentSubtasks.map((st: any) =>
      st.id === subtaskId ? { ...st, ...updates } : st
    )

    const updatedTodo = await prisma.todoItem.update({
      where: { id: todoId },
      data: {
        subtasks: updatedSubtasks as any,
      },
    })

    revalidatePath('/dashboard/apps/todo')
    return { success: true, data: updatedTodo }
  } catch (error) {
    console.error('Failed to update subtask:', error)
    return { success: false, error: 'Failed to update subtask' }
  }
}

export async function deleteSubtask(todoId: string, subtaskId: string) {
  try {
    const todo = await prisma.todoItem.findUnique({
      where: { id: todoId },
    })

    if (!todo) {
      return { success: false, error: 'Todo not found' }
    }

    const currentSubtasks = Array.isArray(todo.subtasks) ? todo.subtasks : []
    const updatedSubtasks = currentSubtasks.filter((st: any) => st.id !== subtaskId)

    const updatedTodo = await prisma.todoItem.update({
      where: { id: todoId },
      data: {
        subtasks: updatedSubtasks as any,
      },
    })

    revalidatePath('/dashboard/apps/todo')
    return { success: true, data: updatedTodo }
  } catch (error) {
    console.error('Failed to delete subtask:', error)
    return { success: false, error: 'Failed to delete subtask' }
  }
}
