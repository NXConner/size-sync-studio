let opencvLoadPromise: Promise<any> | null = null;

function withTimeout<T>(promise: Promise<T>, ms: number, msg: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(msg)), ms);
    promise
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(t);
        reject(e);
      });
  });
}

export async function loadOpenCV(): Promise<any> {
  const win = typeof window !== "undefined" ? (window as any) : undefined;
  if (win && win.cv && typeof win.cv.getBuildInformation === "function") {
    return win.cv;
  }
  if (opencvLoadPromise) return opencvLoadPromise;

  const isProd = Boolean((import.meta as any).env && (import.meta as any).env.PROD);
  // Sources: in prod, only local; in dev, allow CDN fallbacks
  const candidateSrcs: string[] = isProd
    ? ["/opencv/opencv.js"]
    : [
        "/opencv/opencv.js",
        "https://cdn.jsdelivr.net/npm/@techstark/opencv-js@4.8.0/dist/opencv.js",
        "https://unpkg.com/@techstark/opencv-js@4.8.0/dist/opencv.js",
        "https://docs.opencv.org/4.10.0/opencv.js",
        "https://docs.opencv.org/4.x/opencv.js",
      ];

  opencvLoadPromise = new Promise(async (resolve, reject) => {
    // If a script tag already exists, just wait for cv readiness
    const existing = document.getElementById("opencv-js");
    if (existing) {
      const check = () => {
        const cv = (window as any).cv;
        if (cv && typeof cv.getBuildInformation === "function") {
          resolve(cv);
        } else {
          setTimeout(check, 50);
        }
      };
      check();
      return;
    }

    let lastError: any = null;
    for (const src of candidateSrcs) {
      try {
        const cv = await withTimeout(loadFromSrc(src), 15000, `Timed out loading OpenCV.js from ${src}`);
        resolve(cv);
        return;
      } catch (e) {
        lastError = e;
      }
    }
    reject(lastError || new Error("Failed to load OpenCV.js from all sources"));
  });

  return opencvLoadPromise;
}

function loadFromSrc(srcUrl: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "opencv-js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = srcUrl;

    // Configure locateFile so wasm loads from the same directory as the JS
    const base = srcUrl.replace(/[^/]+$/, "");
    (window as any).cvModule = {
      locateFile: (path: string) => {
        if (path.endsWith(".wasm")) return base + path;
        return base + path;
      },
    };

    script.onload = () => {
      const cv = (window as any).cv;
      if (!cv) {
        reject(new Error(`OpenCV not found on window after load from ${srcUrl}`));
        return;
      }
      if (typeof cv.getBuildInformation === "function") {
        resolve(cv);
        return;
      }
      // onRuntimeInitialized is called once wasm is ready
      cv["onRuntimeInitialized"] = () => resolve(cv);
      // Safety timeout
      setTimeout(() => {
        if (typeof cv.getBuildInformation === "function") resolve(cv);
      }, 7000);
    };
    script.onerror = () => reject(new Error(`Failed to load OpenCV.js script from ${srcUrl}`));
    document.body.appendChild(script);
  });
}

// Optional preloader to kick off fetch at app start
export function prefetchOpenCV(): void {
  void loadOpenCV().catch(() => {});
}
