'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { usePatientStore } from '@/stores/patientStore'
import Header from '@/components/Header'
import StatsCard from '@/components/StatsCard'
import QuickActions from '@/components/QuickActions'
import RecentPatients from '@/components/RecentPatients'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, checkAuth } = useAuthStore()
  const { patients } = usePatientStore()

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

  // Calculate statistics
  const totalPatients = patients.length
  const femalePatients = patients.filter(p => p.gender === 'female').length
  const malePatients = patients.filter(p => p.gender === 'male').length
  const patientsWithPhotos = patients.filter(p => p.beforePhotos.length > 0 || p.afterPhotos.length > 0).length

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
            value={totalPatients}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            color="blue"
            change={`+${totalPatients} toplam`}
          />
          
          <StatsCard
            title="Kadın Hastalar"
            value={femalePatients}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            color="purple"
            change={`${totalPatients > 0 ? Math.round((femalePatients / totalPatients) * 100) : 0}%`}
          />
          
          <StatsCard
            title="Erkek Hastalar"
            value={malePatients}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            color="green"
            change={`${totalPatients > 0 ? Math.round((malePatients / totalPatients) * 100) : 0}%`}
          />
          
          <StatsCard
            title="Fotoğraflı Kayıtlar"
            value={patientsWithPhotos}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            color="orange"
            change={`${totalPatients > 0 ? Math.round((patientsWithPhotos / totalPatients) * 100) : 0}%`}
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
            <div><span className="font-medium">Son Güncelleme:</span> {new Date().toLocaleDateString('tr-TR')}</div>
            <div><span className="font-medium">Toplam Kayıt:</span> {totalPatients}</div>
            <div><span className="font-medium">Sistem Durumu:</span> <span className="ml-2 text-green-600">✓ Aktif</span></div>
          </div>
        </div>
      </main>
    </div>
  )
}
