'use client'

import { useState, useMemo } from 'react'
import { Appointment } from '@/stores/appointmentStore'

interface AppointmentCalendarProps {
  appointments: Appointment[]
  selectedDate: string
  onDateSelect: (date: string) => void
  onAppointmentSelect: (appointment: Appointment) => void
  onEditAppointment: (appointment: Appointment) => void
  onDeleteAppointment: (appointment: Appointment) => void
}

export default function AppointmentCalendar({
  appointments,
  selectedDate,
  onDateSelect,
  onAppointmentSelect,
  onEditAppointment,
  onDeleteAppointment,
}: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Takvim için gerekli hesaplamalar
  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    // Ayın ilk günü
    const firstDay = new Date(year, month, 1)
    // Ayın son günü
    const lastDay = new Date(year, month + 1, 0)
    // Ayın ilk gününün haftanın hangi günü olduğu (0 = Pazar)
    const firstDayOfWeek = firstDay.getDay()
    // Ayın toplam gün sayısı
    const totalDays = lastDay.getDate()
    
    // Takvim grid'i için gerekli gün sayısı
    const totalCells = Math.ceil((firstDayOfWeek + totalDays) / 7) * 7
    
    const days = []
    
    // Önceki ayın günleri
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({
        date: prevDate.toISOString().split('T')[0],
        isCurrentMonth: false,
        isToday: prevDate.toISOString().split('T')[0] === new Date().toISOString().split('T')[0],
        isSelected: prevDate.toISOString().split('T')[0] === selectedDate,
      })
    }
    
    // Mevcut ayın günleri
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day)
      days.push({
        date: date.toISOString().split('T')[0],
        isCurrentMonth: true,
        isToday: date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0],
        isSelected: date.toISOString().split('T')[0] === selectedDate,
      })
    }
    
    // Sonraki ayın günleri
    const remainingCells = totalCells - days.length
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i)
      days.push({
        date: nextDate.toISOString().split('T')[0],
        isCurrentMonth: false,
        isToday: nextDate.toISOString().split('T')[0] === new Date().toISOString().split('T')[0],
        isSelected: nextDate.toISOString().split('T')[0] === selectedDate,
      })
    }
    
    return days
  }, [currentMonth, selectedDate])

  // Seçili gün için randevular
  const selectedDateAppointments = useMemo(() => {
    return appointments.filter(apt => apt.date === selectedDate)
  }, [appointments, selectedDate])

  // Ay navigasyonu
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    onDateSelect(today.toISOString().split('T')[0])
  }

  // Gün için randevu sayısı
  const getAppointmentCount = (date: string) => {
    return appointments.filter(apt => apt.date === date).length
  }

  // Gün için randevu durumu rengi
  const getDayStatusColor = (date: string) => {
    const dayAppointments = appointments.filter(apt => apt.date === date)
    if (dayAppointments.length === 0) return ''
    
    const hasConfirmed = dayAppointments.some(apt => apt.status === 'confirmed')
    const hasScheduled = dayAppointments.some(apt => apt.status === 'scheduled')
    const hasCompleted = dayAppointments.some(apt => apt.status === 'completed')
    const hasCancelled = dayAppointments.some(apt => apt.status === 'cancelled')
    
    if (hasCompleted) return 'bg-green-100 border-green-300'
    if (hasConfirmed) return 'bg-blue-100 border-blue-300'
    if (hasScheduled) return 'bg-yellow-100 border-yellow-300'
    if (hasCancelled) return 'bg-red-100 border-red-300'
    return 'bg-gray-100 border-gray-300'
  }

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]

  const dayNames = ['Pzr', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      {/* Takvim Başlığı */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
          >
            Bugün
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Hafta Başlıkları */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((dayName, index) => (
          <div key={index} className="text-center py-2 text-sm font-semibold text-gray-600">
            {dayName}
          </div>
        ))}
      </div>

      {/* Takvim Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarData.map((day, index) => (
          <div
            key={index}
            className={`min-h-[120px] p-2 border rounded-lg cursor-pointer transition-all duration-200 ${
              day.isCurrentMonth
                ? 'hover:bg-blue-50 hover:border-blue-300'
                : 'bg-gray-50 text-gray-400'
            } ${
              day.isToday
                ? 'ring-2 ring-blue-500 ring-opacity-50'
                : ''
            } ${
              day.isSelected
                ? 'bg-blue-100 border-blue-400'
                : ''
            } ${getDayStatusColor(day.date)}`}
            onClick={() => onDateSelect(day.date)}
          >
            {/* Gün Numarası */}
            <div className="text-right mb-1">
              <span className={`text-sm font-medium ${
                day.isToday ? 'text-blue-600 font-bold' : ''
              }`}>
                {new Date(day.date).getDate()}
              </span>
            </div>

            {/* Randevular */}
            <div className="space-y-1">
              {appointments
                .filter(apt => apt.date === day.date)
                .slice(0, 3) // Maksimum 3 randevu göster
                .map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`text-xs p-1 rounded cursor-pointer ${
                      appointment.status === 'confirmed' ? 'bg-green-200 text-green-800' :
                      appointment.status === 'scheduled' ? 'bg-yellow-200 text-yellow-800' :
                      appointment.status === 'completed' ? 'bg-blue-200 text-blue-800' :
                      'bg-red-200 text-red-800'
                    } hover:opacity-80 transition-opacity duration-200`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onAppointmentSelect(appointment)
                    }}
                  >
                    <div className="font-medium truncate">{appointment.time}</div>
                    <div className="truncate">{appointment.patientName}</div>
                  </div>
                ))}
              
              {/* Daha fazla randevu varsa göster */}
              {getAppointmentCount(day.date) > 3 && (
                <div className="text-xs text-gray-500 text-center bg-gray-100 rounded p-1">
                  +{getAppointmentCount(day.date) - 3} daha
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Seçili Gün Detayları */}
      {selectedDateAppointments.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            {new Date(selectedDate).toLocaleDateString('tr-TR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} - Randevular
          </h3>
          <div className="space-y-2">
            {selectedDateAppointments
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-blue-100 transition-colors duration-200 group"
                  onClick={() => onAppointmentSelect(appointment)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="font-medium text-gray-900">{appointment.time}</p>
                      <p className="text-sm text-gray-600">{appointment.patientName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{appointment.treatment}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status === 'confirmed' ? 'Onaylandı' :
                         appointment.status === 'scheduled' ? 'Bekliyor' :
                         appointment.status === 'completed' ? 'Tamamlandı' :
                         'İptal Edildi'}
                      </span>
                    </div>
                    
                    {/* Aksiyon Butonları */}
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditAppointment(appointment)
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Düzenle"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm(`${appointment.patientName} adlı hastanın randevusunu silmek istediğinizden emin misiniz?`)) {
                            onDeleteAppointment(appointment)
                          }
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Sil"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
