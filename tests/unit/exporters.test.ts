import { describe, it, expect } from 'vitest'
import { measurementsToCsv } from '../../src/utils/exporters'

describe('measurementsToCsv', () => {
  it('generates CSV with headers and rows', () => {
    const csv = measurementsToCsv([
      { id: '1', date: '2025-01-01', length: 6, girth: 5, notes: 'n1' },
      { id: '2', date: '2025-01-02', length: 6.1, girth: 5.1, notes: 'n2, with comma' },
    ] as any)
    expect(csv.split('\n')[0]).toContain('id,date,length,girth,notes,sessionId,photoUrl,isPreSession')
    expect(csv).toContain('2025-01-02')
    expect(csv).toMatch(/"n2, with comma"/)
  })
})

