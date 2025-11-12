import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface PortInfo {
  port: number
  project: string | null
  status: 'online' | 'offline' | 'conflict'
  type: 'nextjs' | 'fastapi' | 'unknown'
  pid: number | null
  processes: number
}

export async function GET() {
  try {
    // Get all listening ports in range
    const { stdout: lsofOutput } = await execAsync(
      'lsof -i :9000-9100 -sTCP:LISTEN -t 2>/dev/null || true'
    )

    const pids = lsofOutput.trim().split('\n').filter(Boolean)

    // Get PM2 processes
    const { stdout: pm2Output } = await execAsync('pm2 jlist 2>/dev/null || echo "[]"')
    const pm2Processes = JSON.parse(pm2Output)

    // Build port info map
    const portMap = new Map<number, PortInfo>()

    for (const pid of pids) {
      try {
        const { stdout: portOutput } = await execAsync(
          `lsof -P -p ${pid} -sTCP:LISTEN | grep LISTEN | awk '{print $9}' | cut -d: -f2`
        )
        const port = parseInt(portOutput.trim())

        if (port >= 9000 && port <= 9100) {
          // Find associated PM2 process
          const pm2Process = pm2Processes.find((p: any) =>
            p.pm_id && p.pm2_env?.PORT == port
          )

          // Detect project type
          let type: 'nextjs' | 'fastapi' | 'unknown' = 'unknown'
          if (pm2Process) {
            const script = pm2Process.pm2_env?.pm_exec_path || ''
            if (script.includes('next') || script.includes('.next')) type = 'nextjs'
            else if (script.includes('uvicorn') || script.includes('fastapi')) type = 'fastapi'
          }

          const existing = portMap.get(port)
          if (existing) {
            existing.processes++
            existing.status = 'conflict'
          } else {
            portMap.set(port, {
              port,
              project: pm2Process?.name || null,
              status: 'online',
              type,
              pid: parseInt(pid),
              processes: 1
            })
          }
        }
      } catch (err) {
        // Skip invalid PIDs
      }
    }

    // Add all ports in range (mark unavailable as offline)
    for (let port = 9000; port <= 9100; port++) {
      if (!portMap.has(port)) {
        portMap.set(port, {
          port,
          project: null,
          status: 'offline',
          type: 'unknown',
          pid: null,
          processes: 0
        })
      }
    }

    const portsArray = Array.from(portMap.values()).sort((a, b) => a.port - b.port)

    return NextResponse.json({
      ports: portsArray,
      total: portsArray.length,
      used: portsArray.filter(p => p.status !== 'offline').length,
      conflicts: portsArray.filter(p => p.status === 'conflict').length
    })
  } catch (error) {
    console.error('Failed to scan ports:', error)
    return NextResponse.json({ error: 'Failed to scan ports' }, { status: 500 })
  }
}
