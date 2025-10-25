// Lightweight client-side NSFW scanning utility using dynamic imports
// to avoid increasing the main bundle size. The model is cached after first load.

export type NSFWPrediction = {
  className: string;
  probability: number;
};

export type NSFWResult = {
  topClass: string;
  topScore: number;
  predictions: NSFWPrediction[];
  flagged: boolean;
  reason?: string;
};

let modelPromise: Promise<any> | null = null;

async function loadModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      const tf = await import("@tensorflow/tfjs");
      try {
        // @ts-ignore backend names are stringly typed in tfjs
        await tf.setBackend("webgl");
      } catch (_) {
        // ignore; let tfjs choose default
      }
      await tf.ready();
      // nsfwjs has no types by default
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const nsfw = await import("nsfwjs");
      const model = await nsfw.load();
      return { tf, nsfw, model };
    })();
  }
  return modelPromise;
}

// Helper to build an HTMLImageElement from a File/Blob/DataURL
async function imageFromSource(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

export async function classifyImageElement(
  imgEl: HTMLImageElement,
  thresholds: Partial<Record<"Porn" | "Hentai" | "Sexy", number>> = {}
): Promise<NSFWResult> {
  const { model } = await loadModel();
  const preds: NSFWPrediction[] = await model.classify(imgEl);
  const top = preds.reduce((a, b) => (b.probability > a.probability ? b : a));

  const pornThreshold = thresholds.Porn ?? 0.6;
  const hentaiThreshold = thresholds.Hentai ?? 0.6;
  const sexyThreshold = thresholds.Sexy ?? 0.85;

  let flagged = false;
  let reason: string | undefined;

  for (const p of preds) {
    if (p.className === "Porn" && p.probability >= pornThreshold) {
      flagged = true;
      reason = `Porn ${p.probability.toFixed(2)} ≥ ${pornThreshold}`;
      break;
    }
    if (p.className === "Hentai" && p.probability >= hentaiThreshold) {
      flagged = true;
      reason = `Hentai ${p.probability.toFixed(2)} ≥ ${hentaiThreshold}`;
      break;
    }
    if (p.className === "Sexy" && p.probability >= sexyThreshold) {
      flagged = true;
      reason = `Sexy ${p.probability.toFixed(2)} ≥ ${sexyThreshold}`;
      break;
    }
  }

  return {
    topClass: top.className,
    topScore: top.probability,
    predictions: preds,
    flagged,
    reason,
  };
}

export async function classifyImageFile(
  file: File,
  thresholds?: Partial<Record<"Porn" | "Hentai" | "Sexy", number>>
): Promise<NSFWResult> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = (e) => reject(e);
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
  const imgEl = await imageFromSource(dataUrl);
  return classifyImageElement(imgEl, thresholds);
}
