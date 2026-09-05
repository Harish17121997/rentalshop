import { defineStore } from 'pinia'
import * as authService from '@/services/authService'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || null,
    user: JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
    error: null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },

  actions: {
    async login(username, password) {
      this.loading = true
      this.error = null
      try {
        const { token, user } = await authService.login(username, password)
        this.token = token
        this.user = user
        localStorage.setItem(TOKEN_KEY, token)
        localStorage.setItem(USER_KEY, JSON.stringify(user))
        return true
      } catch (err) {
        this.error = err.message || 'Login failed'
        return false
      } finally {
        this.loading = false
      }
    },

    async logout() {
      await authService.logout()
      this.token = null
      this.user = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },
  },
})
