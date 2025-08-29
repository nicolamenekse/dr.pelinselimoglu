'use client'

import { useState, useEffect } from 'react'
import { Appointment } from '@/stores/appointmentStore'
import { Patient } from '@/stores/patientStore'
import { useAppointmentStore } from '@/stores/appointmentStore'

interface AppointmentFormProps {
  appointment?: Appointment | null
  patients: Patient[]
  onClose: () => void
}

export default function AppointmentForm({ appointment, patients, onClose }: AppointmentFormProps) {
  const { addAppointment, updateAppointment, deleteAppointment } = useAppointmentStore()
  
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 60,
    treatment: '',
    notes: '',
    status: 'scheduled' as const,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Mevcut randevu varsa formu doldur
  useEffect(() => {
    if (appointment) {
      setFormData({
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration,
        treatment: appointment.treatment,
        notes: appointment.notes || '',
        status: appointment.status,
      })
    }
  }, [appointment])

  // Hasta seçildiğinde ismini otomatik doldur
  const handlePatientChange = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId)
    setFormData(prev => ({
      ...prev,
      patientId,
      patientName: patient ? patient.name : '',
    }))
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
    
    // Hata mesajını temizle
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.patientId) {
      newErrors.patientId = 'Hasta seçimi zorunludur'
    }
    if (!formData.date) {
      newErrors.date = 'Tarih seçimi zorunludur'
    }
    if (!formData.time) {
      newErrors.time = 'Saat seçimi zorunludur'
    }
    if (!formData.treatment) {
      newErrors.treatment = 'Tedavi bilgisi zorunludur'
    }
    if (formData.duration <= 0) {
      newErrors.duration = 'Süre 0\'dan büyük olmalıdır'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      if (appointment) {
        // Mevcut randevuyu güncelle
        updateAppointment(appointment.id, formData)
      } else {
        // Yeni randevu ekle
        addAppointment(formData)
      }
      
      onClose()
    } catch (error) {
      console.error('Randevu kaydedilirken hata:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = () => {
    if (appointment && confirm('Bu randevuyu silmek istediğinizden emin misiniz?')) {
      deleteAppointment(appointment.id)
      onClose()
    }
  }

  // Saat seçenekleri (09:00 - 18:00 arası, 30 dakika aralıklarla)
  const timeSlots = []
  for (let hour = 9; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      timeSlots.push(time)
    }
  }

  // Süre seçenekleri
  const durationOptions = [30, 45, 60, 90, 120, 180]

  // Tedavi seçenekleri
  const treatmentOptions = [
    'Dudak dolgusu',
    'Mezoterapi',
    'Botoks',
    'Dolgu Eritme',
    'Konsültasyon',
    'Kontrol',
    'Diğer'
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {appointment ? 'Randevu Düzenle' : 'Yeni Randevu'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Hasta Seçimi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hasta *
            </label>
            <select
              value={formData.patientId}
              onChange={(e) => handlePatientChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.patientId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Hasta seçin</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} - {patient.phone}
                </option>
              ))}
            </select>
            {errors.patientId && (
              <p className="mt-1 text-sm text-red-600">{errors.patientId}</p>
            )}
          </div>

          {/* Tarih ve Saat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarih *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Saat *
              </label>
              <select
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.time ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.time && (
                <p className="mt-1 text-sm text-red-600">{errors.time}</p>
              )}
            </div>
          </div>

          {/* Süre ve Tedavi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Süre (dakika) *
              </label>
              <select
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.duration ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {durationOptions.map((duration) => (
                  <option key={duration} value={duration}>
                    {duration} dakika
                  </option>
                ))}
              </select>
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tedavi *
              </label>
              <select
                value={formData.treatment}
                onChange={(e) => handleInputChange('treatment', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.treatment ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Tedavi seçin</option>
                {treatmentOptions.map((treatment) => (
                  <option key={treatment} value={treatment}>
                    {treatment}
                  </option>
                ))}
              </select>
              {errors.treatment && (
                <p className="mt-1 text-sm text-red-600">{errors.treatment}</p>
              )}
            </div>
          </div>

          {/* Durum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durum
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="scheduled">Planlandı</option>
              <option value="confirmed">Onaylandı</option>
              <option value="completed">Tamamlandı</option>
              <option value="cancelled">İptal Edildi</option>
            </select>
          </div>

          {/* Notlar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notlar
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Randevu ile ilgili notlar..."
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex space-x-3">
              {appointment && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                >
                  Sil
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Kaydediliyor...
                  </>
                ) : (
                  appointment ? 'Güncelle' : 'Kaydet'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
