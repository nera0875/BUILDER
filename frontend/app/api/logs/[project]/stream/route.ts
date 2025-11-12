import { spawn } from 'child_process'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ project: string }> }
) {
  const encoder = new TextEncoder()
  const { project: projectName } = await params

  const stream = new ReadableStream({
    start(controller) {
      const outLog = `/home/pilote/.pm2/logs/${projectName}-out.log`
      const errLog = `/home/pilote/.pm2/logs/${projectName}-error.log`

      const tail = spawn('tail', ['-f', '-n', '50', outLog, errLog])

      tail.stdout.on('data', (data) => {
        const log = data.toString()
        const sseMessage = `data: ${log}\n\n`
        controller.enqueue(encoder.encode(sseMessage))
      })

      tail.stderr.on('data', (data) => {
        const log = `[ERROR] ${data.toString()}`
        const sseMessage = `data: ${log}\n\n`
        controller.enqueue(encoder.encode(sseMessage))
      })

      tail.on('close', () => {
        controller.close()
      })

      request.signal.addEventListener('abort', () => {
        tail.kill()
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
