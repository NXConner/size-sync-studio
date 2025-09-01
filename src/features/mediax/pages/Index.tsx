
import { useState, useEffect, Suspense, lazy, useMemo } from 'react';
import { MediaGallery } from '@mediax/components/MediaGallery';
import { Sidebar } from '@mediax/components/Sidebar';
import { UploadDropzone } from '@mediax/components/UploadDropzone';
import { SearchBar } from '@mediax/components/SearchBar';
import { Menu, X, Settings2, ChevronDown, ChevronUp, ImagePlus } from 'lucide-react';
import BackgroundWallpaper, { WallpaperConfig } from '@mediax/components/BackgroundWallpaper';
const MediaViewer = lazy(() => import('@mediax/components/MediaViewer').then(m => ({ default: m.MediaViewer })));
const WallpaperControls = lazy(() => import('@mediax/components/WallpaperControls'));
import { db, type MediaRecord } from '@mediax/lib/db'
import { usePinLock } from '@mediax/hooks/usePinLock'
import PinLock from '@mediax/components/PinLock'
import { encryptBlob, decryptToBlob } from '@mediax/lib/crypto'
import { hapticImpact } from '@mediax/lib/native'

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  title: string;
  collection: string;
  tags: string[];
  uploadDate: Date;
  size: number;
}

