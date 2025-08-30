'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { usePatientStore } from '@/stores/patientStore'
import { useAppointmentStore } from '@/stores/appointmentStore'
import Header from '@/components/Header'
import StatsCard from '@/components/StatsCard'
import QuickActions from '@/components/QuickActions'
import RecentPatients from '@/components/RecentPatients'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, checkAuth, isLoading } = useAuthStore()
  const { patients } = usePatientStore()
  const { appointments, getUpcomingAppointments } = useAppointmentStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    // Sadece checkAuth tamamlandıktan sonra yönlendirme yap
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="loading-modern">
          <div className="spinner-modern"></div>
        </div>
      </div>
    )
  }

  // Calculate statistics
  const totalPatients = patients.length
  const femalePatients = patients.filter(p => p.gender === 'female').length
  const malePatients = patients.filter(p => p.gender === 'male').length
  const patientsWithPhotos = patients.filter(p => p.beforePhotos.length > 0 || p.afterPhotos.length > 0).length
  
  // Appointment statistics
  const totalAppointments = appointments.length
  const todayAppointments = appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length
  const upcomingAppointments = getUpcomingAppointments().length
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <Header />
      <main className="container-modern py-8">
        {/* Welcome Section */}
        <div className="mb-12 text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-100 to-accent-100 rounded-3xl mb-6">
            <svg className="w-10 h-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="heading-1-modern mb-4">
            Hoş Geldiniz, <span className="text-gradient">{user.name}</span>!
          </h1>
          <p className="text-modern text-lg max-w-2xl mx-auto">
            Dr.Pelin Selimoğlu Estetik Güzellik hasta takip sistemine hoş geldiniz. 
            Bugünkü işlemlerinizi yönetin ve klinik performansınızı takip edin.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="stats-card-modern modern-card-hover">
            <div className="flex items-center">
              <div className="stats-icon-modern bg-gradient-to-br from-primary-100 to-primary-200 text-primary-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Hasta</p>
                <p className="text-3xl font-bold text-gradient">{totalPatients}</p>
                <p className="text-xs text-gray-500 mt-1">+{totalPatients} toplam</p>
              </div>
            </div>
          </div>
          
          <div className="stats-card-modern modern-card-hover">
            <div className="flex items-center">
              <div className="stats-icon-modern bg-gradient-to-br from-accent-100 to-accent-200 text-accent-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Randevu</p>
                <p className="text-3xl font-bold text-gradient">{totalAppointments}</p>
                <p className="text-xs text-gray-500 mt-1">{todayAppointments} bugün</p>
              </div>
            </div>
          </div>
          
          <div className="stats-card-modern modern-card-hover">
            <div className="flex items-center">
              <div className="stats-icon-modern bg-gradient-to-br from-success-100 to-success-200 text-success-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Yaklaşan</p>
                <p className="text-3xl font-bold text-gradient">{upcomingAppointments}</p>
                <p className="text-xs text-gray-500 mt-1">{confirmedAppointments} onaylandı</p>
              </div>
            </div>
          </div>
          
          <div className="stats-card-modern modern-card-hover">
            <div className="flex items-center">
              <div className="stats-icon-modern bg-gradient-to-br from-warning-100 to-warning-200 text-warning-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bugünkü</p>
                <p className="text-3xl font-bold text-gradient">{todayAppointments}</p>
                <p className="text-xs text-gray-500 mt-1">{upcomingAppointments} yaklaşan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions and Recent Patients */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <QuickActions />
          </div>
          <div className="lg:col-span-1">
            <RecentPatients />
          </div>
        </div>

        {/* Additional Info */}
        <div className="modern-card p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-6">
            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="heading-3-modern mb-4">Sistem Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-primary-600 mb-1">
                {new Date().toLocaleDateString('tr-TR')}
              </span>
              <span className="text-gray-500">Son Güncelleme</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-accent-600 mb-1">{totalPatients}</span>
              <span className="text-gray-500">Toplam Kayıt</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-success-600 mb-1">✓</span>
              <span className="text-gray-500">Sistem Durumu</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
