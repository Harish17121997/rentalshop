import { daysBetween, today, toISODate } from './dates'

const INACTIVE_STATUSES = new Set(['Vacant', 'Inactive'])

/**
 * All rent/stock formulas live here so the UI never hand-rolls a calculation.
 * Money is summed as plain numbers (JS doubles are exact for integer paise-scale
 * amounts well beyond any personal-finance range), then rounded once at the end
 * of each function to avoid float drift accumulating across many additions.
 */

/** Sum of monthlyRent for units that are actually let out (excludes Vacant/Inactive) */
export function expectedRent(units = []) {
  const total = units
    .filter((u) => !INACTIVE_STATUSES.has(u.status))
    .reduce((sum, u) => sum + (Number(u.monthlyRent) || 0), 0)
  return round(total)
}

/** Sum of paidAmount across rent payment records for a period */
export function receivedRent(payments = []) {
  const total = payments.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0)
  return round(total)
}

/** Pending = Expected - Received, floored at 0 (overpayment never produces negative pending) */
export function pendingRent(expected, received) {
  return round(Math.max(0, expected - received))
}

/** Collection % = Received / Expected * 100. Returns 0 (not NaN/Infinity) when nothing was expected. */
export function collectionPercent(expected, received) {
  if (!expected) return 0
  return round((received / expected) * 100)
}

/** Rent is due on the 1st of its month — no separate stored due date */
export function rentDueDate(month, year) {
  return `${year}-${String(month).padStart(2, '0')}-01`
}

/** Rent is only actually late after this grace-period cutoff (the 10th) — paid up to this date is just "Pending", not late */
export const RENT_GRACE_PERIOD_DAY = 10

function rentOverdueCutoff(month, year) {
  return `${year}-${String(month).padStart(2, '0')}-${String(RENT_GRACE_PERIOD_DAY).padStart(2, '0')}`
}

/**
 * Derives a payment's status from amounts — never trust a stored status
 * field alone, since paidAmount can change without status being updated.
 * Unpaid rent always reads as "Pending", whether it's a day late or a
 * month late; daysOverdue() still tracks lateness internally for sorting.
 */
export function derivePaymentStatus(payment) {
  const expected = Number(payment?.expectedAmount) || 0
  const paid = Number(payment?.paidAmount) || 0

  if (paid >= expected && expected > 0) return 'Paid'
  if (paid > 0) return 'Partially Paid'
  return 'Pending'
}

/** Days late past the grace-period cutoff (the 10th) — 0 while still within the grace window */
export function daysOverdue(month, year, referenceDate = today()) {
  return Math.max(0, daysBetween(rentOverdueCutoff(month, year), referenceDate))
}

/** Aggregates rent totals for a set of units + that period's payments */
export function summarizeRent(units, payments) {
  const expected = expectedRent(units)
  const received = receivedRent(payments)
  return {
    expected,
    received,
    pending: pendingRent(expected, received),
    collectionPercent: collectionPercent(expected, received),
  }
}

/** Groups received rent by unit category (Shop / Home / Farm) */
export function groupIncomeByCategory(units, payments) {
  const paidByUnit = new Map()
  for (const payment of payments) {
    const prev = paidByUnit.get(payment.unitId) || 0
    paidByUnit.set(payment.unitId, prev + (Number(payment.paidAmount) || 0))
  }

  const groups = {}
  for (const unit of units) {
    if (INACTIVE_STATUSES.has(unit.status)) continue
    const category = unit.category || 'Other'
    const received = paidByUnit.get(unit.unitId) || 0
    groups[category] = round((groups[category] || 0) + received)
  }
  return groups
}

/**
 * Stock/IPO profit — purely buy vs sell, no charges/taxes deduction:
 * Net Profit = Sell Amount - Buy Amount. Unsold positions have no realized
 * profit yet (0), not a negative number, so they never masquerade as a loss.
 */
export function stockNetProfit(transaction) {
  if (!transaction.sellDate) return 0 // unsold: no realized profit yet
  const buyAmount = Number(transaction.buyAmount) || 0
  const sellAmount = Number(transaction.sellAmount) || 0
  return round(sellAmount - buyAmount)
}

export function stockProfitPercent(transaction) {
  const buyAmount = Number(transaction.buyAmount) || 0
  if (!buyAmount) return 0
  return round((stockNetProfit(transaction) / buyAmount) * 100)
}

/**
 * A transaction is Active until sold; once sold it's Done, shown as either
 * Profit or Loss (never a neutral "Sold") so the table reads at a glance.
 */
export function stockStatus(transaction) {
  if (!transaction.sellDate) return 'Active'
  return stockNetProfit(transaction) >= 0 ? 'Profit' : 'Loss'
}

/** Only transactions with a sellDate contribute to realized profit; unsold positions are excluded */
export function summarizeStock(transactions = []) {
  let totalInvested = 0
  let totalSold = 0
  let realizedProfit = 0
  let activeCount = 0
  let winners = 0
  let losers = 0

  for (const tx of transactions) {
    totalInvested += Number(tx.buyAmount) || 0

    if (tx.sellDate) {
      totalSold += Number(tx.sellAmount) || 0
      const profit = stockNetProfit(tx)
      realizedProfit += profit
      if (profit > 0) winners++
      else if (profit < 0) losers++
    } else {
      activeCount++
    }
  }

  return {
    totalInvested: round(totalInvested),
    totalSold: round(totalSold),
    realizedProfit: round(realizedProfit),
    activeCount,
    winners,
    losers,
  }
}

export function todayISO() {
  return toISODate(today())
}

function round(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}
