import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Save recording metadata
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request?.json?.();
    const {
      sessionId,
      deviceId,
      startTime,
      endTime,
      duration,
      fileName,
      fileSize,
      cameraIndex,
      metadata,
    } = body ?? {};

    if (!sessionId || !deviceId || !fileName) {
      return NextResponse.json(
        { success: false, error: 'sessionId, deviceId, and fileName required' },
        { status: 400 }
      );
    }

    const recording = await prisma?.recording?.create?.({
      data: {
        sessionId,
        deviceId,
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : undefined,
        duration: duration ?? undefined,
        fileName,
        fileSize: fileSize ? BigInt(fileSize) : undefined,
        cameraIndex: cameraIndex ?? 0,
        metadata: metadata ?? undefined,
      },
    });

    // Convert BigInt to string for JSON serialization
    const recordingJson = {
      ...recording,
      fileSize: recording?.fileSize?.toString?.() ?? null,
    };

    return NextResponse.json({ success: true, recording: recordingJson });
  } catch (error) {
    console.error('Failed to save recording:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save recording' },
      { status: 500 }
    );
  }
}

/**
 * Get recordings for session
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

    const recordings = await prisma?.recording?.findMany?.({
      where: { sessionId },
      orderBy: { startTime: 'desc' },
    });

    // Convert BigInt to string for JSON serialization
    const recordingsJson = (recordings ?? [])?.map?.((rec) => ({
      ...rec,
      fileSize: rec?.fileSize?.toString?.() ?? null,
    }));

    return NextResponse.json({ success: true, recordings: recordingsJson ?? [] });
  } catch (error) {
    console.error('Failed to get recordings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get recordings' },
      { status: 500 }
    );
  }
}
