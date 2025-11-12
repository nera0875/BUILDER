import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Get all listening ports in range 9000-9100
    const { stdout: lsofOutput } = await execAsync(
      'lsof -i :9000-9100 -sTCP:LISTEN 2>/dev/null | grep LISTEN | awk \'{print $9}\' | cut -d: -f2 | sort -u || true'
    )

    const usedPorts = lsofOutput
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(p => parseInt(p))

    // Generate available ports list
    const availablePorts = []
    for (let port = 9000; port <= 9100; port++) {
      if (!usedPorts.includes(port)) {
        availablePorts.push(port)
      }
    }

    // Categorize by range
    const dashboard = availablePorts.filter(p => p >= 9000 && p <= 9019)
    const nextjs = availablePorts.filter(p => p >= 9020 && p <= 9049)
    const fastapi = availablePorts.filter(p => p >= 9050 && p <= 9079)
    const dev = availablePorts.filter(p => p >= 9080 && p <= 9100)

    return NextResponse.json({
      total: availablePorts.length,
      ports: availablePorts,
      byRange: {
        dashboard: { ports: dashboard, count: dashboard.length },
        nextjs: { ports: nextjs, count: nextjs.length },
        fastapi: { ports: fastapi, count: fastapi.length },
        dev: { ports: dev, count: dev.length }
      }
    })
  } catch (error) {
    console.error('Failed to get available ports:', error)
    return NextResponse.json({ error: 'Failed to get available ports' }, { status: 500 })
  }
}
