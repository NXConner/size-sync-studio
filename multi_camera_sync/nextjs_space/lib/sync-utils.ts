// Timestamp synchronization utilities

export interface SyncCommand {
  action: 'start_recording' | 'stop_recording' | 'start_playback' | 'pause_playback';
  timestamp: number;
  startAt?: number;
  data?: any;
}

export interface CountdownState {
  isActive: boolean;
  remaining: number;
  total: number;
}

/**
 * Calculate time until start
 */
export function calculateTimeUntilStart(startAt: number): number {
  return Math.max(0, startAt - Date.now());
}

/**
 * Format countdown display
 */
export function formatCountdown(milliseconds: number): string {
  if (milliseconds <= 0) return '0';
  const seconds = Math.ceil(milliseconds / 1000);
  return seconds.toString();
}

/**
 * Schedule action at specific time
 */
export function scheduleAction(
  startAt: number,
  action: () => void,
  onCountdown?: (remaining: number) => void
): () => void {
  const delay = calculateTimeUntilStart(startAt);
  
  // Update countdown every 100ms
  let countdownInterval: NodeJS.Timeout | null = null;
  
  if (onCountdown && delay > 0) {
    countdownInterval = setInterval(() => {
      const remaining = calculateTimeUntilStart(startAt);
      onCountdown?.(remaining);
      
      if (remaining <= 0 && countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
    }, 100);
  }
  
  // Schedule the action
  const timeout = setTimeout(() => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    action?.();
  }, Math.max(0, delay));
  
  // Return cleanup function
  return () => {
    if (timeout) clearTimeout(timeout);
    if (countdownInterval) clearInterval(countdownInterval);
  };
}

/**
 * Generate unique participant ID
 */
export function generateParticipantId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get device label
 */
export function getDeviceLabel(): string {
  const ua = navigator?.userAgent ?? '';
  
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS Device';
  if (/Android/i.test(ua)) return 'Android Device';
  if (/Mac/i.test(ua)) return 'Mac';
  if (/Windows/i.test(ua)) return 'Windows PC';
  if (/Linux/i.test(ua)) return 'Linux';
  
  return 'Unknown Device';
}

/**
 * Build share link
 */
export function buildShareLink(sessionId: string): string {
  if (typeof window === 'undefined') return '';
  
  const { origin, pathname } = window?.location ?? {};
  return `${origin}${pathname}?session=${encodeURIComponent(sessionId ?? '')}`;
}

/**
 * Parse session from URL
 */
export function parseSessionFromURL(): string | null {
  if (typeof window === 'undefined') return null;
  
  const params = new URLSearchParams(window?.location?.search ?? '');
  return params?.get?.('session');
}

/**
 * Store session ID in localStorage
 */
export function storeSessionId(sessionId: string | null): void {
  if (typeof window === 'undefined') return;
  
  if (sessionId) {
    localStorage?.setItem?.('camera_sync_session', sessionId);
  } else {
    localStorage?.removeItem?.('camera_sync_session');
  }
}

/**
 * Retrieve session ID from localStorage
 */
export function retrieveSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  
  return localStorage?.getItem?.('camera_sync_session') ?? null;
}

/**
 * Create download link for blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL?.createObjectURL?.(blob);
  const a = document?.createElement?.('a');
  
  if (a) {
    a.href = url ?? '';
    a.download = filename ?? 'recording.webm';
    document?.body?.appendChild?.(a);
    a?.click?.();
    document?.body?.removeChild?.(a);
    URL?.revokeObjectURL?.(url ?? '');
  }
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes?.[i] ?? 'B'}`;
}

/**
 * Format duration
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds === 0) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
