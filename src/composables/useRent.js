import { ref } from 'vue'
import { listRentalUnits, createRentalUnit, updateRentalUnit } from '@/services/rentalUnitService'
import { listRentPayments, listPaymentHistory, recordPayment, updatePayment } from '@/services/rentService'
import { derivePaymentStatus, daysOverdue, pendingRent } from '@/utils/calculations'
import { currentMonth, currentYear, parseISODate } from '@/utils/dates'

/**
 * Drives the Rental page: unit list with the current month's status (Pending
 * whenever anything is unpaid, regardless of how late), a unit's full
 * payment history, and logging a new entry against any unit/date. All
 * amounts run through utils/calculations — this composable only fetches/
 * wires data.
 */
export function useRent() {
  const loading = ref(false)
  const errorMessage = ref('')
  const units = ref([])
  const historyByUnit = ref({})

  async function loadUnits({ month = currentMonth(), year = currentYear() } = {}) {
    loading.value = true
    errorMessage.value = ''
    try {
      const [unitList, payments] = await Promise.all([
        listRentalUnits(),
        listRentPayments({ month, year }),
      ])

      const paymentByUnit = new Map(payments.map((p) => [p.unitId, p]))

      units.value = unitList.map((unit) => {
        const payment = paymentByUnit.get(unit.unitId) || null
        const expected = unit.status === 'Vacant' ? 0 : Number(unit.monthlyRent) || 0
        const paid = Number(payment?.paidAmount) || 0
        return {
          ...unit,
          currentPayment: payment,
          expectedThisMonth: expected,
          paidThisMonth: paid,
          pendingThisMonth: pendingRent(expected, paid),
          status: unit.status === 'Vacant' ? 'Vacant' : derivePaymentStatus(payment),
          daysOverdue: unit.status === 'Vacant' ? 0 : daysOverdue(month, year),
        }
      })
    } catch (err) {
      errorMessage.value = err.message || 'Failed to load rental units'
    } finally {
      loading.value = false
    }
  }

  async function loadHistory(unitId) {
    const history = await listPaymentHistory(unitId)
    historyByUnit.value = { ...historyByUnit.value, [unitId]: history }
    return history
  }

  async function addUnit(payload) {
    await createRentalUnit(payload)
    await loadUnits()
  }

  async function editUnit(unitId, payload) {
    await updateRentalUnit(unitId, payload)
    await loadUnits()
  }

  /** date decides which month/year the entry belongs to — not necessarily the currently viewed month */
  async function addEntry({ unit, amount, date, method, description }, viewedPeriod = {}) {
    const entryDate = parseISODate(date)
    const month = entryDate.getMonth() + 1
    const year = entryDate.getFullYear()

    await recordPayment({
      unitId: unit.unitId,
      expectedAmount: unit.monthlyRent,
      month,
      year,
      amount,
      date,
      method,
      description,
    })

    await loadUnits({ month: viewedPeriod.month ?? currentMonth(), year: viewedPeriod.year ?? currentYear() })
    if (historyByUnit.value[unit.unitId]) {
      await loadHistory(unit.unitId)
    }
  }

  /** Corrects a previously recorded payment (wrong amount/date/etc.), then refreshes both the list and that unit's history. */
  async function editEntry(payment, changes, viewedPeriod = {}) {
    await updatePayment(payment.paymentId, {
      paidAmount: changes.amount,
      paidDate: changes.date,
      paymentMethod: changes.method,
      description: changes.description,
    })

    await loadUnits({ month: viewedPeriod.month ?? currentMonth(), year: viewedPeriod.year ?? currentYear() })
    if (historyByUnit.value[payment.unitId]) {
      await loadHistory(payment.unitId)
    }
  }

  return {
    loading,
    errorMessage,
    units,
    historyByUnit,
    loadUnits,
    loadHistory,
    addUnit,
    editUnit,
    addEntry,
    editEntry,
  }
}
