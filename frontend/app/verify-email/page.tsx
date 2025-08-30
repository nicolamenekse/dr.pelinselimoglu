'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export default function VerifyEmailPage() {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verifyEmail, error, clearError } = useAuthStore()

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (!token || !email) {
      setVerificationStatus('error')
      setErrorMessage('Geçersiz doğrulama bağlantısı')
      return
    }

    const performVerification = async () => {
      setIsVerifying(true)
      clearError()
      
      try {
        await verifyEmail(email, token)
        setVerificationStatus('success')
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } catch (error: any) {
        setVerificationStatus('error')
        setErrorMessage(error.response?.data?.message || 'Doğrulama başarısız')
      } finally {
        setIsVerifying(false)
      }
    }

    performVerification()
  }, [token, email, verifyEmail, clearError, router])

  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="form-card text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">PS</span>
            </div>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">E-posta Doğrulandı!</h2>
          <p className="text-gray-600 mb-6">
            Dr.Pelin Selimoğlu Estetik Güzellik hesabınız başarıyla doğrulandı. Dashboard'a yönlendiriliyorsunuz...
          </p>
          
          <div className="animate-pulse">
            <div className="h-2 bg-gray-200 rounded-full w-3/4 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="form-card text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">PS</span>
            </div>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Doğrulama Başarısız</h2>
          <p className="text-gray-600 mb-6">
            {errorMessage}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="btn-primary w-full"
            >
              Giriş Sayfasına Git
            </button>
            <button
              onClick={() => router.push('/register')}
              className="btn-secondary w-full"
            >
              Yeni Hesap Oluştur
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="form-card text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">E-posta Doğrulanıyor</h2>
        <p className="text-gray-600 mb-6">
          Lütfen bekleyin, e-posta adresiniz doğrulanıyor...
        </p>
        
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    </div>
  )
}
