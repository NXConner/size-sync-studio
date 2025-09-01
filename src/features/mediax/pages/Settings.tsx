import React, { useEffect, useState, Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@mediax/components/ui/tabs'
import { Button } from '@mediax/components/ui/button'
import { Switch } from '@mediax/components/ui/switch'
import { useNavigate, useSearchParams } from 'react-router-dom'
const WallpaperControls = React.lazy(() => import('@mediax/components/WallpaperControls'))
import type { WallpaperConfig } from '@mediax/components/BackgroundWallpaper'
import { toast } from '@mediax/components/ui/use-toast'

const PreferencesTab: React.FC = () => {
  const [wallpaper, setWallpaper] = useState<WallpaperConfig | null>(null)
  const [stealth, setStealth] = useState<boolean>(() => {
    try { return localStorage.getItem('mediax:stealth') === '1' } catch { return false }
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem('wallpaperConfig')
      if (saved) {
        const parsed = JSON.parse(saved) as WallpaperConfig
        if (parsed && parsed.url) setWallpaper(parsed)
      }
    } catch { /* noop */ }
    const onUpdated = (e: Event) => {
      try { const detail = (e as CustomEvent).detail as WallpaperConfig; if (detail && detail.url) setWallpaper(detail) } catch { /* noop */ }
    }
    window.addEventListener('wallpaper:updated', onUpdated as EventListener)
    return () => window.removeEventListener('wallpaper:updated', onUpdated as EventListener)
  }, [])

  useEffect(() => {
    try {
      if (wallpaper) localStorage.setItem('wallpaperConfig', JSON.stringify(wallpaper))
    } catch { /* noop */ }
  }, [wallpaper])

  useEffect(() => {
    try { localStorage.setItem('mediax:stealth', stealth ? '1' : '0') } catch { /* noop */ }
  }, [stealth])

  const handleAddWallpaper = () => document.getElementById('pref-wallpaper-input')?.click()
  const handleWallpaperFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const type = file.type.startsWith('video') ? 'video' : 'image'
    const config: WallpaperConfig = { type, url, objectFit: 'cover', opacity: 1, blurPx: 0, brightness: 1, muted: true, loop: true }
    setWallpaper(config)
    const ev = new CustomEvent('wallpaper:updated', { detail: config })
    window.dispatchEvent(ev)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-700 bg-gray-800/70 p-4">
        <h2 className="text-white font-semibold mb-2">Background</h2>
        <p className="text-sm text-gray-300 mb-3">Add an image or video as your wallpaper, then fine-tune.</p>
        <div className="flex items-center gap-3">
          <Button onClick={handleAddWallpaper}>Add Wallpaper</Button>
          <input id="pref-wallpaper-input" type="file" accept="image/*,video/*" className="hidden" onChange={handleWallpaperFile} />
        </div>
        {wallpaper && (
          <div className="mt-4">
            <Suspense fallback={<div className="text-sm text-gray-400">Loading controls…</div>}>
              <WallpaperControls value={wallpaper} onChange={setWallpaper} />
            </Suspense>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-gray-700 bg-gray-800/70 p-4">
        <h2 className="text-white font-semibold mb-2">Stealth</h2>
        <p className="text-sm text-gray-300 mb-3">Blur thumbnails to reduce shoulder-surfing risk.</p>
        <div className="flex items-center gap-3">
          <Switch checked={stealth} onCheckedChange={(v) => setStealth(!!v)} />
          <span className="text-sm text-gray-300">Enable thumbnail blur</span>
        </div>
      </section>
    </div>
  )
}

const SecurityTab: React.FC = () => {
  const clearLocalData = async () => {
    try {
      // Clear IndexedDB for media table
      const { db } = await import('@mediax/lib/db')
      await db.media.clear()
      // Clear wallpaper and stealth flags
      try { localStorage.removeItem('wallpaperConfig'); localStorage.removeItem('mediax:stealth') } catch { /* noop */ }
      toast({ title: 'Local data cleared', description: 'Media, wallpaper, and preferences removed from this device.' })
      try { const ev = new CustomEvent('wallpaper:updated', { detail: null }); window.dispatchEvent(ev) } catch { /* noop */ }
    } catch (err) {
      toast({ title: 'Failed to clear data', description: err instanceof Error ? err.message : 'Unknown error' })
    }
  }
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-700 bg-gray-800/70 p-4">
        <h2 className="text-white font-semibold mb-2">Security</h2>
        <p className="text-sm text-gray-300 mb-3">PIN lock has been removed.</p>
        <div className="flex items-center gap-3">
          <Button variant="destructive" onClick={clearLocalData}>Clear local data</Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">This removes media entries from this browser, and resets preferences.</p>
      </section>
    </div>
  )
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const tabParam = params.get('tab') || 'preferences'
  const setTab = (next: string) => navigate(`/mediax/settings?tab=${next}`)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="sticky top-0 z-10 bg-gray-900/95 border-b border-gray-800 px-4 py-3">
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>
      <div className="max-w-4xl mx-auto p-4">
        <Tabs value={tabParam} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          <TabsContent value="preferences">
            <PreferencesTab />
          </TabsContent>
          <TabsContent value="security">
            <SecurityTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default SettingsPage

