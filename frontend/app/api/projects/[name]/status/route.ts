import { exec } from 'child_process';
import { promisify } from 'util';
import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export const runtime = 'nodejs';

interface StatusResponse {
  running: boolean;
  port: number | null;
  previewUrl: string | null;
  uptime: string | null;
  memory: string | null;
  cpu: string | null;
  status: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const projectPath = `/home/pilote/projet/secondaire/${name}`;

    // Check if project directory exists
    if (!fs.existsSync(projectPath)) {
      return NextResponse.json(
        {
          running: false,
          port: null,
          previewUrl: null,
          uptime: null,
          memory: null,
          cpu: null,
          status: 'not_found',
        } as StatusResponse,
        { status: 404 }
      );
    }

    // Read PORT from .env file
    const envPath = path.join(projectPath, '.env');
    let port: number | null = null;

    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const portMatch = envContent.match(/^PORT=(\d+)/m);
      if (portMatch) {
        port = parseInt(portMatch[1], 10);
      }
    }

    // Get PM2 process info
    try {
      const { stdout: pm2Output } = await execAsync('pm2 jlist', {
        timeout: 5000,
      });
      const pm2Processes = JSON.parse(pm2Output);
      const pm2Process = pm2Processes.find((p: any) => p.name === name);

      if (pm2Process) {
        const pm2Status = pm2Process.pm2_env?.status || 'unknown';
        const running = pm2Status === 'online';

        // Extract metrics
        const memory = pm2Process.monit?.memory
          ? `${Math.round(pm2Process.monit.memory / 1024 / 1024)} MB`
          : null;

        const cpu = pm2Process.monit?.cpu
          ? `${pm2Process.monit.cpu}%`
          : null;

        // Calculate uptime
        let uptime: string | null = null;
        if (pm2Process.pm2_env?.created_at) {
          const createdAt = new Date(pm2Process.pm2_env.created_at).getTime();
          const now = Date.now();
          const uptimeMs = now - createdAt;
          const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));

          if (days > 0) {
            uptime = `${days}d ${hours}h`;
          } else if (hours > 0) {
            uptime = `${hours}h ${minutes}m`;
          } else {
            uptime = `${minutes}m`;
          }
        }

        const previewUrl =
          port && running ? `http://89.116.27.88:${port}` : null;

        return NextResponse.json({
          running,
          port,
          previewUrl,
          uptime,
          memory,
          cpu,
          status: pm2Status,
        } as StatusResponse);
      } else {
        // No PM2 process found
        return NextResponse.json({
          running: false,
          port,
          previewUrl: null,
          uptime: null,
          memory: null,
          cpu: null,
          status: 'stopped',
        } as StatusResponse);
      }
    } catch (pm2Error) {
      // PM2 command failed or no processes running
      return NextResponse.json({
        running: false,
        port,
        previewUrl: null,
        uptime: null,
        memory: null,
        cpu: null,
        status: 'error',
      } as StatusResponse);
    }
  } catch (error) {
    console.error('Failed to get project status:', error);
    return NextResponse.json(
      {
        running: false,
        port: null,
        previewUrl: null,
        uptime: null,
        memory: null,
        cpu: null,
        status: 'error',
      } as StatusResponse,
      { status: 500 }
    );
  }
}
