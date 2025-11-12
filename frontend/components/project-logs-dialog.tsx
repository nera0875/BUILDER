'use client'

import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface LogEntry {
  timestamp: string
  message: string
  type: 'stdout' | 'stderr'
}

interface ProjectLogsDialogProps {
  projectName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectLogsDialog({
  projectName,
  open,
  onOpenChange,
}: ProjectLogsDialogProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!open || !projectName) return

    setLogs([])
    const eventSource = new EventSource(
      `/api/projects/${encodeURIComponent(projectName)}/logs`
    )
    eventSourceRef.current = eventSource

    eventSource.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data)
        const logEntry: LogEntry = {
          timestamp: data.timestamp || new Date().toISOString(),
          message: data.message || '',
          type: data.type || 'stdout',
        }
        setLogs((prev) => [...prev, logEntry])

        // Auto-scroll to bottom
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
          }
        }, 0)
      } catch (error) {
        console.error('Failed to parse log entry:', error)
      }
    })

    eventSource.addEventListener('done', () => {
      eventSource.close()
    })

    eventSource.onerror = () => {
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [open, projectName])

  const handleClose = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    onOpenChange(false)
  }

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    } catch {
      return isoString
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Logs - {projectName}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <ScrollArea
          ref={scrollRef}
          className="h-[500px] w-full border rounded bg-slate-950 p-4"
        >
          <div className="font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-slate-500">Waiting for logs...</div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`py-1 ${
                    log.type === 'stderr' ? 'text-red-400' : 'text-white'
                  }`}
                >
                  <span className="text-slate-500">[{formatTime(log.timestamp)}]</span>{' '}
                  <span>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
