import { spawn } from 'child_process'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder()

  try {
    const { name } = await req.json()

    // Validate name
    if (!name || typeof name !== 'string') {
      const stream = new ReadableStream({
        start(controller) {
          const error = encoder.encode(`data: ${JSON.stringify({
            step: 'error',
            message: 'Project name is required',
            status: 'error'
          })}\n\n`)
          controller.enqueue(error)
          controller.close()
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    if (!/^[a-z0-9-]{3,50}$/.test(name)) {
      const stream = new ReadableStream({
        start(controller) {
          const error = encoder.encode(`data: ${JSON.stringify({
            step: 'error',
            message: 'Project name must be kebab-case (lowercase, hyphens only, 3-50 chars)',
            status: 'error'
          })}\n\n`)
          controller.enqueue(error)
          controller.close()
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Create SSE stream
    const stream = new ReadableStream({
      start(controller) {
        const script = '/home/pilote/projet/primaire/BUILDER/bin/create-project-stream'
        const process = spawn(script, [name])

        process.stdout.on('data', (data) => {
          controller.enqueue(encoder.encode(data.toString()))
        })

        process.stderr.on('data', (data) => {
          const error = encoder.encode(`data: ${JSON.stringify({
            step: 'error',
            message: data.toString(),
            status: 'error'
          })}\n\n`)
          controller.enqueue(error)
        })

        process.on('close', (code) => {
          if (code !== 0) {
            const error = encoder.encode(`data: ${JSON.stringify({
              step: 'error',
              message: `Process exited with code ${code}`,
              status: 'error'
            })}\n\n`)
            controller.enqueue(error)
          }
          controller.close()
        })

        process.on('error', (err) => {
          const error = encoder.encode(`data: ${JSON.stringify({
            step: 'error',
            message: err.message,
            status: 'error'
          })}\n\n`)
          controller.enqueue(error)
          controller.close()
        })
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    const stream = new ReadableStream({
      start(controller) {
        const errorMsg = encoder.encode(`data: ${JSON.stringify({
          step: 'error',
          message: error.message || 'Failed to create project',
          status: 'error'
        })}\n\n`)
        controller.enqueue(errorMsg)
        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  }
}
