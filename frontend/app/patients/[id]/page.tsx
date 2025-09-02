'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { useAuthStore } from '@/stores/authStore'
import { usePatientStore, Patient } from '@/stores/patientStore'
import { useAppointmentStore } from '@/stores/appointmentStore'

export default function PatientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, checkAuth, isLoading } = useAuthStore()
  const { getPatient } = usePatientStore()
  const { getAppointmentsByPatient } = useAppointmentStore()
  
  const [patient, setPatient] = useState<Patient | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    // Sadece checkAuth tamamlandıktan sonra yönlendirme yap
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (params.id && typeof params.id === 'string') {
      const foundPatient = getPatient(params.id)
      if (foundPatient) {
        setPatient(foundPatient)
      } else {
        router.push('/patients?error=not-found')
      }
    }
  }, [params.id, getPatient, router])

  if (isLoading || !user) {
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

  const getGenderIcon = (gender: 'female' | 'male') => {
    return gender === 'female' ? (
      <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )
  }

  const getAge = (birthDate: string) => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      
      <main className="w-full max-w-none py-6 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-slate-300">
            <li>
              <Link href="/patients" className="hover:text-blue-300 transition-colors duration-200">
                Hastalar
              </Link>
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-white font-medium">{patient.name}</span>
            </li>
          </ol>
        </nav>

        {/* Patient Header - Hero Section */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl shadow-xl p-8 mb-8 border border-slate-600/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center mb-6 lg:mb-0">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg mr-6">
                <span className="text-3xl font-bold text-white">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white font-serif mb-2">{patient.name}</h1>
                <div className="flex items-center space-x-4 text-lg text-slate-300">
                  <div className="flex items-center">
                    {getGenderIcon(patient.gender)}
                    <span className="ml-2">
                      {patient.gender === 'female' ? 'Kadın' : 'Erkek'}
                    </span>
                  </div>
                  {patient.birthDate && (
                    <div className="flex items-center">
                      <span className="mr-2">🎂</span>
                      <span>{new Date(patient.birthDate).toLocaleDateString('tr-TR')}</span>
                      {getAge(patient.birthDate) && (
                        <span className="ml-2 text-blue-300 font-semibold">
                          ({getAge(patient.birthDate)} yaşında)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Link
                href={`/patients/${patient.id}/edit`}
                className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white border border-slate-600/50 shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Düzenle
              </Link>
              <Link
                href="/patients"
                className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-xl bg-slate-700/60 text-slate-200 border border-slate-600/50 hover:bg-slate-600/60 transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Geri Dön
              </Link>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="bg-blue-500/15 rounded-xl p-4 border border-blue-400/30">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📞</span>
                <div>
                  <p className="text-sm text-blue-300 font-medium">Telefon</p>
                  <p className="text-lg font-semibold text-white">{patient.phone}</p>
                </div>
              </div>
            </div>
            
            {patient.email && (
              <div className="bg-emerald-500/15 rounded-xl p-4 border border-emerald-400/30">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📧</span>
                  <div>
                    <p className="text-sm text-emerald-300 font-medium">E-posta</p>
                    <p className="text-lg font-semibold text-white">{patient.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Personal & Medical Info */}
          <div className="xl:col-span-2 space-y-8">
            {/* Personal Information Section */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl shadow-xl p-6 border border-slate-600/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">👤</span>
                <span className="text-white">Kişisel Bilgiler</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-600/50">
                    <span className="text-slate-300 font-medium">Ad Soyad:</span>
                    <span className="font-semibold text-white">{patient.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-600/50">
                    <span className="text-slate-300 font-medium">Cinsiyet:</span>
                    <span className="font-semibold flex items-center text-white">
                      {getGenderIcon(patient.gender)}
                      <span className="ml-2">
                        {patient.gender === 'female' ? 'Kadın' : 'Erkek'}
                      </span>
                    </span>
                  </div>
                  {patient.birthDate && (
                    <div className="flex justify-between items-center py-3 border-b border-slate-600/50">
                      <span className="text-slate-300 font-medium">Doğum Tarihi:</span>
                      <span className="font-semibold text-white">{formatDate(patient.birthDate)}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-600/50">
                    <span className="text-slate-300 font-medium">Telefon:</span>
                    <span className="font-semibold text-white">{patient.phone}</span>
                  </div>
                  {patient.email && (
                    <div className="flex justify-between items-center py-3 border-b border-slate-600/50">
                      <span className="text-slate-300 font-medium">E-posta:</span>
                      <span className="font-semibold text-white">{patient.email}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 border-b border-slate-600/50">
                    <span className="text-slate-300 font-medium">Kayıt Tarihi:</span>
                    <span className="font-semibold text-white">{formatDate(patient.createdAt)}</span>
                  </div>
                </div>
              </div>
              {patient.address && (
                <div className="mt-6 pt-4 border-t border-slate-600/50">
                  <div className="flex justify-between items-start">
                    <span className="text-slate-300 font-medium">Adres:</span>
                    <span className="font-semibold text-white text-right max-w-md">{patient.address}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Treatments Section */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl shadow-xl p-6 border border-slate-600/50">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="mr-3">💊</span>
                Tedavi Bilgileri
              </h2>
              {patient.selectedTreatments.length > 0 ? (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Seçilen Tedaviler</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {patient.selectedTreatments.map((treatment, index) => {
                      // Bu tedavi için randevu bilgisi var mı kontrol et
                      const appointments = getAppointmentsByPatient(patient.id)
                      const treatmentAppointment = appointments?.find(app => 
                        app.treatment === treatment && app.status === 'scheduled'
                      )
                      
                      return (
                        <div key={index} className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 px-4 py-3 rounded-lg border border-slate-600/50 shadow-sm">
                          <div className="flex flex-col">
                            <span className="text-white font-medium">{treatment}</span>
                            {treatmentAppointment && (
                              <span className="text-blue-300 text-sm mt-1">
                                📅 {new Date(treatmentAppointment.date).toLocaleDateString('tr-TR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              {(() => {
                const apts = getAppointmentsByPatient(patient.id) || []
                const createdDay = new Date(patient.createdAt).toISOString().split('T')[0]
                // Bazı tarayıcılarda locale/timezone farkından dolayı karşılaştırma sorunlarını önlemek için normalize et
                const normalize = (d: string) => new Date(d).toISOString().split('T')[0]
                const sameDayCompleted = apts.filter(a => a.status === 'completed' && normalize(a.date) === createdDay)
                const completedPast = apts
                  .filter(a => a.status === 'completed')
                  .sort((a,b)=> new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime())

                return (
                  <>
                    {/* Aynı gün yapılan tedaviler ayrıca gösterilmiyor */}
                    {completedPast.length > 0 && (
                      <div className="mb-2">
                        <h3 className="text-lg font-semibold text-white mb-3">Gerçekleştirilen İşlemler</h3>
                        <div className="flex flex-wrap gap-2">
                          {completedPast.slice(0, 8).map((apt, idx) => (
                            <div key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/15 text-blue-200 border border-blue-400/30 shadow-sm">
                              <span className="text-xs">✅</span>
                              <span className="text-sm font-medium">{apt.treatment}</span>
                              <span className="text-[11px] text-blue-300/80 hidden sm:inline">{new Date(apt.date).toLocaleDateString('tr-TR', { day:'2-digit', month:'2-digit' })}</span>
                            </div>
                          ))}
                        </div>
                        {completedPast.length > 8 && (
                          <p className="mt-2 text-xs text-slate-400">+{completedPast.length - 8} daha</p>
                        )}
                      </div>
                    )}
                  </>
                )
              })()}
              
              {patient.treatmentNotes && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Tedavi Notları</h3>
                  <div className="bg-slate-700/40 p-4 rounded-lg border border-slate-600/50">
                    <p className="text-slate-200 leading-relaxed">{patient.treatmentNotes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Appointments Section */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl shadow-xl p-6 border border-slate-600/50">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="mr-3">📅</span>
                Randevu Bilgileri
              </h2>
              {(() => {
                const all = getAppointmentsByPatient(patient.id) || []
                const now = new Date()
                const upcoming = all.filter(a => {
                  const d = new Date(a.date + 'T' + a.time)
                  return d > now && a.status !== 'cancelled'
                })
                if (upcoming.length > 0) {
                  return (
                    <div className="space-y-4">
                      {upcoming.sort((a,b)=> (a.date + 'T' + a.time).localeCompare(b.date + 'T' + b.time)).map((appointment, index) => (
                        <div key={index} className="bg-slate-700/40 p-4 rounded-lg border border-slate-600/50 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <span className="text-blue-300">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </span>
                              <span className="font-semibold text-white">
                                {new Date(appointment.date).toLocaleDateString('tr-TR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-400/30`}>
                              Planlandı
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-slate-300 font-medium">Saat:</span>
                              <span className="ml-2 font-semibold text-white">{appointment.time}</span>
                            </div>
                            <div>
                              <span className="text-slate-300 font-medium">Süre:</span>
                              <span className="ml-2 font-semibold text-white">{appointment.duration} dakika</span>
                            </div>
                            <div>
                              <span className="text-slate-300 font-medium">İşlem:</span>
                              <span className="ml-2 font-semibold text-white">{appointment.treatment}</span>
                            </div>
                            {appointment.notes && (
                              <div className="md:col-span-2">
                                <span className="text-slate-300 font-medium">Notlar:</span>
                                <span className="ml-2 text-slate-200">{appointment.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                } else {
                  return (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-3">
                        <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-lg font-medium">Henüz randevu bulunmuyor</p>
                      <p className="text-gray-400 text-sm mt-1">Bu hasta için henüz randevu oluşturulmamış</p>
                    </div>
                  )
                }
              })()}
            </div>

            {/* Photos Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">📸</span>
                Fotoğraf Galerisi
              </h2>
              
              {/* Before Photos */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">📷</span>
                  Öncesi Fotoğraflar ({patient.beforePhotos.length})
                </h3>
                {patient.beforePhotos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patient.beforePhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Öncesi fotoğraf ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity duration-200 border-2 border-blue-200"
                          onClick={() => setSelectedPhoto(photo)}
                        />
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                          Öncesi
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">Henüz öncesi fotoğraf yüklenmemiş</p>
                )}
              </div>

              {/* After Photos */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">📷</span>
                  Sonrası Fotoğraflar ({patient.afterPhotos.length})
                </h3>
                {patient.afterPhotos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patient.afterPhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Sonrası fotoğraf ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity duration-200 border-2 border-green-200"
                          onClick={() => setSelectedPhoto(photo)}
                        />
                        <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                          Sonrası
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">Henüz sonrası fotoğraf yüklenmemiş</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Medical Info & Actions */}
          <div className="space-y-8">
            {/* Medical Information - only render if has any info */}
            {Boolean(patient.allergies || patient.medications || patient.medicalHistory || patient.notes) && (
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl shadow-xl p-6 border border-slate-600/50">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="mr-3">🏥</span>
                  Tıbbi Bilgiler
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <span className="mr-2">⚠️</span>
                      Alerjiler
                    </h3>
                    {patient.allergies ? (
                      <div className="bg-slate-700/40 p-4 rounded-lg border border-slate-600/50">
                        <p className="text-slate-200 leading-relaxed">{patient.allergies}</p>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <span className="mr-2">💊</span>
                      Kullandığı İlaçlar
                    </h3>
                    {patient.medications ? (
                      <div className="bg-slate-700/40 p-4 rounded-lg border border-slate-600/50">
                        <p className="text-slate-200 leading-relaxed">{patient.medications}</p>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <span className="mr-2">🏥</span>
                      Tıbbi Geçmiş
                    </h3>
                    {patient.medicalHistory ? (
                      <div className="bg-slate-700/40 p-4 rounded-lg border border-slate-600/50">
                        <p className="text-slate-200 leading-relaxed">{patient.medicalHistory}</p>
                      </div>
                    ) : null}
                  </div>

                  {patient.notes && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <span className="mr-2">📝</span>
                        Genel Notlar
                      </h3>
                      <div className="bg-slate-700/40 p-4 rounded-lg border border-slate-600/50">
                        <p className="text-slate-200 leading-relaxed">{patient.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-200">
              <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
                <span className="mr-3">🚀</span>
                Hızlı İşlemler
              </h2>
              <div className="space-y-3">
                <Link
                  href={`/patients/${patient.id}/edit`}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center font-medium"
                >
                  <span className="mr-2">✏️</span>
                  Bilgileri Düzenle
                </Link>
                <button className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center font-medium">
                  <span className="mr-2">📅</span>
                  Randevu Ekle
                </button>
                <button className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center font-medium">
                  <span className="mr-2">📊</span>
                  Tedavi Raporu
                </button>
                <button className="w-full bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center justify-center font-medium">
                  <span className="mr-2">📱</span>
                  SMS Gönder
                </button>
              </div>
            </div>

            {/* System Info removed per request */}
          </div>
        </div>

        {/* Photo Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl max-h-full">
              <img
                src={selectedPhoto}
                alt="Büyük fotoğraf"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all duration-200"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
