import { exec } from 'child_process'
import { promisify } from 'util'
import { NextResponse } from 'next/server'

const execAsync = promisify(exec)

export async function POST(req: Request) {
  try {
    const { name } = await req.json()

    // Validate name
    if (!name || typeof name !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'MISSING_NAME',
        message: 'Project name is required'
      }, { status: 400 })
    }

    if (!/^[a-z0-9-]{3,50}$/.test(name)) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_NAME',
        message: 'Project name must be kebab-case (lowercase, hyphens only, 3-50 chars)'
      }, { status: 400 })
    }

    // Execute creation script
    const script = '/home/pilote/projet/primaire/BUILDER/bin/create-project-api'
    const { stdout } = await execAsync(`${script} ${name}`, {
      timeout: 120000 // 2 minutes max
    })

    // Parse JSON response from script
    const result = JSON.parse(stdout.trim())

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }

  } catch (error: any) {
    // Check if it's a JSON parsing error (script returned JSON error)
    try {
      const errorResult = JSON.parse(error.stdout || '{}')
      if (errorResult.error) {
        return NextResponse.json(errorResult, { status: 400 })
      }
    } catch {}

    return NextResponse.json({
      success: false,
      error: 'EXECUTION_FAILED',
      message: error.message || 'Failed to create project'
    }, { status: 500 })
  }
}
