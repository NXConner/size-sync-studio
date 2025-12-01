// Camera utilities adapted from size-sync-studio patterns

export interface CameraDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export interface CameraCapabilities {
  canZoom?: boolean;
  canTorch?: boolean;
  zoom?: { min: number; max: number };
  frameRate?: { min: number; max: number };
}

export interface CameraStartOptions {
  deviceId?: string;
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
  frameRate?: number;
  audio?: boolean;
}

export interface CameraStartResult {
  stream: MediaStream;
  track: MediaStreamTrack;
  capabilities?: CameraCapabilities;
}

/**
 * Enumerate all video input devices
 */
export async function enumerateVideoDevices(): Promise<CameraDevice[]> {
  try {
    const devices = await navigator?.mediaDevices?.enumerateDevices?.() ?? [];
    return devices
      .filter((device) => device?.kind === 'videoinput')
      .map((device, index) => ({
        deviceId: device?.deviceId ?? '',
        label: device?.label || `Camera ${index + 1}`,
        kind: device?.kind ?? 'videoinput',
      }));
  } catch (error) {
    console.error('Failed to enumerate devices:', error);
    return [];
  }
}

/**
 * Select best device for facing mode
 */
export async function selectDeviceForFacing(
  facing: 'user' | 'environment'
): Promise<string | undefined> {
  const devices = await enumerateVideoDevices();
  
  if (devices?.length === 0) return undefined;
  
  const backTokens = ['back', 'rear', 'environment'];
  const frontTokens = ['front', 'user', 'face'];
  
  const tokens = facing === 'environment' ? backTokens : frontTokens;
  
  const candidates = devices?.filter?.((d) =>
    tokens?.some?.((token) => d?.label?.toLowerCase?.()?.includes?.(token))
  ) ?? [];
  
  if (candidates?.length > 0) return candidates?.[0]?.deviceId;
  
  // Fallback: pick first/last device
  return facing === 'environment'
    ? devices?.[devices?.length - 1]?.deviceId
    : devices?.[0]?.deviceId;
}

/**
 * Build media constraints
 */
function buildConstraints(opts: CameraStartOptions): MediaStreamConstraints {
  const video: MediaTrackConstraints = {};
  
  if (opts?.deviceId) {
    video.deviceId = { exact: opts?.deviceId };
  } else if (opts?.facingMode) {
    video.facingMode = { ideal: opts?.facingMode };
  }
  
  if (opts?.width) video.width = { ideal: opts?.width };
  if (opts?.height) video.height = { ideal: opts?.height };
  if (opts?.frameRate) video.frameRate = { ideal: opts?.frameRate };
  
  return {
    video: Object.keys(video).length > 0 ? video : true,
    audio: opts?.audio ?? false,
  };
}

/**
 * Start camera with fallback strategy
 */
export async function startCamera(
  opts: CameraStartOptions = {}
): Promise<CameraStartResult> {
  const candidates: MediaStreamConstraints[] = [];
  
  // Try exact deviceId first
  if (opts?.deviceId) {
    candidates?.push?.(buildConstraints(opts));
  }
  
  // Try inferred device for facing mode
  if (!opts?.deviceId && opts?.facingMode) {
    const deviceId = await selectDeviceForFacing(opts?.facingMode);
    if (deviceId) {
      candidates?.push?.(buildConstraints({ ...opts, deviceId }));
    }
  }
  
  // Generic fallback
  candidates?.push?.(buildConstraints({ ...opts, deviceId: undefined }));
  
  let lastError: Error | null = null;
  
  // Try each candidate until one succeeds
  for (const constraints of candidates ?? []) {
    try {
      const stream = await navigator?.mediaDevices?.getUserMedia?.(constraints);
      if (!stream) throw new Error('No stream returned');
      
      const track = stream?.getVideoTracks?.()?.[0];
      if (!track) throw new Error('No video track');
      
      const settings = track?.getSettings?.() ?? {};
      const capsAny = (track?.getCapabilities?.() ?? {}) as any;
      
      const capabilities: CameraCapabilities = {
        canTorch: !!capsAny?.torch,
        canZoom: !!capsAny?.zoom,
        zoom: capsAny?.zoom
          ? { min: Number(capsAny?.zoom?.min ?? 1), max: Number(capsAny?.zoom?.max ?? 1) }
          : undefined,
        frameRate: capsAny?.frameRate
          ? { min: capsAny?.frameRate?.min, max: capsAny?.frameRate?.max }
          : undefined,
      };
      
      return { stream, track, capabilities };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  
  throw lastError ?? new Error('Failed to start camera');
}

/**
 * Stop media stream
 */
export function stopStream(stream: MediaStream | null | undefined): void {
  if (!stream) return;
  
  try {
    stream?.getTracks?.()?.forEach?.((track) => {
      try {
        track?.stop?.();
      } catch (err) {
        console.error('Error stopping track:', err);
      }
    });
  } catch (err) {
    console.error('Error stopping stream:', err);
  }
}

/**
 * Request camera permissions
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const stream = await navigator?.mediaDevices?.getUserMedia?.({ video: true });
    stopStream(stream);
    return true;
  } catch (error) {
    console.error('Camera permission denied:', error);
    return false;
  }
}

/**
 * Check if camera is available
 */
export async function isCameraAvailable(): Promise<boolean> {
  try {
    const devices = await enumerateVideoDevices();
    return (devices?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

/**
 * Get video quality preset
 */
export function getQualityPreset(quality: 'low' | 'medium' | 'high') {
  const presets = {
    low: { width: 640, height: 480, frameRate: 24 },
    medium: { width: 1280, height: 720, frameRate: 30 },
    high: { width: 1920, height: 1080, frameRate: 30 },
  };
  
  return presets?.[quality] ?? presets?.medium;
}
