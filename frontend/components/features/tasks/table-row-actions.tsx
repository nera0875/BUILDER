"use client";

import { Row } from "@tanstack/react-table";
import { MoreHorizontal, Trash2, Edit } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { deleteTask, updateTask } from "@/app/actions/task-actions";
import { priorities, statuses, labels } from "./data/data";
import type { Task, TaskStatus, TaskPriority, TaskLabel } from "@/lib/types/task";

interface TableRowActionsProps {
  row: Row<Task>;
}

export function TableRowActions({ row }: TableRowActionsProps) {
  const task = row.original;
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    setIsLoading(true);
    try {
      const result = await deleteTask(task.id);
      if (!result.success) {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    try {
      const result = await updateTask(task.id, { status: newStatus as TaskStatus });
      if (!result.success) {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update task");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    setIsLoading(true);
    try {
      const result = await updateTask(task.id, { priority: newPriority as TaskPriority });
      if (!result.success) {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLabelChange = async (newLabel: string) => {
    setIsLoading(true);
    try {
      const result = await updateTask(task.id, { label: newLabel as TaskLabel });
      if (!result.success) {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update task");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="data-[state=open]:bg-muted size-8"
          disabled={isLoading}
        >
          <MoreHorizontal />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem disabled>
          <Edit className="mr-2 h-4 w-4" />
          Edit (coming soon)
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={task.status} onValueChange={handleStatusChange}>
              {statuses.map((status) => (
                <DropdownMenuRadioItem key={status.value} value={status.value}>
                  {status.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Priority</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={task.priority} onValueChange={handlePriorityChange}>
              {priorities.map((priority) => (
                <DropdownMenuRadioItem key={priority.value} value={priority.value}>
                  {priority.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Label</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={task.label} onValueChange={handleLabelChange}>
              {labels.map((label) => (
                <DropdownMenuRadioItem key={label.value} value={label.value}>
                  {label.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={handleDelete}
          disabled={isLoading}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
