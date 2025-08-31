'use client'

import Link from 'next/link'
import { useAppointmentStore } from '@/stores/appointmentStore'
import { usePatientStore } from '@/stores/patientStore'

export default function UpcomingAppointments() {
  const { appointments, getUpcomingAppointments } = useAppointmentStore()
  const { patients } = usePatientStore()
  
  // Get more upcoming appointments (up to 8-10 that fit on one page)
  const upcomingAppointments = getUpcomingAppointments().slice(0, 10)

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId)
    return patient ? patient.name : 'Bilinmeyen Hasta'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-600 text-white border-emerald-500'
      case 'pending':
        return 'bg-amber-600 text-white border-amber-500'
      case 'cancelled':
        return 'bg-red-600 text-white border-red-500'
      default:
        return 'bg-slate-600 text-white border-slate-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Onaylandı'
      case 'pending':
        return 'Beklemede'
      case 'cancelled':
        return 'İptal Edildi'
      default:
        return 'Bilinmiyor'
    }
  }

  if (upcomingAppointments.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl shadow-2xl border border-slate-600 p-6 h-full">
        <div className="flex items-center mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-500 rounded-2xl flex items-center justify-center mr-3 shadow-lg flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white font-serif truncate">Yaklaşan Randevular</h3>
        </div>
        
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-slate-200 font-semibold mb-2 text-base">Yaklaşan randevu yok</h4>
          <p className="text-slate-400 text-xs mb-4 px-2">Henüz planlanmış randevu bulunmuyor</p>
          <Link
            href="/appointments"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 text-white rounded-xl text-xs font-semibold transition-all duration-300 border border-slate-500 hover:border-slate-400 shadow-lg hover:shadow-xl"
          >
            <svg className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Randevu Ekle
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl shadow-2xl border border-slate-600 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center min-w-0 flex-1">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-500 rounded-2xl flex items-center justify-center mr-3 shadow-lg flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white font-serif truncate">Yaklaşan Randevular</h3>
        </div>
        <Link
          href="/appointments"
          className="text-xs text-slate-300 hover:text-white font-medium hover:underline transition-colors duration-200 flex-shrink-0 ml-2"
        >
          Tümünü Gör
        </Link>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {upcomingAppointments.map((appointment) => (
          <div
            key={appointment.id}
            className="p-3 rounded-xl border border-slate-600 hover:border-slate-500 hover:shadow-lg transition-all duration-300 bg-slate-750"
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-white truncate mb-1 font-serif">
                  {getPatientName(appointment.patientId)}
                </h4>
                
                <div className="flex flex-wrap items-center gap-1 text-xs text-slate-300 mb-1">
                  <span className="flex items-center bg-slate-700 px-2 py-0.5 rounded-md">
                    <svg className="w-2.5 h-2.5 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate text-xs">{formatDate(appointment.date)}</span>
                  </span>
                  <span className="flex items-center bg-slate-700 px-2 py-0.5 rounded-md">
                    <svg className="w-2.5 h-2.5 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs">{formatTime(appointment.time)}</span>
                  </span>
                </div>
                
                {appointment.treatment && (
                  <p className="text-xs text-slate-400 mb-1 font-medium truncate">
                    {appointment.treatment}
                  </p>
                )}
                
                <div className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                  {getStatusText(appointment.status)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-600">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium truncate">Toplam {upcomingAppointments.length} randevu</span>
          <div className="flex space-x-1 flex-shrink-0">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(71, 85, 105, 0.3);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #475569, #64748b);
          border-radius: 3px;
          border: 1px solid rgba(71, 85, 105, 0.5);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #64748b, #94a3b8);
        }
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #64748b rgba(71, 85, 105, 0.3);
        }
      `}</style>
    </div>
  )
}
