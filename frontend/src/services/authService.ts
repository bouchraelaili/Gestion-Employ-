import api from './api'
import type { LoginResponse, AuthUser } from '../types'

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await api.post('/login', { email, password })
    return res.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getStoredUser: (): AuthUser | null => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem('token')
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token')
  },
}