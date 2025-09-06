// Classic worker to load OpenCV.js off the main thread
// Note: This is a scaffold; operations will be added incrementally.

let cvReady = false;

function ensureLoaded() {
  if (cvReady) return Promise.resolve(true);
  return new Promise((resolve, reject) => {
    try {
      // Only load once
      if (self.cv) {
        if (self.cv['onRuntimeInitialized']) {
          self.cv['onRuntimeInitialized'] = () => {
            cvReady = true;
            resolve(true);
          };
        } else {
          cvReady = true;
          resolve(true);
        }
        return;
      }
      self.importScripts('/opencv/opencv.js');
      if (self.cv) {
        self.cv['onRuntimeInitialized'] = () => {
          cvReady = true;
          resolve(true);
        };
      } else {
        reject(new Error('cv not present after import'));
      }
    } catch (e) {
      reject(e);
    }
  });
}

self.onmessage = async (event) => {
  const { id, type, payload } = event.data || {};
  const reply = (data) => self.postMessage({ id, ok: true, data });
  const fail = (error) => self.postMessage({ id, ok: false, error: String(error && error.message ? error.message : error) });

  try {
    if (type === 'ping') {
      return reply({ pong: true });
    }
    if (type === 'load') {
      await ensureLoaded();
      return reply({ ready: true });
    }
    if (type === 'edges') {
      await ensureLoaded();
      const { width, height, imageData } = payload || {};
      if (!width || !height || !imageData) throw new Error('Invalid payload');
      const cv = self.cv;
      // Create a canvas to write pixels into a Mat
      const off = new OffscreenCanvas(width, height);
      const ctx = off.getContext('2d');
      ctx.putImageData(new ImageData(new Uint8ClampedArray(imageData), width, height), 0, 0);
      const src = cv.imread(off);
      const gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      const blurred = new cv.Mat();
      cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
      const edges = new cv.Mat();
      cv.Canny(blurred, edges, 50, 150);
      const out = new OffscreenCanvas(width, height);
      cv.imshow(out, edges);
      const outCtx = out.getContext('2d');
      const outImage = outCtx.getImageData(0, 0, width, height);
      const buffer = outImage.data.buffer;
      const res = { width, height, imageData: outImage.data }; // will be transferred
      src.delete(); gray.delete(); blurred.delete(); edges.delete();
      return self.postMessage({ id, ok: true, data: res }, [outImage.data.buffer]);
    }
    // Unknown message type for now
    return fail('Unknown message type');
  } catch (e) {
    return fail(e);
  }
};

