import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@mediax/components/ui/tabs'
import { Button } from '@mediax/components/ui/button'
import { useNavigate, useSearchParams } from 'react-router-dom'

const PreferencesTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-700 bg-gray-800/70 p-4">
        <h2 className="text-white font-semibold mb-2">Background</h2>
        <p className="text-sm text-gray-300 mb-3">Add an image or video as your wallpaper.</p>
        <div className="flex items-center gap-3">
          <Button onClick={() => document.getElementById('pref-wallpaper-input')?.click()}>Add Wallpaper</Button>
          <input id="pref-wallpaper-input" type="file" accept="image/*,video/*" className="hidden" onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const url = URL.createObjectURL(file)
            const type = file.type.startsWith('video') ? 'video' : 'image'
            const config = { type, url, objectFit: 'cover', opacity: 1, blurPx: 0, brightness: 1, muted: true, loop: true }
            try { localStorage.setItem('wallpaperConfig', JSON.stringify(config)) } catch { /* ignore */ }
            const ev = new CustomEvent('wallpaper:updated', { detail: config })
            window.dispatchEvent(ev)
          }} />
        </div>
      </section>
    </div>
  )
}

const SecurityTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-700 bg-gray-800/70 p-4">
        <h2 className="text-white font-semibold mb-2">Security</h2>
        <p className="text-sm text-gray-300">PIN lock has been removed. No additional security settings are available.</p>
      </section>
    </div>
  )
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const tabParam = params.get('tab') || 'preferences'
  const setTab = (next: string) => navigate(`/settings?tab=${next}`)

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

