'use client'

import { useEffect } from 'react'
import { initBrowserConsoleIframe } from '@/lib/browser-console-iframe'

interface BrowserConsoleProviderProps {
  children: React.ReactNode
  projectName?: string
}

export function BrowserConsoleProvider({ children, projectName }: BrowserConsoleProviderProps) {
  useEffect(() => {
    // Initialize browser console capture with project name
    // If not provided, will use port number as fallback
    initBrowserConsoleIframe(projectName)
  }, [projectName])

  return <>{children}</>
}
