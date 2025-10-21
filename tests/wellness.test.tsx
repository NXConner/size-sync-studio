import { describe, it, expect, beforeEach } from 'vitest'
import { getFavoritePositionIds, toggleFavoritePosition, getPlaySessionRecords, savePlaySessionRecord } from '@/utils/storage'
import type { PlaySessionRecord } from '@/types/wellness'

describe('Wellness storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('toggles favorites', () => {
    expect(getFavoritePositionIds()).toEqual([])
    const a = toggleFavoritePosition('p1')
    expect(a).toContain('p1')
    const b = toggleFavoritePosition('p1')
    expect(b).not.toContain('p1')
  })

  it('saves and reads play session records', () => {
    const rec: PlaySessionRecord = {
      id: 'r1',
      startedAt: new Date(0).toISOString(),
      endedAt: new Date(1000).toISOString(),
      totalSeconds: 60,
      rounds: [{ positionId: 'p1', seconds: 60, completed: true }],
    }
    savePlaySessionRecord(rec)
    const all = getPlaySessionRecords()
    expect(all.length).toBe(1)
    expect(all[0].id).toBe('r1')
  })
})
