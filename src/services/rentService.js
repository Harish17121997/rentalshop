import { apiGet, apiPost } from './api'

export async function listRentPayments({ month, year, unitId } = {}) {
  return apiGet('rent.list', { month, year, unitId })
}

export async function listPaymentHistory(unitId) {
  return apiGet('rent.history', { unitId })
}

/**
 * Creates the (unitId, month, year) rent record if none exists yet;
 * otherwise adds the new amount onto the existing paidAmount so repeated
 * partial payments accumulate instead of overwriting each other. month/year
 * are derived from the payment date the user picked, not always "now".
 */
export async function recordPayment({ unitId, expectedAmount, month, year, amount, date, method, description }) {
  return apiPost('rent.recordPayment', { unitId, expectedAmount, month, year, amount, date, method, description })
}

/** Directly overwrites a payment's fields — use to correct a wrongly entered amount/date/method. */
export async function updatePayment(paymentId, { paidAmount, paidDate, paymentMethod, description }) {
  return apiPost('rent.updatePayment', { paymentId, paidAmount, paidDate, paymentMethod, description })
}
