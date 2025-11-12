import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Nginx ports
    const { stdout: portsOut } = await execAsync("ss -tulnp 2>/dev/null | grep nginx | awk '{print $5}' | cut -d':' -f2 | sort -u")
    const ports = portsOut.trim().split('\n').filter(Boolean).map(Number)

    // Nginx status
    const { stdout: statusOut } = await execAsync("systemctl is-active nginx 2>/dev/null || echo 'unknown'")
    const status = statusOut.trim()

    // Nginx configs
    const { stdout: configsOut } = await execAsync("ls /etc/nginx/sites-enabled/ 2>/dev/null || echo ''")
    const configs = configsOut.trim().split('\n').filter(Boolean)

    return NextResponse.json({
      ports,
      status,
      configs
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch nginx status' }, { status: 500 })
  }
}
