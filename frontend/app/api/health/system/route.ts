import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    // CPU usage
    const { stdout: cpuOut } = await execAsync("top -bn1 | grep 'Cpu(s)' | awk '{print $2}'")
    const cpu = parseFloat(cpuOut.trim())

    // RAM usage
    const { stdout: ramOut } = await execAsync("free -m | awk 'NR==2{printf \"%s %s %.2f\", $3,$2,$3*100/$2 }'")
    const [ramUsed, ramTotal, ramPercent] = ramOut.trim().split(' ')

    // Disk usage
    const { stdout: diskOut } = await execAsync("df -h / | awk 'NR==2{print $3,$2,$5}'")
    const [diskUsed, diskTotal, diskPercent] = diskOut.trim().split(' ')

    // Uptime
    const { stdout: uptimeOut } = await execAsync("uptime -p")
    const uptime = uptimeOut.trim()

    return NextResponse.json({
      cpu: cpu || 0,
      ram: {
        used: parseInt(ramUsed) || 0,
        total: parseInt(ramTotal) || 0,
        percent: parseFloat(ramPercent) || 0
      },
      disk: {
        used: diskUsed || '0G',
        total: diskTotal || '0G',
        percent: parseInt(diskPercent) || 0
      },
      uptime
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch system metrics' }, { status: 500 })
  }
}
