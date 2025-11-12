import { exec } from 'child_process'
import { promisify } from 'util'
import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

const execAsync = promisify(exec)

interface Project {
  name: string
  path: string
  port: number | null
  status: 'online' | 'stopped' | 'error' | 'not_deployed'
  preview_url: string | null
}

export async function GET() {
  try {
    const secondaireDir = '/home/pilote/projet/secondaire'

    // Get all project directories
    const dirs = fs.readdirSync(secondaireDir)
      .filter(dir => {
        const fullPath = path.join(secondaireDir, dir)
        return fs.statSync(fullPath).isDirectory()
      })

    // Get PM2 processes
    const { stdout: pm2Output } = await execAsync('pm2 jlist', { timeout: 5000 })
    const pm2Processes = JSON.parse(pm2Output)

    // Build projects list
    const projects: Project[] = dirs.map(name => {
      const projectPath = path.join(secondaireDir, name)
      const envPath = path.join(projectPath, '.env')

      let port: number | null = null
      let status: Project['status'] = 'not_deployed'
      let preview_url: string | null = null

      // Check if deployed (has .env with PORT)
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8')
        const portMatch = envContent.match(/^PORT=(\d+)/m)

        if (portMatch) {
          port = parseInt(portMatch[1], 10)
          preview_url = `http://89.116.27.88:${port}`

          // Check PM2 status
          const pm2Process = pm2Processes.find((p: any) => p.name === name)

          if (pm2Process) {
            const pm2Status = pm2Process.pm2_env?.status

            if (pm2Status === 'online') {
              status = 'online'
            } else if (pm2Status === 'stopped') {
              status = 'stopped'
            } else {
              status = 'error'
            }
          } else {
            status = 'error' // Has .env but no PM2 process
          }
        }
      }

      return {
        name,
        path: projectPath,
        port,
        status,
        preview_url
      }
    })

    return NextResponse.json({ projects })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'FAILED_TO_LIST',
      message: error.message
    }, { status: 500 })
  }
}
