import axios from 'axios'

/**
 * Single transport boundary between the app and the backend.
 *
 * Google Apps Script Web Apps only expose doGet/doPost, so every request is
 * routed through one endpoint via an `action` field rather than REST paths.
 * Services call `apiGet`/`apiPost` with an action name — swapping GAS for a
 * different backend later means changing this file only, not every service.
 *
 * USE_MOCK lets every phase before Phase 6 run against in-memory mock data
 * (see each service's `*.mock.js`) so the UI is fully usable before the real
 * backend exists.
 */

export const USE_MOCK = false

const GAS_BASE_URL = import.meta.env.VITE_GAS_API_URL || ''

const client = axios.create({
  baseURL: GAS_BASE_URL,
  timeout: 15000,
})

function getToken() {
  return localStorage.getItem('auth_token') || ''
}

export async function apiGet(action, params = {}) {
  const { data } = await client.get('', {
    params: { action, token: getToken(), ...params },
  })
  return unwrap(data)
}

export async function apiPost(action, payload = {}) {
  const { data } = await client.post('', {
    action,
    token: getToken(),
    payload,
  })
  return unwrap(data)
}

function unwrap(data) {
  if (!data || data.success === false) {
    const message = data?.error || 'Request failed'
    throw new ApiError(message, data?.code)
  }
  return data.data
}

export class ApiError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}
