/**
 * Kanban types derived from Prisma KanbanTask model + UI requirements
 * Source: /tmp/shadcn-kit-temp reference (lines 46-64)
 */

/**
 * TaskUser - Avatar/assignee representation in task cards
 * Used for displaying user avatars and filtering by assignee
 */
export interface TaskUser {
  name: string;
  src: string;
  alt?: string;
  fallback?: string;
}

/**
 * Task - Kanban card data model
 * Maps to Prisma KanbanTask + frontend UI state
 * Priority levels: "low" | "medium" | "high"
 * Progress: 0-100 percentage
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  assignee?: string;
  dueDate?: string;
  progress: number; // 0-100
  attachments?: number;
  comments?: number;
  users: TaskUser[]; // Array of assigned users for avatar display
}

/**
 * Column - Kanban board column state
 * Each column can have multiple tasks
 * Key example: "backlog", "inProgress", "done"
 */
export interface Column {
  [columnId: string]: Task[];
}

/**
 * ColumnTitles - Mapping of column IDs to display names
 * Used for rendering column headers
 * Key example: { "backlog": "Backlog", "inProgress": "In Progress" }
 */
export interface ColumnTitles {
  [columnId: string]: string;
}

/**
 * FilterState - Current filter selections
 * All filters are optional (null = filter not applied)
 */
export interface FilterState {
  searchQuery: string;
  status: "completed" | "inProgress" | "notStarted" | null;
  priority: "low" | "medium" | "high" | null;
  user: string | null; // Filter by TaskUser.name
}

/**
 * KanbanBoardState - Complete Kanban board state
 * Tracks tasks, columns, filters, and UI state
 */
export interface KanbanBoardState {
  columns: Column;
  columnTitles: ColumnTitles;
  filteredColumns: Column;
  filters: FilterState;
  isNewColumnModalOpen: boolean;
  newColumnTitle: string;
}
