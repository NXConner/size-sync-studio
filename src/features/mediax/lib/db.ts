import Dexie, { type Table } from 'dexie'

export type MediaType = 'image' | 'video'

export interface MediaRecord {
  id: string
  type: MediaType
  url: string
  thumbnail: string
  title: string
  collection: string
  tags: string[]
  uploadDate: number
  size: number
  // encryption fields (optional)
  encIvHex?: string
  encData?: Uint8Array
  encMimeType?: string
}

class AppDatabase extends Dexie {
  media!: Table<MediaRecord, string>

  constructor() {
    super('private-media-vault')
    this.version(1).stores({
      media: 'id, collection, type, uploadDate',
    })
  }
}

export const db = new AppDatabase()

