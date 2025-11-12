import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Zombie processes
    const { stdout: zombiesOut } = await execAsync("ps aux | awk '$8==\"Z\" {print $2,$11}' || echo ''")
    const zombies = zombiesOut.trim().split('\n').filter(Boolean).map(line => {
      const [pid, name] = line.split(' ')
      return { pid: parseInt(pid), name }
    })

    // Top memory consumers
    const { stdout: topOut } = await execAsync("ps aux --sort=-%mem | head -11 | tail -10 | awk '{print $2,$11,$4,$3}'")
    const topConsumers = topOut.trim().split('\n').map(line => {
      const [pid, name, mem, cpu] = line.split(' ')
      return {
        pid: parseInt(pid),
        name,
        mem: parseFloat(mem),
        cpu: parseFloat(cpu)
      }
    })

    return NextResponse.json({
      zombies,
      topConsumers
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch processes' }, { status: 500 })
  }
}
