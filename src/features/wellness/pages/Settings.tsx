import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@svh/components/ui/tabs'
import { Button } from '@svh/components/ui/button'
import { Input } from '@svh/components/ui/input'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { usePinLock } from '@svh/hooks/usePinLock'

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
  const { hasPin, setPin, unlock, isLocked, clearPin, lock } = usePinLock()
  const [pin, setPinValue] = React.useState('')
  const [confirm, setConfirm] = React.useState('')
  const [message, setMessage] = React.useState<string | null>(null)

  const onSet = async () => {
    setMessage(null)
    if (pin.length < 4) { setMessage('PIN must be at least 4 digits'); return }
    if (pin !== confirm) { setMessage('PINs do not match'); return }
    await setPin(pin)
    setPinValue(''); setConfirm('')
    setMessage('PIN set. Unlock required next time.')
  }
  const onUnlock = async () => {
    setMessage(null)
    const ok = await unlock(pin)
    setMessage(ok ? 'Unlocked' : 'Incorrect PIN')
    if (ok) setPinValue('')
  }
  const onClear = () => { clearPin(); setMessage('PIN removed') }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-700 bg-gray-800/70 p-4">
        <h2 className="text-white font-semibold mb-2">PIN Lock</h2>
        <p className="text-sm text-gray-300 mb-3">Secure your vault with a PIN.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-300 mb-1">PIN</label>
            <Input type="password" value={pin} onChange={(e) => setPinValue(e.target.value)} inputMode="numeric" />
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">Confirm</label>
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} inputMode="numeric" />
          </div>
          <div className="flex gap-2">
            <Button onClick={onSet}>Set/Update</Button>
            <Button variant="secondary" onClick={onUnlock} disabled={!hasPin || !isLocked}>Unlock</Button>
            <Button variant="destructive" onClick={onClear} disabled={!hasPin}>Remove</Button>
            <Button variant="outline" onClick={lock} disabled={isLocked}>Lock</Button>
          </div>
        </div>
        {message && <p className="text-sm mt-2 text-gray-300">{message}</p>}
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

