// ONNXRuntime Web segmentation worker scaffold
let warmed = false
let ortLoaded = false
let ort = null
let ortSession = null

async function ensureOrt() {
  if (ortLoaded) return true
  try {
    if (!self.ort) {
      try { self.importScripts('/ort.min.js') } catch {}
      if (!self.ort) {
        try { self.importScripts('https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js') } catch {}
      }
    }
    if (self.ort) {
      ort = self.ort
      ortLoaded = true
      return true
    }
  } catch {}
  return false
}

async function ensureModel() {
  if (ortSession) return true
  const ok = await ensureOrt()
  if (!ok) return false
  try {
    // Attempt to load model from public path
    const url = '/models/segmentation.onnx'
    ortSession = await ort.InferenceSession.create(url, { executionProviders: ['wasm'] })
    return true
  } catch {
    return false
  }
}

self.onmessage = async (event) => {
  const { id, type, payload } = event.data || {}
  const ok = (data) => self.postMessage({ id, ok: true, data })
  const fail = (error) => self.postMessage({ id, ok: false, error: String(error && error.message ? error.message : error) })
  try {
    if (type === 'warm') {
      warmed = true
      return ok({ ready: true })
    }
    if (type === 'segment') {
      const { width, height, imageData } = payload || {}
      if (!width || !height || !imageData) throw new Error('Invalid payload')
      // Try ML first
      try {
        const ready = await ensureModel()
        if (ready && ortSession) {
          // Simple NHWC -> NCHW float32 normalization [0,1]
          const rgba = new Uint8ClampedArray(imageData)
          const chw = new Float32Array(1 * 3 * height * width)
          let o = 0
          for (let c = 0; c < 3; c++) {
            for (let y = 0; y < height; y++) {
              for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4
                const v = rgba[idx + c] / 255
                chw[o++] = v
              }
            }
          }
          const inputNames = Object.keys(ortSession.inputMetadata || { input: {} })
          const outputNames = Object.keys(ortSession.outputMetadata || { output: {} })
          const inputName = inputNames[0] || 'input'
          const outputName = outputNames[0] || 'output'
          const inputTensor = new ort.Tensor('float32', chw, [1, 3, height, width])
          const outputs = await ortSession.run({ [inputName]: inputTensor })
          const out = outputs[outputName]
          // Assume single-channel mask probability map HxW
          let mask
          if (out && out.data && out.dims && out.dims.length >= 2) {
            const oh = out.dims.at(-2)
            const ow = out.dims.at(-1)
            const data = out.data
            // Resize/threshold to original size (nearest), here assume same size
            mask = new Uint8ClampedArray(width * height)
            const len = Math.min(mask.length, data.length)
            for (let i = 0; i < len; i++) mask[i] = data[i] > 0.5 ? 255 : 0
          } else {
            mask = new Uint8ClampedArray(width * height)
          }
          return ok({ width, height, mask })
        }
      } catch {}
      // Fallback: empty mask
      const mask = new Uint8ClampedArray(width * height)
      return ok({ width, height, mask })
    }
    return fail('Unknown message type')
  } catch (e) {
    return fail(e)
  }
}

