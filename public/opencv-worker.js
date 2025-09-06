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
    // Unknown message type for now
    return fail('Unknown message type');
  } catch (e) {
    return fail(e);
  }
};

