import { ref } from 'vue'
import { listRentalUnits } from '@/services/rentalUnitService'
import { listRentPayments } from '@/services/rentService'
import { listStockTransactions } from '@/services/stockService'
import {
  summarizeRent,
  groupIncomeByCategory,
  summarizeStock,
  derivePaymentStatus,
  daysOverdue,
} from '@/utils/calculations'

const INACTIVE_STATUSES = new Set(['Vacant', 'Inactive'])

/**
 * Assembles everything the dashboard shows for a given month/year. All money
 * math runs through utils/calculations — this composable only fetches and
 * wires data together, it never computes a total itself.
 */
export function useDashboard() {
  const loading = ref(false)
  const errorMessage = ref('')

  const rentSummary = ref({ expected: 0, received: 0, pending: 0, collectionPercent: 0 })
  const incomeByCategory = ref({})
  const stockSummary = ref({ totalInvested: 0, totalSold: 0, realizedProfit: 0, activeCount: 0, winners: 0, losers: 0 })
  const pendingRentRows = ref([])

  async function load({ month, year }) {
    loading.value = true
    errorMessage.value = ''
    try {
      const [units, payments, stockTransactions] = await Promise.all([
        listRentalUnits(),
        listRentPayments({ month, year }),
        listStockTransactions(),
      ])

      rentSummary.value = summarizeRent(units, payments)
      incomeByCategory.value = groupIncomeByCategory(units, payments)
      stockSummary.value = summarizeStock(stockTransactions)

      const paymentByUnit = new Map(payments.map((p) => [p.unitId, p]))

      // Iterate units, not payments — a unit with no entry at all for this
      // month must still show as pending, not silently disappear.
      pendingRentRows.value = units
        .filter((u) => !INACTIVE_STATUSES.has(u.status))
        .map((unit) => {
          const payment = paymentByUnit.get(unit.unitId) || null
          const expected = Number(unit.monthlyRent) || 0
          const paid = Number(payment?.paidAmount) || 0
          return {
            paymentId: payment?.paymentId || null,
            unitId: unit.unitId,
            unitName: unit.unitName,
            tenantName: unit.tenantName || '-',
            pending: Math.max(0, expected - paid),
            daysOverdue: daysOverdue(month, year),
            status: derivePaymentStatus(payment),
          }
        })
        .filter((row) => row.status !== 'Paid')
        .sort((a, b) => b.daysOverdue - a.daysOverdue)
    } catch (err) {
      errorMessage.value = err.message || 'Failed to load dashboard data'
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    errorMessage,
    rentSummary,
    incomeByCategory,
    stockSummary,
    pendingRentRows,
    load,
  }
}
