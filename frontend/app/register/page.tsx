'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()
  const { register, isLoading, error, clearError } = useAuthStore()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (formData.password !== formData.confirmPassword) {
      return
    }

    try {
      await register(formData.name, formData.email, formData.password)
      setShowSuccess(true)
    } catch (error) {
      // Error is handled by the store
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="form-card text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Kayıt Başarılı!</h2>
          <p className="text-gray-600 mb-6">
            E-posta adresinize doğrulama bağlantısı gönderildi. 
            Lütfen e-postanızı kontrol edin ve hesabınızı doğrulayın.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="btn-primary w-full"
            >
              Giriş Sayfasına Git
            </button>
            <button
              onClick={() => setShowSuccess(false)}
              className="btn-secondary w-full"
            >
              Başka Hesap Oluştur
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="form-card">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kayıt Ol</h1>
          <p className="text-gray-600">Yeni hesap oluşturun</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Ad Soyad
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="Ad Soyad"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              E-posta
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="ornek@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Şifre
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Şifre Tekrar
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input-field"
              placeholder="••••••••"
              required
              minLength={6}
            />
            {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">Şifreler eşleşmiyor</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || formData.password !== formData.confirmPassword}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Giriş yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
