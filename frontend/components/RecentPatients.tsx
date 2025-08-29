'use client'

import Link from 'next/link'
import { usePatientStore } from '@/stores/patientStore'

export default function RecentPatients() {
  const { patients } = usePatientStore()
  
  // Get 5 most recent patients
  const recentPatients = patients
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Son Eklenen Hastalar</h2>
        <Link href="/patients" className="text-sm text-blue-600 hover:text-blue-800">
          Tümünü Gör
        </Link>
      </div>
      
      {recentPatients.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz hasta yok</h3>
          <p className="mt-1 text-sm text-gray-500">
            İlk hastayı eklemek için yeni hasta kaydı yapın
          </p>
          <div className="mt-6">
            <Link href="/patients/new" className="btn-primary text-sm">
              İlk Hastayı Ekle
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {recentPatients.map((patient) => (
            <div key={patient.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {patient.name}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {patient.phone}
                </p>
              </div>
              <div className="text-xs text-gray-400">
                {new Date(patient.createdAt).toLocaleDateString('tr-TR')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
