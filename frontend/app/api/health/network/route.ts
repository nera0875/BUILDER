import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface NetworkConnection {
  local: string
  remote: string
  state: string
}

export async function GET() {
  try {
    // Get established TCP connections
    const { stdout } = await execAsync(
      "ss -tn state established | awk 'NR>1 {print $4,$5,$1}'"
    )

    const connections: NetworkConnection[] = []
    const lines = stdout.trim().split('\n')

    for (const line of lines) {
      const parts = line.trim().split(/\s+/)
      if (parts.length >= 2) {
        connections.push({
          local: parts[0],
          remote: parts[1],
          state: parts[2] || 'ESTAB'
        })
      }
    }

    // Get connection statistics
    const stats = {
      total: connections.length,
      uniqueLocalPorts: new Set(connections.map(c => c.local.split(':')[1])).size,
      uniqueRemoteIPs: new Set(connections.map(c => c.remote.split(':')[0])).size
    }

    return NextResponse.json({
      stats,
      connections: connections.slice(0, 50) // Limit to 50 most recent
    })
  } catch (error) {
    console.error('Network check error:', error)
    return NextResponse.json({ error: 'Failed to fetch network information' }, { status: 500 })
  }
}
