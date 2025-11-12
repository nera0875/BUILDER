"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, Table } from "lucide-react";
import KanbanView from "@/components/features/tasks/kanban-view";
import { TableView } from "@/components/features/tasks/table-view";
import { getTasks } from "@/app/actions/task-actions";
import type { Task } from "@/lib/types/task";

export default function TasksPage() {
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      setIsLoading(true);
      const result = await getTasks();
      if (result.success && result.data && Array.isArray(result.data)) {
        // Map database tasks to frontend Task type, ensuring users is properly typed
        const mappedTasks = result.data.map((task: any) => ({
          ...task,
          users: Array.isArray(task.users) ? task.users : [],
        })) as Task[];
        setTasks(mappedTasks);
      }
      setIsLoading(false);
    }
    fetchTasks();
  }, []);

  if (isLoading) {
    return <div className="container mx-auto py-6">Loading tasks...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage your tasks with Kanban or Table view</p>
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as any)}>
          <TabsList>
            <TabsTrigger value="kanban">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="table">
              <Table className="h-4 w-4 mr-2" />
              Table
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {view === "kanban" ? <KanbanView /> : <TableView tasks={tasks} />}
    </div>
  );
}
