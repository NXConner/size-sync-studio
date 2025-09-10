export async function shareFileBlob(filename: string, blob: Blob, title = 'Health Report', text = 'Sharing report') {
  try {
    const files = [new File([blob], filename, { type: blob.type })]
    if (navigator.canShare && navigator.canShare({ files })) {
      await navigator.share({ files, title, text })
      return true
    }
  } catch {}
  return false
}

