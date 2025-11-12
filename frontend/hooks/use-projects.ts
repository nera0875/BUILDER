'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Project {
  name: string
  path: string
  port: number | null
  status: 'online' | 'stopped' | 'error' | 'not_deployed'
  preview_url: string | null
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects/list')
      const data = await res.json()

      if (data.projects) {
        setProjects(data.projects)
        setError(null)
      } else {
        setError(data.message || 'Failed to load projects')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial load
    refreshProjects()

    // Poll every 5 seconds to detect new projects
    const interval = setInterval(refreshProjects, 5000)

    return () => clearInterval(interval)
  }, [refreshProjects])

  return {
    projects,
    loading,
    error,
    refreshProjects
  }
}
