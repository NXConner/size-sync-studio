import React from 'react'
import { sha256Hex, deriveKeyFromPin } from '@svh/lib/crypto'

const SALT_KEY = 'pmv:pinSalt'
const HASH_KEY = 'pmv:pinHash'
const TIMEOUT_MS = 5 * 60 * 1000

export function usePinLock() {
  const [hasPin, setHasPin] = React.useState<boolean>(false)
  const [unlockedKey, setUnlockedKey] = React.useState<CryptoKey | null>(null)
  const [isLocked, setIsLocked] = React.useState<boolean>(true)
  const lastActiveRef = React.useRef<number>(Date.now())

  React.useEffect(() => {
    const salt = localStorage.getItem(SALT_KEY)
    const hash = localStorage.getItem(HASH_KEY)
    const exists = !!salt && !!hash
    setHasPin(exists)
    setIsLocked(exists)
  }, [])

  React.useEffect(() => {
    const onActivity = () => {
      lastActiveRef.current = Date.now()
    }
    const interval = window.setInterval(() => {
      if (unlockedKey && Date.now() - lastActiveRef.current > TIMEOUT_MS) {
        lock()
      }
    }, 10_000)
    window.addEventListener('mousemove', onActivity)
    window.addEventListener('keydown', onActivity)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('mousemove', onActivity)
      window.removeEventListener('keydown', onActivity)
    }
  }, [unlockedKey])

  async function setPin(pin: string) {
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')
    const hash = await sha256Hex(pin + ':' + saltHex)
    localStorage.setItem(SALT_KEY, saltHex)
    localStorage.setItem(HASH_KEY, hash)
    setHasPin(true)
    // lock after setting pin; require unlock explicitly
    setUnlockedKey(null)
    setIsLocked(true)
  }

  async function unlock(pin: string): Promise<boolean> {
    const saltHex = localStorage.getItem(SALT_KEY)
    const expected = localStorage.getItem(HASH_KEY)
    if (!saltHex || !expected) return false
    const actual = await sha256Hex(pin + ':' + saltHex)
    if (actual !== expected) return false
    const key = await deriveKeyFromPin(pin, saltHex)
    setUnlockedKey(key)
    setIsLocked(false)
    lastActiveRef.current = Date.now()
    return true
  }

  function lock() {
    setUnlockedKey(null)
    setIsLocked(true)
  }

  return {
    hasPin,
    isLocked,
    key: unlockedKey,
    setPin,
    unlock,
    lock,
    clearPin: () => {
      try {
        localStorage.removeItem(SALT_KEY)
        localStorage.removeItem(HASH_KEY)
      } catch { /* ignore */ }
      setHasPin(false)
      setUnlockedKey(null)
      setIsLocked(false)
    },
  }
}

