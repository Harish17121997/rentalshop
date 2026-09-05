import { apiGet, apiPost, USE_MOCK } from './api'
import { mockRentPayments } from './mockData'

export async function listRentPayments({ month, year, unitId } = {}) {
  if (USE_MOCK) {
    let results = clone(mockRentPayments)
    if (month) results = results.filter((r) => r.month === Number(month))
    if (year) results = results.filter((r) => r.year === Number(year))
    if (unitId) results = results.filter((r) => r.unitId === unitId)
    return results
  }
  return apiGet('rent.list', { month, year, unitId })
}

export async function listPaymentHistory(unitId) {
  if (USE_MOCK) {
    return clone(mockRentPayments)
      .filter((r) => r.unitId === unitId)
      .sort((a, b) => (b.year - a.year) || (b.month - a.month))
  }
  return apiGet('rent.history', { unitId })
}

/**
 * Creates the (unitId, month, year) rent record if none exists yet;
 * otherwise adds the new amount onto the existing paidAmount so repeated
 * partial payments accumulate instead of overwriting each other. month/year
 * are derived from the payment date the user picked, not always "now".
 */
export async function recordPayment({ unitId, expectedAmount, month, year, amount, date, method, description }) {
  if (USE_MOCK) {
    let record = mockRentPayments.find((r) => r.unitId === unitId && r.month === month && r.year === year)

    if (!record) {
      record = {
        paymentId: `r${mockRentPayments.length + 1}`,
        unitId,
        month,
        year,
        expectedAmount,
        paidAmount: 0,
        paidDate: null,
        paymentMethod: null,
        description: '',
      }
      mockRentPayments.push(record)
    }

    record.paidAmount = (Number(record.paidAmount) || 0) + Number(amount)
    record.paidDate = date
    record.paymentMethod = method
    record.description = description
    return clone(record)
  }
  return apiPost('rent.recordPayment', { unitId, expectedAmount, month, year, amount, date, method, description })
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}
