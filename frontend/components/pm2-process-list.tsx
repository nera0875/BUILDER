import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Cpu } from 'lucide-react'

interface Process {
  id: number
  name: string
  status: 'online' | 'stopped' | 'errored'
  cpu: number
  memory: number
}

export function PM2ProcessList() {
  const processes: Process[] = [
    { id: 0, name: 'builder-frontend', status: 'online', cpu: 2.5, memory: 125 },
    { id: 1, name: 'builder-backend', status: 'online', cpu: 3.2, memory: 215 },
  ]

  const getStatusBadgeVariant = (status: Process['status']) => {
    switch (status) {
      case 'online':
        return 'default'
      case 'stopped':
        return 'secondary'
      case 'errored':
        return 'destructive'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          PM2 Processes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {processes.map(process => (
            <div key={process.id} className="p-3 bg-muted rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{process.name}</span>
                <Badge variant={getStatusBadgeVariant(process.status)}>
                  {process.status}
                </Badge>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>CPU: {process.cpu}%</span>
                <span>Memory: {process.memory}MB</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
