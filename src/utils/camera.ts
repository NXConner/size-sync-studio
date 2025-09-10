// Lightweight camera utilities for starting/stopping streams, enumerating devices,
// applying constraints (zoom/torch/fps), and measuring FPS.

export type CameraFacingMode = "user" | "environment";

export type CameraStartOptions = {
  deviceId?: string;
  facingMode?: CameraFacingMode;
  width?: number;
  height?: number;
  frameRate?: number;
  preferExact?: boolean;
};

export type CameraCapabilities = {
  canTorch: boolean;
  canZoom: boolean;
  zoom?: { min: number; max: number; step?: number };
  frameRate?: { min: number; max: number };
  width?: { min: number; max: number };
  height?: { min: number; max: number };
};

export type CameraStartResult = {
  stream: MediaStream;
  track: MediaStreamTrack;
  capabilities: CameraCapabilities;
};

export const stopStream = (stream?: MediaStream | null) => {
  if (!stream) return;
  for (const track of stream.getTracks()) {
    try { track.stop(); } catch {}
  }
};

export const enumerateVideoDevices = async (): Promise<MediaDeviceInfo[]> => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === "videoinput");
  } catch {
    return [];
  }
};

export const selectDeviceForFacing = async (
  facing: CameraFacingMode,
): Promise<string | undefined> => {
  const devices = await enumerateVideoDevices();
  if (devices.length === 0) return undefined;
  // Try to infer front/back from labels when available
  const labelIncludes = (label: string, tokens: string[]) =>
    tokens.some((t) => label.toLowerCase().includes(t));
  const backTokens = ["back", "rear", "environment"];
  const frontTokens = ["front", "user", "face"]; 
  const candidates = devices.filter((d) =>
    facing === "environment"
      ? labelIncludes(d.label, backTokens)
      : labelIncludes(d.label, frontTokens),
  );
  if (candidates.length > 0) return candidates[0].deviceId;
  // Fallback: pick first/last device depending on facing
  return facing === "environment" ? devices[devices.length - 1].deviceId : devices[0].deviceId;
};

const buildConstraints = (opts: CameraStartOptions): MediaStreamConstraints => {
  const width = opts.width && opts.width > 0 ? opts.width : undefined;
  const height = opts.height && opts.height > 0 ? opts.height : undefined;
  const frameRate = opts.frameRate && opts.frameRate > 0 ? opts.frameRate : undefined;
  const preferExact = !!opts.preferExact;
  const video: MediaTrackConstraints = {};
  if (opts.deviceId) video.deviceId = { exact: opts.deviceId };
  if (!opts.deviceId && opts.facingMode) video.facingMode = { ideal: opts.facingMode } as any;
  if (width) video.width = preferExact ? { exact: width } : { ideal: width };
  if (height) video.height = preferExact ? { exact: height } : { ideal: height };
  if (frameRate) video.frameRate = preferExact ? { exact: frameRate } : { ideal: frameRate };
  return { video, audio: false };
};

