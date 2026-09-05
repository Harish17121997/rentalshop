import { apiGet, apiPost, USE_MOCK } from './api'
import { mockRentalUnits } from './mockData'

export async function listRentalUnits() {
  if (USE_MOCK) return clone(mockRentalUnits)
  return apiGet('rentalUnits.list')
}

export async function createRentalUnit(payload) {
  if (USE_MOCK) {
    const record = { unitId: `u${mockRentalUnits.length + 1}`, status: 'Rented', ...payload }
    mockRentalUnits.push(record)
    return clone(record)
  }
  return apiPost('rentalUnits.create', payload)
}

export async function updateRentalUnit(unitId, payload) {
  if (USE_MOCK) {
    const index = mockRentalUnits.findIndex((u) => u.unitId === unitId)
    if (index !== -1) mockRentalUnits[index] = { ...mockRentalUnits[index], ...payload }
    return clone(mockRentalUnits[index])
  }
  return apiPost('rentalUnits.update', { unitId, ...payload })
}

export async function deleteRentalUnit(unitId) {
  if (USE_MOCK) {
    const index = mockRentalUnits.findIndex((u) => u.unitId === unitId)
    if (index !== -1) mockRentalUnits.splice(index, 1)
    return { unitId }
  }
  return apiPost('rentalUnits.delete', { unitId })
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}
