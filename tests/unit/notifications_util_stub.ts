export function computeNextDailyTime(timeHHMM: string, now: Date = new Date()): number {
  const [hh, mm] = timeHHMM.split(':').map((s) => parseInt(s, 10))
  const next = new Date(now)
  next.setHours(hh, mm, 0, 0)
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1)
  }
  return next.getTime() - now.getTime()
}

