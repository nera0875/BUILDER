import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface DockerContainer {
  id: string
  name: string
  status: string
  ports: string
}

export async function GET() {
  try {
    // Check if docker is available
    try {
      await execAsync('which docker')
    } catch {
      return NextResponse.json({
        available: false,
        message: 'Docker not installed',
        containers: []
      })
    }

    // Get all containers with custom format
    const { stdout } = await execAsync(
      'docker ps -a --format "{{.ID}}|{{.Names}}|{{.Status}}|{{.Ports}}"'
    )

    const containers: DockerContainer[] = []
    const lines = stdout.trim().split('\n').filter(line => line.length > 0)

    for (const line of lines) {
      const [id, name, status, ports] = line.split('|')
      containers.push({
        id: id.trim(),
        name: name.trim(),
        status: status.trim(),
        ports: ports.trim() || 'none'
      })
    }

    return NextResponse.json({
      available: true,
      count: containers.length,
      containers
    })
  } catch (error) {
    console.error('Docker check error:', error)
    return NextResponse.json({
      available: false,
      error: 'Failed to fetch docker information',
      containers: []
    }, { status: 500 })
  }
}
