'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import Header from '@/components/Header'
import StatsCard from '@/components/StatsCard'
import QuickActions from '@/components/QuickActions'
import RecentPatients from '@/components/RecentPatients'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hoş Geldiniz, {user.name}!</h1>
          <p className="mt-2 text-gray-600">
            Estetik Klinik hasta takip sistemine hoş geldiniz. Bugünkü işlemlerinizi yönetin.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Toplam Hasta"
            value="156"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            color="blue"
            change="+12 bu ay"
          />
          <StatsCard
            title="Bugünkü Randevular"
            value="8"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            color="green"
          />
          <StatsCard
            title="Bu Ay Gelir"
            value="₺45,250"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
            color="purple"
            change="+8% geçen aya göre"
          />
          <StatsCard
            title="Aktif Tedaviler"
            value="23"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="orange"
          />
        </div>

        {/* Quick Actions and Recent Patients */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <QuickActions />
          </div>
          <div className="lg:col-span-1">
            <RecentPatients />
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sistem Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Son Güncelleme:</span> {new Date().toLocaleDateString('tr-TR')}
            </div>
            <div>
              <span className="font-medium">Toplam Kayıt:</span> 1,247
            </div>
            <div>
              <span className="font-medium">Sistem Durumu:</span> 
              <span className="ml-2 text-green-600">✓ Aktif</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
