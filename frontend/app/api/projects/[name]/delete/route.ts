import { execSync } from 'child_process';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Project name is required' },
        { status: 400 }
      );
    }

    // Stop PM2 process
    try {
      execSync(`pm2 delete ${name}`, { stdio: 'ignore' });
    } catch {
      // Process may not exist, continue with deletion
    }

    // Delete project folder
    const projectPath = `/home/pilote/projet/secondaire/${name}`;
    if (fs.existsSync(projectPath)) {
      fs.rmSync(projectPath, { recursive: true, force: true });
    }

    return NextResponse.json({
      success: true,
      message: `Project '${name}' deleted successfully`,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        message: `Failed to delete project: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
