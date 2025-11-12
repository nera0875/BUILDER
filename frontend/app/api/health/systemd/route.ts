import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface SystemdService {
  service: string
  state: string
  description: string
}

// Key services to monitor
const MONITORED_SERVICES = ['nginx', 'postgresql', 'docker', 'pm2']

export async function GET() {
  try {
    // Get all running services
    const { stdout } = await execAsync(
      "systemctl list-units --type=service --state=running --no-pager --no-legend | awk '{print $1,$3,$4}'"
    )

    const allServices: SystemdService[] = []
    const monitoredServices: SystemdService[] = []
    const lines = stdout.trim().split('\n')

    for (const line of lines) {
      const parts = line.trim().split(/\s+/)
      if (parts.length >= 2) {
        const serviceName = parts[0].replace('.service', '')
        const state = parts[1]
        const description = parts.slice(2).join(' ') || 'N/A'

        const serviceInfo: SystemdService = {
          service: serviceName,
          state,
          description
        }

        allServices.push(serviceInfo)

        // Check if this is a monitored service
        if (MONITORED_SERVICES.some(ms => serviceName.includes(ms))) {
          monitoredServices.push(serviceInfo)
        }
      }
    }

    // Also check status of monitored services even if not running
    for (const serviceName of MONITORED_SERVICES) {
      if (!monitoredServices.some(s => s.service.includes(serviceName))) {
        try {
          const { stdout: statusOut } = await execAsync(
            `systemctl is-active ${serviceName} 2>/dev/null || echo "inactive"`
          )
          const state = statusOut.trim()

          monitoredServices.push({
            service: serviceName,
            state: state === 'active' ? 'running' : state,
            description: `${serviceName} service`
          })
        } catch {
          // Service doesn't exist
          monitoredServices.push({
            service: serviceName,
            state: 'not-found',
            description: `${serviceName} not installed`
          })
        }
      }
    }

    return NextResponse.json({
      total: allServices.length,
      monitored: monitoredServices,
      all: allServices.slice(0, 20) // Limit to 20 for performance
    })
  } catch (error) {
    console.error('Systemd check error:', error)
    return NextResponse.json({ error: 'Failed to fetch systemd information' }, { status: 500 })
  }
}
