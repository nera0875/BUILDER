'use client'

import { usePathname, useRouter } from 'next/navigation'
import { SidebarNav, type NavItemId } from '@/components/sidebar-nav'

export default function AppsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  // Determine active view from current pathname
  const getActiveView = (): NavItemId => {
    if (pathname.includes('/apps/kanban')) return 'kanban'
    if (pathname.includes('/apps/todo')) return 'todo'
    if (pathname.includes('/apps/tasks')) return 'tasks'
    return 'kanban'
  }

  return (
    <div className="flex h-screen">
      <SidebarNav
        activeView={getActiveView()}
        onNavigate={() => router.push('/dashboard')}
      />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
