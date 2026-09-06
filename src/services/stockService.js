import { apiGet, apiPost } from './api'

export async function listStockTransactions() {
  return apiGet('stock.list')
}

export async function createStockTransaction(payload) {
  return apiPost('stock.create', payload)
}

export async function updateStockTransaction(transactionId, payload) {
  return apiPost('stock.update', { transactionId, ...payload })
}
