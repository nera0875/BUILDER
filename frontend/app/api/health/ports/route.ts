import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface PortInfo {
  port: number
  protocol: string
  state: string
  process: string
}

export async function GET() {
  try {
    // Get all listening ports (TCP and UDP)
    const { stdout } = await execAsync("ss -tuln | awk 'NR>1 {print $1,$5,$6}'")

    const ports: PortInfo[] = []
    const lines = stdout.trim().split('\n')

    for (const line of lines) {
      const parts = line.trim().split(/\s+/)
      if (parts.length >= 2) {
        const protocol = parts[0].toLowerCase()
        const address = parts[1]
        const state = parts[2] || 'LISTEN'

        // Extract port from address (format: *:PORT or IP:PORT)
        const portMatch = address.match(/:(\d+)$/)
        if (portMatch) {
          const port = parseInt(portMatch[1])

          // Try to get process name for this port
          let process = 'unknown'
          try {
            const { stdout: procOut } = await execAsync(
              `ss -tlnp 2>/dev/null | grep :${port} | awk -F'users:' '{print $2}' | head -1`
            )
            const procMatch = procOut.match(/\("([^"]+)"/)
            if (procMatch) {
              process = procMatch[1]
            }
          } catch {
            // Process info not available (requires root)
          }

          ports.push({
            port,
            protocol,
            state,
            process
          })
        }
      }
    }

    // Sort by port number
    ports.sort((a, b) => a.port - b.port)

    return NextResponse.json(ports)
  } catch (error) {
    console.error('Ports check error:', error)
    return NextResponse.json({ error: 'Failed to fetch port information' }, { status: 500 })
  }
}
