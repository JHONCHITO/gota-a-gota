'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Oficina } from '@/lib/types'

interface OficinaListItem extends Omit<Oficina, '_id'> {
  _id: string
}

export default function DashboardClient() {
  const [oficinas, setOficinas] = useState<OficinaListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    nombre: '',
    ciudad: '',
    direccion: '',
    telefono: '',
    responsable: '',
    emailContacto: '',
    descripcion: '',
    usuarioAdmin: '',
    passwordAdmin: '',
  })

  useEffect(() => {
    fetchOficinas()
  }, [])

  const fetchOficinas = async () => {
    try {
      const response = await fetch('/api/oficinas')
      const data = await response.json()
      setOficinas(data.oficinas || [])
    } catch {
      setError('Error al cargar oficinas')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const url = editingId ? `/api/oficinas/${editingId}` : '/api/oficinas'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar oficina')
      }

      setSuccess(editingId ? 'Oficina actualizada exitosamente' : 'Oficina creada exitosamente')
      setFormData({
        nombre: '',
        ciudad: '',
        direccion: '',
        telefono: '',
        responsable: '',
        emailContacto: '',
        descripcion: '',
        usuarioAdmin: '',
        passwordAdmin: '',
      })
      setEditingId(null)
      fetchOficinas()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (oficina: OficinaListItem) => {
    setEditingId(oficina._id)
    setFormData({
      nombre: oficina.nombre,
      ciudad: oficina.ciudad,
      direccion: oficina.direccion,
      telefono: oficina.telefono,
      responsable: oficina.responsable || '',
      emailContacto: oficina.emailContacto || '',
      descripcion: oficina.descripcion || '',
      usuarioAdmin: oficina.usuarioAdmin,
      passwordAdmin: '',
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta oficina?')) return

    try {
      const response = await fetch(`/api/oficinas/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar')
      }

      setSuccess('Oficina eliminada exitosamente')
      fetchOficinas()
    } catch {
      setError('Error al eliminar oficina')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({
      nombre: '',
      ciudad: '',
      direccion: '',
      telefono: '',
      responsable: '',
      emailContacto: '',
      descripcion: '',
      usuarioAdmin: '',
      passwordAdmin: '',
    })
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-900/50 border border-green-500 text-green-200 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lista de oficinas */}
          <div className="bg-[#161b22] rounded-xl p-6 border border-[#30363d]">
            <h2 className="text-xl font-semibold mb-6">Oficinas Registradas</h2>
            
            {loading ? (
              <p className="text-[#8b949e]">Cargando...</p>
            ) : oficinas.length === 0 ? (
              <p className="text-[#8b949e]">No hay oficinas registradas</p>
            ) : (
              <div className="space-y-4">
                {oficinas.map((oficina) => (
                  <div
                    key={oficina._id}
                    className="border-b border-[#30363d] pb-4 last:border-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-white">{oficina.nombre}</h3>
                        <p className="text-sm text-[#8b949e]">Ciudad: {oficina.ciudad}</p>
                        <p className="text-sm text-[#8b949e]">Dirección: {oficina.direccion}</p>
                        <p className="text-sm text-[#8b949e]">Teléfono: {oficina.telefono}</p>
                        {oficina.responsable && (
                          <p className="text-sm text-[#8b949e]">Responsable: {oficina.responsable}</p>
                        )}
                        {oficina.emailContacto && (
                          <p className="text-sm text-[#8b949e]">Email: {oficina.emailContacto}</p>
                        )}
                        <p className="text-sm text-[#8b949e]">Usuario admin: {oficina.usuarioAdmin}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleEdit(oficina)}
                          className="px-4 py-1 bg-yellow-600/20 text-yellow-400 border border-yellow-600 rounded hover:bg-yellow-600/30 transition-colors text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(oficina._id)}
                          className="px-4 py-1 bg-red-600/20 text-red-400 border border-red-600 rounded hover:bg-red-600/30 transition-colors text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulario crear/editar oficina */}
          <div className="bg-[#161b22] rounded-xl p-6 border border-[#30363d]">
            <h2 className="text-xl font-semibold mb-6">
              {editingId ? 'Editar Oficina' : 'Crear Nueva Oficina'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#c9d1d9] mb-1">
                  Nombre de la oficina
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#6366f1]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#c9d1d9] mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#6366f1]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#c9d1d9] mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#6366f1]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#c9d1d9] mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#6366f1]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#c9d1d9] mb-1">
                  Responsable (opcional)
                </label>
                <input
                  type="text"
                  value={formData.responsable}
                  onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#6366f1]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#c9d1d9] mb-1">
                  Email de contacto (opcional)
                </label>
                <input
                  type="email"
                  value={formData.emailContacto}
                  onChange={(e) => setFormData({ ...formData, emailContacto: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#6366f1]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#c9d1d9] mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#6366f1] min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#c9d1d9] mb-1">
                  Usuario admin
                </label>
                <input
                  type="text"
                  value={formData.usuarioAdmin}
                  onChange={(e) => setFormData({ ...formData, usuarioAdmin: e.target.value })}
                  placeholder="admin@gotaagota.com"
                  className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#6366f1]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#c9d1d9] mb-1">
                  Contraseña admin {editingId && '(dejar vacío para mantener)'}
                </label>
                <input
                  type="password"
                  value={formData.passwordAdmin}
                  onChange={(e) => setFormData({ ...formData, passwordAdmin: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#6366f1]"
                  required={!editingId}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-[#6366f1] hover:bg-[#5558e3] disabled:bg-[#6366f1]/50 text-white font-medium rounded-lg transition-colors"
                >
                  {saving ? 'Guardando...' : editingId ? 'Actualizar Oficina' : 'Crear Oficina'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-3 bg-[#30363d] hover:bg-[#484f58] text-white font-medium rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
