import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Register device in session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request?.json?.();
    const { sessionId, participantId, deviceLabel } = body ?? {};

    if (!sessionId || !participantId) {
      return NextResponse.json(
        { success: false, error: 'sessionId and participantId required' },
        { status: 400 }
      );
    }

    // Check if device already exists
    const existing = await prisma?.device?.findUnique?.({
      where: { participantId },
    });

    if (existing) {
      // Update last seen
      const device = await prisma?.device?.update?.({
        where: { participantId },
        data: {
          isOnline: true,
          lastSeenAt: new Date(),
          deviceLabel: deviceLabel ?? existing?.deviceLabel,
        },
      });
      return NextResponse.json({ success: true, device });
    }

    // Create new device
    const device = await prisma?.device?.create?.({
      data: {
        sessionId,
        participantId,
        deviceLabel: deviceLabel ?? 'Unknown Device',
        isOnline: true,
      },
    });

    // Update session device count
    const session = await prisma?.session?.findUnique?.({
      where: { id: sessionId },
      include: { devices: { where: { isOnline: true } } },
    });

    if (session) {
      await prisma?.session?.update?.({
        where: { id: sessionId },
        data: { deviceCount: session?.devices?.length ?? 0 },
      });
    }

    return NextResponse.json({ success: true, device });
  } catch (error) {
    console.error('Failed to register device:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register device' },
      { status: 500 }
    );
  }
}

/**
 * Update device status
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request?.json?.();
    const { participantId, isOnline } = body ?? {};

    if (!participantId) {
      return NextResponse.json(
        { success: false, error: 'participantId required' },
        { status: 400 }
      );
    }

    const device = await prisma?.device?.update?.({
      where: { participantId },
      data: {
        isOnline: isOnline ?? true,
        lastSeenAt: new Date(),
      },
    });

    // Update session device count
    const session = await prisma?.session?.findUnique?.({
      where: { id: device?.sessionId ?? '' },
      include: { devices: { where: { isOnline: true } } },
    });

    if (session) {
      await prisma?.session?.update?.({
        where: { id: device?.sessionId ?? '' },
        data: { deviceCount: session?.devices?.length ?? 0 },
      });
    }

    return NextResponse.json({ success: true, device });
  } catch (error) {
    console.error('Failed to update device:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update device' },
      { status: 500 }
    );
  }
}

/**
 * Get devices for session
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request?.url ?? '');
    const sessionId = searchParams?.get?.('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId required' },
        { status: 400 }
      );
    }

    const devices = await prisma?.device?.findMany?.({
      where: { sessionId },
      orderBy: { joinedAt: 'asc' },
    });

    return NextResponse.json({ success: true, devices: devices ?? [] });
  } catch (error) {
    console.error('Failed to get devices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get devices' },
      { status: 500 }
    );
  }
}
