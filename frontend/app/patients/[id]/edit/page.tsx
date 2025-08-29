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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hasta Bilgilerini Düzenle</h1>
              <p className="mt-2 text-gray-600">
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

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= activeStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < activeStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 text-sm text-gray-600">
            <span className={activeStep === 1 ? 'text-blue-600 font-medium' : ''}>Kişisel Bilgiler</span>
            <span className="mx-2">•</span>
            <span className={activeStep === 2 ? 'text-blue-600 font-medium' : ''}>Tedavi Bilgileri</span>
            <span className="mx-2">•</span>
            <span className={activeStep === 3 ? 'text-blue-600 font-medium' : ''}>Fotoğraflar</span>
            <span className="mx-2">•</span>
            <span className={activeStep === 4 ? 'text-blue-600 font-medium' : ''}>Önizleme</span>
          </div>
        </div>

        <div className="space-y-8">
          {/* Step 1: Personal Information */}
          {activeStep === 1 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">👤</span>
                Kişisel Bilgiler
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Hasta adı ve soyadı"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="05XX XXX XX XX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="hasta@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doğum Tarihi
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cinsiyet
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="female">Kadın</option>
                    <option value="male">Erkek</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Hasta adresi"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Treatment Information */}
          {activeStep === 2 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">💊</span>
                Tedavi Bilgileri
              </h2>
              
              <div className="space-y-6">
                {/* Treatment Categories */}
                {Object.entries(treatmentCategories).map(([category, treatments]) => (
                  <div key={category} className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {treatments.map((treatment) => (
                        <label key={treatment} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.selectedTreatments.includes(treatment)}
                            onChange={() => handleTreatmentToggle(treatment)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{treatment}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Treatment Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tedavi Notları
                  </label>
                  <textarea
                    name="treatmentNotes"
                    value={formData.treatmentNotes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tedavi ile ilgili notlar..."
                  />
                </div>
                
                {/* Randevu Bilgileri */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <input
                      type="checkbox"
                      id="hasAppointment"
                      checked={formData.hasAppointment}
                      onChange={(e) => setFormData(prev => ({ ...prev, hasAppointment: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="hasAppointment" className="text-lg font-medium text-gray-900">
                      Hasta için randevu oluştur
                    </label>
                  </div>
                  
                  {formData.hasAppointment && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Randevu Tarihi *
                        </label>
                        <input
                          type="date"
                          value={formData.appointmentDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Randevu Saati *
                        </label>
                        <select
                          value={formData.appointmentTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {Array.from({ length: 20 }, (_, i) => {
                            const hour = Math.floor(i / 2) + 9
                            const minute = (i % 2) * 30
                            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
                            return (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            )
                          })}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Süre (dakika) *
                        </label>
                        <select
                          value={formData.appointmentDuration}
                          onChange={(e) => setFormData(prev => ({ ...prev, appointmentDuration: parseInt(e.target.value) }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value={30}>30 dakika</option>
                          <option value={45}>45 dakika</option>
                          <option value={60}>60 dakika</option>
                          <option value={90}>90 dakika</option>
                          <option value={120}>120 dakika</option>
                          <option value={180}>180 dakika</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          İşlem Türü *
                        </label>
                        <select
                          value={formData.appointmentTreatment}
                          onChange={(e) => setFormData(prev => ({ ...prev, appointmentTreatment: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">İşlem seçiniz</option>
                          {formData.selectedTreatments.length > 0 ? (
                            formData.selectedTreatments.map((treatment) => (
                              <option key={treatment} value={treatment}>
                                {treatment}
                              </option>
                            ))
                          ) : (
                            <option value="Konsültasyon">Konsültasyon</option>
                          )}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Randevu Notları
                        </label>
                        <textarea
                          value={formData.appointmentNotes}
                          onChange={(e) => setFormData(prev => ({ ...prev, appointmentNotes: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={2}
                          placeholder="Randevu ile ilgili notlar..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Photos */}
          {activeStep === 3 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">📸</span>
                Fotoğraflar
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Before Photos */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Öncesi Fotoğraflar</h3>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'before')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-4 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Öncesi Fotoğraf Ekle
                  </button>
                  
                  {formData.beforePhotos.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {formData.beforePhotos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={photo}
                            alt={`Öncesi ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-blue-200"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index, 'before')}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* After Photos */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Sonrası Fotoğraflar</h3>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'after')}
                    className="hidden"
                    id="after-photos"
                  />
                  <label
                    htmlFor="after-photos"
                    className="w-full p-4 border-2 border-dashed border-green-300 rounded-lg text-green-600 hover:border-green-400 hover:bg-green-50 transition-colors duration-200 cursor-pointer block"
                  >
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Sonrası Fotoğraf Ekle
                  </label>
                  
                  {formData.afterPhotos.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {formData.afterPhotos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={photo}
                            alt={`Sonrası ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-green-200"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index, 'after')}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preview and Additional Info */}
          {activeStep === 4 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">📋</span>
                Önizleme ve Ek Bilgiler
              </h2>

              <div className="space-y-6">
                {/* Patient Info Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Hasta Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Ad Soyad:</strong> {formData.name || 'Belirtilmedi'}</div>
                    <div><strong>Telefon:</strong> {formData.phone || 'Belirtilmedi'}</div>
                    <div><strong>E-posta:</strong> {formData.email || 'Belirtilmedi'}</div>
                    <div><strong>Cinsiyet:</strong> {formData.gender === 'female' ? 'Kadın' : 'Erkek'}</div>
                    {formData.birthDate && (
                      <div><strong>Doğum Tarihi:</strong> {new Date(formData.birthDate).toLocaleDateString('tr-TR')}</div>
                    )}
                    {formData.address && (
                      <div className="md:col-span-2"><strong>Adres:</strong> {formData.address}</div>
                    )}
                  </div>
                </div>

                {/* Selected Treatments */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Seçilen Tedaviler</h3>
                  {formData.selectedTreatments.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.selectedTreatments.map((treatment) => (
                        <span key={treatment} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {treatment}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Henüz tedavi seçilmedi</p>
                  )}
                  {formData.treatmentNotes && (
                    <div className="mt-3">
                      <strong>Tedavi Notları:</strong>
                      <p className="text-sm text-gray-700 mt-1">{formData.treatmentNotes}</p>
                    </div>
                  )}
                </div>

                {/* Photo Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Fotoğraflar</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Öncesi:</strong> {formData.beforePhotos.length} fotoğraf
                    </div>
                    <div>
                      <strong>Sonrası:</strong> {formData.afterPhotos.length} fotoğraf
                    </div>
                  </div>
                </div>
                
                {/* Appointment Summary */}
                {formData.hasAppointment && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="text-lg font-medium text-blue-900 mb-3">📅 Randevu Bilgileri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div><strong>Tarih:</strong> {new Date(formData.appointmentDate).toLocaleDateString('tr-TR')}</div>
                      <div><strong>Saat:</strong> {formData.appointmentTime}</div>
                      <div><strong>Süre:</strong> {formData.appointmentDuration} dakika</div>
                      <div><strong>İşlem:</strong> {formData.appointmentTreatment || 'Belirtilmedi'}</div>
                      {formData.appointmentNotes && (
                        <div className="md:col-span-2"><strong>Notlar:</strong> {formData.appointmentNotes}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Medical Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alerjiler
                    </label>
                    <textarea
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Bilinen alerjiler..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kullandığı İlaçlar
                    </label>
                    <textarea
                      name="medications"
                      value={formData.medications}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Düzenli kullanılan ilaçlar..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tıbbi Geçmiş
                    </label>
                    <textarea
                      name="medicalHistory"
                      value={formData.medicalHistory}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Önemli tıbbi geçmiş..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Genel Notlar
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Genel notlar..."
                    />
                  </div>
                </div>

                {/* Final Submit Section */}
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <h3 className="text-lg font-medium text-blue-900 mb-3">✅ Önizleme Tamamlandı</h3>
                  <p className="text-blue-700 text-sm mb-4">
                    Tüm bilgileri kontrol ettiniz. Değişiklik yapmak istiyorsanız önceki adımlara dönebilir, 
                    onaylıyorsanız aşağıdaki "Güncelle" butonuna tıklayabilirsiniz.
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-blue-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Form validasyonu: {formData.name.trim() && formData.phone.trim() ? '✅ Geçerli' : '❌ Eksik bilgi'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={activeStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                activeStep === 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Önceki
            </button>

            {activeStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary px-6 py-3"
              >
                Sonraki
                <svg className="w-5 h-5 ml-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="btn-primary px-8 py-3"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Güncelleniyor...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Güncelle
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
