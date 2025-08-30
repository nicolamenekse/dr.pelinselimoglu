'use client'

import { usePatientStore } from '@/stores/patientStore'
import Link from 'next/link'

export default function RecentPatients() {
  const { patients } = usePatientStore()

  // Get the 5 most recent patients
  const recentPatients = patients
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getGenderIcon = (gender: string) => {
    return gender === 'female' ? '👩' : '👨'
  }

  const getGenderColor = (gender: string) => {
    return gender === 'female' ? 'from-pink-100 to-pink-200 text-pink-600' : 'from-blue-100 to-blue-200 text-blue-600'
  }

  if (recentPatients.length === 0) {
    return (
      <div className="modern-card p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="heading-3-modern mb-2">Henüz Hasta Yok</h3>
        <p className="text-modern mb-6">İlk hasta kaydını oluşturmak için "Yeni Hasta" butonuna tıklayın</p>
        <Link href="/patients/new" className="btn-primary-modern">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          İlk Hastayı Ekle
        </Link>
      </div>
    )
  }

  return (
    <div className="modern-card p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-100 to-accent-200 rounded-2xl flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h2 className="heading-2-modern">Son Eklenen Hastalar</h2>
            <p className="text-modern">Son 5 hasta kaydı</p>
          </div>
        </div>
        <Link 
          href="/patients" 
          className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200"
        >
          Tümünü Gör →
        </Link>
      </div>

      <div className="space-y-4">
        {recentPatients.map((patient, index) => (
          <Link
            key={patient.id}
            href={`/patients/${patient.id}`}
            className="block group"
          >
            <div className="modern-card p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="patient-avatar-modern group-hover:scale-110 transition-transform duration-200">
                  {patient.beforePhotos.length > 0 ? (
                    <img
                      src={patient.beforePhotos[0]}
                      alt={patient.name}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <span className="text-lg font-bold">{getInitials(patient.name)}</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gradient transition-colors duration-200 truncate">
                      {patient.name}
                    </h3>
                    <span className="text-2xl">{getGenderIcon(patient.gender)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(patient.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                    
                    {patient.selectedTreatments.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <span>{patient.selectedTreatments[0]}</span>
                        {patient.selectedTreatments.length > 1 && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            +{patient.selectedTreatments.length - 1}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">
            Toplam {patients.length} hasta kaydı
          </p>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-accent-300 rounded-full"></div>
            <div className="w-2 h-2 bg-primary-300 rounded-full"></div>
            <div className="w-2 h-2 bg-success-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
