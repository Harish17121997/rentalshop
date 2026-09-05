import { ref, computed } from 'vue'
import { listStockTransactions, createStockTransaction, updateStockTransaction } from '@/services/stockService'
import { summarizeStock, stockNetProfit, stockProfitPercent, stockStatus } from '@/utils/calculations'

/**
 * Drives the Stock/IPO page: transaction list with per-row profit/status,
 * split into Active (unsold) vs Done (sold, Profit/Loss), and the aggregate
 * summary. All math runs through utils/calculations.
 */
export function useStock() {
  const loading = ref(false)
  const errorMessage = ref('')
  const transactions = ref([])

  const rows = computed(() =>
    transactions.value
      .map((tx) => ({
        ...tx,
        netProfit: stockNetProfit(tx),
        profitPercent: stockProfitPercent(tx),
        status: stockStatus(tx),
      }))
      .sort((a, b) => new Date(b.buyDate) - new Date(a.buyDate)),
  )

  const activeRows = computed(() => rows.value.filter((r) => r.status === 'Active'))
  const doneRows = computed(() => rows.value.filter((r) => r.status !== 'Active'))

  const summary = computed(() => summarizeStock(transactions.value))

  async function load() {
    loading.value = true
    errorMessage.value = ''
    try {
      transactions.value = await listStockTransactions()
    } catch (err) {
      errorMessage.value = err.message || 'Failed to load stock transactions'
    } finally {
      loading.value = false
    }
  }

  async function addTransaction(payload) {
    await createStockTransaction(payload)
    await load()
  }

  async function recordSale(transactionId, { sellPrice, sellAmount, sellDate }) {
    await updateStockTransaction(transactionId, { sellPrice, sellAmount, sellDate })
    await load()
  }

  return {
    loading,
    errorMessage,
    rows,
    activeRows,
    doneRows,
    summary,
    load,
    addTransaction,
    recordSale,
  }
}
