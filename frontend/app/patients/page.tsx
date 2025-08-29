'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { useAuthStore } from '@/stores/authStore'
import { usePatientStore, Patient } from '@/stores/patientStore'

export default function PatientsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, checkAuth, isLoading } = useAuthStore()
  const { patients, deletePatient } = usePatientStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGender, setFilterGender] = useState<'all' | 'female' | 'male'>('all')
  const [filterTreatment, setFilterTreatment] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    // Sadece checkAuth tamamlandıktan sonra yönlendirme yap
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  // Show success message if redirected from new patient
  const showSuccess = searchParams.get('success') === 'true'

  // Filter and sort patients
  const filteredPatients = patients
    .filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           patient.phone.includes(searchTerm) ||
                           patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      
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

  const handleDeletePatient = (id: string, name: string) => {
    if (confirm(`${name} adlı hastayı silmek istediğinizden emin misiniz?`)) {
      deletePatient(id)
    }
  }

  const getTreatmentBadges = (treatments: string[]) => {
    return treatments.slice(0, 3).map((treatment, index) => (
      <span key={index} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mr-1 mb-1">
        {treatment}
      </span>
    ))
  }

  const getGenderIcon = (gender: 'female' | 'male') => {
    return gender === 'female' ? (
      <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Kayıtlı Hastalar</h1>
              <p className="text-lg text-gray-600">
                Toplam <span className="font-semibold text-blue-600">{filteredPatients.length}</span> hasta bulundu
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                href="/patients/new"
                className="btn-primary inline-flex items-center text-lg px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Yeni Hasta Ekle
              </Link>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-400 text-green-700 rounded-xl shadow-sm">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="font-semibold">Hasta başarıyla kaydedildi!</p>
                <p className="text-sm opacity-80">Hasta listesinde görüntüleyebilirsiniz.</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-end gap-6">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">🔍 Arama</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 pr-4 py-3 text-lg rounded-xl border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Hasta adı, telefon veya e-posta..."
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">👥 Cinsiyet</label>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value as 'all' | 'female' | 'male')}
                className="input-field py-3 px-4 rounded-xl border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="all">Tümü</option>
                <option value="female">Kadın</option>
                <option value="male">Erkek</option>
              </select>
            </div>

            {/* Treatment Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">💉 Tedavi</label>
              <select
                value={filterTreatment}
                onChange={(e) => setFilterTreatment(e.target.value)}
                className="input-field py-3 px-4 rounded-xl border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">📊 Sıralama</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortBy(field as 'name' | 'createdAt' | 'updatedAt')
                  setSortOrder(order as 'asc' | 'desc')
                }}
                className="input-field py-3 px-4 rounded-xl border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">👁️ Görünüm</label>
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'table' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📋 Tablo
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🎴 Kart
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Patients List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {filteredPatients.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hasta bulunamadı</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterGender !== 'all' || filterTreatment !== 'all' 
                  ? 'Filtreleri değiştirmeyi deneyin' 
                  : 'Henüz hasta kaydı yapılmamış'}
              </p>
              {!searchTerm && filterGender === 'all' && filterTreatment === 'all' && (
                <Link href="/patients/new" className="btn-primary text-lg px-8 py-3">
                  İlk Hastayı Ekle
                </Link>
              )}
            </div>
          ) : viewMode === 'table' ? (
            /* Table View */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      👤 Hasta
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      📞 İletişim
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      💊 Tedaviler
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      📸 Fotoğraflar
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      📅 Kayıt Tarihi
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      ⚙️ İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-sm font-bold text-white">
                              {patient.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">{patient.name}</div>
                            <div className="flex items-center text-sm text-gray-500">
                              {getGenderIcon(patient.gender)}
                              <span className="ml-1">
                                {patient.gender === 'female' ? 'Kadın' : 'Erkek'}
                              </span>
                              {patient.birthDate && (
                                <span className="ml-2">• {new Date(patient.birthDate).toLocaleDateString('tr-TR')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{patient.phone}</div>
                        {patient.email && (
                          <div className="text-sm text-gray-500">{patient.email}</div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {getTreatmentBadges(patient.selectedTreatments)}
                          {patient.selectedTreatments.length > 3 && (
                            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                              +{patient.selectedTreatments.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            📷 {patient.beforePhotos.length} Öncesi
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            📷 {patient.afterPhotos.length} Sonrası
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="text-center">
                          <div className="font-semibold">{new Date(patient.createdAt).toLocaleDateString('tr-TR')}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(patient.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <Link
                            href={`/patients/${patient.id}`}
                            className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors duration-200"
                          >
                            👁️ Görüntüle
                          </Link>
                          <Link
                            href={`/patients/${patient.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline transition-colors duration-200"
                          >
                            ✏️ Düzenle
                          </Link>
                          <button
                            onClick={() => handleDeletePatient(patient.id, patient.name)}
                            className="text-red-600 hover:text-red-800 font-semibold hover:underline transition-colors duration-200"
                          >
                            🗑️ Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View */
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatients.map((patient) => (
                  <div key={patient.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-xl font-bold text-white">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{patient.name}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          {getGenderIcon(patient.gender)}
                          <span className="ml-1">
                            {patient.gender === 'female' ? 'Kadın' : 'Erkek'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 w-16">📞</span>
                        <span className="font-semibold">{patient.phone}</span>
                      </div>
                      {patient.email && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500 w-16">📧</span>
                          <span className="font-semibold">{patient.email}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 w-16">📅</span>
                        <span className="font-semibold">
                          {new Date(patient.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">💊 Tedaviler</h4>
                      <div className="flex flex-wrap gap-1">
                        {getTreatmentBadges(patient.selectedTreatments)}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">📸 Fotoğraflar</h4>
                      <div className="flex space-x-2">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {patient.beforePhotos.length} Öncesi
                        </span>
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          {patient.afterPhotos.length} Sonrası
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 pt-4 border-t border-gray-100">
                      <Link
                        href={`/patients/${patient.id}`}
                        className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 text-center py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        👁️ Görüntüle
                      </Link>
                      <Link
                        href={`/patients/${patient.id}/edit`}
                        className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-center py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        ✏️ Düzenle
                      </Link>
                      <button
                        onClick={() => handleDeletePatient(patient.id, patient.name)}
                        className="flex-1 bg-red-50 text-red-700 hover:bg-red-100 text-center py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        🗑️ Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
