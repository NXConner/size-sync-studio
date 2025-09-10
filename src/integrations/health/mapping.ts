import type { Measurement, Session } from '@/types'

// Example mapping stubs. Real implementations must conform to HealthKit/Health Connect data models.

export function mapMeasurementToHealth(measurement: Measurement) {
  return {
    date: measurement.date,
    length_cm: round2(inchesToCm(measurement.length)),
    girth_cm: round2(inchesToCm(measurement.girth)),
    notes: measurement.notes || ''
  }
}

export function mapSessionToWorkout(session: Session) {
  const start = new Date(session.startTime)
  const end = session.endTime ? new Date(session.endTime) : new Date()
  const durationMin = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000))
  return {
    start: session.startTime,
    end: session.endTime || new Date().toISOString(),
    duration_min: durationMin,
    pressure_logs: (session.pressureLogs || []).map(p => ({ ts: p.timestamp, kpa: p.pressure }))
  }
}

function inchesToCm(i: number) { return i * 2.54 }
function round2(n: number) { return Math.round(n * 100) / 100 }

