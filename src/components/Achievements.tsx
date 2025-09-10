import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getMeasurements } from '@/utils/storage'

export function Achievements() {
  const { streak, total, firstDate } = useMemo(() => {
    const list = getMeasurements().slice().sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const total = list.length
    let streak = 0
    let lastDay: string | null = null
    for (let i = list.length - 1; i >= 0; i--) {
      const d = new Date(list[i].date)
      d.setHours(0,0,0,0)
      const key = d.toISOString()
      if (!lastDay) { streak = 1; lastDay = key; continue }
      const prev = new Date(lastDay)
      const diff = (prev.getTime() - d.getTime()) / (24*60*60*1000)
      if (diff === 1) { streak += 1; lastDay = key } else if (diff === 0) { continue } else { break }
    }
    const firstDate = list[0]?.date || ''
    return { streak, total, firstDate }
  }, [])

  return (
    <Card className="gradient-card shadow-card">
      <CardHeader>
        <CardTitle>Achievements & Streaks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{streak}</div>
            <div className="text-xs text-muted-foreground">Day streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-xs text-muted-foreground">Total entries</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{firstDate ? new Date(firstDate).toLocaleDateString() : '--'}</div>
            <div className="text-xs text-muted-foreground">Since</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

