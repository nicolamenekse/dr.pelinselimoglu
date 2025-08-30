'use client'

import Link from 'next/link'

const quickActions = [
  {
    title: 'Yeni Hasta',
    description: 'Yeni hasta kaydı oluşturun',
    href: '/patients/new',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    color: 'primary'
  },
  {
    title: 'Hasta Listesi',
    description: 'Kayıtlı hastaları görüntüleyin',
    href: '/patients',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    color: 'accent'
  },
  {
    title: 'Randevular',
    description: 'Randevu takvimini yönetin',
    href: '/appointments',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'success'
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
    color: 'warning'
  }
]

const getColorClasses = (color: string) => {
  switch (color) {
    case 'primary':
      return 'from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700'
    case 'accent':
      return 'from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700'
    case 'success':
      return 'from-success-500 to-success-600 hover:from-success-600 hover:to-success-700'
    case 'warning':
      return 'from-warning-500 to-warning-600 hover:from-warning-600 hover:to-warning-700'
    default:
      return 'from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700'
  }
}

const getIconBgColor = (color: string) => {
  switch (color) {
    case 'primary':
      return 'bg-primary-100 text-primary-600'
    case 'accent':
      return 'bg-accent-100 text-accent-600'
    case 'success':
      return 'bg-success-100 text-success-600'
    case 'warning':
      return 'bg-warning-100 text-warning-600'
    default:
      return 'bg-primary-100 text-primary-600'
  }
}

export default function QuickActions() {
  return (
    <div className="modern-card p-8">
      <div className="flex items-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mr-4">
          <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h2 className="heading-2-modern">Hızlı İşlemler</h2>
          <p className="text-modern">Sık kullanılan işlemlere hızlıca erişin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className="group block"
          >
            <div className="modern-card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 ${getIconBgColor(action.color)} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gradient transition-colors duration-200">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {action.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-700 transition-colors duration-200">
                    <span>Başla</span>
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            Daha fazla özellik için menüyü kullanın
          </p>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-primary-300 rounded-full"></div>
            <div className="w-2 h-2 bg-accent-300 rounded-full"></div>
            <div className="w-2 h-2 bg-success-300 rounded-full"></div>
            <div className="w-2 h-2 bg-warning-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
