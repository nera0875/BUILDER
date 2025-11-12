import { spawn } from 'child_process';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  // Create readable stream for SSE
  const encoder = new TextEncoder();
  const customReadable = new ReadableStream({
    start(controller) {
      const pm2Process = spawn('pm2', ['logs', name, '--lines', '50', '--raw']);

      pm2Process.stdout?.on('data', (data: Buffer) => {
        const message = data.toString().trim();
        if (message) {
          const sseMessage = `data: ${JSON.stringify({
            message,
            type: 'stdout',
            timestamp: new Date().toISOString(),
          })}\n\n`;
          controller.enqueue(encoder.encode(sseMessage));
        }
      });

      pm2Process.stderr?.on('data', (data: Buffer) => {
        const message = data.toString().trim();
        if (message) {
          const sseMessage = `data: ${JSON.stringify({
            message,
            type: 'stderr',
            timestamp: new Date().toISOString(),
          })}\n\n`;
          controller.enqueue(encoder.encode(sseMessage));
        }
      });

      pm2Process.on('error', (error) => {
        const errorMessage = `data: ${JSON.stringify({
          message: `Error: ${error.message}`,
          type: 'error',
          timestamp: new Date().toISOString(),
        })}\n\n`;
        controller.enqueue(encoder.encode(errorMessage));
        controller.close();
      });

      pm2Process.on('close', (code) => {
        const closeMessage = `data: ${JSON.stringify({
          message: `Process ended with code ${code}`,
          type: 'close',
          timestamp: new Date().toISOString(),
        })}\n\n`;
        controller.enqueue(encoder.encode(closeMessage));
        controller.close();
      });
    },
  });

  return new NextResponse(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
