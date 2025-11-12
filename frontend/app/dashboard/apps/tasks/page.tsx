import { DataTable } from '@/components/features/tasks/data-table'
import { columns } from '@/components/features/tasks/columns'
import { getTasks } from '@/app/actions/tasks-actions'

export default async function TasksPage() {
  const result = await getTasks()
  const tasks = result.success && result.data ? (result.data as any[]) : []

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={tasks as any} />
    </div>
  )
}
