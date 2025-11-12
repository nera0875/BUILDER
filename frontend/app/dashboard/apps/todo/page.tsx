"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";
import {
  getTodos,
  createTodo,
  deleteTodo,
  toggleCompleted,
} from "@/app/actions/todo-actions";

interface TodoItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  completed: boolean;
  createdAt: Date;
  completedAt: Date | null;
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const statusColors = {
  backlog: "bg-gray-100 text-gray-800",
  "todo": "bg-slate-100 text-slate-800",
  "in-progress": "bg-purple-100 text-purple-800",
  done: "bg-green-100 text-green-800",
  canceled: "bg-red-100 text-red-800",
};

export default function TodoPage() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
  });
  const [filter, setFilter] = useState<{ status?: string; priority?: string }>({});

  useEffect(() => {
    loadTodos();
  }, [filter]);

  async function loadTodos() {
    setLoading(true);
    try {
      const result = await getTodos(filter);
      if (result.success && result.data) {
        setTodos(result.data);
      }
    } catch (error) {
      console.error("Failed to load todos:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTodo() {
    if (!formData.title.trim()) return;

    try {
      const result = await createTodo({
        title: formData.title,
        description: formData.description || undefined,
        priority: formData.priority as "low" | "medium" | "high",
        status: formData.status as "backlog" | "todo" | "in-progress" | "done" | "canceled",
        tags: [],
      });

      if (result.success) {
        setFormData({ title: "", description: "", priority: "medium", status: "todo" });
        setIsOpen(false);
        await loadTodos();
      }
    } catch (error) {
      console.error("Failed to create todo:", error);
    }
  }

  async function handleToggleComplete(id: string) {
    try {
      await toggleCompleted(id);
      await loadTodos();
    } catch (error) {
      console.error("Failed to toggle todo:", error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteTodo(id);
      await loadTodos();
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Todo List</h1>
          <p className="text-gray-500 mt-1">Manage your tasks and stay organized</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Todo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Todo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  placeholder="What do you need to do?"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  placeholder="Add details (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-24"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backlog">Backlog</SelectItem>
                      <SelectItem value="todo">Todo</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAddTodo} className="w-full">
                Create Todo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <Select value={filter.status || ""} onValueChange={(value) => setFilter({ ...filter, status: value || undefined })}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="backlog">Backlog</SelectItem>
            <SelectItem value="todo">Todo</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filter.priority || ""} onValueChange={(value) => setFilter({ ...filter, priority: value || undefined })}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Loading todos...</p>
          </CardContent>
        </Card>
      ) : todos.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No todos yet. Create one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {todos.map((todo) => (
            <Card key={todo.id} className={todo.completed ? "opacity-60" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => handleToggleComplete(todo.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold text-lg ${todo.completed ? "line-through text-gray-500" : ""}`}>
                        {todo.title}
                      </h3>
                    </div>
                    {todo.description && (
                      <p className="text-sm text-gray-600 mb-3">{todo.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Badge className={statusColors[todo.status as keyof typeof statusColors]}>
                        {todo.status}
                      </Badge>
                      <Badge className={priorityColors[todo.priority as keyof typeof priorityColors]}>
                        {todo.priority}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(todo.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
