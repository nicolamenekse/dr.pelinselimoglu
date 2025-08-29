'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Estetik Klinik</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Merhaba, {user.name}</span>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hoş Geldiniz!</h2>
            <p className="text-gray-600 mb-6">
              Estetik Klinik hasta takip sistemine başarıyla giriş yaptınız.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Hesap Bilgileri</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>Ad Soyad:</strong> {user.name}</p>
                <p><strong>E-posta:</strong> {user.email}</p>
                <p><strong>Durum:</strong> {user.isEmailVerified ? '✅ Doğrulanmış' : '❌ Doğrulanmamış'}</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Not:</strong> Hasta takip formu özelliği yakında eklenecek. 
                Şu anda sadece giriş/kayıt sistemi aktif.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
