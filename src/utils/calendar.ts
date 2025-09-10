export function buildIcsEvent(options: {
  title: string
  description?: string
  start: Date
  end?: Date
  uid?: string
  url?: string
}): string {
  const dt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const uid = options.uid || `${Date.now()}@sizeseeker`
  const end = options.end ? options.end : new Date(options.start.getTime() + 30 * 60 * 1000)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SizeSeeker//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dt(new Date())}`,
    `DTSTART:${dt(options.start)}`,
    `DTEND:${dt(end)}`,
    `SUMMARY:${escapeText(options.title)}`,
    options.description ? `DESCRIPTION:${escapeText(options.description)}` : undefined,
    options.url ? `URL:${options.url}` : undefined,
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean)
  return lines.join('\r\n')
}

function escapeText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

export function downloadIcs(filename: string, ics: string) {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

