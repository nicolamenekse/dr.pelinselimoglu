'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useAuthStore } from '@/stores/authStore'
import { usePatientStore } from '@/stores/patientStore'
import { useAppointmentStore } from '@/stores/appointmentStore'

interface TreatmentCategory {
  id: string
  name: string
  treatments: string[]
}

interface PatientFormData {
  // Kişisel Bilgiler
  name: string
  phone: string
  email: string
  birthDate: string
  gender: 'female' | 'male'
  address: string
  
  // Tedavi Bilgileri
  selectedTreatments: string[]
  treatmentNotes: string
  
  // Fotoğraflar
  beforePhotos: File[]
  afterPhotos: File[]
  
  // Ek Bilgiler
  allergies: string
  medications: string
  medicalHistory: string
  notes: string
  
  // Randevu Bilgileri
  hasAppointment: boolean
  appointmentDate: string
  appointmentTime: string
  appointmentDuration: number
  appointmentTreatment: string
  appointmentNotes: string
}

export default function NewPatientPage() {
  const router = useRouter()
  const { user, checkAuth, isLoading: authLoading } = useAuthStore()
  const { addPatient } = usePatientStore()
  const { addAppointment } = useAppointmentStore()
  const [isLoading, setIsLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    phone: '',
    email: '',
    birthDate: '',
    gender: 'female',
    address: '',
    selectedTreatments: [],
    treatmentNotes: '',
    beforePhotos: [],
    afterPhotos: [],
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

  const treatmentCategories: TreatmentCategory[] = [
    {
      id: 'dudak-dolgusu',
      name: 'Dudak Dolgusu',
      treatments: ['Juviderm', 'Teosyal', 'Elegance']
    },
    {
      id: 'mezoterapi',
      name: 'Mezoterapi',
      treatments: ['Monako (Nem)', 'Pluryal', 'Clear']
    },
    {
      id: 'botoks',
      name: 'Botoks',
      treatments: [
        'Yarı Yüz',
        'Tüm Yüz + Masseter',
        'Tüm Yüz',
        'Alt Yüz',
        'Sadece Masseter',
        'Nefertiti (Boyun)'
      ]
    },
    {
      id: 'dolgu-eritme',
      name: 'Dolgu Eritme',
      treatments: ['Dudak', 'Göz Altı', 'Yanak', 'Çene']
    }
  ]

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    // Sadece checkAuth tamamlandıktan sonra yönlendirme yap
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleInputChange = (field: keyof PatientFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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

  const handlePhotoUpload = (type: 'before' | 'after', files: FileList) => {
    const fileArray = Array.from(files)
    if (type === 'before') {
      setFormData(prev => ({
        ...prev,
        beforePhotos: [...prev.beforePhotos, ...fileArray]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        afterPhotos: [...prev.afterPhotos, ...fileArray]
      }))
    }
  }

  const removePhoto = (type: 'before' | 'after', index: number) => {
    if (type === 'before') {
      setFormData(prev => ({
        ...prev,
        beforePhotos: prev.beforePhotos.filter((_, i) => i !== index)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        afterPhotos: prev.afterPhotos.filter((_, i) => i !== index)
      }))
    }
  }

  const nextStep = () => setActiveStep(prev => Math.min(prev + 1, 4))
  const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 1))

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      // Form validation
      if (!formData.name.trim() || !formData.phone.trim()) {
        throw new Error('Ad ve telefon alanları zorunludur')
      }

      // Convert files to base64 strings for storage (in real app, upload to server)
      const beforePhotoUrls = await Promise.all(
        formData.beforePhotos.map(file => fileToBase64(file))
      )
      const afterPhotoUrls = await Promise.all(
        formData.afterPhotos.map(file => fileToBase64(file))
      )

      // Create patient data
      const patientData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        birthDate: formData.birthDate,
        gender: formData.gender,
        address: formData.address.trim(),
        selectedTreatments: formData.selectedTreatments,
        treatmentNotes: formData.treatmentNotes.trim(),
        beforePhotos: beforePhotoUrls,
        afterPhotos: afterPhotoUrls,
        allergies: formData.allergies.trim(),
        medications: formData.medications.trim(),
        medicalHistory: formData.medicalHistory.trim(),
        notes: formData.notes.trim()
      }

      // Save to store
      addPatient(patientData)
      
      // Create appointment if requested
      if (formData.hasAppointment) {
        const appointmentData = {
          patientId: crypto.randomUUID(), // Generate temporary ID
          patientName: patientData.name,
          date: formData.appointmentDate,
          time: formData.appointmentTime,
          duration: formData.appointmentDuration,
          treatment: formData.appointmentTreatment || (formData.selectedTreatments.length > 0 ? formData.selectedTreatments[0] : 'Konsültasyon'),
          notes: formData.appointmentNotes,
          status: 'scheduled' as const
        }
        
        addAppointment(appointmentData)
      }
      
      // Success - redirect to patients list
      router.push('/patients?success=true')
    } catch (error) {
      console.error('Error saving patient:', error)
      alert(error instanceof Error ? error.message : 'Hasta kaydedilirken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-600 border-t-slate-300"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mb-6 shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-serif">
            Yeni Hasta Kaydı
          </h1>
          <p className="text-slate-300 text-xl font-light max-w-2xl mx-auto">
            Yeni hasta bilgilerini sisteme ekleyin ve tedavi planını oluşturun.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold font-serif transition-all duration-300 ${
                  step <= activeStep 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-110' 
                    : 'bg-slate-700 text-slate-300 border border-slate-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-20 h-1 mx-4 rounded-full transition-all duration-300 ${
                    step < activeStep ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-sm text-slate-400 max-w-2xl mx-auto">
            <span className="font-medium">Kişisel Bilgiler</span>
            <span className="font-medium">Tedavi Seçimi</span>
            <span className="font-medium">Fotoğraflar</span>
            <span className="font-medium">Önizleme</span>
          </div>
        </div>

        <div className="space-y-8">
          {/* Step 1: Personal Information */}
          {activeStep === 1 && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl shadow-2xl border border-slate-600 p-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white font-serif">Kişisel Bilgiler</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Hasta adı ve soyadı"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="+90 555 123 4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="hasta@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Doğum Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Cinsiyet
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="female">Kadın</option>
                    <option value="male">Erkek</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Adres
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                    rows={3}
                    placeholder="Hasta adresi"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Treatment Selection */}
          {activeStep === 2 && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl shadow-2xl border border-slate-600 p-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white font-serif">Tedavi Seçimi</h2>
              </div>
              
              <div className="space-y-8">
                {treatmentCategories.map((category) => (
                  <div key={category.id} className="border border-slate-600 rounded-2xl p-6 bg-slate-750">
                    <h3 className="text-xl font-bold text-white mb-4 font-serif">{category.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.treatments.map((treatment) => (
                        <label key={treatment} className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={formData.selectedTreatments.includes(treatment)}
                            onChange={() => handleTreatmentToggle(treatment)}
                            className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-slate-500 rounded-lg bg-slate-700"
                          />
                          <span className="text-slate-200 group-hover:text-white transition-colors duration-200">{treatment}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Tedavi Notları
                  </label>
                  <textarea
                    value={formData.treatmentNotes}
                    onChange={(e) => handleInputChange('treatmentNotes', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 resize-none"
                    rows={4}
                    placeholder="Tedavi ile ilgili özel notlar, beklentiler..."
                  />
                </div>
                
                {/* Randevu Bilgileri */}
                <div className="border-t border-slate-600 pt-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <input
                      type="checkbox"
                      id="hasAppointment"
                      checked={formData.hasAppointment}
                      onChange={(e) => handleInputChange('hasAppointment', e.target.checked)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-500 rounded-lg bg-slate-700"
                    />
                    <label htmlFor="hasAppointment" className="text-xl font-bold text-white font-serif">
                      Hasta için randevu oluştur
                    </label>
                  </div>
                  
                  {formData.hasAppointment && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-750 rounded-2xl border border-slate-600">
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-3">
                          Randevu Tarihi *
                        </label>
                        <input
                          type="date"
                          value={formData.appointmentDate}
                          onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-3">
                          Randevu Saati *
                        </label>
                        <select
                          value={formData.appointmentTime}
                          onChange={(e) => handleInputChange('appointmentTime', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
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
                        <label className="block text-sm font-semibold text-slate-300 mb-3">
                          Süre (dakika) *
                        </label>
                        <select
                          value={formData.appointmentDuration}
                          onChange={(e) => handleInputChange('appointmentDuration', parseInt(e.target.value))}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
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
                        <label className="block text-sm font-semibold text-slate-300 mb-3">
                          İşlem Türü *
                        </label>
                        <select
                          value={formData.appointmentTreatment}
                          onChange={(e) => handleInputChange('appointmentTreatment', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
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
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-300 mb-3">
                          Randevu Notları
                        </label>
                        <textarea
                          value={formData.appointmentNotes}
                          onChange={(e) => handleInputChange('appointmentNotes', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
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

          {/* Step 3: Photo Upload */}
          {activeStep === 3 && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl shadow-2xl border border-slate-600 p-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white font-serif">Fotoğraf Yükleme</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Before Photos */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-6 font-serif">Öncesi Fotoğraflar</h3>
                  <div className="border-2 border-dashed border-slate-500 rounded-2xl p-8 text-center hover:border-slate-400 transition-colors duration-300">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handlePhotoUpload('before', e.target.files)}
                      className="hidden"
                      ref={fileInputRef}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Fotoğraf Seç
                    </button>
                    <p className="mt-4 text-sm text-slate-400">
                      PNG, JPG, JPEG (max 5MB)
                    </p>
                  </div>
                  
                  {formData.beforePhotos.length > 0 && (
                    <div className="mt-6 space-y-3">
                      {formData.beforePhotos.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-750 rounded-xl border border-slate-600">
                          <span className="text-sm text-slate-200">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removePhoto('before', index)}
                            className="text-red-400 hover:text-red-300 transition-colors duration-200"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* After Photos */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-6 font-serif">Sonrası Fotoğraflar</h3>
                  <div className="border-2 border-dashed border-slate-500 rounded-2xl p-8 text-center hover:border-slate-400 transition-colors duration-300">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handlePhotoUpload('after', e.target.files)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Fotoğraf Seç
                    </button>
                    <p className="mt-4 text-sm text-slate-400">
                      PNG, JPG, JPEG (max 5MB)
                    </p>
                  </div>
                  
                  {formData.afterPhotos.length > 0 && (
                    <div className="mt-6 space-y-3">
                      {formData.afterPhotos.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-750 rounded-xl border border-slate-600">
                          <span className="text-sm text-slate-200">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removePhoto('after', index)}
                            className="text-red-400 hover:text-red-300 transition-colors duration-200"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
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
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl shadow-2xl border border-slate-600 p-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white font-serif">Önizleme ve Ek Bilgiler</h2>
              </div>
              
              <div className="space-y-8">
                {/* Patient Info Summary */}
                <div className="bg-slate-750 rounded-2xl p-6 border border-slate-600">
                  <h3 className="text-xl font-bold text-white mb-4 font-serif">Hasta Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="text-slate-300"><strong className="text-white">Ad Soyad:</strong> {formData.name || 'Belirtilmedi'}</div>
                    <div className="text-slate-300"><strong className="text-white">Telefon:</strong> {formData.phone || 'Belirtilmedi'}</div>
                    <div className="text-slate-300"><strong className="text-white">E-posta:</strong> {formData.email || 'Belirtilmedi'}</div>
                    <div className="text-slate-300"><strong className="text-white">Cinsiyet:</strong> {formData.gender === 'female' ? 'Kadın' : 'Erkek'}</div>
                    {formData.birthDate && (
                      <div className="text-slate-300"><strong className="text-white">Doğum Tarihi:</strong> {new Date(formData.birthDate).toLocaleDateString('tr-TR')}</div>
                    )}
                    {formData.address && (
                      <div className="md:col-span-2 text-slate-300"><strong className="text-white">Adres:</strong> {formData.address}</div>
                    )}
                  </div>
                </div>
                
                {/* Appointment Summary */}
                {formData.hasAppointment && (
                  <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 rounded-2xl p-6 border border-blue-600">
                    <h3 className="text-xl font-bold text-blue-200 mb-4 font-serif">📅 Randevu Bilgileri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="text-blue-300"><strong className="text-blue-100">Tarih:</strong> {new Date(formData.appointmentDate).toLocaleDateString('tr-TR')}</div>
                      <div className="text-blue-300"><strong className="text-blue-100">Saat:</strong> {formData.appointmentTime}</div>
                      <div className="text-blue-300"><strong className="text-blue-100">Süre:</strong> {formData.appointmentDuration} dakika</div>
                      <div className="text-blue-300"><strong className="text-blue-100">İşlem:</strong> {formData.appointmentTreatment || 'Belirtilmedi'}</div>
                      {formData.appointmentNotes && (
                        <div className="md:col-span-2 text-blue-300"><strong className="text-blue-100">Notlar:</strong> {formData.appointmentNotes}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Selected Treatments */}
                <div className="bg-slate-750 rounded-2xl p-6 border border-slate-600">
                  <h3 className="text-xl font-bold text-white mb-4 font-serif">Seçilen Tedaviler</h3>
                  {formData.selectedTreatments.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {formData.selectedTreatments.map((treatment) => (
                        <span key={treatment} className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl text-sm font-semibold border border-emerald-500">
                          {treatment}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400">Henüz tedavi seçilmedi</p>
                  )}
                  {formData.treatmentNotes && (
                    <div className="mt-4">
                      <strong className="text-white">Tedavi Notları:</strong>
                      <p className="text-sm text-slate-300 mt-2">{formData.treatmentNotes}</p>
                    </div>
                  )}
                </div>

                {/* Photo Summary */}
                <div className="bg-slate-750 rounded-2xl p-6 border border-slate-600">
                  <h3 className="text-xl font-bold text-white mb-4 font-serif">Fotoğraflar</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="text-slate-300">
                      <strong className="text-white">Öncesi:</strong> {formData.beforePhotos.length} fotoğraf
                    </div>
                    <div className="text-slate-300">
                      <strong className="text-white">Sonrası:</strong> {formData.afterPhotos.length} fotoğraf
                    </div>
                  </div>
                </div>

                {/* Additional Medical Info */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">
                      Alerjiler
                    </label>
                    <textarea
                      value={formData.allergies}
                      onChange={(e) => handleInputChange('allergies', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 resize-none"
                      rows={2}
                      placeholder="Bilinen alerjiler..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">
                      Kullandığı İlaçlar
                    </label>
                    <textarea
                      value={formData.medications}
                      onChange={(e) => handleInputChange('medications', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 resize-none"
                      rows={2}
                      placeholder="Düzenli kullanılan ilaçlar..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">
                      Tıbbi Geçmiş
                    </label>
                    <textarea
                      value={formData.medicalHistory}
                      onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 resize-none"
                      rows={3}
                      placeholder="Önemli tıbbi geçmiş, ameliyatlar..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">
                      Genel Notlar
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 resize-none"
                      rows={3}
                      placeholder="Ek notlar, özel durumlar..."
                    />
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
              className="px-8 py-4 bg-slate-700 text-slate-300 rounded-xl font-semibold hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border border-slate-600 hover:border-slate-500"
            >
              Önceki
            </button>
            
            <div className="flex space-x-4">
              {activeStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Sonraki
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? 'Kaydediliyor...' : 'Hastayı Kaydet'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
