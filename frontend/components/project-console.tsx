'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Trash2, ChevronsDown, ChevronsUp } from 'lucide-react'

interface ProjectConsoleProps {
  projectName: string
}

export function ProjectConsole({ projectName }: ProjectConsoleProps) {
  const [logs, setLogs] = useState<string[]>([])
  const [filter, setFilter] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // SSE Connection for real-time logs
  useEffect(() => {
    setLogs([`[${new Date().toISOString()}] Connecting to ${projectName} logs...`])

    const eventSource = new EventSource(`/api/logs/${projectName}/stream`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setIsConnected(true)
      setLogs(prev => [...prev, `[${new Date().toISOString()}] ✓ Connected to PM2 log stream`])
    }

    eventSource.onmessage = (event) => {
      const newLog = event.data
      if (newLog.trim()) {
        setLogs(prev => [...prev, newLog])
      }
    }

    eventSource.onerror = () => {
      setIsConnected(false)
      setLogs(prev => [...prev, `[${new Date().toISOString()}] ✗ Connection lost, reconnecting...`])
    }

    return () => {
      eventSource.close()
      eventSourceRef.current = null
    }
  }, [projectName])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])

  const filteredLogs = logs.filter(log =>
    log.toLowerCase().includes(filter.toLowerCase())
  )

  const clearLogs = () => {
    setLogs([`[${new Date().toISOString()}] Logs cleared`])
  }

  const getLogColor = (log: string) => {
    if (log.includes('[ERROR]') || log.includes('ERROR') || log.includes('error')) {
      return 'text-red-400'
    }
    if (log.includes('[WARN]') || log.includes('WARN') || log.includes('warning')) {
      return 'text-yellow-400'
    }
    if (log.includes('✓') || log.includes('Ready') || log.includes('success')) {
      return 'text-green-400'
    }
    return 'text-slate-300'
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-background border-t transition-all duration-300 ${isOpen ? 'h-96' : 'h-12'} z-50`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-3">
          <span className="font-semibold">Console - {projectName}</span>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
          <span className="text-xs text-muted-foreground">
            {filteredLogs.length} {filteredLogs.length === 1 ? 'line' : 'lines'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isOpen && (
            <>
              <Input
                placeholder="Filter logs..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="h-8 w-48"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={clearLogs}
                className="h-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsOpen(!isOpen)}
            className="h-8"
          >
            {isOpen ? <ChevronsDown className="h-4 w-4" /> : <ChevronsUp className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Console Body */}
      {isOpen && (
        <div className="h-[calc(100%-3rem)] overflow-y-auto bg-black p-3 font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <p className="text-muted-foreground">No logs available to display</p>
          ) : (
            filteredLogs.map((log, i) => (
              <div key={i} className={`py-0.5 ${getLogColor(log)}`}>
                {log}
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>
      )}
    </div>
  )
}
