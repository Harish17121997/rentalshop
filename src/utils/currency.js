const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const INR_FORMATTER_DECIMAL = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Formats a number as Indian-grouped currency, e.g. 1250000 -> ₹12,50,000 */
export function formatCurrency(amount, { decimals = false } = {}) {
  const value = Number(amount) || 0
  return decimals ? INR_FORMATTER_DECIMAL.format(value) : INR_FORMATTER.format(value)
}

/** Formats a plain number with Indian grouping, no currency symbol */
export function formatNumber(amount) {
  const value = Number(amount) || 0
  return new Intl.NumberFormat('en-IN').format(value)
}

/** Rounds to 2 decimal places, avoiding float artifacts like 10.000000000000002 */
export function roundMoney(amount) {
  return Math.round((Number(amount) || 0) * 100) / 100
}
