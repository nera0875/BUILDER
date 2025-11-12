import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const projectPath = `/home/pilote/projet/secondaire/${name}`;

    // Check if project directory exists
    if (!fs.existsSync(projectPath)) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if already running
    try {
      const pmListOutput = execSync('pm2 list --nostream', {
        encoding: 'utf-8',
      });
      if (pmListOutput.includes(name) && pmListOutput.includes('online')) {
        return NextResponse.json(
          { success: false, error: 'Project is already running' },
          { status: 400 }
        );
      }
    } catch (e) {
      // Continue - pm2 list might fail if no processes running
    }

    // Read PORT from .env file
    const envPath = path.join(projectPath, '.env');
    let port = 3001; // default port

    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const portMatch = envContent.match(/PORT=(\d+)/);
      if (portMatch) {
        port = parseInt(portMatch[1], 10);
      }
    }

    // Start PM2 with ecosystem config
    const startCommand = `cd ${projectPath} && pm2 start ecosystem.config.js`;
    execSync(startCommand, { stdio: 'inherit' });

    const previewUrl = `http://89.116.27.88:${port}`;

    return NextResponse.json({
      success: true,
      port,
      previewUrl,
    });
  } catch (error) {
    console.error('Failed to start project:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start project',
      },
      { status: 500 }
    );
  }
}
