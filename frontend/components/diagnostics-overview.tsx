'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Network, Server, Gauge, AlertCircle } from 'lucide-react'

interface OverviewStats {
  portsUsed: number
  portsTotal: number
  pm2Processes: number
  systemHealth: 'good' | 'warning' | 'critical'
  conflicts: number
}

interface DiagnosticsOverviewProps {
  onNavigate: (tab: string) => void
}

export function DiagnosticsOverview({ onNavigate }: DiagnosticsOverviewProps) {
  const [stats, setStats] = useState<OverviewStats>({
    portsUsed: 0,
    portsTotal: 101,
    pm2Processes: 0,
    systemHealth: 'good',
    conflicts: 0
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch ports stats
        const portsRes = await fetch('/api/diagnostics/ports')
        const portsData = await portsRes.json()

        // Fetch PM2 stats
        const pm2Res = await fetch('/api/health/pm2')
        const pm2Data = await pm2Res.json()

        // Fetch system health
        const systemRes = await fetch('/api/health/system')
        const systemData = await systemRes.json()

        // Determine system health
        let health: 'good' | 'warning' | 'critical' = 'good'
        if (systemData.cpu?.usage > 90 || systemData.memory?.usedPercent > 90) {
          health = 'critical'
        } else if (systemData.cpu?.usage > 70 || systemData.memory?.usedPercent > 70) {
          health = 'warning'
        }

        setStats({
          portsUsed: portsData.used || 0,
          portsTotal: portsData.total || 101,
          pm2Processes: pm2Data.processes?.length || 0,
          systemHealth: health,
          conflicts: portsData.conflicts || 0
        })
      } catch (error) {
        console.error('Failed to fetch overview stats:', error)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [])

  const getHealthColor = () => {
    switch (stats.systemHealth) {
      case 'good':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'critical':
        return 'text-red-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {stats.conflicts > 0 && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">
                {stats.conflicts} Port Conflict{stats.conflicts > 1 ? 's' : ''} Detected
              </p>
              <p className="text-sm text-muted-foreground">
                Multiple processes are using the same port
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ports Card */}
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onNavigate('ports')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ports</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.portsUsed}/{stats.portsTotal}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ports in use
            </p>
          </CardContent>
        </Card>

        {/* PM2 Card */}
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onNavigate('pm2')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">PM2 Processes</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pm2Processes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              active processes
            </p>
          </CardContent>
        </Card>

        {/* System Health Card */}
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onNavigate('system')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor()}`}>
              {stats.systemHealth.toUpperCase()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              overall status
            </p>
          </CardContent>
        </Card>

        {/* Nginx Card */}
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onNavigate('nginx')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nginx</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">ACTIVE</div>
            <p className="text-xs text-muted-foreground mt-1">
              proxy status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Info */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">Port Ranges:</span>
            <br />
            <span className="text-muted-foreground">
              9000-9019: Dashboard/System • 9020-9049: Next.js • 9050-9079: FastAPI • 9080-9100: Dev/Test
            </span>
          </p>
          <p>
            <span className="font-semibold">Auto-refresh:</span>
            <span className="text-muted-foreground"> Every 10 seconds</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
