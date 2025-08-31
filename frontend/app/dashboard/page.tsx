'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { usePatientStore } from '@/stores/patientStore'
import { useAppointmentStore } from '@/stores/appointmentStore'
import Header from '@/components/Header'
import QuickActions from '@/components/QuickActions'
import UpcomingAppointments from '@/components/UpcomingAppointments'
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-600 border-t-slate-300"></div>
        </div>
      </div>
    )
  }

  // Calculate statistics
  const totalPatients = patients.length
  const totalAppointments = appointments.length
  const upcomingAppointments = getUpcomingAppointments().length
  const todayAppointments = appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      <main className="pt-2.5 pb-10">
        {/* Welcome Section - Centered */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-serif">
              Hoş geldiniz, Dr. {user.name}
            </h1>
            <p className="text-slate-300 text-xl font-light">
              Dr.Pelin Selimoğlu Estetik Güzellik hasta takip sistemine hoş geldiniz
            </p>
          </div>
        </div>

        {/* Statistics Cards - Centered */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Toplam Hasta - Clickable */}
            <Link href="/patients" className="block group">
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl shadow-2xl border border-slate-600 p-8 hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 hover:border-slate-500 cursor-pointer">
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-300 text-sm font-medium mb-2">Toplam Hasta</p>
                    <p className="text-3xl font-bold text-white font-serif group-hover:text-blue-300 transition-colors duration-300">{totalPatients}</p>
                    <div className="flex items-center text-blue-400 text-xs font-medium group-hover:text-blue-300 transition-colors duration-300">
                      <span>Tümünü Gör</span>
                      <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
            
            {/* Toplam Randevu */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl shadow-2xl border border-slate-600 p-8 hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 hover:scale-105">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-5 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-300 text-sm font-medium mb-2">Toplam Randevu</p>
                  <p className="text-3xl font-bold text-white font-serif">{totalAppointments}</p>
                </div>
              </div>
            </div>
            
            {/* Yaklaşan Randevular */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl shadow-2xl border border-slate-600 p-8 hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 hover:scale-105">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center mr-5 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-300 text-sm font-medium mb-2">Yaklaşan</p>
                  <p className="text-3xl font-bold text-white font-serif">{upcomingAppointments}</p>
                </div>
              </div>
            </div>
            
            {/* Bugünkü Randevular */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl shadow-2xl border border-slate-600 p-8 hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 hover:scale-105">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mr-5 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-300 text-sm font-medium mb-2">Bugünkü</p>
                  <p className="text-3xl font-bold text-white font-serif">{todayAppointments}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Left-Aligned Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Upcoming Appointments (Far Left, Header Altında) */}
          <div className="lg:w-80 lg:flex-shrink-0 px-4 lg:pl-8">
            <UpcomingAppointments />
          </div>

          {/* Right Side - Quick Actions (Taking remaining space) */}
          <div className="flex-1 px-4 lg:pr-8">
            <QuickActions />
          </div>
        </div>
      </main>
    </div>
  )
}

