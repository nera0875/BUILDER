"use client";

import { useState } from "react";
import { Table } from "@tanstack/react-table";
import { X, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { AddTaskDialog } from "./add-task-dialog";

import { priorities, statuses, labels } from "./data/data";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { bulkDeleteTasks } from "@/app/actions/task-actions";
import type { Task } from "@/lib/types/task";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelection = selectedRows.length > 0;

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedRows.length} selected task(s)?`)) return;

    setIsDeleting(true);
    try {
      const ids = selectedRows.map(row => (row.original as Task).id);
      const result = await bulkDeleteTasks(ids);

      if (!result.success) {
        alert(`Error: ${result.error}`);
      } else {
        table.resetRowSelection();
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      alert("Failed to delete tasks");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between lg:hidden">
        <h1 className="me-4 text-xl font-bold tracking-tight lg:text-2xl">Tasks</h1>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>Add Task</Button>
      </div>
      <div className="flex flex-col justify-between md:flex-row lg:items-center">
        <h1 className="me-4 hidden text-xl font-bold tracking-tight lg:flex lg:text-2xl">Tasks</h1>
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            placeholder="Filter tasks..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Status"
              options={statuses}
            />
          )}
          {table.getColumn("priority") && (
            <DataTableFacetedFilter
              column={table.getColumn("priority")}
              title="Priority"
              options={priorities}
            />
          )}
          {table.getColumn("label") && (
            <DataTableFacetedFilter
              column={table.getColumn("label")}
              title="Label"
              options={labels}
            />
          )}
          {table.getColumn("assignee") && (
            <DataTableFacetedFilter
              column={table.getColumn("assignee")}
              title="Assignee"
              options={[]} // Will be dynamically populated from unique values
            />
          )}
          {isFiltered && (
            <Button variant="ghost" size="sm" onClick={() => table.resetColumnFilters()}>
              Reset
              <X />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasSelection && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({selectedRows.length})
            </Button>
          )}
          <DataTableViewOptions table={table} />
          <Button size="sm" onClick={() => setShowAddDialog(true)}>Add Task</Button>
        </div>
      </div>
      <AddTaskDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onTaskCreated={() => window.location.reload()}
      />
    </div>
  );
}
