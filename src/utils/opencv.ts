let opencvLoadPromise: Promise<any> | null = null;

export async function loadOpenCV(): Promise<any> {
  const win = typeof window !== "undefined" ? (window as any) : undefined;
  if (win && win.cv && typeof win.cv.getBuildInformation === "function") {
    return win.cv;
  }
  if (opencvLoadPromise) return opencvLoadPromise;

  opencvLoadPromise = new Promise((resolve, reject) => {
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

    const script = document.createElement("script");
    script.id = "opencv-js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = "https://docs.opencv.org/4.x/opencv.js";
    script.onload = () => {
      const cv = (window as any).cv;
      if (!cv) {
        reject(new Error("OpenCV not found on window after load"));
        return;
      }
      if (typeof cv.getBuildInformation === "function") {
        resolve(cv);
        return;
      }
      cv["onRuntimeInitialized"] = () => resolve(cv);
      // Safety timeout in case onRuntimeInitialized never fires
      setTimeout(() => {
        if (typeof cv.getBuildInformation === "function") resolve(cv);
      }, 5000);
    };
    script.onerror = () => reject(new Error("Failed to load OpenCV.js"));
    document.body.appendChild(script);
  });

  return opencvLoadPromise;
}
