'use client'

import Link from 'next/link'

const quickActions = [
  {
    title: 'Yeni Hasta',
    description: 'Yeni hasta kaydı oluştur',
    icon: '👤',
    href: '/patients/new',
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Hasta Listesi',
    description: 'Tüm hastaları görüntüle',
    icon: '📋',
    href: '/patients',
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    title: 'Randevular',
    description: 'Randevu takvimini yönet',
    icon: '📅',
    href: '/appointments',
    color: 'from-violet-500 to-violet-600'
  },
  {
    title: 'Raporlar',
    description: 'Hasta istatistikleri ve raporlar',
    icon: '📊',
    href: '/reports',
    color: 'from-amber-500 to-amber-600'
  }
]

export default function QuickActions() {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl shadow-2xl border border-slate-600 p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-500 rounded-3xl mb-6 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 font-serif">Hızlı İşlemler</h2>
        <p className="text-slate-300 text-sm">Günlük işlemlerinizi hızlıca gerçekleştirin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className="group block"
          >
            <div className="bg-gradient-to-br from-slate-750 to-slate-700 rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 border border-slate-600 hover:border-slate-500 cursor-pointer">
              <div className="flex items-start space-x-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">{action.icon}</span>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2 font-serif group-hover:text-blue-300 transition-colors duration-300">
                    {action.title}
                  </h3>
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                    {action.description}
                  </p>
                  
                  <div className="flex items-center text-blue-400 font-semibold text-sm group-hover:text-blue-300 transition-colors duration-300">
                    <span>Başla</span>
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-600">
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-4">
            Tüm işlemlerinizi tek yerden yönetin
          </p>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
