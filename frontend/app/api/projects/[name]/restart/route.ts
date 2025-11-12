import { execSync } from 'child_process';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Project name is required' },
        { status: 400 }
      );
    }

    // Restart project via PM2
    execSync(`pm2 restart ${name}`, { stdio: 'pipe' });

    return NextResponse.json(
      {
        success: true,
        message: `Project "${name}" restarted successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        message: `Failed to restart project: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
