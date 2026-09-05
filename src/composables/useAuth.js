import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

/**
 * The only surface components/router should use for auth. Keeps Pinia and
 * authService as implementation details, so backend/store changes later
 * don't ripple through every component that needs to know who's logged in.
 */
export function useAuth() {
  const store = useAuthStore()

  return {
    user: computed(() => store.user),
    isAuthenticated: computed(() => store.isAuthenticated),
    loading: computed(() => store.loading),
    error: computed(() => store.error),
    login: (username, password) => store.login(username, password),
    logout: () => store.logout(),
  }
}
