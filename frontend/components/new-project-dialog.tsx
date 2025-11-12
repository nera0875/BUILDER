'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface NewProjectDialogProps {
  onSuccess: () => void
}

interface CompletedSteps {
  [key: string]: string
}

interface HealthCheckProgress {
  percent: number
  elapsed: number
}

export function NewProjectDialog({ onSuccess }: NewProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<CompletedSteps>({})
  const [healthCheckProgress, setHealthCheckProgress] = useState<HealthCheckProgress | null>(null)
  const { toast } = useToast()

  const createProject = async () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Project name is required',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    setCompletedSteps({})
    setHealthCheckProgress(null)

    try {
      const res = await fetch('/api/projects/create-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      })

      if (!res.ok) {
        throw new Error('Failed to start project creation')
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Stream not available')
      }

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              // Handle healthcheck with JSON progress
              if (data.step === 'healthcheck' && typeof data.message === 'object') {
                setHealthCheckProgress(data.message as HealthCheckProgress)
              }
              // Handle completed steps (success status)
              else if (data.status === 'success') {
                setCompletedSteps(prev => ({ ...prev, [data.step]: data.message }))
                if (data.step === 'healthcheck') {
                  setHealthCheckProgress(null)

                  // Force close after healthcheck success (stream may not close properly)
                  setTimeout(() => {
                    toast({
                      title: '✓ Project Created',
                      description: `${name} is ready and running`,
                    })

                    setName('')
                    setCompletedSteps({})
                    setHealthCheckProgress(null)
                    setLoading(false)
                    setOpen(false)
                    onSuccess()
                  }, 1000)
                }
              }
              // Handle complete event
              else if (data.status === 'complete') {
                try {
                  // Parse project info from message
                  const projectInfo = typeof data.message === 'string'
                    ? JSON.parse(data.message)
                    : data.message

                  // Show success toast
                  toast({
                    title: '✓ Project Created',
                    description: `${projectInfo.name} is ready at port ${projectInfo.port}`,
                  })

                  // Close dialog and refresh
                  setTimeout(() => {
                    setName('')
                    setCompletedSteps({})
                    setHealthCheckProgress(null)
                    setLoading(false)
                    setOpen(false)
                    onSuccess()
                  }, 800)

                  return
                } catch (parseError) {
                  console.error('Failed to parse complete message:', parseError, data.message)
                  // Still close on complete even if parsing fails
                  toast({
                    title: '✓ Project Created',
                    description: 'Project created successfully',
                  })

                  setTimeout(() => {
                    setName('')
                    setCompletedSteps({})
                    setHealthCheckProgress(null)
                    setLoading(false)
                    setOpen(false)
                    onSuccess()
                  }, 800)

                  return
                }
              }
              // Handle errors
              else if (data.status === 'error') {
                toast({
                  title: 'Error',
                  description: data.message,
                  variant: 'destructive'
                })
                setLoading(false)
                return
              }
              // Handle progress steps (clone, init, install, deploy)
              else if (data.status === 'progress') {
                setCompletedSteps(prev => ({ ...prev, [data.step]: data.message }))
              }

            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }

    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create project',
        variant: 'destructive'
      })
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      createProject()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a new project from BUILDER stack (Next.js 16 + 57 shadcn components)
          </DialogDescription>
        </DialogHeader>

        {!loading ? (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="my-awesome-app"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground">
                  Must be kebab-case (lowercase, hyphens only)
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                onClick={createProject}
                disabled={loading || !name.trim()}
              >
                Create Project
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Creating "{name}"</h3>
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              </div>

              <div className="space-y-3">
                {/* Clone Step */}
                {completedSteps.clone && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/10">
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    </div>
                    <span className="text-foreground/90">{completedSteps.clone}</span>
                  </div>
                )}

                {/* Init Step */}
                {completedSteps.init && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/10">
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    </div>
                    <span className="text-foreground/90">{completedSteps.init}</span>
                  </div>
                )}

                {/* Install Step */}
                {completedSteps.install && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/10">
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    </div>
                    <span className="text-foreground/90">{completedSteps.install}</span>
                  </div>
                )}

                {/* Deploy Step */}
                {completedSteps.deploy && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/10">
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    </div>
                    <span className="text-foreground/90">{completedSteps.deploy}</span>
                  </div>
                )}

                {/* Health Check - Single line with updating percentage */}
                {(healthCheckProgress || completedSteps.healthcheck) && (
                  <div className="flex items-center gap-2.5 text-sm">
                    {healthCheckProgress ? (
                      <>
                        <div className="flex items-center justify-center w-5 h-5">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                        </div>
                        <span className="text-foreground/90">
                          Starting application... {healthCheckProgress.percent}%
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/10">
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        </div>
                        <span className="text-foreground/90">{completedSteps.healthcheck}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Initial loading state */}
                {Object.keys(completedSteps).length === 0 && !healthCheckProgress && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-muted-foreground">Initializing...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
