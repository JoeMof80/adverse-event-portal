const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
const timeFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })

/** "2 November 2026" from an ISO date or date-time string. */
export function formatDate(iso: string): string {
  const date = iso.length === 10 ? new Date(`${iso}T00:00:00`) : new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : dateFormat.format(date)
}

/** "2 November 2026, 14:05" from an ISO date-time string. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : dateTimeFormat.format(date)
}

/** "14:05" from an ISO date-time string. */
export function formatTime(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : timeFormat.format(date)
}

/** Today's date as YYYY-MM-DD in local time, for comparing with date inputs. */
export function todayIso(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
