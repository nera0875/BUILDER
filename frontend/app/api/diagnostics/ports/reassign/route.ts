import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: Request) {
  try {
    const { project, newPort } = await request.json()

    if (!project || !newPort || newPort < 9000 || newPort > 9100) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    // Check if new port is available
    const { stdout: checkOutput } = await execAsync(
      `lsof -i:${newPort} 2>/dev/null || true`
    )

    if (checkOutput.trim()) {
      return NextResponse.json({
        error: `Port ${newPort} is already in use`
      }, { status: 400 })
    }

    // Update PM2 env variable
    await execAsync(`pm2 set ${project}:PORT ${newPort}`)

    // Restart project
    await execAsync(`pm2 restart ${project}`)

    return NextResponse.json({
      success: true,
      message: `Port reassigned to ${newPort} successfully`,
      newPort
    })
  } catch (error) {
    console.error('Failed to reassign port:', error)
    return NextResponse.json({ error: 'Failed to reassign port' }, { status: 500 })
  }
}