export const startCamera = async (opts: CameraStartOptions = {}): Promise<CameraStartResult> => {
  // Try deviceId first if provided, else try inferred device for facing, else generic
  let lastError: any = null;
  const tryWith = async (constraints: MediaStreamConstraints) => {
    const c: any = { ...constraints };
    // Mobile-oriented hints
    if (c.video && typeof c.video === 'object') {
      c.video.focusMode = (c.video.focusMode || 'continuous') as any;
      c.video.advanced = [
        { focusMode: 'continuous' as any },
        { whiteBalanceMode: 'continuous' as any },
        { exposureMode: 'continuous' as any },
      ];
    }
    return navigator.mediaDevices.getUserMedia(c);
  };

  const candidates: MediaStreamConstraints[] = [];
  if (opts.deviceId) candidates.push(buildConstraints(opts));
  if (!opts.deviceId && opts.facingMode) {
    const deviceId = await selectDeviceForFacing(opts.facingMode);
    if (deviceId) candidates.push(buildConstraints({ ...opts, deviceId }));
  }
  // generic with facing ideal
  candidates.push(buildConstraints({ ...opts, deviceId: undefined }));

  for (const c of candidates) {
    try {
      const stream = await tryWith(c);
      const track = stream.getVideoTracks()[0];
      const capsAny = (track.getCapabilities ? track.getCapabilities() : {}) as any;
      const capabilities: CameraCapabilities = {
        canTorch: !!capsAny.torch,
        canZoom: !!capsAny.zoom,
        zoom: capsAny.zoom
          ? { min: Number(capsAny.zoom.min ?? 1), max: Number(capsAny.zoom.max ?? 1), step: capsAny.zoom.step }
          : undefined,
        frameRate: capsAny.frameRate ? { min: capsAny.frameRate.min, max: capsAny.frameRate.max } : undefined,
        width: capsAny.width ? { min: capsAny.width.min, max: capsAny.width.max } : undefined,
        height: capsAny.height ? { min: capsAny.height.min, max: capsAny.height.max } : undefined,
      };
      return { stream, track, capabilities };
    } catch (err) {
      lastError = err;
    }
  }

  // Final fallback: plain video true
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: opts.facingMode || 'environment' } as any }, audio: false });
    const track = stream.getVideoTracks()[0];
    const capsAny = (track.getCapabilities ? track.getCapabilities() : {}) as any;
    const capabilities: CameraCapabilities = {
      canTorch: !!capsAny.torch,
      canZoom: !!capsAny.zoom,
      zoom: capsAny.zoom
        ? { min: Number(capsAny.zoom.min ?? 1), max: Number(capsAny.zoom.max ?? 1), step: capsAny.zoom.step }
        : undefined,
      frameRate: capsAny.frameRate ? { min: capsAny.frameRate.min, max: capsAny.frameRate.max } : undefined,
      width: capsAny.width ? { min: capsAny.width.min, max: capsAny.width.max } : undefined,
      height: capsAny.height ? { min: capsAny.height.min, max: capsAny.height.max } : undefined,
    };
    return { stream, track, capabilities };
  } catch (err) {
    throw lastError || err;
  }
};

export const cycleFacingMode = async (
  current: CameraFacingMode,
): Promise<CameraFacingMode> => (current === "environment" ? "user" : "environment");


export const applyZoom = async (track: MediaStreamTrack, level: number) => {
  try {
    const caps: any = track.getCapabilities ? track.getCapabilities() : {};
    if (!caps.zoom) return false;
    const constrained: any = { advanced: [{ zoom: level }] };
    await track.applyConstraints(constrained);
    return true;
  } catch {
    return false;
  }
};

export const setTorch = async (track: MediaStreamTrack, on: boolean) => {
  try {
    const caps: any = track.getCapabilities ? track.getCapabilities() : {};
    if (!caps.torch) return false;
    const constrained: any = { advanced: [{ torch: on }] };
    await track.applyConstraints(constrained);
    return true;
  } catch {
    return false;
  }
};

export const applyFrameRate = async (track: MediaStreamTrack, fps: number) => {
  try {
    await track.applyConstraints({ frameRate: { ideal: fps } as any });
    return true;
  } catch {
    return false;
  }
};

export const measureVideoFps = async (
  video: HTMLVideoElement,
  sampleMs = 750,
): Promise<number> => {
  // Use requestVideoFrameCallback when available; otherwise use timeupdate heuristics
  const rvfc = (video as any).requestVideoFrameCallback?.bind(video);
  if (rvfc) {
    let count = 0;
    let start = 0;
    return new Promise<number>((resolve) => {
      const handle = (_: any, metadata: any) => {
        if (count === 0) start = metadata.mediaTime;
        count += 1;
        const elapsed = metadata.mediaTime - start; // seconds
        if (elapsed >= sampleMs / 1000) {
          resolve(Math.max(0, Math.round(count / elapsed)));
        } else {
          rvfc(handle);
        }
      };
      rvfc(handle);
    });
  }
  // Fallback: estimate with RAF around readyState
  return new Promise<number>((resolve) => {
    let frames = 0;
    let start = performance.now();
    const tick = () => {
      frames += 1;
      const now = performance.now();
      if (now - start >= sampleMs) {
        const fps = Math.round((frames * 1000) / (now - start));
        resolve(fps);
      } else {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  });
};

