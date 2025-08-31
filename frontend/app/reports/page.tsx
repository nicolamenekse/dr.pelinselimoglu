'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { usePatientStore } from '@/stores/patientStore'
import { useAppointmentStore } from '@/stores/appointmentStore'
import Header from '@/components/Header'
import Link from 'next/link'

export default function ReportsPage() {
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
  
  // Appointment statistics
  const totalAppointments = appointments.length
  const todayAppointments = appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length
  const upcomingAppointments = getUpcomingAppointments().length
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed').length

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 Raporlar & İstatistikler</h1>
                             <p className="mt-2 text-gray-600">
                 Dr.Pelin Selimoğlu Estetik Güzellik performansınızı analiz edin ve hasta verilerinizi detaylı olarak inceleyin.
               </p>
            </div>
            <Link
              href="/dashboard"
              className="btn-secondary inline-flex items-center px-4 py-2 text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard'a Dön
            </Link>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Hasta</p>
                <p className="text-2xl font-bold text-gray-900">{totalPatients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Randevu</p>
                <p className="text-2xl font-bold text-gray-900">{totalAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Yaklaşan</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bugün</p>
                <p className="text-2xl font-bold text-gray-900">{todayAppointments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Patient Statistics */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">👥</span>
              Hasta İstatistikleri
            </h3>
            
            <div className="space-y-6">
              {/* Gender Distribution */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-4">Cinsiyet Dağılımı</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-pink-500 text-xl">👩</span>
                      <span className="text-gray-700 font-medium">Kadın</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-bold text-blue-600">{femalePatients}</span>
                      <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                        {totalPatients > 0 ? Math.round((femalePatients / totalPatients) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-blue-500 text-xl">👨</span>
                      <span className="text-gray-700 font-medium">Erkek</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-bold text-blue-600">{malePatients}</span>
                      <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                        {totalPatients > 0 ? Math.round((malePatients / totalPatients) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Statistics */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-4">Fotoğraf İstatistikleri</h4>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Fotoğraflı Hasta</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold text-green-600">{patientsWithPhotos}</span>
                    <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                      {totalPatients > 0 ? Math.round((patientsWithPhotos / totalPatients) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Age Groups */}
              {(() => {
                const patientsWithBirthDate = patients.filter(p => p.birthDate)
                if (patientsWithBirthDate.length > 0) {
                  const today = new Date()
                  const ageGroups = {
                    '18-25': patientsWithBirthDate.filter(p => {
                      const age = today.getFullYear() - new Date(p.birthDate).getFullYear()
                      return age >= 18 && age <= 25
                    }).length,
                    '26-35': patientsWithBirthDate.filter(p => {
                      const age = today.getFullYear() - new Date(p.birthDate).getFullYear()
                      return age >= 26 && age <= 35
                    }).length,
                    '36-45': patientsWithBirthDate.filter(p => {
                      const age = today.getFullYear() - new Date(p.birthDate).getFullYear()
                      return age >= 36 && age <= 45
                    }).length,
                    '46+': patientsWithBirthDate.filter(p => {
                      const age = today.getFullYear() - new Date(p.birthDate).getFullYear()
                      return age >= 46
                    }).length
                  }
                  
                  return (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-medium text-purple-900 mb-4">Yaş Grupları</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(ageGroups).map(([group, count]) => (
                          <div key={group} className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">{group} yaş</span>
                            <span className="text-2xl font-bold text-purple-600">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                return null
              })()}
            </div>
          </div>

          {/* Treatment Reports */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">💊</span>
              Tedavi Raporları
            </h3>
            
            <div className="space-y-6">
              {/* Treatment Categories */}
              {(() => {
                const treatmentStats = {}
                patients.forEach(patient => {
                  patient.selectedTreatments.forEach(treatment => {
                    treatmentStats[treatment] = (treatmentStats[treatment] || 0) + 1
                  })
                })
                
                const sortedTreatments = Object.entries(treatmentStats)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                
                if (sortedTreatments.length > 0) {
                  return (
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h4 className="font-medium text-indigo-900 mb-4">En Popüler Tedaviler</h4>
                      <div className="space-y-3">
                        {sortedTreatments.map(([treatment, count]) => (
                          <div key={treatment} className="flex items-center justify-between">
                            <span className="text-gray-700 font-medium">{treatment}</span>
                            <div className="flex items-center space-x-3">
                              <div className="w-24 bg-indigo-200 rounded-full h-3">
                                <div 
                                  className="bg-indigo-600 h-3 rounded-full transition-all duration-300" 
                                  style={{ width: `${(count / Math.max(...Object.values(treatmentStats))) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-lg font-bold text-indigo-600 min-w-[2rem] text-right">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                return (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-500 text-center py-4">Henüz tedavi verisi bulunmuyor</p>
                  </div>
                )
              })()}

              {/* Appointment Status */}
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-medium text-orange-900 mb-4">Randevu Durumları</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Planlandı</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {appointments.filter(apt => apt.status === 'scheduled').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Tamamlandı</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {appointments.filter(apt => apt.status === 'completed').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">İptal Edildi</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {appointments.filter(apt => apt.status === 'cancelled').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trends Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">📈</span>
            Aylık Trendler
          </h3>
          
          {(() => {
            const monthlyStats = {}
            const currentMonth = new Date().getMonth()
            const currentYear = new Date().getFullYear()
            
            // Son 6 ayın verilerini topla
            for (let i = 5; i >= 0; i--) {
              const month = (currentMonth - i + 12) % 12
              const year = currentMonth - i < 0 ? currentYear - 1 : currentYear
              const monthKey = `${year}-${(month + 1).toString().padStart(2, '0')}`
              monthlyStats[monthKey] = {
                patients: patients.filter(p => {
                  const patientMonth = new Date(p.createdAt).getMonth()
                  const patientYear = new Date(p.createdAt).getFullYear()
                  return patientMonth === month && patientYear === year
                }).length,
                appointments: appointments.filter(apt => {
                  const aptMonth = new Date(apt.date).getMonth()
                  const aptYear = new Date(apt.date).getFullYear()
                  return aptMonth === month && aptYear === year
                }).length
              }
            }
            
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(monthlyStats).map(([month, stats]) => (
                  <div key={month} className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4 border border-teal-200">
                    <h4 className="font-medium text-teal-900 mb-3 text-center">{month}</h4>
                    <div className="space-y-2 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-teal-600">👥</span>
                        <span className="text-2xl font-bold text-teal-700">{stats.patients}</span>
                        <span className="text-sm text-teal-600">hasta</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-teal-600">📅</span>
                        <span className="text-2xl font-bold text-teal-700">{stats.appointments}</span>
                        <span className="text-sm text-teal-600">randevu</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>

        {/* Export Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-blue-900 mb-2">📋 Rapor İndirme</h3>
              <p className="text-blue-700">Detaylı raporları PDF veya Excel formatında indirin</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center">
                <span className="mr-2">📄</span>
                PDF İndir
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center">
                <span className="mr-2">📊</span>
                Excel İndir
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
