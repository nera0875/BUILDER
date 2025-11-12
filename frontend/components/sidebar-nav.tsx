'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  FolderOpen,
  TestTube,
  ScrollText,
  Settings,
  Activity,
  FileText,
  LayoutDashboard
} from 'lucide-react'

export type NavItemId = 'projects' | 'devtools' | 'logs' | 'actions' | 'health' | 'diagnostics'

interface NavItem {
  id: NavItemId
  label: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
}

interface SidebarNavProps {
  activeView: NavItemId
  onNavigate: (view: NavItemId) => void
  selectedProjectName?: string | null
  selectedProjectStatus?: 'online' | 'stopped' | 'error' | 'not_deployed' | null
}

const navItems: NavItem[] = [
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'devtools', label: 'DevTools', icon: TestTube },
  { id: 'health', label: 'Diagnostics', icon: Activity },
  { id: 'logs', label: 'Logs', icon: FileText, href: '/logs' },
  { id: 'actions', label: 'Actions', icon: Settings },
]

export function SidebarNav({
  activeView,
  onNavigate,
  selectedProjectName,
  selectedProjectStatus
}: SidebarNavProps) {
  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'online':
        return 'default'
      case 'stopped':
        return 'secondary'
      case 'error':
        return 'destructive'
      case 'not_deployed':
      default:
        return 'outline'
    }
  }

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'online':
        return 'Online'
      case 'stopped':
        return 'Stopped'
      case 'error':
        return 'Error'
      case 'not_deployed':
      default:
        return 'Not Deployed'
    }
  }

  return (
    <aside className="w-64 border-r bg-muted/30 flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6" />
          <div>
            <h1 className="text-lg font-bold">Builder</h1>
            <p className="text-xs text-muted-foreground">Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = activeView === item.id

            if (item.href) {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive && 'bg-accent text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </a>
              )
            }

            return (
              <Button
                key={item.id}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-accent'
                )}
                onClick={() => onNavigate(item.id)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            )
          })}
        </div>
      </nav>

      {selectedProjectName && (
        <div className="p-4 border-t">
          <p className="text-xs text-muted-foreground mb-1">Active Project</p>
          <p className="font-medium text-sm truncate">{selectedProjectName}</p>
          <span className="inline-block mt-1 text-xs font-medium px-2 py-1 rounded-md bg-accent">
            {getStatusLabel(selectedProjectStatus || undefined)}
          </span>
        </div>
      )}
    </aside>
  )
}
