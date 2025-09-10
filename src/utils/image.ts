export async function loadImageAdjusted(file: File): Promise<HTMLCanvasElement> {
  const img = await fileToImage(file)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const { width, height } = orientationAdjustedSize(img)
  canvas.width = width; canvas.height = height
  // For simplicity, draw as-is; modern browsers respect EXIF via CSS image-orientation in many contexts. Optionally rotate here if needed.
  ctx.drawImage(img, 0, 0, width, height)
  return canvas
}

function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e) }
    img.src = url
  })
}

function orientationAdjustedSize(img: HTMLImageElement) {
  // Placeholder: could inspect EXIF via a library to detect rotate 90/270 and swap
  return { width: img.naturalWidth, height: img.naturalHeight }
}

