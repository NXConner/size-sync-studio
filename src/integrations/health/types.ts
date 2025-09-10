import type { Measurement, Session } from '@/types'

export type HealthPlatform = 'apple_healthkit' | 'google_health_connect'

export type HealthPermission =
  | 'read_body_measurements'
  | 'write_body_measurements'
  | 'read_workouts'
  | 'write_workouts'

export interface HealthAdapterInfo {
  platform: HealthPlatform
  available: boolean
  permissionsGranted: HealthPermission[]
}

export interface HealthSyncResult {
  measurementsExported: number
  sessionsExported: number
  measurementsImported: number
  sessionsImported: number
}

export interface HealthAdapter {
  getInfo(): Promise<HealthAdapterInfo>
  requestPermissions(perms: HealthPermission[]): Promise<HealthPermission[]>
  exportMeasurements(measurements: Measurement[]): Promise<number>
  exportSessions(sessions: Session[]): Promise<number>
  importAll(): Promise<{ measurements: Measurement[]; sessions: Session[] }>
}