const Index = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | undefined>(undefined);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [wallpaper, setWallpaper] = useState<WallpaperConfig | null>(null);
  const [showWallpaperControls, setShowWallpaperControls] = useState(false);
  const pin = usePinLock()

  // Initial load: hydrate from IndexedDB; if empty, seed with mock data once
  useEffect(() => {
    const load = async () => {
      const records = await db.media.toArray()
      if (records.length === 0) {
        const seed: MediaRecord[] = [
          {
            id: 'seed-1',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=1200&q=80',
            thumbnail: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400&q=80',
            title: 'Personal Photo 1',
            collection: 'favorites',
            tags: ['personal', 'private'],
            uploadDate: Date.now(),
            size: 2048000,
          },
          {
            id: 'seed-2',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
            thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80',
            title: 'Personal Photo 2',
            collection: 'recent',
            tags: ['personal', 'work'],
            uploadDate: Date.now(),
            size: 1536000,
          },
        ]
        await db.media.bulkPut(seed)
        const loaded = seed.map(r => ({ ...r, uploadDate: new Date(r.uploadDate) })) as unknown as MediaItem[]
        setMediaItems(loaded)
      } else {
        // If encrypted, attempt to decrypt only when unlocked; otherwise skip showing those items
        const loaded: MediaItem[] = []
        for (const r of records) {
          try {
            if (r.encIvHex && r.encData && r.encMimeType) {
              if (!pin.key) continue
              const blob = await decryptToBlob(r.encIvHex, r.encData, pin.key, r.encMimeType)
              const url = URL.createObjectURL(blob)
              loaded.push({ ...r, url, thumbnail: url, uploadDate: new Date(r.uploadDate) } as unknown as MediaItem)
            } else {
              loaded.push({ ...r, uploadDate: new Date(r.uploadDate) } as unknown as MediaItem)
            }
          } catch { /* ignore corrupt entries */ }
        }
        setMediaItems(loaded)
      }
    }
    load()
  }, [pin.key])

  // Load wallpaper from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('wallpaperConfig');
      if (saved) {
        const parsed: WallpaperConfig = JSON.parse(saved);
        if (parsed && parsed.url && (parsed.type === 'image' || parsed.type === 'video')) {
          setWallpaper(parsed);
        }
      }
    } catch { void 0 }
    const onUpdated = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail as WallpaperConfig
        if (detail && detail.url) setWallpaper(detail)
      } catch { /* noop */ }
    }
    window.addEventListener('wallpaper:updated', onUpdated as EventListener)
    return () => window.removeEventListener('wallpaper:updated', onUpdated as EventListener)
  }, []);

  // Persist wallpaper to localStorage
  useEffect(() => {
    try {
      if (wallpaper) {
        localStorage.setItem('wallpaperConfig', JSON.stringify(wallpaper));
      } else {
        localStorage.removeItem('wallpaperConfig');
      }
    } catch { void 0 }
  }, [wallpaper]);

  const filteredMedia = useMemo(() => {
    return mediaItems.filter(item => {
      const matchesCollection = selectedCollection === 'all' || item.collection === selectedCollection;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCollection && matchesSearch;
    });
  }, [mediaItems, selectedCollection, searchQuery]);

  const collections = useMemo(() => ['all', ...Array.from(new Set(mediaItems.map(item => item.collection)))], [mediaItems]);

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);
    try {
      const now = Date.now()
      const list = Array.from(files)
      const total = list.length
      const records: MediaRecord[] = []
      for (let index = 0; index < list.length; index++) {
        const file = list[index]
        const id = `upload-${now}-${index}`
        const type = file.type.startsWith('video/') ? 'video' : 'image'
        let url = ''
        let thumbnail = ''
        const createUrl = () => URL.createObjectURL(file)
        if (pin.key) {
          const { ivHex, data, mimeType } = await encryptBlob(file, pin.key)
          await db.media.put({
            id,
            type,
            url: '',
            thumbnail: '',
            title: file.name,
            collection: 'recent',
            tags: ['uploaded'],
            uploadDate: now,
            size: file.size,
            encIvHex: ivHex,
            encData: data,
            encMimeType: mimeType,
          })
          const blob = await decryptToBlob(ivHex, data, pin.key, mimeType)
          url = URL.createObjectURL(blob)
          thumbnail = url
        } else {
          url = createUrl()
          thumbnail = createUrl()
          await db.media.put({
            id,
            type,
            url,
            thumbnail,
            title: file.name,
            collection: 'recent',
            tags: ['uploaded'],
            uploadDate: now,
            size: file.size,
          })
        }
        records.push({ id, type, url, thumbnail, title: file.name, collection: 'recent', tags: ['uploaded'], uploadDate: now, size: file.size })
        setUploadProgress(Math.round(((index + 1) / total) * 100))
      }
      // Simulate per-file progress for UX
      const toItems: MediaItem[] = records.map(r => ({ ...r, uploadDate: new Date(r.uploadDate) })) as unknown as MediaItem[]
      setMediaItems(prev => [...toItems, ...prev])
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(undefined), 500)
    }
  };

  const handleSetWallpaper = (media: MediaItem) => {
    const config: WallpaperConfig = {
      type: media.type,
      url: media.url,
      objectFit: 'cover',
      opacity: 1,
      blurPx: 0,
      brightness: 1,
      muted: true,
      loop: true,
    };
    hapticImpact();
    setWallpaper(config);
  };


  return (
    <div className="min-h-screen text-white relative">
      <PinLock />
      <BackgroundWallpaper wallpaper={wallpaper} />
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button
              aria-label="Toggle sidebar"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Private Media Vault
            </h1>
          </div>
          <SearchBar onSearch={setSearchQuery} />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          collections={collections}
          selectedCollection={selectedCollection}
          onCollectionChange={setSelectedCollection}
          onUpload={() => { hapticImpact(); document.getElementById('file-upload')?.click() }}
        />

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="p-6">
            {/* Wallpaper Controls (collapsible) */}
            {wallpaper && (
              <div className="mb-4">
                <button
                  onClick={() => setShowWallpaperControls(!showWallpaperControls)}
                  className="flex items-center gap-2 rounded-md border border-gray-700 bg-gray-800/70 px-3 py-2 hover:bg-gray-800"
                >
                  <Settings2 size={16} />
                  <span className="text-sm">Wallpaper settings</span>
                  {showWallpaperControls ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
                </button>
                {showWallpaperControls && (
                  <div className="mt-3" onMouseEnter={() => { void import('@mediax/components/WallpaperControls'); }}>
                    <Suspense fallback={<div className="text-sm text-gray-400">Loading controls…</div>}>
                      <WallpaperControls value={wallpaper} onChange={setWallpaper} />
                    </Suspense>
                  </div>
                )}
              </div>
            )}
            {/* Add Wallpaper Button */}
            <div className="mb-4">
              <button
                onClick={() => document.getElementById('add-wallpaper-input')?.click()}
                className="flex items-center gap-2 rounded-md border border-gray-700 bg-gray-800/70 px-3 py-2 hover:bg-gray-800"
              >
                <ImagePlus size={16} />
                <span className="text-sm">Add Background (image/video)</span>
              </button>
              <input
                id="add-wallpaper-input"
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const url = URL.createObjectURL(file)
                  const type = file.type.startsWith('video/') ? 'video' : 'image'
                  const next: WallpaperConfig = { type, url, objectFit: 'cover', opacity: 1, blurPx: 0, brightness: 1, muted: true, loop: true }
                  hapticImpact();
                  setWallpaper(next)
                }}
              />
            </div>
            {/* Upload Dropzone */}
            <UploadDropzone onFileUpload={handleFileUpload} isUploading={isUploading} progress={uploadProgress} error={uploadError} />
            
            {/* Media Gallery */}
            <MediaGallery
              mediaItems={filteredMedia}
              onMediaSelect={setSelectedMedia}
            />
          </div>
        </main>
      </div>

      {/* Full-screen Media Viewer */}
      {selectedMedia && (
        <Suspense fallback={<div className="p-4 text-sm text-gray-400">Loading viewer…</div>}>
          <MediaViewer
            media={selectedMedia}
            onClose={() => setSelectedMedia(null)}
            onNext={() => {
              const currentIndex = filteredMedia.findIndex(item => item.id === selectedMedia!.id);
              const nextIndex = (currentIndex + 1) % filteredMedia.length;
              setSelectedMedia(filteredMedia[nextIndex]);
            }}
            onPrevious={() => {
              const currentIndex = filteredMedia.findIndex(item => item.id === selectedMedia!.id);
              const prevIndex = (currentIndex - 1 + filteredMedia.length) % filteredMedia.length;
              setSelectedMedia(filteredMedia[prevIndex]);
            }}
            onSetWallpaper={() => handleSetWallpaper(selectedMedia)}
            onUpdateMeta={async ({ id, title, collection, tags }: { id: string; title: string; collection: string; tags: string[] }) => {
              setMediaItems(prev => prev.map(m => m.id === id ? { ...m, title: title ?? m.title, collection: collection ?? m.collection, tags: tags ?? m.tags } : m))
              const rec = await db.media.get(id)
              if (rec) {
                await db.media.update(id, { title: title ?? rec.title, collection: collection ?? rec.collection, tags: tags ?? rec.tags })
              }
              setSelectedMedia(s => s && s.id === id ? { ...s, title: title ?? s.title, collection: collection ?? s.collection, tags: tags ?? s.tags } : s)
            }}
          />
        </Suspense>
      )}

      {/* Hidden file input */}
      <input
        id="file-upload"
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
      />
    </div>
  );
};

export default Index;
