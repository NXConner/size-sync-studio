export type ReminderType = 'measurement_daily' | 'screening_followup'

export interface Reminder {
  id: string
  type: ReminderType
  // For daily reminders, time is 'HH:MM' in local time
  time?: string
  // For one-off reminders, triggerAt is ISO string
  triggerAt?: string
  title: string
  body: string
  active: boolean
}

const STORAGE_KEY = 'reminders'
const timers = new Map<string, number>()

export function getReminders(): Reminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function saveReminders(reminders: Reminder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
}

export async function ensureNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  try {
    return await Notification.requestPermission()
  } catch {
    return Notification.permission
  }
}

export async function showLocalNotification(
  registration: ServiceWorkerRegistration | null,
  title: string,
  options?: NotificationOptions,
) {
  const perm = await ensureNotificationPermission()
  if (perm !== 'granted') return
  try {
    if (registration && 'showNotification' in registration) {
      await registration.showNotification(title, options)
    } else if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(title, options)
    } else {
      new Notification(title, options)
    }
  } catch {
    try { new Notification(title, options) } catch {}
  }
}

function computeNextDailyTime(timeHHMM: string): number {
  const [hh, mm] = timeHHMM.split(':').map((s) => parseInt(s, 10))
  const now = new Date()
  const next = new Date()
  next.setHours(hh, mm, 0, 0)
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1)
  }
  return next.getTime() - now.getTime()
}

function scheduleTimer(id: string, delayMs: number, fn: () => void) {
  clearTimer(id)
  const t = window.setTimeout(fn, Math.max(0, delayMs))
  timers.set(id, t)
}

function clearTimer(id: string) {
  const t = timers.get(id)
  if (t) window.clearTimeout(t)
  timers.delete(id)
}

export function cancelReminder(id: string) {
  clearTimer(id)
  const reminders = getReminders().filter((r) => r.id !== id)
  saveReminders(reminders)
}

export function upsertReminder(reminder: Reminder) {
  const reminders = getReminders()
  const idx = reminders.findIndex((r) => r.id === reminder.id)
  if (idx >= 0) reminders[idx] = reminder
  else reminders.push(reminder)
  saveReminders(reminders)
}

export function scheduleReminder(reg: ServiceWorkerRegistration | null, reminder: Reminder) {
  if (!reminder.active) {
    clearTimer(reminder.id)
    return
  }
  if (reminder.type === 'measurement_daily' && reminder.time) {
    const scheduleNext = () => {
      scheduleTimer(reminder.id, computeNextDailyTime(reminder.time!), async () => {
        await showLocalNotification(reg, reminder.title, { body: reminder.body, tag: reminder.id })
        // schedule the next day
        scheduleNext()
      })
    }
    scheduleNext()
    return
  }
  if (reminder.type === 'screening_followup' && reminder.triggerAt) {
    const delay = new Date(reminder.triggerAt).getTime() - Date.now()
    if (delay <= 0) return
    scheduleTimer(reminder.id, delay, async () => {
      await showLocalNotification(reg, reminder.title, { body: reminder.body, tag: reminder.id })
      clearTimer(reminder.id)
    })
    return
  }
}

export async function scheduleAllActive(reg: ServiceWorkerRegistration | null) {
  const reminders = getReminders().filter((r) => r.active)
  for (const r of reminders) scheduleReminder(reg, r)
}

export function createDailyMeasurementReminder(timeHHMM: string): Reminder {
  return {
    id: 'reminder-measurement-daily',
    type: 'measurement_daily',
    time: timeHHMM,
    title: 'Measurement Reminder',
    body: 'Time to record your measurement today.',
    active: true,
  }
}

export function createScreeningFollowupReminder(triggerAtISO: string): Reminder {
  return {
    id: `reminder-screening-${Date.now()}`,
    type: 'screening_followup',
    triggerAt: triggerAtISO,
    title: 'Health Screening Follow-up',
    body: 'Consider reviewing your screening results and recommendations.',
    active: true,
  }
}

