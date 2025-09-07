import { useCallback, useEffect, useState } from 'react'
import { deriveKeyFromPin } from '@mediax/lib/crypto'

const STORAGE_KEY = 'mediax:pin:salt'
const FLAG_HAS_PIN = 'mediax:pin:present'

export function usePinLock() {
  const [key, setKey] = useState<CryptoKey | null>(null)
  const [hasPin, setHasPin] = useState<boolean>(false)
  const [isLocked, setIsLocked] = useState<boolean>(true)

  useEffect(() => {
    try {
      setHasPin(localStorage.getItem(FLAG_HAS_PIN) === '1')
    } catch { setHasPin(false) }
  }, [])

  const setPin = useCallback(async (pin: string) => {
    const saltHex = (() => { try { return localStorage.getItem(STORAGE_KEY) || undefined } catch { return undefined } })()
    const { key, saltHex: nextSalt } = await deriveKeyFromPin(pin, saltHex)
    try {
      localStorage.setItem(STORAGE_KEY, nextSalt)
      localStorage.setItem(FLAG_HAS_PIN, '1')
    } catch {}
    setKey(key)
    setHasPin(true)
    setIsLocked(false)
  }, [])

  const unlock = useCallback(async (pin: string) => {
    try {
      const saltHex = localStorage.getItem(STORAGE_KEY) || undefined
      const { key } = await deriveKeyFromPin(pin, saltHex)
      setKey(key)
      setIsLocked(false)
      return true
    } catch {
      return false
    }
  }, [])

  const lock = useCallback(() => {
    setKey(null)
    setIsLocked(true)
  }, [])

  const clearPin = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(FLAG_HAS_PIN)
    } catch {}
    setKey(null)
    setHasPin(false)
    setIsLocked(true)
  }, [])

  return { hasPin, isLocked, key, setPin, unlock, lock, clearPin }
}

