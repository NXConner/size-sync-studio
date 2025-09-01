import { useEffect, useState } from 'react'
import { db, type MediaRecord } from '@mediax/lib/db'
import { getMeasurements, getPhoto } from '@/utils/storage'
import { MediaGallery } from '@mediax/components/MediaGallery'
import type { MediaItem } from '@mediax/pages/Index'

export default function Explore() {
  const [items, setItems] = useState<MediaItem[]>([])

  useEffect(() => {
    const hydrate = async () => {
      const existing = await db.media.toArray()
      const byId = new Set(existing.map(r => r.id))
      const measurements = getMeasurements().slice(0, 50)
      const toInsert: MediaRecord[] = []
      for (const m of measurements) {
        if (!m.photoUrl || byId.has(m.id)) continue
        try {
          const blob = await getPhoto(m.id)
          if (!blob) continue
          const url = URL.createObjectURL(blob)
          toInsert.push({
            id: m.id,
            type: 'image',
            url,
            thumbnail: url,
            title: `Measurement ${new Date(m.date).toLocaleString()}`,
            collection: 'measurements',
            tags: ['measure'],
            uploadDate: new Date(m.date).getTime(),
            size: blob.size,
          })
        } catch {}
      }
      if (toInsert.length) await db.media.bulkPut(toInsert)
      const all = await db.media.toArray()
      const cast: MediaItem[] = all.map(r => ({ ...r, uploadDate: new Date(r.uploadDate) } as unknown as MediaItem))
      setItems(cast)
    }
    void hydrate()
  }, [])

  const [selected, setSelected] = useState<MediaItem | null>(null)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">mediaX Explore</h1>
      <MediaGallery mediaItems={items} onMediaSelect={setSelected} />
      {selected && (
        <div className="mt-4 text-sm text-muted-foreground">Selected: {selected.title}</div>
      )}
    </div>
  )
}

