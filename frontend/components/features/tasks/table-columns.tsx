"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MessageSquare, Paperclip, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { labels, priorities, statuses } from "./data/data";
import type { Task } from "@/lib/types/task";
import { DataTableColumnHeader } from "./data-table-column-header";
import { TableRowActions } from "./table-row-actions";

export const tableColumns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <div className="w-[80px] truncate">{row.getValue("id")}</div>,
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    cell: ({ row }) => {
      const label = labels.find((label) => label.value === row.original.label);

      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {label && <Badge variant="outline">{label.label}</Badge>}
            <span className="max-w-[400px] truncate font-medium">{row.getValue("title")}</span>
          </div>
          {row.original.description && (
            <p className="max-w-[400px] truncate text-xs text-muted-foreground">
              {row.original.description}
            </p>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = statuses.find((status) => status.value === row.getValue("status"));

      if (!status) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center gap-2">
          <span className="text-sm">{status.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: "priority",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
    cell: ({ row }) => {
      const priority = priorities.find((priority) => priority.value === row.getValue("priority"));

      if (!priority) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center gap-2">
          <span className="text-sm">{priority.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: "progress",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Progress" />,
    cell: ({ row }) => {
      const progress = row.getValue("progress") as number;

      return (
        <div className="flex w-[120px] items-center gap-2">
          <Progress value={progress} className="h-2" />
          <span className="text-xs text-muted-foreground">{progress}%</span>
        </div>
      );
    }
  },
  {
    accessorKey: "assignee",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Assignee" />,
    cell: ({ row }) => {
      const assignee = row.getValue("assignee") as string | null;

      if (!assignee) {
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="text-xs">Unassigned</span>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {assignee.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{assignee}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: "users",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Team" />,
    cell: ({ row }) => {
      const users = row.original.users;

      if (!users || users.length === 0) {
        return null;
      }

      return (
        <div className="flex -space-x-2">
          {users.slice(0, 3).map((user, idx) => (
            <Avatar key={idx} className="h-6 w-6 border-2 border-background">
              {user.src && <AvatarImage src={user.src} alt={user.name} />}
              <AvatarFallback className="text-xs">
                {user.fallback || user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
          {users.length > 3 && (
            <Avatar className="h-6 w-6 border-2 border-background">
              <AvatarFallback className="text-xs">+{users.length - 3}</AvatarFallback>
            </Avatar>
          )}
        </div>
      );
    },
    enableSorting: false
  },
  {
    accessorKey: "attachments",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Files" />,
    cell: ({ row }) => {
      const attachments = row.getValue("attachments") as number;

      if (attachments === 0) {
        return null;
      }

      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Paperclip className="h-4 w-4" />
          <span className="text-xs">{attachments}</span>
        </div>
      );
    }
  },
  {
    accessorKey: "comments",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Comments" />,
    cell: ({ row }) => {
      const comments = row.getValue("comments") as number;

      if (comments === 0) {
        return null;
      }

      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span className="text-xs">{comments}</span>
        </div>
      );
    }
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Due Date" />,
    cell: ({ row }) => {
      const dueDate = row.getValue("dueDate") as Date | null;

      if (!dueDate) {
        return null;
      }

      const date = new Date(dueDate);
      const isOverdue = date < new Date() && row.original.status !== "done";

      return (
        <div className={`text-sm ${isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
          {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </div>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <TableRowActions row={row} />
  }
];
