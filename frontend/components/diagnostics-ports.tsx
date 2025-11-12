'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash, RotateCw, AlertCircle, Info, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PortInfo {
  port: number
  project: string | null
  status: 'online' | 'offline' | 'conflict'
  type: 'nextjs' | 'fastapi' | 'unknown'
  pid: number | null
  processes: number
}

export function DiagnosticsPorts() {
  const [ports, setPorts] = useState<PortInfo[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedPort, setSelectedPort] = useState<PortInfo | null>(null)
  const [confirmAction, setConfirmAction] = useState<'kill' | 'reassign' | null>(null)
  const [newPort, setNewPort] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const { toast } = useToast()

  const fetchPorts = async () => {
    try {
      const res = await fetch('/api/diagnostics/ports')
      const data = await res.json()
      setPorts(data.ports || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch ports',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPorts()
    const interval = setInterval(fetchPorts, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleKillPort = async () => {
    if (!selectedPort) return

    try {
      const res = await fetch('/api/diagnostics/ports/kill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ port: selectedPort.port })
      })

      if (!res.ok) throw new Error('Failed to kill port')

      toast({
        title: 'Success',
        description: `Port ${selectedPort.port} killed successfully`
      })

      fetchPorts()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to kill port',
        variant: 'destructive'
      })
    } finally {
      setConfirmAction(null)
      setSelectedPort(null)
    }
  }

  const handleReassignPort = async () => {
    if (!selectedPort || !selectedPort.project || !newPort) return

    const portNum = parseInt(newPort)
    if (portNum < 9000 || portNum > 9100) {
      toast({
        title: 'Error',
        description: 'Port must be between 9000 and 9100',
        variant: 'destructive'
      })
      return
    }

    try {
      const res = await fetch('/api/diagnostics/ports/reassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: selectedPort.project,
          newPort: portNum
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to reassign port')
      }

      toast({
        title: 'Success',
        description: `Port reassigned to ${portNum} successfully`
      })

      fetchPorts()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reassign port',
        variant: 'destructive'
      })
    } finally {
      setConfirmAction(null)
      setSelectedPort(null)
      setNewPort('')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-600">Online</Badge>
      case 'offline':
        return <Badge variant="secondary">Offline</Badge>
      case 'conflict':
        return <Badge variant="destructive">Conflict</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'nextjs':
        return <Badge variant="outline">Next.js</Badge>
      case 'fastapi':
        return <Badge variant="outline">FastAPI</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const filteredPorts = ports.filter(port =>
    port.status !== 'offline' && (
      filter === '' ||
      port.port.toString().includes(filter) ||
      port.project?.toLowerCase().includes(filter.toLowerCase())
    )
  )

  const conflicts = ports.filter(p => p.status === 'conflict')

  return (
    <div className="space-y-6">
      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Port Conflicts Detected</AlertTitle>
          <AlertDescription>
            {conflicts.length} port{conflicts.length > 1 ? 's are' : ' is'} being used by multiple processes.
            This can cause service disruptions.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Port Manager</h3>
          <p className="text-sm text-muted-foreground">
            Manage ports 9000-9100 across all projects
          </p>
        </div>
        <Button onClick={fetchPorts} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Search by port or project name..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-md"
      />

      {/* Ports Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Ports (9000-9100)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Port</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>PID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredPorts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No ports found</TableCell>
                </TableRow>
              ) : (
                filteredPorts.map(port => (
                  <TableRow key={port.port}>
                    <TableCell className="font-mono font-semibold">{port.port}</TableCell>
                    <TableCell>{port.project || '-'}</TableCell>
                    <TableCell>{getStatusBadge(port.status)}</TableCell>
                    <TableCell>{getTypeBadge(port.type)}</TableCell>
                    <TableCell className="font-mono text-sm">{port.pid || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {port.status !== 'offline' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPort(port)
                                setShowDetails(true)
                              }}
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPort(port)
                                setConfirmAction('kill')
                              }}
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                            {port.project && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedPort(port)
                                  setConfirmAction('reassign')
                                }}
                              >
                                <RotateCw className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Kill Confirmation */}
      <AlertDialog open={confirmAction === 'kill'} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kill Port {selectedPort?.port}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will terminate the process using port {selectedPort?.port}.
              {selectedPort?.project && ` Project "${selectedPort.project}" will stop immediately.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleKillPort}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Kill Port
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reassign Confirmation */}
      <AlertDialog open={confirmAction === 'reassign'} onOpenChange={() => {
        setConfirmAction(null)
        setNewPort('')
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reassign Port for {selectedPort?.project}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will change the port and restart the project. Enter new port (9000-9100):
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            type="number"
            placeholder="New port (9000-9100)"
            value={newPort}
            onChange={(e) => setNewPort(e.target.value)}
            min={9000}
            max={9100}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReassignPort}>
              Reassign Port
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Port Details Sheet */}
      <Sheet open={showDetails} onOpenChange={setShowDetails}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Port {selectedPort?.port} Details</SheetTitle>
            <SheetDescription>Complete information about this port</SheetDescription>
          </SheetHeader>
          {selectedPort && (
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm font-semibold">Port</p>
                <p className="text-sm text-muted-foreground font-mono">{selectedPort.port}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Project</p>
                <p className="text-sm text-muted-foreground">{selectedPort.project || 'None'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Status</p>
                <div className="mt-1">{getStatusBadge(selectedPort.status)}</div>
              </div>
              <div>
                <p className="text-sm font-semibold">Type</p>
                <div className="mt-1">{getTypeBadge(selectedPort.type)}</div>
              </div>
              <div>
                <p className="text-sm font-semibold">PID</p>
                <p className="text-sm text-muted-foreground font-mono">{selectedPort.pid || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Processes</p>
                <p className="text-sm text-muted-foreground">{selectedPort.processes}</p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
