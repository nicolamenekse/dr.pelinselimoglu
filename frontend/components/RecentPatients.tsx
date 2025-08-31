'use client'

import { usePatientStore } from '@/stores/patientStore'
import Link from 'next/link'

export default function RecentPatients() {
  const { patients } = usePatientStore()

  // Get the 3 most recent patients
  const recentPatients = patients
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

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

  if (recentPatients.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl shadow-2xl border border-slate-600 p-6">
        <div className="flex items-center mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-500 rounded-2xl flex items-center justify-center mr-3 shadow-lg flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white font-serif truncate">Son Hastalar</h3>
        </div>
        
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h4 className="text-slate-200 font-semibold mb-2 text-base">Henüz hasta kaydı yok</h4>
          <p className="text-slate-400 text-xs mb-4 px-2">İlk hasta kaydınızı oluşturmak için aşağıdaki butona tıklayın</p>
          <Link
            href="/patients/new"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 text-white rounded-xl text-xs font-semibold transition-all duration-300 border border-slate-500 hover:border-slate-400 shadow-lg hover:shadow-xl"
          >
            <svg className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Yeni Hasta Ekle
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl shadow-2xl border border-slate-600 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center min-w-0 flex-1">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-500 rounded-2xl flex items-center justify-center mr-3 shadow-lg flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white font-serif truncate">Son Hastalar</h3>
        </div>
        <Link
          href="/patients"
          className="text-xs text-slate-300 hover:text-white font-medium hover:underline transition-colors duration-200 flex-shrink-0 ml-2"
        >
          Tümünü Gör
        </Link>
      </div>

      <div className="space-y-3">
        {recentPatients.map((patient) => (
          <Link
            key={patient.id}
            href={`/patients/${patient.id}`}
            className="block group"
          >
            <div className="p-4 rounded-2xl border border-slate-600 hover:border-slate-500 hover:shadow-lg transition-all duration-300 bg-slate-750 cursor-pointer">
              <div className="flex items-center space-x-3">
                {patient.beforePhotos && patient.beforePhotos.length > 0 ? (
                  <img
                    src={patient.beforePhotos[0]}
                    alt={patient.name}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-slate-500 shadow-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-500 rounded-xl flex items-center justify-center border-2 border-slate-500 shadow-lg flex-shrink-0">
                    <span className="text-slate-200 font-bold text-sm font-serif">
                      {getInitials(patient.name)}
                    </span>
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-sm font-semibold text-white truncate font-serif flex-1">
                      {patient.name}
                    </h4>
                    <span className="text-base flex-shrink-0">{getGenderIcon(patient.gender)}</span>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center bg-slate-700 px-2 py-1 rounded-lg w-fit">
                      <svg className="w-3 h-3 mr-1 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-slate-300 font-medium truncate">
                        {new Date(patient.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    
                    {patient.selectedTreatments && patient.selectedTreatments.length > 0 && (
                      <div className="flex items-center bg-slate-700 px-2 py-1 rounded-lg w-fit">
                        <svg className="w-3 h-3 mr-1 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <span className="text-xs text-slate-300 font-medium truncate max-w-[120px]">
                          {patient.selectedTreatments[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-600">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium truncate">Son 3 hasta kaydı</span>
          <div className="flex space-x-1 flex-shrink-0">
            <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
            <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
