import { execSync } from 'child_process';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(
  _request: NextRequest,
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

    // Stop PM2 process
    try {
      execSync(`pm2 stop ${name}`, { stdio: 'ignore' });
    } catch (e) {
      // Process might not be running
      return NextResponse.json(
        { success: false, error: 'Project is not running' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Project stopped',
    });
  } catch (error) {
    console.error('Failed to stop project:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to stop project',
      },
      { status: 500 }
    );
  }
}
