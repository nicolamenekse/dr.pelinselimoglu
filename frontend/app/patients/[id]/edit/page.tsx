'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/Header'
import { useAuthStore } from '@/stores/authStore'
import { usePatientStore, Patient } from '@/stores/patientStore'
import { useAppointmentStore } from '@/stores/appointmentStore'

export default function EditPatientPage() {
  const router = useRouter()
  const params = useParams()
  const { user, checkAuth, isLoading: authLoading } = useAuthStore()
  const { getPatient, updatePatient } = usePatientStore()
  const { addAppointment } = useAppointmentStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  const [patient, setPatient] = useState<Patient | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    birthDate: '',
    gender: 'female' as 'female' | 'male',
    address: '',
    selectedTreatments: [] as string[],
    treatmentNotes: '',
    beforePhotos: [] as string[],
    afterPhotos: [] as string[],
    allergies: '',
    medications: '',
    medicalHistory: '',
    notes: '',
    hasAppointment: false,
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '09:00',
    appointmentDuration: 60,
    appointmentTreatment: '',
    appointmentNotes: ''
  })

  // Treatment categories
  const treatmentCategories = {
    'Dudak dolgusu': ['Juviderm', 'Teosyal', 'Eleguine Deep'],
    'Mezoterapi': ['Monako (nem)', 'Plural', 'Clear'],
    'Botoks': ['Yarı yüz', 'Tüm yüz + Massater', 'Tüm yüz', 'Alt yüz', 'Sadece Masseter', 'Nefertiti (Boyun)'],
    'Dolgu Eritme': ['Dudak', 'Göz altı', 'Yanak', 'Çene']
  }

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

  useEffect(() => {
    if (params.id && typeof params.id === 'string') {
      const foundPatient = getPatient(params.id)
      if (foundPatient) {
        setPatient(foundPatient)
        // Pre-populate form with existing data
        setFormData({
          name: foundPatient.name,
          phone: foundPatient.phone,
          email: foundPatient.email,
          birthDate: foundPatient.birthDate,
          gender: foundPatient.gender,
          address: foundPatient.address,
          selectedTreatments: foundPatient.selectedTreatments,
          treatmentNotes: foundPatient.treatmentNotes,
          beforePhotos: foundPatient.beforePhotos,
          afterPhotos: foundPatient.afterPhotos,
          allergies: foundPatient.allergies,
          medications: foundPatient.medications,
          medicalHistory: foundPatient.medicalHistory,
          notes: foundPatient.notes,
          hasAppointment: false,
          appointmentDate: new Date().toISOString().split('T')[0],
          appointmentTime: '09:00',
          appointmentDuration: 60,
          appointmentTreatment: '',
          appointmentNotes: ''
        })
      } else {
        router.push('/patients?error=not-found')
      }
    }
  }, [params.id, getPatient, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTreatmentToggle = (treatment: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTreatments: prev.selectedTreatments.includes(treatment)
        ? prev.selectedTreatments.filter(t => t !== treatment)
        : [...prev.selectedTreatments, treatment]
    }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const newPhotos = files.map(file => URL.createObjectURL(file))
      setFormData(prev => ({
        ...prev,
        [type === 'before' ? 'beforePhotos' : 'afterPhotos']: [...prev[type === 'before' ? 'beforePhotos' : 'afterPhotos'], ...newPhotos]
      }))
    }
  }

  const removePhoto = (index: number, type: 'before' | 'after') => {
    setFormData(prev => ({
      ...prev,
      [type === 'before' ? 'beforePhotos' : 'afterPhotos']: prev[type === 'before' ? 'beforePhotos' : 'afterPhotos'].filter((_, i) => i !== index)
    }))
  }

  const nextStep = () => {
    if (activeStep < 4) {
      setActiveStep(activeStep + 1)
    }
  }

  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      // Form validation
      if (!formData.name.trim() || !formData.phone.trim()) {
        throw new Error('Ad ve telefon alanları zorunludur')
      }

      if (!patient) {
        throw new Error('Hasta bulunamadı')
      }

      // Update patient data
      const updatedPatientData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        birthDate: formData.birthDate,
        gender: formData.gender,
        address: formData.address.trim(),
        selectedTreatments: formData.selectedTreatments,
        treatmentNotes: formData.treatmentNotes.trim(),
        beforePhotos: formData.beforePhotos,
        afterPhotos: formData.afterPhotos,
        photos: patient.photos || [], // Preserve existing photos or initialize empty array
        allergies: formData.allergies.trim(),
        medications: formData.medications.trim(),
        medicalHistory: formData.medicalHistory.trim(),
        notes: formData.notes.trim()
      }

      // Update in store
      updatePatient(patient.id, updatedPatientData)

      // Create appointment if requested
      if (formData.hasAppointment) {
        const appointmentData = {
          patientId: patient.id,
          patientName: formData.name.trim(),
          date: formData.appointmentDate,
          time: formData.appointmentTime,
          duration: formData.appointmentDuration,
          treatment: formData.appointmentTreatment || (formData.selectedTreatments.length > 0 ? formData.selectedTreatments[0] : 'Konsültasyon'),
          notes: formData.appointmentNotes,
          status: 'scheduled' as const
        }
        addAppointment(appointmentData)
      }

      // Success - redirect to patient detail
      router.push(`/patients/${patient.id}?success=updated`)
    } catch (error) {
      console.error('Error updating patient:', error)
      alert(error instanceof Error ? error.message : 'Hasta güncellenirken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Hasta bilgileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      <main className="w-full max-w-none py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-100">Hasta Bilgilerini Düzenle</h1>
              <p className="mt-2 text-slate-400">
                {patient.name} - Bilgileri güncelleyin
              </p>
            </div>
            <button
              onClick={() => router.push(`/patients/${patient.id}`)}
              className="btn-secondary"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Geri Dön
            </button>
          </div>
        </div>

        {/* Tek Sayfa 3 Sütun Düzen */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Sol Sütun: Kişisel Bilgiler + Fotoğraflar */}
          <div className="xl:col-span-3">
            <div className="space-y-4">
              <section className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-md rounded-2xl shadow-xl border border-slate-600/50 p-6">
                <div className="flex items-center space-x-3 mb-5">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white font-serif">👤 Kişisel Bilgiler</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Ad Soyad *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2.5 bg-slate-700/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 text-sm"
                      placeholder="Hasta adı ve soyadı"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Doğum Tarihi</label>
                      <input
                        type="date"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 bg-slate-700/80 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Cinsiyet</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 bg-slate-700/80 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 text-sm"
                      >
                        <option value="female">Kadın</option>
                        <option value="male">Erkek</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Telefon *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2.5 bg-slate-700/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 text-sm"
                        placeholder="05XX XXX XX XX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">E-posta</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 bg-slate-700/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 text-sm"
                        placeholder="ornek@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Adres</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2.5 bg-slate-700/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 text-sm resize-none"
                      placeholder="Hasta adresi"
                    />
                  </div>
                </div>
              </section>
              <section className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-md rounded-2xl shadow-xl border border-slate-600/50 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white font-serif">📸 Fotoğraflar</h2>
                </div>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Tedavi Öncesi</h3>
                  <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={(e) => handlePhotoUpload(e, 'before')} className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full py-2 px-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg">📷 Fotoğraf Seç</button>
                  {formData.beforePhotos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {formData.beforePhotos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img src={photo} alt={`Before ${index + 1}`} className="w-full h-16 object-cover rounded-lg border-2 border-blue-300" />
                          <button type="button" onClick={() => removePhoto(index, 'before')} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs hover:bg-red-600">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Tedavi Sonrası</h3>
                  <input type="file" multiple accept="image/*" onChange={(e) => handlePhotoUpload(e, 'after')} className="hidden" id="after-photos" />
                  <label htmlFor="after-photos" className="w-full py-2 px-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 shadow-lg cursor-pointer text-center block">📷 Fotoğraf Seç</label>
                  {formData.afterPhotos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {formData.afterPhotos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img src={photo} alt={`After ${index + 1}`} className="w-full h-16 object-cover rounded-lg border-2 border-emerald-300" />
                          <button type="button" onClick={() => removePhoto(index, 'after')} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs hover:bg-red-600">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Orta Sütun: Tedavi Seçimi */}
          <div className="xl:col-span-6">
            <section className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-md rounded-2xl shadow-xl border border-slate-600/50 p-6 h-full">
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white font-serif">💊 Tedavi Seçimi</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(treatmentCategories).map(([category, treatments]) => (
                  <div key={category} className="bg-gradient-to-br from-slate-700/50 to-slate-600/50 rounded-xl p-3 border border-slate-500/30">
                    <h3 className="text-base font-bold text-white mb-3 text-center">{category}</h3>
                    <div className="space-y-2">
                      {treatments.map((treatment) => (
                        <div key={treatment} className="flex flex-col items-center space-y-2">
                          <button
                            type="button"
                            onClick={() => handleTreatmentToggle(treatment)}
                            className={`w-full max-w-xs py-2 px-3 rounded-lg transition-all duration-300 cursor-pointer font-medium text-sm text-center ${
                              formData.selectedTreatments.includes(treatment)
                                ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg transform scale-105'
                                : 'bg-slate-600/50 text-slate-200 hover:bg-slate-600 hover:text-white hover:shadow-md border border-slate-500/50'
                            }`}
                          >
                            <span>{treatment}</span>
                          </button>
                          {formData.selectedTreatments.includes(treatment) && (
                            <button type="button" onClick={() => handleTreatmentToggle(treatment)} className="px-2 py-1 text-xs bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-md hover:from-red-600 hover:to-rose-600 hover:scale-105 transition-all duration-200 font-medium shadow-sm">❌ Kaldır</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Tedavi Notları</label>
                <textarea name="treatmentNotes" value={formData.treatmentNotes} onChange={handleInputChange} rows={3} className="w-full px-3 py-2.5 bg-slate-700/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 transition-all duration-300 text-sm" placeholder="Tedavi ile ilgili notlar..." />
              </div>
            </section>
          </div>

          {/* Sağ Sütun: Randevu */}
          <div className="xl:col-span-3">
            <section className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-md rounded-2xl shadow-xl border border-slate-600/50 p-6 h-full">
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white font-serif">📅 Randevu</h2>
              </div>
              <div className="flex items-center space-x-2 mb-4">
                <input type="checkbox" id="hasAppointment" checked={formData.hasAppointment} onChange={(e) => setFormData(prev => ({ ...prev, hasAppointment: e.target.checked }))} className="h-4 w-4 text-indigo-500 focus:ring-indigo-500 border-slate-600 bg-slate-800 rounded" />
                <label htmlFor="hasAppointment" className="text-sm font-medium text-slate-200">Randevu oluştur</label>
              </div>
              {formData.hasAppointment && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Tarih</label>
                      <input type="date" value={formData.appointmentDate} onChange={(e) => setFormData(prev => ({ ...prev, appointmentDate: e.target.value }))} min={new Date().toISOString().split('T')[0]} className="w-full px-2 py-2 bg-slate-700/80 border border-slate-600/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Saat</label>
                      <select value={formData.appointmentTime} onChange={(e) => setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))} className="w-full px-2 py-2 bg-slate-700/80 border border-slate-600/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400">
                        {Array.from({ length: 20 }, (_, i) => {
                          const hour = Math.floor(i / 2) + 9
                          const minute = (i % 2) * 30
                          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
                          return <option key={time} value={time}>{time}</option>
                        })}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Süre</label>
                    <select value={formData.appointmentDuration} onChange={(e) => setFormData(prev => ({ ...prev, appointmentDuration: parseInt(e.target.value) }))} className="w-full px-2 py-2 bg-slate-700/80 border border-slate-600/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400">
                      <option value={30}>30dk</option>
                      <option value={45}>45dk</option>
                      <option value={60}>60dk</option>
                      <option value={90}>90dk</option>
                      <option value={120}>120dk</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">İşlem</label>
                    <select value={formData.appointmentTreatment} onChange={(e) => setFormData(prev => ({ ...prev, appointmentTreatment: e.target.value }))} className="w-full px-2 py-2 bg-slate-700/80 border border-slate-600/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400">
                      <option value="">İşlem seçiniz</option>
                      {formData.selectedTreatments.length > 0 ? (
                        formData.selectedTreatments.map((t) => (<option key={t} value={t}>{t}</option>))
                      ) : (
                        <option value="Konsültasyon">Konsültasyon</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Not</label>
                    <textarea value={formData.appointmentNotes} onChange={(e) => setFormData(prev => ({ ...prev, appointmentNotes: e.target.value }))} rows={2} className="w-full px-2 py-2 bg-slate-700/80 border border-slate-600/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" placeholder="Randevu notu..." />
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Kaydet Butonu */}
        <div className="flex justify-center pt-6">
          <button type="button" onClick={handleSubmit} disabled={isLoading} className="px-12 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-bold rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Güncelleniyor...</span>
              </div>
            ) : (
              '✅ Değişiklikleri Kaydet'
            )}
          </button>
        </div>
      </main>
    </div>
  )
}
