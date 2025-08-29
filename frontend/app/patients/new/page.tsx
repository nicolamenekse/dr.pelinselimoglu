'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useAuthStore } from '@/stores/authStore'

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
}

export default function NewPatientPage() {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
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
    notes: ''
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
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // TODO: API call to save patient data
      console.log('Patient data:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      router.push('/patients?success=true')
    } catch (error) {
      console.error('Error saving patient:', error)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Yeni Hasta Kaydı</h1>
          <p className="mt-2 text-gray-600">
            Yeni hasta bilgilerini sisteme ekleyin ve tedavi planını oluşturun.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
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
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Kişisel Bilgiler</span>
            <span>Tedavi Seçimi</span>
            <span>Fotoğraflar</span>
            <span>Önizleme</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Personal Information */}
          {activeStep === 1 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Kişisel Bilgiler</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="input-field"
                    placeholder="Hasta adı ve soyadı"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="input-field"
                    placeholder="+90 555 123 4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="input-field"
                    placeholder="hasta@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doğum Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cinsiyet
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="input-field"
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
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Hasta adresi"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Treatment Selection */}
          {activeStep === 2 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Tedavi Seçimi</h2>
              
              <div className="space-y-6">
                {treatmentCategories.map((category) => (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">{category.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {category.treatments.map((treatment) => (
                        <label key={treatment} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.selectedTreatments.includes(treatment)}
                            onChange={() => handleTreatmentToggle(treatment)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{treatment}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tedavi Notları
                  </label>
                  <textarea
                    value={formData.treatmentNotes}
                    onChange={(e) => handleInputChange('treatmentNotes', e.target.value)}
                    className="input-field"
                    rows={4}
                    placeholder="Tedavi ile ilgili özel notlar, beklentiler..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Photo Upload */}
          {activeStep === 3 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Fotoğraf Yükleme</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Before Photos */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Öncesi Fotoğraflar</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                      className="btn-primary"
                    >
                      Fotoğraf Seç
                    </button>
                    <p className="mt-2 text-sm text-gray-500">
                      PNG, JPG, JPEG (max 5MB)
                    </p>
                  </div>
                  
                  {formData.beforePhotos.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.beforePhotos.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removePhoto('before', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Sonrası Fotoğraflar</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                      className="btn-primary"
                    >
                      Fotoğraf Seç
                    </button>
                    <p className="mt-2 text-sm text-gray-500">
                      PNG, JPG, JPEG (max 5MB)
                    </p>
                  </div>
                  
                  {formData.afterPhotos.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.afterPhotos.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removePhoto('after', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Önizleme ve Ek Bilgiler</h2>
              
              <div className="space-y-6">
                {/* Patient Info Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Hasta Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Ad Soyad:</strong> {formData.name}</div>
                    <div><strong>Telefon:</strong> {formData.phone}</div>
                    <div><strong>E-posta:</strong> {formData.email || 'Belirtilmedi'}</div>
                    <div><strong>Cinsiyet:</strong> {formData.gender === 'female' ? 'Kadın' : 'Erkek'}</div>
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
                </div>

                {/* Additional Medical Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alerjiler
                    </label>
                    <textarea
                      value={formData.allergies}
                      onChange={(e) => handleInputChange('allergies', e.target.value)}
                      className="input-field"
                      rows={2}
                      placeholder="Bilinen alerjiler..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kullandığı İlaçlar
                    </label>
                    <textarea
                      value={formData.medications}
                      onChange={(e) => handleInputChange('medications', e.target.value)}
                      className="input-field"
                      rows={2}
                      placeholder="Düzenli kullanılan ilaçlar..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tıbbi Geçmiş
                    </label>
                    <textarea
                      value={formData.medicalHistory}
                      onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                      className="input-field"
                      rows={3}
                      placeholder="Önemli tıbbi geçmiş, ameliyatlar..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Genel Notlar
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="input-field"
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
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Önceki
            </button>
            
            <div className="flex space-x-3">
              {activeStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary"
                >
                  Sonraki
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Kaydediliyor...' : 'Hastayı Kaydet'}
                </button>
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
