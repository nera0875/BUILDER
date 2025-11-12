import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: Request) {
  try {
    const { port } = await request.json()

    if (!port || port < 9000 || port > 9100) {
      return NextResponse.json({ error: 'Invalid port number' }, { status: 400 })
    }

    // Kill process using port
    await execAsync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`)

    // Wait a bit to ensure process is killed
    await new Promise(resolve => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      message: `Port ${port} killed successfully`
    })
  } catch (error) {
    console.error('Failed to kill port:', error)
    return NextResponse.json({ error: 'Failed to kill port' }, { status: 500 })
  }
}
