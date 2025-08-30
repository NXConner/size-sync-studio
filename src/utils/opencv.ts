let opencvLoadPromise: Promise<any> | null = null;

export async function loadOpenCV(): Promise<any> {
  if (typeof window !== 'undefined' && (window as any).cv && (window as any).cv['loaded']) {
    return (window as any).cv;
  }
  if (opencvLoadPromise) return opencvLoadPromise;

  opencvLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://docs.opencv.org/4.x/opencv.js';
    script.onload = () => {
      const waitForReady = () => {
        const cv = (window as any).cv;
        if (cv && cv['ready']) {
          resolve(cv);
        } else {
          setTimeout(waitForReady, 50);
        }
      };
      waitForReady();
    };
    script.onerror = () => reject(new Error('Failed to load OpenCV.js'));
    document.body.appendChild(script);
  });

  return opencvLoadPromise;
}

