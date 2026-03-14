'use client'

import { useRouter } from 'next/navigation'
import type { SessionPayload } from '@/lib/auth'

interface Props {
  session: SessionPayload
}

export default function OficinaDashboardClient({ session }: Props) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Panel de Oficina</h1>
            <p className="text-[#8b949e]">{session.oficinaNombre}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="bg-[#161b22] rounded-xl p-6 border border-[#30363d]">
          <h2 className="text-xl font-semibold mb-4">Bienvenido</h2>
          <p className="text-[#8b949e] mb-6">
            Has iniciado sesión correctamente en la oficina: <strong className="text-white">{session.oficinaNombre}</strong>
          </p>
          
          <div className="bg-[#0d1117] rounded-lg p-4 border border-[#30363d]">
            <h3 className="font-medium mb-2">Información de la sesión:</h3>
            <ul className="text-sm text-[#8b949e] space-y-1">
              <li>ID de Oficina: {session.oficinaId}</li>
              <li>Usuario: {session.email}</li>
              <li>Rol: {session.role}</li>
            </ul>
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <h3 className="font-medium text-blue-400 mb-2">Nota de integración</h3>
            <p className="text-sm text-[#8b949e]">
              Este dashboard es un ejemplo. Puedes integrar esta autenticación con tu proyecto existente de Gota a Gota 
              usando la sesión JWT. La información de la oficina está disponible en la sesión para filtrar datos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
