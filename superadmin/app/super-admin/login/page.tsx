'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DollarSign } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

export default function SuperAdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!API_BASE) {
        throw new Error('Falta configurar NEXT_PUBLIC_API_BASE_URL')
      }

      const response = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión')
      }

      // aquí podrías guardar token en localStorage si lo devuelves
      // localStorage.setItem('token', data.token)

      router.push('/super-admin/dashboard')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al iniciar sesión'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#161b22] rounded-xl p-8 border border-[#30363d]">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-[#6366f1] rounded-xl flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-1">
          Gota a Gota
        </h1>
        <p className="text-[#8b949e] text-center mb-8">
          Super Admin
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#c9d1d9] mb-1"
            >
              Usuario
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gotaagota.com"
              className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-white placeholder-[#6e7681] focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#c9d1d9] mb-1"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-white placeholder-[#6e7681] focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#6366f1] hover:bg-[#5558e3] disabled:bg-[#6366f1]/50 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
