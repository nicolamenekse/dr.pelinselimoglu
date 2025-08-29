'use client'

import { useState, useMemo } from 'react'
import { Appointment } from '@/stores/appointmentStore'

interface AppointmentListProps {
  appointments: Appointment[]
  onAppointmentSelect: (appointment: Appointment) => void
}

export default function AppointmentList({ appointments, onAppointmentSelect }: AppointmentListProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'time' | 'patientName' | 'treatment'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Filtreleme ve sıralama
  const filteredAndSortedAppointments = useMemo(() => {
    let filtered = appointments

    // Durum filtresi
    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus)
    }

    // Sıralama
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date + 'T' + a.time)
          bValue = new Date(b.date + 'T' + b.time)
          break
        case 'time':
          aValue = a.time
          bValue = b.time
          break
        case 'patientName':
          aValue = a.patientName.toLowerCase()
          bValue = b.patientName.toLowerCase()
          break
        case 'treatment':
          aValue = a.treatment.toLowerCase()
          bValue = b.treatment.toLowerCase()
          break
        default:
          aValue = new Date(a.date + 'T' + a.time)
          bValue = new Date(b.date + 'T' + b.time)
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [appointments, filterStatus, sortBy, sortOrder])

  const getStatusBadge = (status: Appointment['status']) => {
    const statusConfig = {
      scheduled: { text: 'Planlandı', bg: 'bg-yellow-100', textColor: 'text-yellow-800', border: 'border-yellow-300' },
      confirmed: { text: 'Onaylandı', bg: 'bg-green-100', textColor: 'text-green-800', border: 'border-green-300' },
      completed: { text: 'Tamamlandı', bg: 'bg-blue-100', textColor: 'text-blue-800', border: 'border-blue-300' },
      cancelled: { text: 'İptal Edildi', bg: 'bg-red-100', textColor: 'text-red-800', border: 'border-red-300' },
    }

    const config = statusConfig[status]
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.textColor} ${config.border} border`}>
        {config.text}
      </span>
    )
  }

  const getStatusIcon = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return (
          <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'confirmed':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'completed':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'cancelled':
        return (
          <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} dk`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) {
      return `${hours} sa`
    }
    return `${hours} sa ${remainingMinutes} dk`
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      {/* Filtreler ve Sıralama */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Durum Filtresi */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Durum:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tümü</option>
              <option value="scheduled">Planlandı</option>
              <option value="confirmed">Onaylandı</option>
              <option value="completed">Tamamlandı</option>
              <option value="cancelled">İptal Edildi</option>
            </select>
          </div>

          {/* Sıralama */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sırala:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Tarih</option>
              <option value="time">Saat</option>
              <option value="patientName">Hasta Adı</option>
              <option value="treatment">Tedavi</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {sortOrder === 'asc' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Randevu Listesi */}
      <div className="overflow-hidden">
        {filteredAndSortedAppointments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Randevu bulunamadı</h3>
            <p className="text-gray-500">
              {filterStatus !== 'all' ? 'Seçilen durumda randevu bulunmuyor' : 'Henüz randevu oluşturulmamış'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAndSortedAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                onClick={() => onAppointmentSelect(appointment)}
              >
                <div className="flex items-start justify-between">
                  {/* Sol Taraf - Tarih ve Saat */}
                  <div className="flex items-start space-x-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex flex-col items-center justify-center text-white">
                        <div className="text-xs font-medium">
                          {new Date(appointment.date).toLocaleDateString('tr-TR', { month: 'short' })}
                        </div>
                        <div className="text-lg font-bold">
                          {new Date(appointment.date).getDate()}
                        </div>
                      </div>
                      <div className="mt-2 text-sm font-medium text-gray-900">
                        {formatTime(appointment.time)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDuration(appointment.duration)}
                      </div>
                    </div>

                    {/* Hasta ve Tedavi Bilgileri */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.patientName}
                        </h3>
                        {getStatusBadge(appointment.status)}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">💊</span>
                          <span>{appointment.treatment}</span>
                        </div>
                        
                        {appointment.notes && (
                          <div className="flex items-start space-x-2">
                            <span className="text-gray-400 mt-0.5">📝</span>
                            <span className="line-clamp-2">{appointment.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sağ Taraf - Durum ve İkon */}
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {formatDate(appointment.date)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(appointment.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                      {getStatusIcon(appointment.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Özet Bilgi */}
      {filteredAndSortedAppointments.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Toplam {filteredAndSortedAppointments.length} randevu gösteriliyor
            </span>
            <span>
              {filterStatus !== 'all' && `(${filterStatus} durumunda)`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
