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
    if (type === 'detect') {
      await ensureLoaded();
      const { width, height, imageData } = payload || {};
      if (!width || !height || !imageData) throw new Error('Invalid payload');
      const cv = self.cv;
      const off = new OffscreenCanvas(width, height);
      const ctx = off.getContext('2d');
      ctx.putImageData(new ImageData(new Uint8ClampedArray(imageData), width, height), 0, 0);
      const src = cv.imread(off);
      const rgba = new cv.Mat();
      cv.cvtColor(src, rgba, cv.COLOR_RGBA2RGB);
      const hsv = new cv.Mat();
      const ycrcb = new cv.Mat();
      cv.cvtColor(rgba, hsv, cv.COLOR_RGB2HSV);
      cv.cvtColor(rgba, ycrcb, cv.COLOR_RGB2YCrCb);

      // Build mask
      const mask1 = new cv.Mat();
      const mask2 = new cv.Mat();
      const mask = new cv.Mat();
      const low1 = new cv.Mat(height, width, cv.CV_8UC3, [0, 133, 77]);
      const high1 = new cv.Mat(height, width, cv.CV_8UC3, [255, 173, 127]);
      cv.inRange(ycrcb, low1, high1, mask1);
      const low2 = new cv.Mat(height, width, cv.CV_8UC3, [0, Math.round(0.23 * 255), 50]);
      const high2 = new cv.Mat(height, width, cv.CV_8UC3, [50, Math.round(0.68 * 255), 255]);
      cv.inRange(hsv, low2, high2, mask2);
      cv.bitwise_or(mask1, mask2, mask);

      const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(7, 7));
      cv.morphologyEx(mask, mask, cv.MORPH_CLOSE, kernel);
      cv.morphologyEx(mask, mask, cv.MORPH_OPEN, kernel);

      // Contours and axis
      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();
      cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
      let bestIdx = -1;
      let bestArea = 0;
      for (let i = 0; i < contours.size(); i++) {
        const cnt = contours.get(i);
        const area = cv.contourArea(cnt, false);
        if (area > bestArea) {
          bestArea = area; bestIdx = i;
        }
        cnt.delete();
      }
      contours.delete(); hierarchy.delete();
      const contours2 = new cv.MatVector();
      const hierarchy2 = new cv.Mat();
      cv.findContours(mask, contours2, hierarchy2, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      let axisUx = 1, axisUy = 0;
      let end1 = null, end2 = null;
      let bestCnt = null;
      if (bestIdx >= 0) {
        const cnt = contours2.get(bestIdx);
        const moments = cv.moments(cnt, false);
        const cx = moments.m00 !== 0 ? moments.m10 / moments.m00 : width / 2;
        const cy = moments.m00 !== 0 ? moments.m01 / moments.m00 : height / 2;
        const angle = 0.5 * Math.atan2(2 * moments.mu11, moments.mu20 - moments.mu02);
        axisUx = Math.cos(angle);
        axisUy = Math.sin(angle);
        let minS = Number.POSITIVE_INFINITY, maxS = Number.NEGATIVE_INFINITY;
        let minPt = { x: cx, y: cy }, maxPt = { x: cx, y: cy };
        const data = cnt.data32S;
        for (let i = 0; i < data.length; i += 2) {
          const x = data[i]; const y = data[i + 1];
          const s = (x - cx) * axisUx + (y - cy) * axisUy;
          if (s < minS) { minS = s; minPt = { x, y }; }
          if (s > maxS) { maxS = s; maxPt = { x, y }; }
        }
        end1 = minPt; end2 = maxPt; bestCnt = cnt;
      }

      // Fallback Hough
      if (!end1 || !end2) {
        const gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        const blurred = new cv.Mat();
        cv.GaussianBlur(gray, blurred, new cv.Size(9, 9), 0, 0, cv.BORDER_DEFAULT);
        const edges = new cv.Mat();
        cv.Canny(blurred, edges, 50, 150);
        const lines = new cv.Mat();
        cv.HoughLinesP(edges, lines, 1, Math.PI / 180, 80, 0.2 * Math.min(width, height), 20);
        let bestLineLen = 0;
        for (let i = 0; i < lines.rows; i++) {
          const p = lines.int32Ptr(i);
          const x1 = p[0], y1 = p[1], x2 = p[2], y2 = p[3];
          const len = Math.hypot(x2 - x1, y2 - y1);
          if (len > bestLineLen) {
            bestLineLen = len;
            end1 = { x: x1, y: y1 }; end2 = { x: x2, y: y2 };
            axisUx = (x2 - x1) / (len || 1);
            axisUy = (y2 - y1) / (len || 1);
          }
        }
        gray.delete(); blurred.delete(); edges.delete(); lines.delete();
      }

      // widths sampling
      let widths = [];
      if (end1 && end2) {
        const totalLen = Math.hypot(end2.x - end1.x, end2.y - end1.y) || 1;
        const centerX = (end1.x + end2.x) / 2; const centerY = (end1.y + end2.y) / 2;
        const perpUx = -axisUy; const perpUy = axisUx;
        const ts = [-0.2, -0.1, -0.05, 0, 0.05, 0.1, 0.2];
        const maxScan = Math.floor(Math.min(width, height) * 0.25);
        const isInside = (x, y) => {
          const ix = Math.round(x); const iy = Math.round(y);
          if (ix < 0 || iy < 0 || ix >= width || iy >= height) return false;
          return mask.ucharPtr(iy, ix)[0] > 0;
        };
        for (const t of ts) {
          const px = centerX + t * totalLen * axisUx;
          const py = centerY + t * totalLen * axisUy;
          let left = 0, right = 0;
          for (let s = 0; s < maxScan; s++) { if (!isInside(px - s * perpUx, py - s * perpUy)) { left = s; break; } }
          for (let s = 0; s < maxScan; s++) { if (!isInside(px + s * perpUx, py + s * perpUy)) { right = s; break; } }
          const w = left + right; if (w > 0) widths.push(w);
        }
      }

      // confidence metrics
      let elongation = 0, solidity = 1;
      if (end1 && end2 && widths.length) {
        widths.sort((a, b) => a - b);
        const lengthPx = Math.hypot(end2.x - end1.x, end2.y - end1.y) || 1;
        const medianW = widths[Math.floor(widths.length / 2)];
        elongation = lengthPx / Math.max(1, medianW);
      }
      try {
        if (bestCnt) {
          const hull = new cv.Mat();
          cv.convexHull(bestCnt, hull, false, true);
          const area = cv.contourArea(bestCnt, false);
          const hullArea = Math.max(1, cv.contourArea(hull, false));
          solidity = Math.min(1, area / hullArea);
          hull.delete();
        }
      } catch {}
      const areaFraction = bestArea / (width * height);
      let confidence = 0;
      confidence += Math.min(1, (elongation || 0) / 3) * 0.45;
      confidence += Math.min(1, areaFraction / 0.2) * 0.25;
      confidence += Math.min(1, solidity) * 0.30;

      // Pack mask image for optional overlay
      const maskCanvas = new OffscreenCanvas(width, height);
      cv.imshow(maskCanvas, mask);
      const mctx = maskCanvas.getContext('2d');
      const maskImage = mctx.getImageData(0, 0, width, height);

      // Cleanup
      src.delete(); rgba.delete(); hsv.delete(); ycrcb.delete();
      mask1.delete(); mask2.delete(); mask.delete(); kernel.delete();
      contours2.delete(); hierarchy2.delete(); if (bestCnt) bestCnt.delete();

      const result = { end1, end2, axisUx, axisUy, widths, bestArea, width, height, confidence, maskImage: maskImage.data };
      return self.postMessage({ id, ok: true, data: result }, [maskImage.data.buffer]);
    }
    // Unknown message type for now
    return fail('Unknown message type');
  } catch (e) {
    return fail(e);
  }
};

