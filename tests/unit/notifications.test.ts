import { describe, it, expect } from 'vitest'
import { computeNextDailyTime } from './notifications_util_stub'
describe('computeNextDailyTime', () => {
  it('schedules later today if time in future', () => {
    const now = new Date('2025-01-01T08:00:00Z')
    const ms = computeNextDailyTime('09:00', now)
    expect(ms).toBeGreaterThan(0)
    expect(ms).toBeLessThan(2 * 60 * 60 * 1000)
  })
  it('rolls to tomorrow if time passed', () => {
    const now = new Date('2025-01-01T10:00:00Z')
    const ms = computeNextDailyTime('09:00', now)
    expect(ms).toBeGreaterThan(20 * 60 * 60 * 1000)
  })
})

// Provide a small stub to test scheduling math without browser Notification APIs

