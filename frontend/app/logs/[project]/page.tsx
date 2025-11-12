'use client'

import { Metadata } from 'next'
import { useParams } from 'next/navigation'
import { ProjectConsole } from '@/components/project-console'

export default function ProjectLogsPage() {
  const params = useParams()
  const projectName = params.project as string

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b p-6 bg-background">
        <h1 className="text-3xl font-bold">Project Logs</h1>
        <p className="text-muted-foreground mt-1">
          {projectName}
        </p>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <ProjectConsole projectName={projectName} />
      </div>
    </main>
  )
}
