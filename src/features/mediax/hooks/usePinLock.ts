// Deprecated: PIN lock removed. Provide a no-op hook to preserve imports.

export function usePinLock() {
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

