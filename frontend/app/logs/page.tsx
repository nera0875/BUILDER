'use client'

import { useRouter } from 'next/navigation'
import { useProjects } from '@/hooks/use-projects'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollText } from 'lucide-react'

export default function LogsPage() {
  const { projects, loading } = useProjects()
  const router = useRouter()

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Select Project Logs</h1>

      {loading ? (
        <p>Loading projects...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => (
            <Card key={project.name} className="hover:border-primary cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <ScrollText className="h-5 w-5" />
                  <h3 className="font-semibold">{project.name}</h3>
                </div>
                <Button
                  onClick={() => router.push(`/logs/${project.name}`)}
                  className="w-full"
                >
                  View Logs
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
