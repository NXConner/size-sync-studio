// Lightweight loader for MediaPipe Pose via CDN at runtime.
// This avoids bundling heavy code and keeps initial load fast.

export type PoseResult = {
  landmarks: { x: number; y: number; z?: number; visibility?: number }[];
};

export type PoseAPI = {
  start: (videoEl: HTMLVideoElement, onResults: (res: PoseResult) => void) => Promise<void>;
  stop: () => void;
};

let poseApiPromise: Promise<PoseAPI> | null = null;

export async function loadPose(): Promise<PoseAPI> {
  if (poseApiPromise) return poseApiPromise;
  poseApiPromise = (async () => {
    // Load scripts dynamically
    await ensureScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
    await ensureScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
    await ensureScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js');

    // @ts-ignore
    const mpPose = window.Pose;
    // @ts-ignore
    const Camera = window.Camera;

    let pose: any; // MediaPipe Pose instance
    let camera: any;

    const start = async (videoEl: HTMLVideoElement, onResults: (res: PoseResult) => void) => {
      pose = new mpPose.Pose({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6,
      });
      pose.onResults((results: any) => {
        if (results.poseLandmarks) {
          onResults({ landmarks: results.poseLandmarks });
        }
      });
      camera = new Camera(videoEl, {
        onFrame: async () => {
          await pose.send({ image: videoEl });
        },
        width: 640,
        height: 480,
      });
      await camera.start();
    };

    const stop = () => {
      try { camera?.stop(); } catch {}
      try { pose?.close(); } catch {}
    };

    return { start, stop } as PoseAPI;
  })();
  return poseApiPromise;
}

async function ensureScript(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}
