import axios from 'axios'

/**
 * Single transport boundary between the app and the backend.
 *
 * Google Apps Script Web Apps only expose doGet/doPost, so every request is
 * routed through one endpoint via an `action` field rather than REST paths.
 * Services call `apiGet`/`apiPost` with an action name — swapping GAS for a
 * different backend later means changing this file only, not every service.
 */

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
  // Sent as text/plain (not application/json) so the browser treats this as
  // a "simple request" and skips the CORS preflight — Apps Script Web Apps
  // don't implement doOptions(), so a preflighted request never completes.
  const { data } = await client.post(
    '',
    JSON.stringify({ action, token: getToken(), payload }),
    { headers: { 'Content-Type': 'text/plain;charset=utf-8' } },
  )
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
