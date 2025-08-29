'use client'

import Link from 'next/link'

interface Patient {
  id: string
  name: string
  phone: string
  lastVisit: string
  status: 'active' | 'inactive' | 'pending'
}

export default function RecentPatients() {
  // Mock data - later will come from API
  const recentPatients: Patient[] = [
    {
      id: '1',
      name: 'Ayşe Yılmaz',
      phone: '+90 555 123 4567',
      lastVisit: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Mehmet Demir',
      phone: '+90 555 987 6543',
      lastVisit: '2024-01-14',
      status: 'active'
    },
    {
      id: '3',
      name: 'Fatma Kaya',
      phone: '+90 555 456 7890',
      lastVisit: '2024-01-13',
      status: 'pending'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif'
      case 'inactive':
        return 'Pasif'
      case 'pending':
        return 'Beklemede'
      default:
        return 'Bilinmiyor'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Son Hastalar</h3>
          <Link
            href="/patients"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Tümünü Gör →
          </Link>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {recentPatients.map((patient) => (
          <div key={patient.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                  <p className="text-sm text-gray-500">{patient.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(patient.status)}`}>
                  {getStatusText(patient.status)}
                </span>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Son Ziyaret</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(patient.lastVisit).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
