import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button as _Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

interface PortMapping {
  port: number
  service: string
  status: 'active' | 'inactive'
}

export function NginxPortsManager() {
  const ports: PortMapping[] = [
    { port: 3000, service: 'Frontend', status: 'active' },
    { port: 5000, service: 'API Server', status: 'active' },
    { port: 5432, service: 'PostgreSQL', status: 'active' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          NGINX Port Mappings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {ports.map(mapping => (
            <div key={mapping.port} className="flex items-center justify-between p-2 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">{mapping.service}</p>
                <p className="text-xs text-muted-foreground">:{mapping.port}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  mapping.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {mapping.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
