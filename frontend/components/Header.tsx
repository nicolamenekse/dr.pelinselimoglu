'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuthStore()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/'
    }
    return pathname === href
  }

  const menuItems = [
    { href: '/dashboard', label: 'Ana Sayfa', icon: '🏠' },
    { href: '/patients/new', label: 'Yeni Kayıt', icon: '➕' },
    { href: '/patients', label: 'Hastalar', icon: '👥' },
    { href: '/appointments', label: 'Randevular', icon: '📅' },
    { href: '/reports', label: 'Raporlar', icon: '📊' }
  ]

  // Don't render user-specific content until client-side hydration is complete
  if (!isClient || isLoading) {
    return (
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-600 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Clinic Name */}
            <div className="flex items-center space-x-4 group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-slate-500">
                <span className="text-white font-bold text-lg font-serif">PS</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-white font-serif">Dr.Pelin Selimoğlu</span>
                <p className="text-xs text-slate-300 font-medium">Estetik Güzellik</p>
              </div>
            </div>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden lg:flex items-center space-x-1">
              {menuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2 whitespace-nowrap ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white border border-slate-500 shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-xs">{item.label}</span>
                </a>
              ))}
            </nav>

            {/* Loading State for User Info */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-3">
                <div className="w-9 h-9 bg-slate-700 rounded-xl animate-pulse"></div>
                <div className="w-24 h-4 bg-slate-700 rounded animate-pulse"></div>
              </div>
              <div className="w-20 h-9 bg-slate-700 rounded-xl animate-pulse"></div>
            </div>

            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-600 shadow-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Clinic Name */}
          <div className="flex items-center space-x-4 group cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-slate-500">
              <span className="text-white font-bold text-lg font-serif">PS</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-white font-serif">Dr.Pelin Selimoğlu</span>
              <p className="text-xs text-slate-300 font-medium">Estetik Güzellik</p>
            </div>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center space-x-1">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2 whitespace-nowrap ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white border border-slate-500 shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50 hover:border-slate-500'
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </a>
            ))}
          </nav>

          {/* User Info and Logout - Far Right */}
          <div className="flex items-center space-x-3">
            {/* User Avatar and Name */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl flex items-center justify-center border border-slate-500">
                <span className="text-white font-semibold text-sm font-serif">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-slate-300 text-sm font-medium whitespace-nowrap">
                Dr. {user?.name || 'Kullanıcı'}
              </span>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl text-sm font-medium transition-all duration-300 border border-red-500 hover:border-red-400 shadow-lg hover:shadow-xl flex items-center space-x-2 whitespace-nowrap"
            >
              <span className="text-sm">🚪</span>
              <span className="text-xs">Çıkış</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden animate-fade-in-up border-t border-slate-600 bg-slate-800/95 backdrop-blur-sm">
            <div className="py-4 space-y-2">
              {menuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white border border-slate-500'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-base mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              ))}
              
              {/* Mobile User Info and Logout */}
              <div className="px-6 py-4 border-t border-slate-600">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl flex items-center justify-center border border-slate-500">
                    <span className="text-white font-semibold text-sm font-serif">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Dr. {user?.name || 'Kullanıcı'}</p>
                    <p className="text-slate-400 text-xs">Kullanıcı</p>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl text-sm font-medium transition-all duration-300 border border-red-500 hover:border-red-400 shadow-lg flex items-center justify-center space-x-2"
                >
                  <span className="text-base">🚪</span>
                  <span>Çıkış Yap</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
