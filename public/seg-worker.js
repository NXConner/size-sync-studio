// Placeholder ONNXRuntime Web segmentation worker scaffold (model loading can be added later)
let warmed = false

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
      // For now, return a dummy empty mask of the same size
      const mask = new Uint8ClampedArray(width * height)
      return ok({ width, height, mask })
    }
    return fail('Unknown message type')
  } catch (e) {
    return fail(e)
  }
}

