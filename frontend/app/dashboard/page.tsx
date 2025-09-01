'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { usePatientStore } from '@/stores/patientStore'
import { useAppointmentStore } from '@/stores/appointmentStore'
import Header from '@/components/Header'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, checkAuth, isLoading } = useAuthStore()
  const { patients } = usePatientStore()
  const { appointments, getUpcomingAppointments } = useAppointmentStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-cyan-800">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-white"></div>
        </div>
      </div>
    )
  }

  // Calculate statistics
  const totalPatients = patients.length
  const totalAppointments = appointments.length
  const upcomingAppointments = getUpcomingAppointments().length
  const todayAppointments = appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length

  // Get recent patients (last 5)
  const recentPatients = patients.slice(-5).reverse()

  // Get upcoming appointments for sidebar
  const upcomingAppts = getUpcomingAppointments().slice(0, 8)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-cyan-800">
      <Header />
      
      {/* User Welcome Card - Top Right */}
      <div className="absolute top-24 right-8 z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg font-serif">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-white">
              <p className="font-semibold text-sm">Hoş geldiniz, Dr. {user.name}</p>
              <p className="text-xs text-cyan-200">Dashboard</p>
            </div>
          </div>
        </div>
      </div>

      <main className="pt-8 pb-10 px-4 lg:px-8">
        {/* 3-Column Layout */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar - Upcoming Appointments */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-6 h-fit sticky top-32">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mr-3 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white font-serif">Yaklaşan Randevular</h2>
              </div>
              
              <div className="space-y-3">
                {upcomingAppts.length > 0 ? (
                  upcomingAppts.map((apt, index) => (
                    <div key={apt.id} className="bg-white/5 rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          <span className="text-cyan-200 text-xs font-medium">
                            {new Date(apt.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <span className="text-white text-sm font-semibold">{apt.time}</span>
                      </div>
                      <p className="text-white font-medium text-sm mb-1">{apt.patientName}</p>
                      <p className="text-cyan-200 text-xs">{apt.treatment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-cyan-200 text-sm">Yaklaşan randevu yok</p>
                  </div>
                )}
              </div>
              
              <Link href="/appointments" className="mt-6 w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white text-center py-3 rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl block">
                Tüm Randevuları Gör
              </Link>
            </div>
          </div>

          {/* Center Column - Statistics & Quick Actions */}
          <div className="lg:col-span-6">
            {/* Statistics Cards - 2x2 Grid */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white font-serif mb-6 text-center">📊 İstatistikler</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Toplam Hasta */}
                <Link href="/patients" className="group">
                  <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white font-serif">{totalPatients}</div>
                        <div className="text-xs text-cyan-200">Toplam</div>
                      </div>
                    </div>
                    <p className="text-white font-medium text-sm mb-2">Toplam Hasta</p>
                    <div className="flex items-center text-cyan-300 text-xs">
                      <span>📈 +12% bu ay</span>
                    </div>
                  </div>
                </Link>

                {/* Toplam Randevu */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-500 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white font-serif">{totalAppointments}</div>
                      <div className="text-xs text-emerald-200">Toplam</div>
                    </div>
                  </div>
                  <p className="text-white font-medium text-sm mb-2">Toplam Randevu</p>
                  <div className="flex items-center text-emerald-300 text-xs">
                    <span>📈 +8% bu hafta</span>
                  </div>
                </div>

                {/* Yaklaşan Randevular */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-500 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white font-serif">{upcomingAppointments}</div>
                      <div className="text-xs text-violet-200">Yaklaşan</div>
                    </div>
                  </div>
                  <p className="text-white font-medium text-sm mb-2">Yaklaşan Randevular</p>
                  <div className="flex items-center text-violet-300 text-xs">
                    <span>📅 Bu hafta</span>
                  </div>
                </div>

                {/* Bugünkü Randevular */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-500 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white font-serif">{todayAppointments}</div>
                      <div className="text-xs text-amber-200">Bugün</div>
                    </div>
                  </div>
                  <p className="text-white font-medium text-sm mb-2">Bugünkü Randevular</p>
                  <div className="flex items-center text-amber-300 text-xs">
                    <span>📅 {new Date().toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions - 2x2 Grid */}
            <div>
              <h2 className="text-2xl font-bold text-white font-serif mb-6 text-center">⚡ Hızlı İşlemler</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Yeni Hasta */}
                <Link href="/patients/new" className="group">
                  <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-3xl border border-blue-400/30 p-6 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-3xl">➕</span>
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">Yeni Hasta</h3>
                      <p className="text-cyan-200 text-sm">Hasta kaydı oluştur</p>
                    </div>
                  </div>
                </Link>

                {/* Randevu Oluştur */}
                <Link href="/appointments" className="group">
                  <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-md rounded-3xl border border-emerald-400/30 p-6 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-3xl">📅</span>
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">Randevu Oluştur</h3>
                      <p className="text-emerald-200 text-sm">Yeni randevu ekle</p>
                    </div>
                  </div>
                </Link>

                {/* Hasta Listesi */}
                <Link href="/patients" className="group">
                  <div className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 backdrop-blur-md rounded-3xl border border-violet-400/30 p-6 hover:from-violet-500/30 hover:to-purple-500/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-3xl">👥</span>
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">Hasta Listesi</h3>
                      <p className="text-violet-200 text-sm">Tüm hastaları görüntüle</p>
                    </div>
                  </div>
                </Link>

                {/* Raporlar */}
                <Link href="/reports" className="group">
                  <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-md rounded-3xl border border-amber-400/30 p-6 hover:from-amber-500/30 hover:to-orange-500/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-3xl">📊</span>
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">Raporlar</h3>
                      <p className="text-amber-200 text-sm">İstatistikleri incele</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Recent Patients */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-6 h-fit sticky top-32">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mr-3 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white font-serif">Son Eklenen Hastalar</h2>
              </div>
              
              <div className="space-y-3">
                {recentPatients.length > 0 ? (
                  recentPatients.map((patient, index) => (
                    <Link key={patient.id} href={`/patients/${patient.id}`} className="block group">
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all duration-300 group-hover:scale-105">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-sm font-serif">
                              {patient.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium text-sm mb-1">{patient.name}</p>
                            <div className="flex flex-wrap gap-1">
                              {patient.selectedTreatments.slice(0, 2).map((treatment, idx) => (
                                <span key={idx} className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-200 rounded-full border border-cyan-400/30">
                                  {treatment}
                                </span>
                              ))}
                              {patient.selectedTreatments.length > 2 && (
                                <span className="px-2 py-1 text-xs bg-white/10 text-white rounded-full">
                                  +{patient.selectedTreatments.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-cyan-200 text-sm">Henüz hasta yok</p>
                  </div>
                )}
              </div>
              
              <Link href="/patients" className="mt-6 w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-center py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl block">
                Tüm Hastaları Gör
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

