'use client'

import { useState } from 'react'
import { useProjects } from '@/hooks/use-projects'
import { SidebarNav, type NavItemId } from '@/components/sidebar-nav'
import { NewProjectDialog } from '@/components/new-project-dialog'
import { ProjectActions } from '@/components/project-actions'
import { ProjectConsole } from '@/components/project-console'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  ExternalLink,
  FolderOpen,
  RefreshCw,
  ScrollText,
  Settings
} from 'lucide-react'
import { HealthDashboard } from '@/components/health-dashboard'
import { NginxPortsManager } from '@/components/nginx-ports-manager'
import { PM2ProcessList } from '@/components/pm2-process-list'
import { ZombieProcessKiller } from '@/components/zombie-process-killer'

type View = 'projects' | 'devtools' | 'logs' | 'actions' | 'health'

type ProjectStatus = 'online' | 'stopped' | 'error' | 'not_deployed'

interface Project {
  name: string
  path: string
  port: number | null
  status: ProjectStatus
  preview_url: string | null
}

export default function DashboardPage() {
  const { projects, loading, refreshProjects } = useProjects()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [activeView, setActiveView] = useState<View>('projects')

  const statusConfig: Record<ProjectStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
    online: { label: 'Online', variant: 'default', color: 'text-green-500' },
    stopped: { label: 'Stopped', variant: 'secondary', color: 'text-yellow-500' },
    error: { label: 'Error', variant: 'destructive', color: 'text-red-500' },
    not_deployed: { label: 'Not Deployed', variant: 'outline', color: 'text-gray-500' }
  }

  if (loading && projects.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading projects...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <SidebarNav
        activeView={activeView as NavItemId}
        onNavigate={(view) => setActiveView(view as View)}
        selectedProjectName={selectedProject?.name}
        selectedProjectStatus={selectedProject?.status}
      />

      {/* Main Content - Changes based on active view */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Projects View */}
        {activeView === 'projects' && (
          <div className="flex h-full">
            {/* Projects List */}
            <div className="w-80 border-r flex flex-col bg-background">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">Projects</h2>
                  <Button variant="ghost" size="icon" onClick={refreshProjects}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <NewProjectDialog onSuccess={refreshProjects} />
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No projects yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {projects.map(project => {
                      const config = statusConfig[project.status]
                      const isSelected = selectedProject?.name === project.name

                      return (
                        <Card
                          key={project.name}
                          className={cn(
                            'transition-colors hover:bg-accent',
                            isSelected && 'border-primary bg-accent'
                          )}
                        >
                          <CardContent className="p-3">
                            <div className="cursor-pointer" onClick={() => setSelectedProject(project)}>
                              <div className="flex items-start justify-between mb-1">
                                <h3 className="font-medium text-sm truncate flex-1">
                                  {project.name}
                                </h3>
                                <Badge variant={config.variant} className="ml-2 text-xs">
                                  {config.label}
                                </Badge>
                              </div>
                              {project.preview_url && (
                                <p className="text-xs text-muted-foreground truncate">
                                  Port {project.port}
                                </p>
                              )}
                            </div>
                            <div className="mt-2 pt-2 border-t" onClick={(e) => e.stopPropagation()}>
                              <ProjectActions
                                projectName={project.name}
                                isRunning={project.status === 'online'}
                                onStatusChange={refreshProjects}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="flex-1 flex flex-col">
              {selectedProject ? (
                <>
                  <div className="border-b p-4 bg-background">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold">{selectedProject.name}</h2>
                        {selectedProject.preview_url && (
                          <p className="text-sm text-muted-foreground">
                            {selectedProject.preview_url}
                          </p>
                        )}
                      </div>
                      {selectedProject.preview_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectedProject.preview_url && window.open(selectedProject.preview_url, '_blank')}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 p-4">
                    {selectedProject.status === 'online' && selectedProject.preview_url ? (
                      <iframe
                        src={selectedProject.preview_url}
                        className="w-full h-full border rounded-lg"
                        title={`Preview of ${selectedProject.name}`}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <p className="text-lg mb-2">Project not running</p>
                          <p className="text-sm">
                            {selectedProject.status === 'not_deployed'
                              ? 'Deploy this project first'
                              : 'Start the project to see preview'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Select a project</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DevTools View */}
        {activeView === 'devtools' && (
          <div className="flex flex-col h-full">
            <div className="border-b p-4 bg-background">
              <h2 className="text-xl font-bold">Chrome DevTools</h2>
              <p className="text-sm text-muted-foreground">
                Universal testing environment (noVNC)
              </p>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src="http://89.116.27.88:6081/vnc.html?host=89.116.27.88&port=6081&autoconnect=true&reconnect=true&reconnect_delay=5000&resize=scale&quality=9"
                className="w-full h-full border-0"
                title="Chrome DevTools (noVNC)"
              />
            </div>
          </div>
        )}

        {/* Logs View */}
        {activeView === 'logs' && (
          <div className="flex flex-col h-full">
            <div className="border-b p-4 bg-background">
              <h2 className="text-xl font-bold">PM2 Logs</h2>
              {selectedProject && (
                <p className="text-sm text-muted-foreground">
                  {selectedProject.name}
                </p>
              )}
            </div>
            <div className="flex-1 p-4">
              {selectedProject ? (
                <div className="bg-black/95 text-green-400 font-mono text-sm p-4 rounded-lg h-full overflow-auto">
                  <p className="text-yellow-400 mb-2">// PM2 Logs - {selectedProject.name}</p>
                  <p className="text-muted-foreground">
                    Real-time logs coming soon...
                  </p>
                  <p className="text-muted-foreground mt-2">
                    Command: pm2 logs {selectedProject.name}
                  </p>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <ScrollText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Select a project to view logs</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions View */}
        {activeView === 'actions' && (
          <div className="flex flex-col h-full">
            <div className="border-b p-4 bg-background">
              <h2 className="text-xl font-bold">Project Actions</h2>
              {selectedProject && (
                <p className="text-sm text-muted-foreground">
                  {selectedProject.name}
                </p>
              )}
            </div>
            <div className="flex-1 p-4">
              {selectedProject ? (
                <ProjectActions
                  projectName={selectedProject.name}
                  isRunning={selectedProject.status === 'online'}
                  onStatusChange={refreshProjects}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Select a project for actions</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Health View */}
        {activeView === 'health' && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="border-b p-6 bg-background">
              <h1 className="text-3xl font-bold">System Health & Monitoring</h1>
              <p className="text-muted-foreground mt-1">
                Monitor system resources, NGINX configuration, and process management
              </p>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                {/* Left column */}
                <div className="space-y-6">
                  <HealthDashboard />
                  <NginxPortsManager />
                </div>

                {/* Right column */}
                <div className="space-y-6">
                  <PM2ProcessList />
                  <ZombieProcessKiller />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Project Console */}
      {selectedProject && activeView === 'projects' && (
        <ProjectConsole projectName={selectedProject.name} />
      )}
    </div>
  )
}
