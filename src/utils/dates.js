const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/** Parses 'YYYY-MM-DD' into a local Date at midnight, avoiding UTC-shift bugs from `new Date(str)` */
export function parseISODate(isoString) {
  if (!isoString) return null
  const [year, month, day] = isoString.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

/** Formats a Date or ISO string as '05 Aug 2026' */
export function formatDisplayDate(date) {
  const d = typeof date === 'string' ? parseISODate(date) : date
  if (!d || Number.isNaN(d.getTime())) return '-'
  const day = String(d.getDate()).padStart(2, '0')
  return `${day} ${MONTH_NAMES_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

/** Formats a Date as 'YYYY-MM-DD' for storage/API use, in local time (not UTC) */
export function toISODate(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? parseISODate(date) : date
  if (!d || Number.isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getMonthName(monthNumber, { short = false } = {}) {
  const index = Number(monthNumber) - 1
  const names = short ? MONTH_NAMES_SHORT : MONTH_NAMES
  return names[index] ?? ''
}

export function getMonthOptions({ short = false } = {}) {
  const names = short ? MONTH_NAMES_SHORT : MONTH_NAMES
  return names.map((name, index) => ({ value: index + 1, label: name }))
}

export function getYearOptions(currentYear, { back = 5, forward = 1 } = {}) {
  const years = []
  for (let y = currentYear + forward; y >= currentYear - back; y--) {
    years.push(y)
  }
  return years
}

/** Days between two dates (b - a), ignoring time-of-day */
export function daysBetween(a, b) {
  const dateA = typeof a === 'string' ? parseISODate(a) : a
  const dateB = typeof b === 'string' ? parseISODate(b) : b
  if (!dateA || !dateB) return 0
  const msPerDay = 24 * 60 * 60 * 1000
  const startOfA = new Date(dateA.getFullYear(), dateA.getMonth(), dateA.getDate())
  const startOfB = new Date(dateB.getFullYear(), dateB.getMonth(), dateB.getDate())
  return Math.round((startOfB - startOfA) / msPerDay)
}

export function today() {
  return new Date()
}

export function currentMonth() {
  return today().getMonth() + 1
}

export function currentYear() {
  return today().getFullYear()
}
