import { apiGet, apiPost, USE_MOCK } from './api'
import { mockStockTransactions } from './mockData'

export async function listStockTransactions() {
  if (USE_MOCK) return clone(mockStockTransactions)
  return apiGet('stock.list')
}

export async function createStockTransaction(payload) {
  if (USE_MOCK) {
    const record = { transactionId: `s${mockStockTransactions.length + 1}`, ...payload }
    mockStockTransactions.push(record)
    return record
  }
  return apiPost('stock.create', payload)
}

export async function updateStockTransaction(transactionId, payload) {
  if (USE_MOCK) {
    const index = mockStockTransactions.findIndex((s) => s.transactionId === transactionId)
    if (index !== -1) mockStockTransactions[index] = { ...mockStockTransactions[index], ...payload }
    return mockStockTransactions[index]
  }
  return apiPost('stock.update', { transactionId, ...payload })
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}
