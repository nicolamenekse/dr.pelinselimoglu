'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { useAuthStore } from '@/stores/authStore'
import { usePatientStore, Patient } from '@/stores/patientStore'
import { useAppointmentStore } from '@/stores/appointmentStore'

export default function PatientsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, checkAuth, isLoading } = useAuthStore()
  const { patients, deletePatient, getAllPatients } = usePatientStore()
  const { appointments, getAppointmentsByPatient, syncAppointmentsWithPatients } = useAppointmentStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGender, setFilterGender] = useState<'all' | 'female' | 'male'>('all')
  const [filterTreatment, setFilterTreatment] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [mounted, setMounted] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Sadece checkAuth tamamlandıktan sonra yönlendirme yap
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

    // Randevu verilerini yükle ve kontrol et
  useEffect(() => {
    if (user && patients.length > 0) {
      console.log('Total appointments in store:', appointments.length)
      console.log('All appointments:', appointments)
      
      // Tüm randevuların patientId'lerini kontrol et
      const allPatientIds = appointments.map(apt => apt.patientId)
      const uniquePatientIds = Array.from(new Set(allPatientIds))
      console.log('All unique patientIds in appointments:', uniquePatientIds)
      
      // Her hasta için randevu verilerini yükle
      patients.forEach(patient => {
        const patientAppointments = getAppointmentsByPatient(patient.id)
        console.log(`Patient ${patient.id} (${patient.name}) appointments:`, patientAppointments)
        console.log(`Patient ID type:`, typeof patient.id, `Value:`, patient.id)
        
        // Bu hasta ID'sinin randevularda olup olmadığını kontrol et
        const hasMatchingAppointments = appointments.some(apt => apt.patientId === patient.id)
        console.log(`Patient ${patient.name} has matching appointments:`, hasMatchingAppointments)
        
        if (appointments.length > 0) {
          console.log(`First appointment patientId:`, appointments[0]?.patientId, `Type:`, typeof appointments[0]?.patientId)
        }
      })
      
      // Randevu-hasta senkronizasyonunu yap
      syncAppointmentsWithPatients(patients)
    }
  }, [user, patients, appointments, getAppointmentsByPatient, syncAppointmentsWithPatients])

  // Show success message if redirected from new patient
  const showSuccess = searchParams.get('success') === 'true'

  // Filter and sort patients
  const filteredPatients = getAllPatients()
    .filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           patient.phone.includes(searchTerm) ||
                           patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (patient.tcId && patient.tcId.includes(searchTerm))
      
      const matchesGender = filterGender === 'all' || patient.gender === filterGender
      
      const matchesTreatment = filterTreatment === 'all' || 
                              patient.selectedTreatments.some(treatment => 
                                treatment.toLowerCase().includes(filterTreatment.toLowerCase())
                              )
      
      return matchesSearch && matchesGender && matchesTreatment
    })
    .sort((a, b) => {
      let aValue: any
      let bValue: any
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'createdAt':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        case 'updatedAt':
          aValue = new Date(a.updatedAt)
          bValue = new Date(b.updatedAt)
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  // Pagination logic
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterGender, filterTreatment, sortBy, sortOrder])

  const handleDeletePatient = (id: string, name: string) => {
    // Hasta randevularını kontrol et
    const patientAppointments = getAppointmentsByPatient(id)
    const hasAppointments = patientAppointments.length > 0
    
    let confirmMessage = `${name} adlı hastayı silmek istediğinizden emin misiniz?`
    
    if (hasAppointments) {
      const upcomingCount = patientAppointments.filter(apt => {
        const aptDate = new Date(apt.date + 'T' + apt.time)
        return aptDate > new Date() && apt.status !== 'cancelled'
      }).length
      
      const pastCount = patientAppointments.length - upcomingCount
      
      confirmMessage += `\n\nBu hastaya ait ${patientAppointments.length} randevu da silinecek:`
      if (upcomingCount > 0) {
        confirmMessage += `\n• ${upcomingCount} yaklaşan randevu`
      }
      if (pastCount > 0) {
        confirmMessage += `\n• ${pastCount} geçmiş randevu`
      }
      confirmMessage += `\n\nDevam etmek istiyor musunuz?`
    }
    
    if (confirm(confirmMessage)) {
      deletePatient(id)
      // Başarı mesajı göster
      if (hasAppointments) {
        alert(`${name} adlı hasta ve ${patientAppointments.length} randevusu başarıyla silindi.`)
      } else {
        alert(`${name} adlı hasta başarıyla silindi.`)
      }
    }
  }

  const debugPatientData = () => {
    const allPatients = getAllPatients()
    console.log('=== DEBUG PATIENT DATA ===')
    console.log('Total patients:', allPatients.length)
    
    allPatients.forEach((patient, index) => {
      console.log(`Patient ${index + 1}:`, {
        name: patient.name,
        tcId: patient.tcId,
        phone: patient.phone,
        email: patient.email,
        hasTcId: !!patient.tcId,
        tcIdValue: patient.tcId,
        selectedTreatments: patient.selectedTreatments,
        hasSelectedTreatments: !!patient.selectedTreatments,
        selectedTreatmentsLength: patient.selectedTreatments?.length || 0,
        treatmentNotes: patient.treatmentNotes
      })
    })
    alert(`Debug data logged to console. Check browser console for details.`)
  }

  const getCompletedTreatments = (patientId: string) => {
    const patient = getAllPatients().find(p => p.id === patientId)
    if (!patient) return []
    
    const patientAppointments = getAppointmentsByPatient(patientId)
    
    // Randevulardan tamamlanan tedaviler
    const completedAppointments = patientAppointments
      .filter(apt => apt.status === 'completed')
      .sort((a, b) => {
        // Sort by date descending (most recent first)
        const dateA = new Date(a.date + 'T' + a.time)
        const dateB = new Date(b.date + 'T' + b.time)
        return dateB.getTime() - dateA.getTime()
      })
      .map(apt => ({
        treatment: apt.treatment,
        date: apt.date,
        time: apt.time
      }))
    
    // Hasta verisinden selectedTreatments (eğer randevu yoksa)
    const selectedTreatments = patient.selectedTreatments || []
    const selectedTreatmentData = selectedTreatments.map((treatment: string) => ({
      treatment,
      date: new Date().toISOString().split('T')[0], // Bugünün tarihi
      time: '00:00'
    }))
    
    // Her iki kaynaktan gelen tedavileri birleştir ve tekrarları kaldır
    const allTreatments = [...completedAppointments, ...selectedTreatmentData]
    const uniqueTreatments = allTreatments.filter((treatment, index, self) => 
      index === self.findIndex(t => t.treatment === treatment.treatment)
    )
    
    return uniqueTreatments
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getTreatmentBadges = (treatments: string[]) => {
    console.log('getTreatmentBadges called with:', treatments)
    if (!treatments || treatments.length === 0) {
      console.log('No treatments provided to getTreatmentBadges')
      return <span className="text-slate-400 text-xs italic">Tedavi seçilmemiş</span>
    }
    return treatments.slice(0, 3).map((treatment, index) => (
      <span key={index} className="inline-block px-3 py-1 text-xs bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 rounded-lg mr-2 mb-2 font-medium border border-indigo-400/30">
        {treatment}
      </span>
    ))
  }

  const getGenderIcon = (gender: 'female' | 'male') => {
    return gender === 'female' ? (
      <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )
  }

  const getPatientAppointments = (patientId: string) => {
    // Artık sadece patientId ile eşleştirme yap
    // Senkronizasyon sayesinde tüm randevular doğru patientId'ye sahip olacak
    const result = getAppointmentsByPatient(patientId)
    
    if (result.length > 0) {
      console.log(`✅ Found ${result.length} appointments for patient ${patientId}`)
    } else {
      console.log(`ℹ️ No appointments found for patient ${patientId}`)
    }
    
    return result
  }

    const formatAppointmentInfo = (patientId: string) => {
    const patientAppointments = getPatientAppointments(patientId)
    
    
    
    if (!patientAppointments || patientAppointments.length === 0) {
      return {
        hasAppointments: false,
        text: "Randevu yok",
        nextAppointment: null,
        isUrgent: false,
        completedTreatments: []
      }
    }

    // Sadece gelecekteki randevuları kontrol et
    const now = new Date()
    const upcomingAppointments = patientAppointments
      .filter(apt => {
        if (!apt.date || !apt.time) return false
        try {
          const aptDate = new Date(apt.date + 'T' + apt.time)
          return aptDate > now && apt.status !== 'cancelled'
        } catch (error) {
          console.error('Date parsing error:', error, apt)
          return false
        }
      })
      .sort((a, b) => {
        try {
          const dateA = new Date(a.date + 'T' + a.time)
          const dateB = new Date(b.date + 'T' + b.time)
          return dateA.getTime() - dateB.getTime()
        } catch (error) {
          console.error('Sort error:', error)
          return 0
        }
      })

    // Geçmiş randevulardan son 2'sini al (tedaviler bölümü için)
    const pastAppointments = patientAppointments
      .filter(apt => {
        if (!apt.date || !apt.time) return false
        try {
          const aptDate = new Date(apt.date + 'T' + apt.time)
          return aptDate <= now && apt.status !== 'cancelled'
        } catch (error) {
          console.error('Date parsing error:', error, apt)
          return false
        }
      })
      .sort((a, b) => {
        try {
          const dateA = new Date(a.date + 'T' + a.time)
          const dateB = new Date(b.date + 'T' + b.time)
          return dateB.getTime() - dateA.getTime()
        } catch (error) {
          console.error('Sort error:', error)
          return 0
        }
      })
      .slice(0, 2)
      .map(apt => ({
        date: apt.date,
        treatment: apt.treatment
      }))

    if (upcomingAppointments.length > 0) {
      const nextAppointment = upcomingAppointments[0]
      const daysUntilAppointment = Math.ceil((new Date(nextAppointment.date + 'T' + nextAppointment.time).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      return {
        hasAppointments: true,
        text: `${new Date(nextAppointment.date).toLocaleDateString('tr-TR')} - ${nextAppointment.time} - ${nextAppointment.treatment}`,
        nextAppointment: nextAppointment,
        isUrgent: daysUntilAppointment <= 3,
        upcomingAppointments: upcomingAppointments,
        completedTreatments: pastAppointments
      }
    } else {
      // Gelecekte randevu yok
      return {
        hasAppointments: false,
        text: "Randevu yok",
        nextAppointment: null,
        isUrgent: false,
        upcomingAppointments: [],
        completedTreatments: pastAppointments
      }
    }
  }

  if (!mounted || !user) {
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
      
      <main className="w-full max-w-none py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-white font-serif">
              👥 Kayıtlı Hastalar
            </h1>
            <span className="text-slate-400 text-lg">
              ({filteredPatients.length} hasta • Sayfa {currentPage}/{totalPages})
            </span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={debugPatientData}
              className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              🔍 Debug TC ID
            </button>
            <Link
              href="/patients/new"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              ✨ Yeni Hasta Ekle
            </Link>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-8 p-6 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-400/30 rounded-2xl shadow-lg backdrop-blur-md">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-200">🎉 Hasta başarıyla kaydedildi!</p>
                <p className="text-emerald-300">Hasta listesinde görüntüleyebilirsiniz.</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Filters and Search */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-8 border border-slate-600/50">
          <div className="flex flex-col lg:flex-row lg:items-end gap-6">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-300 mb-3">🔍 Arama</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-700/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 text-lg"
                  placeholder="Hasta adı, telefon veya e-posta..."
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">👥 Cinsiyet</label>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value as 'all' | 'female' | 'male')}
                className="px-4 py-3 bg-slate-700/80 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300"
              >
                <option value="all">Tümü</option>
                <option value="female">Kadın</option>
                <option value="male">Erkek</option>
              </select>
            </div>

            {/* Treatment Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">💉 Tedavi</label>
              <select
                value={filterTreatment}
                onChange={(e) => setFilterTreatment(e.target.value)}
                className="px-4 py-3 bg-slate-700/80 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300"
              >
                <option value="all">Tümü</option>
                <option value="dudak">Dudak</option>
                <option value="mezoterapi">Mezoterapi</option>
                <option value="botoks">Botoks</option>
                <option value="dolgu">Dolgu</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">📊 Sıralama</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortBy(field as 'name' | 'createdAt' | 'updatedAt')
                  setSortOrder(order as 'asc' | 'desc')
                }}
                className="px-4 py-3 bg-slate-700/80 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300"
              >
                <option value="createdAt-desc">En Yeni</option>
                <option value="createdAt-asc">En Eski</option>
                <option value="name-asc">Ad A-Z</option>
                <option value="name-desc">Ad Z-A</option>
                <option value="updatedAt-desc">Son Güncelleme</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">👁️ Görünüm</label>
              <div className="flex bg-slate-700/80 rounded-xl p-1 border border-slate-600/50">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    viewMode === 'table' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                  }`}
                >
                  📋 Tablo
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                  }`}
                >
                  🎴 Kart
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Patients List */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-slate-600/50">
          {filteredPatients.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mb-6 border border-slate-600/50">
                <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 font-serif">Hasta bulunamadı</h3>
              <p className="text-slate-400 mb-8 text-lg">
                {searchTerm || filterGender !== 'all' || filterTreatment !== 'all' 
                  ? 'Filtreleri değiştirmeyi deneyin' 
                  : 'Henüz hasta kaydı yapılmamış'}
              </p>
              {!searchTerm && filterGender === 'all' && filterTreatment === 'all' && (
                <Link href="/patients/new" className="inline-flex items-center text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  ✨ İlk Hastayı Ekle
                </Link>
              )}
            </div>
          ) : viewMode === 'table' ? (
            /* Table View */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-600/50">
                <thead className="bg-gradient-to-r from-slate-750/50 to-slate-700/50">
                  <tr>
                    <th className="w-1/4 px-8 py-6 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">
                      👤 Hasta
                    </th>
                    <th className="w-1/6 px-8 py-6 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">
                      📞 İletişim
                    </th>
                    <th className="w-1/3 px-8 py-6 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">
                      💊 Uygulanan İşlemler
                    </th>
                    <th className="w-1/6 px-8 py-6 text-right text-xs font-bold text-slate-300 uppercase tracking-wider">
                      ⚙️ İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800/30 divide-y divide-slate-600/50">
                  {paginatedPatients.map((patient) => {
                    const appointmentInfo = formatAppointmentInfo(patient.id)
                    return (
                      <tr key={patient.id} className="hover:bg-slate-750/50 transition-all duration-300 group cursor-pointer">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <Link
                            href={`/patients/${patient.id}`}
                            className="block"
                          >
                            <div className="flex items-center">
                              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-lg font-bold text-white">
                                  {patient.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors duration-300">{patient.name}</div>
                                <div className="flex items-center text-sm text-slate-300">
                                  {getGenderIcon(patient.gender)}
                                  <span className="ml-2">
                                    {patient.gender === 'female' ? 'Kadın' : 'Erkek'}
                                  </span>
                                  {patient.birthDate && (
                                    <span className="ml-3 text-slate-400">• {new Date(patient.birthDate).toLocaleDateString('tr-TR')}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </td>
                        
                        <td className="px-8 py-6 whitespace-nowrap">
                          <Link
                            href={`/patients/${patient.id}`}
                            className="block"
                          >
                            <div className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">{patient.phone}</div>
                            <div className="text-sm text-slate-300">
                              TC: {patient.tcId || '-'}
                            </div>
                          </Link>
                        </td>
                        
                                                 <td className="px-8 py-6 whitespace-nowrap">
                           <Link
                             href={`/patients/${patient.id}`}
                             className="block"
                           >
                                                           <div className="space-y-3">
                                {/* Gerçekleştirilen İşlemler */}
                                {(() => {
                                  const completedTreatments = getCompletedTreatments(patient.id)
                                  if (completedTreatments.length > 0) {
                                    return (
                                      <div className="space-y-1">
                                        {completedTreatments.slice(0, 3).map((treatment, index) => (
                                          <div key={index} className="text-xs bg-emerald-500/20 text-emerald-200 rounded-lg px-2 py-1 border border-emerald-400/30">
                                            <div className="font-medium">{treatment.treatment}</div>
                                            <div className="text-emerald-300/80">{formatDate(treatment.date)}</div>
                                          </div>
                                        ))}
                                        {completedTreatments.length > 3 && (
                                          <div className="text-xs text-emerald-300/80">
                                            +{completedTreatments.length - 3} tedavi daha
                                          </div>
                                        )}
                                      </div>
                                    )
                                  } else {
                                    return (
                                      <div className="text-xs text-slate-400 italic">
                                        Henüz uygulanan tedavi yok
                                      </div>
                                    )
                                  }
                                })()}
                              </div>
                           </Link>
                         </td>
                        
                        
                        
                                                 <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                           <div className="flex items-center justify-end space-x-3">
                             <Link
                               href={`/patients/${patient.id}/edit`}
                               onClick={(e) => e.stopPropagation()}
                               className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                             >
                               <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                               </svg>
                               Düzenle
                             </Link>
                             <button
                               onClick={(e) => {
                                 e.preventDefault()
                                 e.stopPropagation()
                                 handleDeletePatient(patient.id, patient.name)
                               }}
                               className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                             >
                               <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                               </svg>
                               Sil
                             </button>
                           </div>
                         </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View */
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                {paginatedPatients.map((patient) => {
                  const appointmentInfo = formatAppointmentInfo(patient.id)
                  return (
                                         <Link
                       key={patient.id}
                       href={`/patients/${patient.id}`}
                       className="block bg-gradient-to-br from-slate-750/50 to-slate-700/50 border border-slate-600/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 backdrop-blur-md group cursor-pointer h-full flex flex-col"
                     >
                      <div className="flex items-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-xl font-bold text-white">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-xl font-bold text-white font-serif group-hover:text-blue-300 transition-colors duration-300">{patient.name}</h3>
                          <div className="flex items-center text-sm text-slate-300">
                            {getGenderIcon(patient.gender)}
                            <span className="ml-2">
                              {patient.gender === 'female' ? 'Kadın' : 'Erkek'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                                             <div className="space-y-4 mb-6 flex-1">
                        <div className="flex items-center text-sm">
                          <span className="text-slate-400 w-16">📞</span>
                          <div>
                            <div className="font-semibold text-white">{patient.phone}</div>
                            {patient.tcId && (
                              <div className="text-sm text-slate-300">TC: {patient.tcId}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start text-sm">
                          <span className="text-slate-400 w-16 mt-1">📅</span>
                          <div className="flex-1">
                            <div className={`font-semibold ${
                              appointmentInfo.isUrgent 
                                ? 'text-orange-300 bg-orange-500/20 px-3 py-2 rounded-lg border border-orange-400/30' 
                                : 'text-white'
                            }`}>
                              {appointmentInfo.hasAppointments ? appointmentInfo.text : "Randevu yok"}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                                                                                           <div className="mb-6 flex-1">
                         <h4 className="text-sm font-semibold text-slate-300 mb-3">💊 Uygulanan İşlemler</h4>
                         <div className="space-y-3">
                            {/* Gerçekleştirilen İşlemler */}
                            {(() => {
                              const completedTreatments = getCompletedTreatments(patient.id)
                              if (completedTreatments.length > 0) {
                                return (
                                  <div className="space-y-1">
                                    {completedTreatments.slice(0, 2).map((treatment, index) => (
                                      <div key={index} className="text-xs bg-emerald-500/20 text-emerald-200 rounded-lg px-2 py-1 border border-emerald-400/30">
                                        <div className="font-medium">{treatment.treatment}</div>
                                        <div className="text-emerald-300/80">{formatDate(treatment.date)}</div>
                                      </div>
                                    ))}
                                    {completedTreatments.length > 2 && (
                                      <div className="text-xs text-emerald-300/80">
                                        +{completedTreatments.length - 2} tedavi daha
                                      </div>
                                    )}
                                  </div>
                                )
                              } else {
                                return (
                                  <div className="text-xs text-slate-400 italic">
                                    Henüz uygulanan tedavi yok
                                  </div>
                                )
                              }
                            })()}
                         </div>
                       </div>
                      
                      
                      
                                               <div className="flex space-x-3 pt-6 border-t border-slate-600/50 mt-auto">
                         <Link
                           href={`/patients/${patient.id}/edit`}
                           onClick={(e) => e.stopPropagation()}
                           className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-center py-3 px-4 rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                         >
                           <svg className="w-4 h-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.586a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                           </svg>
                           Düzenle
                         </Link>
                         <button
                           onClick={(e) => {
                             e.preventDefault()
                             e.stopPropagation()
                             handleDeletePatient(patient.id, patient.name)
                           }}
                           className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-center py-3 px-4 rounded-xl text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                         >
                           <svg className="w-4 h-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                           </svg>
                           Sil
                         </button>
                       </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center space-x-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-slate-700/60 text-slate-200 rounded-lg border border-slate-600/50 hover:bg-slate-600/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Önceki
            </button>
            
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-slate-700/60 text-slate-200 border border-slate-600/50 hover:bg-slate-600/60'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-slate-700/60 text-slate-200 rounded-lg border border-slate-600/50 hover:bg-slate-600/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center"
            >
              Sonraki
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </main>
    </div>
  )
}