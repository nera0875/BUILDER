'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw } from 'lucide-react'

interface Service {
  unit: string
  state: string
  description: string
}

interface SystemdData {
  total: number
  monitored: Service[]
  all: Service[]
}

export function SystemdServices() {
  const [data, setData] = useState<SystemdData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchServices = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/health/systemd')
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error('Failed to fetch systemd:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
    const interval = setInterval(fetchServices, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>System Services</CardTitle>
          <Button variant="ghost" size="icon" onClick={fetchServices}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{data?.total} total running services</p>

            <div>
              <h4 className="font-semibold mb-2">Monitored Services</h4>
              <div className="space-y-2">
                {data?.monitored.map(service => (
                  <div key={service.unit} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium text-sm">{service.unit}</p>
                      <p className="text-xs text-muted-foreground">{service.description}</p>
                    </div>
                    <Badge variant={service.state === 'active' ? 'default' : 'secondary'}>
                      {service.state}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
