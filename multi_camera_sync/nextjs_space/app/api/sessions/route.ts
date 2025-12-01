import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Create new session
 */
export async function POST(request: NextRequest) {
  try {
    const session = await prisma?.session?.create?.({
      data: {
        status: 'active',
        deviceCount: 0,
      },
    });

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('Failed to create session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

/**
 * Get session by ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request?.url ?? '');
    const sessionId = searchParams?.get?.('id');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    const session = await prisma?.session?.findUnique?.({
      where: { id: sessionId },
      include: {
        devices: true,
        recordings: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('Failed to get session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get session' },
      { status: 500 }
    );
  }
}

/**
 * Update session status
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request?.json?.();
    const { sessionId, status, deviceCount } = body ?? {};

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (typeof deviceCount === 'number') updateData.deviceCount = deviceCount;

    const session = await prisma?.session?.update?.({
      where: { id: sessionId },
      data: updateData,
    });

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('Failed to update session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
