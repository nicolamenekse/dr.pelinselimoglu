'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export default function HomePage() {
  const router = useRouter()
  const { user, checkAuth, isLoading } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    // Sadece checkAuth tamamlandıktan sonra yönlendirme yap
    if (!isLoading) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [user, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Yönlendiriliyor...</p>
      </div>
    </div>
  )
}
