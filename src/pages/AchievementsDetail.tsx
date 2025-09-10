import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getMeasurements } from '@/utils/storage'
import { useMemo } from 'react'

function calcWeeklyGoals() {
  const list = getMeasurements().slice().sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const byWeek = new Map<string, number>()
  list.forEach(m => {
    const d = new Date(m.date)
    const year = d.getFullYear()
    const week = Math.ceil((((d.getTime() - new Date(year,0,1).getTime()) / 86400000) + new Date(year,0,1).getDay()+1) / 7)
    const key = `${year}-W${week}`
    byWeek.set(key, (byWeek.get(key) || 0) + 1)
  })
  const weeks = Array.from(byWeek.entries()).map(([k, v]) => ({ week: k, entries: v }))
  return weeks
}

export default function AchievementsDetail() {
  const weeks = useMemo(() => calcWeeklyGoals(), [])
  const total = useMemo(() => getMeasurements().length, [])
  const badges = useMemo(() => {
    const arr: { id: string; label: string }[] = []
    if (total >= 10) arr.push({ id: 'b10', label: '10 Entries' })
    if (total >= 25) arr.push({ id: 'b25', label: '25 Entries' })
    if (total >= 50) arr.push({ id: 'b50', label: '50 Entries' })
    if (weeks.some(w => w.entries >= 5)) arr.push({ id: 'w5', label: '5 Entries in a Week' })
    return arr
  }, [weeks, total])

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {badges.length ? badges.map(b => (
              <span key={b.id} className="px-3 py-1 rounded-full border text-sm">{b.label}</span>
            )) : <span className="text-sm text-muted-foreground">No badges yet</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            {weeks.map(w => (
              <li key={w.week}>{w.week}: {w.entries} entries</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

