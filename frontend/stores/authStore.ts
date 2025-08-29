import { create } from 'zustand'
import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Configure axios defaults
axios.defaults.baseURL = API_BASE
axios.defaults.withCredentials = true

// Axios interceptor to add token to requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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
  user: (() => {
    // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgilerini yükle
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData')
      if (userData) {
        try {
          return JSON.parse(userData)
        } catch (error) {
          console.error('Failed to parse user data from localStorage:', error)
        }
      }
    }
    return null
  })(),
  isLoading: false,
  error: null,
  isAuthenticated: (() => {
    // Sayfa yüklendiğinde localStorage'dan token kontrolü yap
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('authToken')
    }
    return false
  })(),

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post('/auth/login', { email, password })
      
      // Token'ı ve kullanıcı bilgilerini localStorage'a kaydet
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('userData', JSON.stringify(response.data.user))
      }
      
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
      
      // Token'ı ve kullanıcı bilgilerini localStorage'a kaydet
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('userData', JSON.stringify(response.data.user))
      }
      
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
      // LocalStorage'dan token'ı ve kullanıcı bilgilerini temizle
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      set({ 
        user: null, 
        isAuthenticated: false, 
        error: null 
      })
    }
  },

    checkAuth: async () => {
    set({ isLoading: true })
    try {
      // Önce localStorage'dan token kontrolü yap
      const token = localStorage.getItem('authToken')
      if (!token) {
        console.log('checkAuth: Token bulunamadı')
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false
        })
        return
      }

      // LocalStorage'dan kullanıcı bilgilerini al
      const userData = localStorage.getItem('userData')
      if (userData) {
        try {
          const user = JSON.parse(userData)
          console.log('checkAuth: LocalStorage\'dan kullanıcı bilgileri alındı:', user)
          
          // Önce localStorage'dan yükle, sonra backend doğrulaması yap
          set({ 
            user: user, 
            isAuthenticated: true,
            isLoading: false
          })
          
          // Backend doğrulamasını arka planda yap
          setTimeout(async () => {
            try {
              const response = await axios.get('/auth/me')
              if (response.data.authenticated) {
                console.log('checkAuth: Backend doğrulama başarılı')
                // Backend'den güncel kullanıcı bilgilerini al
                set({ 
                  user: response.data.user, 
                  isAuthenticated: true
                })
                // Güncel bilgileri localStorage'a kaydet
                localStorage.setItem('userData', JSON.stringify(response.data.user))
              } else {
                console.log('checkAuth: Backend doğrulama başarısız')
                // Backend'de doğrulanamadıysa temizle
                localStorage.removeItem('authToken')
                localStorage.removeItem('userData')
                set({ 
                  user: null, 
                  isAuthenticated: false
                })
              }
            } catch (backendError) {
              console.log('checkAuth: Backend doğrulama hatası, localStorage kullanılıyor')
              // Backend hatası durumunda localStorage'daki bilgiler kullanılmaya devam eder
            }
          }, 100)
          
          return
        } catch (parseError) {
          console.error('User data parse error:', parseError)
        }
      }

      console.log('checkAuth: LocalStorage\'da kullanıcı bilgisi yok, backend doğrulaması yapılıyor...')
      
      // LocalStorage'da kullanıcı bilgisi yoksa backend'e istek at
      try {
        const response = await axios.get('/auth/me')
        if (response.data.authenticated) {
          console.log('checkAuth: Backend doğrulama başarılı')
          set({ 
            user: response.data.user, 
            isAuthenticated: true,
            isLoading: false
          })
          // Kullanıcı bilgilerini localStorage'a kaydet
          localStorage.setItem('userData', JSON.stringify(response.data.user))
        } else {
          console.log('checkAuth: Backend doğrulama başarısız')
          localStorage.removeItem('authToken')
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false
          })
        }
      } catch (backendError: any) {
        console.error('Backend connection error:', backendError)
        
        // Backend çalışmıyorsa token'dan kullanıcı bilgilerini çıkarmaya çalış
        try {
          const tokenParts = token.split('.')
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]))
            console.log('checkAuth: Token payload:', payload)
            
            const tempUser = {
              id: payload.sub,
              email: payload.email,
              name: payload.email.split('@')[0],
              isEmailVerified: true
            }
            
            set({ 
              user: tempUser, 
              isAuthenticated: true,
              isLoading: false
            })
            // Geçici kullanıcı bilgilerini localStorage'a kaydet
            localStorage.setItem('userData', JSON.stringify(tempUser))
            return
          }
        } catch (decodeError) {
          console.error('Token decode error:', decodeError)
        }
        
        // Hiçbir yöntem çalışmazsa temizle
        localStorage.removeItem('authToken')
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false
        })
      }
    } catch (error: any) {
      console.error('checkAuth General Error:', error)
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false
      })
    }
  },

  clearError: () => set({ error: null })
}))
