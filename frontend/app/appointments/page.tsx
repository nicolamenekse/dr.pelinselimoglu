'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useAuthStore } from '@/stores/authStore'
import { useAppointmentStore, Appointment } from '@/stores/appointmentStore'
import { usePatientStore } from '@/stores/patientStore'
import AppointmentCalendar from '@/components/AppointmentCalendar'
import AppointmentForm from '@/components/AppointmentForm'
import AppointmentList from '@/components/AppointmentList'

export default function AppointmentsPage() {
  const router = useRouter()
  const { user, checkAuth, isLoading: authLoading } = useAuthStore()
  const { appointments, getUpcomingAppointments } = useAppointmentStore()
  const { patients } = usePatientStore()
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showForm, setShowForm] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Sadece checkAuth tamamlandıktan sonra yönlendirme yap
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  if (!mounted || authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  const upcomingAppointments = getUpcomingAppointments()
  const todayIso = new Date().toISOString().split('T')[0]
  const todayAppointments = appointments.filter(apt => apt.date === selectedDate)
  const visibleAppointments = appointments.filter(apt => apt.date !== todayIso)

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setShowForm(false)
    setSelectedAppointment(null)
  }

  const handleAppointmentSelect = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowForm(true)
  }

  const handleNewAppointment = () => {
    setSelectedAppointment(null)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedAppointment(null)
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowForm(true)
  }

  const handleDeleteAppointment = (appointment: Appointment) => {
    // Randevu silme işlemi
    const { deleteAppointment } = useAppointmentStore.getState()
    deleteAppointment(appointment.id)
    
    // Başarı mesajı göster
    alert(`${appointment.patientName} adlı hastanın randevusu başarıyla silindi.`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      
      <main className="w-full max-w-none py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white font-serif mb-2">📅 Randevu Takvimi</h1>
              <p className="text-slate-300">
                Toplam <span className="font-semibold text-blue-300">{appointments.length}</span> randevu • Bugün <span className="font-semibold text-emerald-300">{todayAppointments.length}</span> randevu
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
                className="px-5 py-3 rounded-xl text-sm font-medium bg-slate-700/60 text-slate-200 border border-slate-600/50 hover:bg-slate-600/60 transition-all"
              >
                {viewMode === 'calendar' ? '📋 Liste Görünümü' : '📅 Takvim Görünümü'}
              </button>
              <button
                onClick={handleNewAppointment}
                className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white border border-slate-600/50 shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Yeni Randevu
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bugün</p>
                <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Onaylanan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(apt => apt.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bekleyen</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(apt => apt.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Yaklaşan</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Calendar/List View */}
          <div className="xl:col-span-2">
            {viewMode === 'calendar' ? (
              <AppointmentCalendar
                appointments={visibleAppointments}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                onAppointmentSelect={handleAppointmentSelect}
                onEditAppointment={handleEditAppointment}
                onDeleteAppointment={handleDeleteAppointment}
              />
            ) : (
              <AppointmentList
                appointments={visibleAppointments}
                onAppointmentSelect={handleAppointmentSelect}
                onEditAppointment={handleEditAppointment}
                onDeleteAppointment={handleDeleteAppointment}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Appointments (exclude today) */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl shadow-xl p-6 border border-slate-600/50">
              <h3 className="text-lg font-semibold text-white mb-4">Yaklaşan Randevular</h3>
              {visibleAppointments.filter(a => a.date > todayIso).length === 0 ? (
                <p className="text-slate-400 text-center py-4">Yaklaşan randevu bulunmuyor</p>
              ) : (
                <div className="space-y-3">
                  {visibleAppointments
                    .filter(a => a.date > todayIso)
                    .sort((a, b) => (a.date + 'T' + a.time).localeCompare(b.date + 'T' + b.time))
                    .slice(0, 8)
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-3 bg-slate-700/40 rounded-lg cursor-pointer hover:bg-slate-600/50 transition-colors duration-200 group border border-slate-600/50"
                        onClick={() => handleAppointmentSelect(appointment)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">{appointment.patientName}</p>
                            <p className="text-sm text-slate-300">{appointment.treatment}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-blue-300">{appointment.date} {appointment.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Hızlı İşlemler</h3>
              <div className="space-y-3">
                <button
                  onClick={handleNewAppointment}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center font-medium"
                >
                  <span className="mr-2">📅</span>
                  Yeni Randevu
                </button>
                <button className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center font-medium">
                  <span className="mr-2">📱</span>
                  Toplu SMS
                </button>
                <button className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center font-medium">
                  <span className="mr-2">📊</span>
                  Rapor Oluştur
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Appointment Form Modal */}
      {showForm && (
        <AppointmentForm
          appointment={selectedAppointment}
          patients={patients}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}
