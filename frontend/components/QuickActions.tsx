'use client'

import Link from 'next/link'

interface QuickActionProps {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: 'blue' | 'green' | 'purple' | 'orange'
}

export default function QuickActions() {
  const actions: QuickActionProps[] = [
    {
      title: 'Yeni Hasta Kaydı',
      description: 'Yeni hasta bilgilerini sisteme ekleyin',
      href: '/patients/new',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: 'blue'
    },
    {
      title: 'Hasta Listesi',
      description: 'Tüm kayıtlı hastaları görüntüleyin ve yönetin',
      href: '/patients',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'green'
    },
    {
      title: 'Randevu Takvimi',
      description: 'Hasta randevularını planlayın ve takip edin',
      href: '/appointments',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'purple'
    },
    {
      title: 'Raporlar',
      description: 'Hasta istatistikleri ve tedavi raporları',
      href: '/reports',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'orange'
    }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'
      case 'green':
        return 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
      case 'purple':
        return 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200'
      case 'orange':
        return 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200'
      default:
        return 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Hızlı İşlemler</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className={`p-4 rounded-lg border transition-colors duration-200 ${getColorClasses(action.color)}`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {action.icon}
              </div>
              <div>
                <h3 className="font-medium">{action.title}</h3>
                <p className="text-sm opacity-80">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
