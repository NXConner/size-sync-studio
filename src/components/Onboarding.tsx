import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

export function Onboarding() {
  const [open, setOpen] = useState(false)
  const [dontShow, setDontShow] = useState(false)

  useEffect(() => {
    try {
      const seen = localStorage.getItem('onboarding-seen')
      if (!seen) setOpen(true)
    } catch {}
  }, [])

  const close = () => {
    if (dontShow) try { localStorage.setItem('onboarding-seen', '1') } catch {}
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to Size Seeker</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Track measurements, visualize progress, and receive helpful reminders.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Use Measure to record length and girth over time.</li>
            <li>View trends and photos on the Analytics page.</li>
            <li>Configure daily reminders in Settings → Notifications.</li>
          </ul>
          <label className="flex items-center gap-2 mt-2 text-foreground">
            <Checkbox checked={dontShow} onCheckedChange={(v) => setDontShow(Boolean(v))} />
            Don't show again
          </label>
        </div>
        <div className="flex justify-end">
          <Button onClick={close}>Get started</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

