import { apiGet, apiPost } from './api'

export async function listRentalUnits() {
  return apiGet('rentalUnits.list')
}

export async function createRentalUnit(payload) {
  return apiPost('rentalUnits.create', payload)
}

export async function updateRentalUnit(unitId, payload) {
  return apiPost('rentalUnits.update', { unitId, ...payload })
}

export async function deleteRentalUnit(unitId) {
  return apiPost('rentalUnits.delete', { unitId })
}
