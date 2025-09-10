import { getMeasurements, getSessions } from '@/utils/storage'
import type { HealthAdapter, HealthAdapterInfo, HealthPermission } from './types'

export class WebHealthStub implements HealthAdapter {
  async getInfo(): Promise<HealthAdapterInfo> {
    return { platform: 'google_health_connect', available: false, permissionsGranted: [] }
  }
  async requestPermissions(_perms: HealthPermission[]): Promise<HealthPermission[]> {
    return []
  }
  async exportMeasurements(): Promise<number> {
    const list = getMeasurements()
    // In web stub, just no-op and return count
    return list.length
  }
  async exportSessions(): Promise<number> {
    const list = getSessions()
    return list.length
  }
  async importAll() {
    return { measurements: [], sessions: [] }
  }
}

export function getHealthAdapter(): HealthAdapter {
  return new WebHealthStub()
}

