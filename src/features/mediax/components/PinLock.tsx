import React from 'react'
import { Button } from '@mediax/components/ui/button'
import { Input } from '@mediax/components/ui/input'
import { usePinLock } from '@mediax/hooks/usePinLock'

export const PinLock: React.FC = () => {
  const { hasPin, isLocked, setPin, unlock } = usePinLock()
  const [pin, setPinValue] = React.useState('')
  const [step, setStep] = React.useState<'set' | 'confirm' | 'unlock'>(hasPin ? 'unlock' : 'set')
  const [first, setFirst] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setStep(hasPin ? 'unlock' : 'set')
  }, [hasPin])

  // Only render the lock UI when a PIN exists and the vault is currently locked
  if (!hasPin || !isLocked) return null

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (step === 'set') {
      if (pin.length < 4) {
        setError('PIN must be at least 4 digits')
        return
      }
      setFirst(pin)
      setPinValue('')
      setStep('confirm')
    } else if (step === 'confirm') {
      if (pin !== first) {
        setError('PINs do not match')
        return
      }
      await setPin(pin)
    } else {
      const ok = await unlock(pin)
      if (!ok) setError('Incorrect PIN')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur flex items-center justify-center">
      <form onSubmit={onSubmit} className="w-full max-w-xs space-y-3 p-4 bg-gray-900 rounded-lg border border-gray-800">
        <h2 className="text-white text-lg font-semibold text-center">
          {hasPin ? 'Unlock Vault' : step === 'set' ? 'Set PIN' : 'Confirm PIN'}
        </h2>
        <Input type="password" inputMode="numeric" value={pin} onChange={(e) => setPinValue(e.target.value)} placeholder="Enter PIN" />
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <Button type="submit" className="w-full">{hasPin ? 'Unlock' : step === 'set' ? 'Next' : 'Save'}</Button>
      </form>
    </div>
  )
}

export default PinLock

