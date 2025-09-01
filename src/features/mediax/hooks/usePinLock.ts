// Deprecated: PIN lock removed. Provide a no-op hook to preserve imports.
import React from 'react'

export function usePinLock() {
  const [dummy] = React.useState(null)
  return {
    hasPin: false,
    isLocked: false,
    key: null as unknown as CryptoKey | null,
    setPin: async () => {},
    unlock: async () => true,
    lock: () => {},
    clearPin: () => {},
  }
}

