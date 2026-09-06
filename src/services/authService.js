import { apiPost } from './api'

/**
 * Auth service — the only place that knows how login is actually performed.
 * useAuth()/the auth store call this without knowing the backend details.
 */
export async function login(username, password) {
  return apiPost('auth.login', { username, password })
}

export async function logout() {
  await apiPost('auth.logout', {})
}
