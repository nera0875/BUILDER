import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

interface ChangePortResponse {
  success: boolean
  port?: number
  preview_url?: string
  message?: string
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
): Promise<NextResponse<ChangePortResponse>> {
  try {
    const { name } = await params

    // Validate project name (alphanumeric + dash only)
    if (!name || !/^[a-z0-9-]+$/.test(name)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid project name format',
        },
        { status: 400 }
      )
    }

    const projectPath = `/home/pilote/projet/secondaire/${name}`
    const envPath = path.join(projectPath, '.env')

    // Verify project exists
    if (!fs.existsSync(projectPath)) {
      return NextResponse.json(
        {
          success: false,
          message: `Project "${name}" not found`,
        },
        { status: 404 }
      )
    }

    // Release old port
    try {
      execSync(
        `/home/pilote/projet/primaire/BUILDER/bin/port-manager release ${name}`,
        { timeout: 5000, stdio: 'pipe' }
      )
    } catch (error) {
      // Port may not have been registered, continue
      console.warn(`Warning: Could not release old port for ${name}`)
    }

    // Assign new port
    let newPort: string
    try {
      newPort = execSync(
        `/home/pilote/projet/primaire/BUILDER/bin/port-manager assign ${name}`,
        { timeout: 5000, stdio: 'pipe' }
      )
        .toString()
        .trim()

      if (!newPort || !/^\d+$/.test(newPort)) {
        throw new Error('Invalid port returned from port-manager')
      }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: `Failed to assign new port: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
        { status: 500 }
      )
    }

    // Update .env file if exists
    if (fs.existsSync(envPath)) {
      try {
        let envContent = fs.readFileSync(envPath, 'utf-8')
        // Replace PORT=XXX or add new PORT line
        if (envContent.includes('PORT=')) {
          envContent = envContent.replace(/^PORT=\d+$/m, `PORT=${newPort}`)
        } else {
          envContent += `\nPORT=${newPort}`
        }
        fs.writeFileSync(envPath, envContent, 'utf-8')
      } catch (error) {
        console.warn(`Warning: Could not update .env for ${name}`)
      }
    }

    // Restart PM2 process
    try {
      execSync(`pm2 restart ${name}`, { timeout: 10000, stdio: 'pipe' })
    } catch (error) {
      // Try to start if not running
      try {
        execSync(
          `cd ${projectPath} && pm2 start npm --name ${name} -- start`,
          { timeout: 10000, stdio: 'pipe' }
        )
      } catch (startError) {
        console.warn(
          `Warning: Could not restart PM2 process for ${name}: ${startError instanceof Error ? startError.message : 'Unknown error'}`
        )
        // Don't fail - port assignment was successful
      }
    }

    return NextResponse.json({
      success: true,
      port: parseInt(newPort, 10),
      preview_url: `http://89.116.27.88:${newPort}`,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/projects/[name]/change-port
 * Returns information about port change capability
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
): Promise<NextResponse> {
  try {
    const { name } = await params

    return NextResponse.json({
      message: 'Use POST to change project port',
      endpoint: `POST /api/projects/${name}/change-port`,
      example: {
        method: 'POST',
        url: `/api/projects/${name}/change-port`,
        response: {
          success: true,
          port: 3001,
          preview_url: 'http://89.116.27.88:3001',
        },
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
