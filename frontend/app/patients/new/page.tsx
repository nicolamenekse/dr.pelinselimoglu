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
  tcId: string
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
  const [mounted, setMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    tcId: '',
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
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleInputChange = (field: keyof PatientFormData, value: any) => {
    let formattedValue = value
    
    // Özel formatlama uygula
    if (field === 'phone') {
      formattedValue = formatPhoneNumber(value)
    } else if (field === 'tcId') {
      formattedValue = formatTcId(value)
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }))
  }

  const handleTreatmentToggle = (treatment: string) => {
    setFormData(prev => {
      const isCurrentlySelected = prev.selectedTreatments.includes(treatment)
      
      if (isCurrentlySelected) {
        // Tedavi kaldırılıyorsa, tüm listelerden çıkar
        return {
          ...prev,
          selectedTreatments: prev.selectedTreatments.filter(t => t !== treatment),
          sameDayTreatments: prev.sameDayTreatments.filter(t => t !== treatment),
          appointments: prev.appointments.filter(apt => apt.treatment !== treatment)
        }
      } else {
        // Tedavi ekleniyorsa, sadece selectedTreatments'e ekle
        return {
          ...prev,
          selectedTreatments: [...prev.selectedTreatments, treatment]
        }
      }
    })
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

  // Telefon numarası formatlama fonksiyonu
  const formatPhoneNumber = (value: string) => {
    // Sadece rakamları al
    const numbers = value.replace(/\D/g, '')
    
    // Maksimum 11 rakam (0xxx xxx xxxx)
    if (numbers.length > 11) {
      return formData.phone // Mevcut değeri koru
    }
    
    // Format: 4-3-4 (0xxx xxx xxxx)
    if (numbers.length <= 4) {
      return numbers
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 4)} ${numbers.slice(4)}`
    } else {
      return `${numbers.slice(0, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7)}`
    }
  }

  // TC kimlik numarası formatlama fonksiyonu
  const formatTcId = (value: string) => {
    // Sadece rakamları al ve maksimum 11 rakam
    const numbers = value.replace(/\D/g, '').slice(0, 11)
    return numbers
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
          status: 'scheduled'
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

  if (!mounted || authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      
      <main className="w-full max-w-none py-6 px-4 sm:px-6 lg:px-8">
        {/* Main Content - 3-Column Layout: Left (Personal+Photos) | Center (Treatment) | Right (Appointments) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN - Personal Information + Photo Upload (Stacked) */}
          <div className="xl:col-span-3">
            <div className="space-y-4">
              {/* Personal Information Section */}
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
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Ad Soyad *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-700/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 text-sm"
                      placeholder="Hasta adı ve soyadı"
                      required
                    />
                  </div>

                  {/* TC Kimlik Numarası */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">TC Kimlik Numarası *</label>
                    <input
                      type="text"
                      value={formData.tcId}
                      onChange={(e) => handleInputChange('tcId', e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-700/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 text-sm"
                      placeholder="12345678901"
                      maxLength={11}
                      required
                    />
                  </div>
                  
                  {/* Birth Date & Gender */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Doğum Tarihi *</label>
                      <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-700/80 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Cinsiyet</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-700/80 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 text-sm"
                      >
                        <option value="female">Kadın</option>
                        <option value="male">Erkek</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Phone & Email */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Telefon *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-700/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 text-sm"
                        placeholder="0555 123 4567"
                        maxLength={13}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">E-posta</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-700/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 text-sm"
                        placeholder="ornek@email.com"
                      />
                    </div>
                  </div>
                  
                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Adres</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2.5 bg-slate-700/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 text-sm resize-none"
                      placeholder="Hasta adresi"
                    />
                  </div>
                  
                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Genel Notlar</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 bg-slate-700/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 text-sm resize-none"
                      placeholder="Alerjiler, ilaçlar, tıbbi geçmiş..."
                    />
                  </div>
                </div>
              </section>

              {/* Photo Upload Section - Below Personal Info */}
              <section className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-md rounded-2xl shadow-xl border border-slate-600/50 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white font-serif">📸 Fotoğraflar</h2>
                </div>
                
                {/* Before Photos */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
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
                    className="w-full py-2 px-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg"
                  >
                    📷 Fotoğraf Seç
                  </button>
                  
                  {formData.beforePhotos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {formData.beforePhotos.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Before ${index + 1}`}
                            className="w-full h-16 object-cover rounded-lg border-2 border-blue-300"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto('before', index)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs hover:bg-red-600"
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
                  <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
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
                    className="w-full py-2 px-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 shadow-lg cursor-pointer text-center block"
                  >
                    📷 Fotoğraf Seç
                  </label>
                  
                  {formData.afterPhotos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {formData.afterPhotos.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`After ${index + 1}`}
                            className="w-full h-16 object-cover rounded-lg border-2 border-emerald-300"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto('after', index)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* CENTER COLUMN - Treatment Selection (Full Width) */}
          <div className="xl:col-span-6">
            <section className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-md rounded-2xl shadow-xl border border-slate-600/50 p-6 h-fit">
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white font-serif">💊 Tedavi Seçimi</h2>
              </div>
              
              {/* Treatment Categories in Grid Layout */}
              <div className="grid grid-cols-2 gap-4">
                {treatmentCategories.map((category) => (
                  <div key={category.id} className="bg-gradient-to-br from-slate-700/50 to-slate-600/50 rounded-xl p-3 border border-slate-500/30 transition-all duration-300 hover:shadow-lg">
                    <h3 className="text-base font-bold text-white mb-3 flex items-center justify-center">
                      <span className="mr-2 text-xl">{getCategoryIcon(category.id)}</span>
                      {category.name}
                    </h3>
                    <div className="space-y-2">
                      {category.treatments.map((treatment) => (
                        <div key={treatment} className="group">
                          <div className="flex flex-col items-center space-y-2">
                            <button
                              type="button"
                              onClick={() => handleTreatmentToggle(treatment)}
                              className={`w-full max-w-xs py-2 px-3 rounded-lg transition-all duration-300 cursor-pointer font-medium text-sm text-center ${
                                formData.sameDayTreatments.includes(treatment)
                                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg transform scale-105'
                                  : formData.appointments.some(apt => apt.treatment === treatment)
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                                    : formData.selectedTreatments.includes(treatment)
                                      ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg transform scale-105'
                                      : 'bg-slate-600/50 text-slate-200 hover:bg-slate-600 hover:text-white hover:shadow-md border border-slate-500/50'
                              }`}
                            >
                              <span>{treatment}</span>
                            </button>
                            
                            {formData.selectedTreatments.includes(treatment) && (
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => addToSameDayTreatments(treatment)}
                                  className="px-2 py-1 text-xs bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-md hover:from-emerald-600 hover:to-green-600 hover:scale-105 transition-all duration-200 font-medium shadow-sm"
                                >
                                  🕐 Aynı Gün
                                </button>
                                <button
                                  type="button"
                                  onClick={() => addToAppointments(treatment)}
                                  className="px-2 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 hover:scale-105 transition-all duration-200 font-medium shadow-sm"
                                >
                                  📅 Randevu
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleTreatmentToggle(treatment)}
                                  className="px-2 py-1 text-xs bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-md hover:from-red-600 hover:to-rose-600 hover:scale-105 transition-all duration-200 font-medium shadow-sm"
                                >
                                  ❌ Kaldır
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

          {/* RIGHT COLUMN - Appointments */}
          <div className="xl:col-span-3">
            <section className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-md rounded-2xl shadow-xl border border-slate-600/50 p-6 h-fit">
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white font-serif">📅 Randevular</h2>
              </div>
              
              <div className="space-y-4">
                {/* Same Day Treatments - Green */}
                {formData.sameDayTreatments.length > 0 && (
                  <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-400/30 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-emerald-300 mb-3 flex items-center">
                      🕐 Aynı Gün Tedaviler
                      <span className="ml-2 text-xs bg-emerald-500 text-white px-2 py-1 rounded-full">
                        {formData.sameDayTreatments.length}
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {formData.sameDayTreatments.map((treatment, index) => (
                        <div key={index} className="flex items-center justify-between group">
                          <span className="flex-1 px-3 py-2 bg-emerald-500/30 text-emerald-200 rounded-lg text-sm font-medium border border-emerald-400/30">
                            {treatment}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                sameDayTreatments: prev.sameDayTreatments.filter((_, i) => i !== index)
                              }))
                            }}
                            className="ml-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center text-xs hover:scale-110"
                            title="Tedaviyi kaldır"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Future Appointments - Purple */}
                {formData.appointments.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-purple-300 mb-3 flex items-center">
                      📋 Planlanan Randevular
                      <span className="ml-2 text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                        {formData.appointments.length}
                      </span>
                    </h3>
                    <div className="space-y-3">
                      {formData.appointments.map((appointment, index) => (
                        <div key={index} className="bg-slate-700/50 rounded-lg p-3 border border-purple-400/30">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white text-sm">{appointment.treatment}</h4>
                            <button
                              type="button"
                              onClick={() => removeAppointment(index)}
                              className="w-5 h-5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <label className="block text-xs font-medium text-slate-400 mb-1">Tarih</label>
                              <input
                                type="date"
                                value={appointment.date}
                                onChange={(e) => handleAppointmentChange(index, 'date', e.target.value)}
                                className="w-full px-2 py-1 bg-slate-600/50 border border-slate-500/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-slate-400 mb-1">Saat</label>
                              <input
                                type="time"
                                value={appointment.time}
                                onChange={(e) => handleAppointmentChange(index, 'time', e.target.value)}
                                className="w-full px-2 py-1 bg-slate-600/50 border border-slate-500/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
                              />
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <label className="block text-xs font-medium text-slate-400 mb-1">Süre</label>
                            <select
                              value={appointment.duration}
                              onChange={(e) => handleAppointmentChange(index, 'duration', parseInt(e.target.value))}
                              className="w-full px-2 py-1 bg-slate-600/50 border border-slate-500/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
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
              </div>
            </section>
          </div>
        </div>

        {/* Submit Button - Centered */}
        <div className="flex justify-center pt-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-12 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-bold rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Kaydediliyor...</span>
              </div>
            ) : (
              '✅ Hasta Kaydını Tamamla'
            )}
          </button>
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
