import { create } from 'zustand'
import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Configure axios defaults
axios.defaults.baseURL = API_BASE
axios.defaults.withCredentials = true

interface User {
  id: string
  name: string
  email: string
  isEmailVerified: boolean
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  verifyEmail: (email: string, token: string) => Promise<void>
  resendVerification: (email: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post('/auth/login', { email, password })
      set({ 
        user: response.data.user, 
        isAuthenticated: true, 
        isLoading: false 
      })
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Giriş başarısız', 
        isLoading: false 
      })
      throw error
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      await axios.post('/auth/register', { name, email, password })
      set({ isLoading: false })
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Kayıt başarısız', 
        isLoading: false 
      })
      throw error
    }
  },

  verifyEmail: async (email: string, token: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post('/auth/verify-email', { email, token })
      set({ 
        user: response.data.user, 
        isAuthenticated: true, 
        isLoading: false 
      })
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Doğrulama başarısız', 
        isLoading: false 
      })
      throw error
    }
  },

  resendVerification: async (email: string) => {
    set({ isLoading: true, error: null })
    try {
      await axios.post('/auth/resend-verification', { email })
      set({ isLoading: false })
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Tekrar gönderme başarısız', 
        isLoading: false 
      })
      throw error
    }
  },

  logout: async () => {
    try {
      await axios.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      set({ 
        user: null, 
        isAuthenticated: false, 
        error: null 
      })
    }
  },

  checkAuth: async () => {
    try {
      const response = await axios.get('/auth/me')
      if (response.data.authenticated) {
        set({ 
          user: response.data.user, 
          isAuthenticated: true 
        })
      }
    } catch (error) {
      set({ 
        user: null, 
        isAuthenticated: false 
      })
    }
  },

  clearError: () => set({ error: null })
}))
