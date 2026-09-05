import { apiPost } from './api'
import { USE_MOCK } from './api'
import { mockUsers } from './mockData'

/**
 * Auth service — the only place that knows how login is actually performed.
 * useAuth()/the auth store call this; neither knows whether the backend is
 * mocked or a real GAS endpoint.
 */
export async function login(username, password) {
  if (USE_MOCK) {
    await simulateLatency()
    const user = mockUsers.find(
      (u) => u.username.toLowerCase() === String(username).toLowerCase() && u.password === password,
    )
    if (!user) {
      throw new Error('Invalid username or password')
    }
    return {
      token: `mock-token-${user.userId}`,
      user: { userId: user.userId, name: user.name, username: user.username, role: user.role },
    }
  }

  return apiPost('auth.login', { username, password })
}

export async function logout() {
  if (USE_MOCK) return
  await apiPost('auth.logout', {})
}

function simulateLatency() {
  return new Promise((resolve) => setTimeout(resolve, 350))
}
