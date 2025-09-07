import React, { useState } from 'react'
import { usePinLock } from '@mediax/hooks/usePinLock'

const PinLock: React.FC = () => {
  const { hasPin, isLocked, setPin, unlock, lock, clearPin } = usePinLock()
  const [pin, setPinInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!hasPin) {
    return (
      <div className="w-full bg-purple-900/30 border-b border-purple-800 text-purple-100">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-3">
          <span className="text-sm">Protect your media with a PIN (AES‑GCM encryption at rest).</span>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Set 4+ digit PIN"
            className="ml-auto w-40 rounded bg-purple-950/40 border border-purple-700 px-2 py-1 text-sm outline-none"
            value={pin}
            onChange={(e) => setPinInput(e.target.value)}
          />
          <button
            className="rounded bg-purple-600 hover:bg-purple-500 px-3 py-1 text-sm"
            onClick={async () => { setError(null); if (pin.trim().length < 4) { setError('Use 4+ digits'); return } await setPin(pin.trim()); setPinInput('') }}
          >Set PIN</button>
          {error && <span className="text-xs text-red-300 ml-2">{error}</span>}
        </div>
      </div>
    )
  }

  if (isLocked) {
    return (
      <div className="w-full bg-gray-900 border-b border-gray-800 text-gray-100">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-3">
          <span className="text-sm">Vault locked</span>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Enter PIN"
            className="ml-auto w-40 rounded bg-gray-800 border border-gray-700 px-2 py-1 text-sm outline-none"
            value={pin}
            onChange={(e) => setPinInput(e.target.value)}
          />
          <button
            className="rounded bg-emerald-600 hover:bg-emerald-500 px-3 py-1 text-sm"
            onClick={async () => { const ok = await unlock(pin.trim()); if (!ok) { setError('Incorrect PIN') } else { setError(null); setPinInput('') } }}
          >Unlock</button>
          <button className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-1 text-sm" onClick={() => setPinInput('')}>Clear</button>
          {error && <span className="text-xs text-red-400 ml-2">{error}</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-gray-900/60 border-b border-gray-800 text-gray-300">
      <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center gap-3">
        <span className="text-xs">Vault unlocked</span>
        <button className="ml-auto rounded bg-gray-700 hover:bg-gray-600 px-2 py-1 text-xs" onClick={lock}>Lock</button>
        <button className="rounded bg-red-600 hover:bg-red-500 px-2 py-1 text-xs" onClick={clearPin}>Remove PIN</button>
      </div>
    </div>
  )
}

export default PinLock

