import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    const { stdout } = await execAsync('pm2 jlist')
    const apps = JSON.parse(stdout)

    const formatted = apps.map((app: any) => ({
      name: app.name,
      status: app.pm2_env.status,
      cpu: app.monit.cpu,
      memory: Math.round(app.monit.memory / 1024 / 1024), // MB
      restarts: app.pm2_env.restart_time,
      uptime: app.pm2_env.pm_uptime
    }))

    return NextResponse.json({ apps: formatted })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch PM2 apps' }, { status: 500 })
  }
}
