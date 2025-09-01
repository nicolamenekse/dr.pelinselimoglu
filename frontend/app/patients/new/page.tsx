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
  appointments: Array<{
    treatment: string
    date: string
    time: string
    duration: number
    notes: string
  }>
  sameDayTreatments: string[]
}

export default function NewPatientPage() {
  const router = useRouter()
  const { user, checkAuth, isLoading: authLoading } = useAuthStore()
  const { addPatient } = usePatientStore()
  const { addAppointment } = useAppointmentStore()
  const [isLoading, setIsLoading] = useState(false)
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
    appointments: [],
    sameDayTreatments: []
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

  const addToAppointments = (treatment: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTreatments: prev.selectedTreatments.filter(t => t !== treatment),
      appointments: [...prev.appointments, {
        treatment,
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        duration: 60,
        notes: ''
      }]
    }))
  }

  const addToSameDayTreatments = (treatment: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTreatments: prev.selectedTreatments.filter(t => t !== treatment),
      sameDayTreatments: [...prev.sameDayTreatments, treatment]
    }))
  }

  const handleAppointmentChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      appointments: prev.appointments.map((apt, i) => 
        i === index ? { ...apt, [field]: value } : apt
      )
    }))
  }

  const removeAppointment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      appointments: prev.appointments.filter((_, i) => i !== index)
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      // Form validation
      if (!formData.name.trim() || !formData.phone.trim()) {
        throw new Error('Ad ve telefon alanları zorunludur')
      }

      // Convert files to base64 strings
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

      // Add patient
      addPatient(patientData)

      // Create appointments for scheduled treatments
      for (const appointment of formData.appointments) {
        addAppointment({
          patientId: crypto.randomUUID(), // Generate temporary ID
          patientName: patientData.name,
          treatment: appointment.treatment,
          date: appointment.date,
          time: appointment.time,
          duration: appointment.duration,
          notes: appointment.notes,
          status: 'confirmed'
        })
      }

      // Create completed appointments for same-day treatments
      for (const treatment of formData.sameDayTreatments) {
        addAppointment({
          patientId: crypto.randomUUID(), // Generate temporary ID
          patientName: patientData.name,
          treatment,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          duration: 60,
          notes: 'Aynı gün yapılan tedavi',
          status: 'completed'
        })
      }

      // Redirect to patients list with success message
      router.push('/patients?success=true')
    } catch (error: any) {
      alert(error.message || 'Hasta kaydı sırasında bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      
<<<<<<< HEAD
      <main className="w-full py-8 px-6">
        {/* Full Width Container */}
        <div className="w-full max-w-none">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-8">
            
            {/* Page Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-3xl mb-6 shadow-2xl">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
=======
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
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-600/50 p-8">
              {/* Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl mb-6 shadow-2xl">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white font-serif mb-3">Kişisel Bilgiler</h2>
                <p className="text-slate-300 text-lg">Hasta bilgilerini eksiksiz olarak doldurun</p>
              </div>
              
              {/* Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ad Soyad */}
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Ad Soyad *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-5 py-4 bg-slate-700/80 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 text-lg backdrop-blur-sm group-hover:bg-slate-700/90"
                      placeholder="Hasta adı ve soyadı"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
                
                {/* Telefon */}
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Telefon *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-5 py-4 bg-slate-700/80 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-400/50 transition-all duration-300 text-lg backdrop-blur-sm group-hover:bg-slate-700/90"
                      placeholder="+90 555 123 4567"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
                
                {/* E-posta */}
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    E-posta
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-5 py-4 bg-slate-700/80 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 text-lg backdrop-blur-sm group-hover:bg-slate-700/90"
                      placeholder="hasta@email.com"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
                
                {/* Doğum Tarihi */}
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Doğum Tarihi
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className="w-full px-5 py-4 bg-slate-700/80 border border-slate-600/50 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400/50 transition-all duration-300 text-lg backdrop-blur-sm group-hover:bg-slate-700/90"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
                
                {/* Cinsiyet */}
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Cinsiyet
                  </label>
                  <div className="relative">
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-5 py-4 bg-slate-700/80 border border-slate-600/50 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-400/50 transition-all duration-300 text-lg backdrop-blur-sm group-hover:bg-slate-700/90 appearance-none cursor-pointer"
                    >
                      <option value="female">👩 Kadın</option>
                      <option value="male">👨 Erkek</option>
                    </select>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Adres - Full Width */}
                <div className="lg:col-span-2 group">
                  <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Adres
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-5 py-4 bg-slate-700/80 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/50 transition-all duration-300 text-lg backdrop-blur-sm group-hover:bg-slate-700/90 resize-none"
                      rows={4}
                      placeholder="Hasta adresi (sokak, mahalle, ilçe, şehir)"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
              </div>
              
              {/* Progress Indicator */}
              <div className="mt-10 text-center">
                <div className="inline-flex items-center space-x-2 bg-slate-700/50 rounded-full px-6 py-3 backdrop-blur-sm border border-slate-600/30">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-slate-300 text-sm font-medium">1 / 4 Adım</span>
                  <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                  <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                  <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                </div>
>>>>>>> 1ad49f5cb8fbd5516b3d64c3a96349e542b9d51c
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3 font-serif">
                Yeni Hasta Kaydı
              </h1>
              <p className="text-gray-600 text-xl font-light">
                Hasta bilgilerini eksiksiz olarak doldurun
              </p>
            </div>

            {/* Main Content - Full Width Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* LEFT COLUMN - Personal Information */}
              <div className="xl:col-span-1">
                <section className="bg-white rounded-3xl p-8 border border-pink-100 shadow-xl hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 font-serif">👤 Kişisel Bilgiler</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {/* First Name & Last Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Ad *</label>
                        <input
                          type="text"
                          value={formData.name.split(' ')[0] || ''}
                          onChange={(e) => {
                            const lastName = formData.name.split(' ').slice(1).join(' ') || '';
                            handleInputChange('name', `${e.target.value} ${lastName}`.trim());
                          }}
                          className="w-full px-4 py-3 bg-gray-50 border border-pink-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 hover:bg-white"
                          placeholder="Hasta adı"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Soyad *</label>
                        <input
                          type="text"
                          value={formData.name.split(' ').slice(1).join(' ') || ''}
                          onChange={(e) => {
                            const firstName = formData.name.split(' ')[0] || '';
                            handleInputChange('name', `${firstName} ${e.target.value}`.trim());
                          }}
                          className="w-full px-4 py-3 bg-gray-50 border border-pink-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 hover:bg-white"
                          placeholder="Hasta soyadı"
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Birth Date & Gender */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Doğum Tarihi *</label>
                        <input
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => handleInputChange('birthDate', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-pink-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 hover:bg-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Cinsiyet</label>
                        <select
                          value={formData.gender || ''}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-pink-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 hover:bg-white"
                        >
                          <option value="">Seçiniz</option>
                          <option value="female">Kadın</option>
                          <option value="male">Erkek</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Phone & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Telefon *</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-pink-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 hover:bg-white"
                          placeholder="05XX XXX XX XX"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">E-posta</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-pink-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 hover:bg-white"
                          placeholder="ornek@email.com"
                        />
                      </div>
                    </div>
                    
                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Genel Notlar</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 border border-pink-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 hover:bg-white resize-none"
                        placeholder="Hasta ile ilgili ek bilgiler, özel notlar, alerjiler, kullanılan ilaçlar, tıbbi geçmiş..."
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* CENTER COLUMN - Treatment Selection */}
              <div className="xl:col-span-1">
                <section className="bg-white rounded-3xl p-8 border border-indigo-100 shadow-xl hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 font-serif">💊 Tedavi Seçimi</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {treatmentCategories.map((category) => (
                                             <div key={category.id} className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200 transition-all duration-300 hover:shadow-lg">
                         <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center">
                           <span className="mr-3 text-2xl">{getCategoryIcon(category.id)}</span>
                           {category.name}
                         </h3>
                         <div className="grid grid-cols-1 gap-3">
                           {category.treatments.map((treatment) => (
                             <div key={treatment} className="group">
                               <div className="flex items-center justify-between">
                                 <button
                                   type="button"
                                   onClick={() => handleTreatmentToggle(treatment)}
                                   className={`flex-1 text-left py-3 px-4 rounded-xl transition-all duration-300 cursor-pointer font-medium text-sm ${
                                     formData.sameDayTreatments.includes(treatment)
                                       ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg transform scale-105'
                                       : formData.appointments.some(apt => apt.treatment === treatment)
                                         ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                                         : formData.selectedTreatments.includes(treatment)
                                           ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg transform scale-105'
                                           : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md hover:transform hover:scale-102 border border-indigo-200'
                                   }`}
                                 >
                                   <span>{treatment}</span>
                                 </button>
                                 
                                 {formData.selectedTreatments.includes(treatment) && (
                                   <div className="flex flex-col space-y-2 ml-3">
                                     <button
                                       type="button"
                                       onClick={() => addToSameDayTreatments(treatment)}
                                       className="px-3 py-1 text-xs bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-600 hover:scale-105 transition-all duration-200 font-medium shadow-sm"
                                     >
                                       🕐 Aynı Gün
                                     </button>
                                     <button
                                       type="button"
                                       onClick={() => addToAppointments(treatment)}
                                       className="px-3 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 hover:scale-105 transition-all duration-200 font-medium shadow-sm"
                                     >
                                       📅 Randevu
                                     </button>
                                   </div>
                                 )}
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* RIGHT COLUMN - Photo Upload & Appointments */}
              <div className="xl:col-span-1">
                <div className="space-y-6">
                  
                  {/* Photo Upload Section */}
                  <section className="bg-white rounded-3xl p-8 border border-purple-100 shadow-xl hover:shadow-2xl transition-all duration-500">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 font-serif">📸 Fotoğraflar</h2>
                    </div>
                    
                    {/* Before Photos */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                        <span className="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                        Tedavi Öncesi
                      </h3>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => e.target.files && handlePhotoUpload('before', e.target.files)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-400 to-indigo-500 text-white rounded-xl text-sm font-medium hover:from-blue-500 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        📷 Fotoğraf Seç
                      </button>
                      
                      {formData.beforePhotos.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          {formData.beforePhotos.map((file, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Before ${index + 1}`}
                                className="w-full h-24 object-cover rounded-xl border-2 border-blue-200"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto('before', index)}
                                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm hover:bg-red-600"
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
                      <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                        <span className="w-3 h-3 bg-emerald-400 rounded-full mr-2"></span>
                        Tedavi Sonrası
                      </h3>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => e.target.files && handlePhotoUpload('after', e.target.files)}
                        className="hidden"
                        id="after-photos"
                      />
                      <label
                        htmlFor="after-photos"
                        className="w-full py-3 px-4 bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-xl text-sm font-medium hover:from-emerald-500 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer text-center block"
                      >
                        📷 Fotoğraf Seç
                      </label>
                      
                      {formData.afterPhotos.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          {formData.afterPhotos.map((file, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`After ${index + 1}`}
                                className="w-full h-24 object-cover rounded-xl border-2 border-emerald-200"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto('after', index)}
                                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Appointments Section */}
                  <section className="bg-white rounded-3xl p-8 border border-pink-100 shadow-xl hover:shadow-2xl transition-all duration-500">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 font-serif">📅 Randevular</h2>
                    </div>
                    
                    {/* Same Day Treatments - Green */}
                    {formData.sameDayTreatments.length > 0 && (
                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4 mb-4">
                        <h3 className="text-lg font-bold text-emerald-800 mb-3 flex items-center">
                          🕐 Aynı Gün Tedaviler
                          <span className="ml-2 text-sm bg-emerald-500 text-white px-3 py-1 rounded-full">
                            {formData.sameDayTreatments.length}
                          </span>
                        </h3>
                        <div className="space-y-2">
                          {formData.sameDayTreatments.map((treatment, index) => (
                            <span key={index} className="block px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium">
                              {treatment}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Future Appointments - Purple */}
                    {formData.appointments.length > 0 && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-4">
                        <h3 className="text-lg font-bold text-purple-800 mb-3 flex items-center">
                          📋 Planlanan Randevular
                          <span className="ml-2 text-sm bg-purple-500 text-white px-3 py-1 rounded-full">
                            {formData.appointments.length}
                          </span>
                        </h3>
                        <div className="space-y-3">
                          {formData.appointments.map((appointment, index) => (
                            <div key={index} className="bg-white rounded-xl p-3 border border-purple-200 shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-800 text-sm">{appointment.treatment}</h4>
                                <button
                                  type="button"
                                  onClick={() => removeAppointment(index)}
                                  className="w-5 h-5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center text-xs"
                                >
                                  ×
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Tarih</label>
                                  <input
                                    type="date"
                                    value={appointment.date}
                                    onChange={(e) => handleAppointmentChange(index, 'date', e.target.value)}
                                    className="w-full px-2 py-1 bg-gray-50 border border-purple-200 rounded text-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Saat</label>
                                  <input
                                    type="time"
                                    value={appointment.time}
                                    onChange={(e) => handleAppointmentChange(index, 'time', e.target.value)}
                                    className="w-full px-2 py-1 bg-gray-50 border border-purple-200 rounded text-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
                                  />
                                </div>
                              </div>
                              
                              <div className="mt-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Süre</label>
                                <select
                                  value={appointment.duration}
                                  onChange={(e) => handleAppointmentChange(index, 'duration', parseInt(e.target.value))}
                                  className="w-full px-2 py-1 bg-gray-50 border border-purple-200 rounded text-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
                                >
                                  <option value={30}>30dk</option>
                                  <option value={45}>45dk</option>
                                  <option value={60}>60dk</option>
                                  <option value={90}>90dk</option>
                                  <option value={120}>120dk</option>
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </div>

            {/* Submit Button - Centered */}
            <div className="flex justify-center pt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="px-16 py-5 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-2xl font-bold rounded-3xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    <span>Kaydediliyor...</span>
                  </div>
                ) : (
                  '✅ Hasta Kaydını Tamamla'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

// Helper function to get category icons
function getCategoryIcon(categoryId: string): string {
  const icons: { [key: string]: string } = {
    'dudak-dolgusu': '💋',
    'mezoterapi': '💉',
    'botoks': '🧬',
    'dolgu-eritme': '🔄'
  }
  return icons[categoryId] || '💊'
}
