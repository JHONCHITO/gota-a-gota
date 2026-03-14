'use client'

import { useState } from 'react'

type Oficina = {
  id: string
  nombre: string
  email: string
  password: string
  administrador: string
  telefono: string
  direccion: string
  ciudad: string
}

export default function SuperAdminDashboard() {
  const [oficinas, setOficinas] = useState<Oficina[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    administrador: '',
    telefono: '',
    direccion: '',
    ciudad: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!API_URL) {
        throw new Error('Falta NEXT_PUBLIC_API_URL en el entorno')
      }

      // si estás editando, podrías usar PUT/PATCH aquí. De momento solo creamos.
      const response = await fetch(`${API_URL}/oficinas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear oficina')
      }

      setOficinas(prev => [
        ...prev,
        {
          id: data.id || crypto.randomUUID(),
          ...formData,
        },
      ])

      setEditingId(null)

      setFormData({
        nombre: '',
        email: '',
        password: '',
        administrador: '',
        telefono: '',
        direccion: '',
        ciudad: '',
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al crear oficina'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (oficina: Oficina) => {
    setEditingId(oficina.id)
    setFormData({
      nombre: oficina.nombre,
      email: oficina.email,
      password: oficina.password,
      administrador: oficina.administrador,
      telefono: oficina.telefono,
      direccion: oficina.direccion,
      ciudad: oficina.ciudad,
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar esta oficina?')) return
    // aquí luego podemos llamar DELETE al backend
    setOficinas(prev => prev.filter(o => o.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Panel Super Admin
            </h1>
            <p className="text-gray-400 mt-1">
              Crea y administra las oficinas, sus accesos y datos.
            </p>
          </div>
          <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Modo configuración
          </span>
        </header>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        {/* Contenido principal */}
        <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* Formulario */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg shadow-black/40">
            <h2 className="text-xl font-semibold mb-4">
              Crear / editar oficina
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Define el correo y contraseña de acceso de la oficina y los
              datos del administrador responsable.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre y ciudad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Nombre de la oficina
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Oficina Centro Cali"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Cali"
                    required
                  />
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Cra 1 # 2-34"
                  required
                />
              </div>

              {/* Credenciales de acceso */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Correo de acceso
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="oficina@tuapp.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Contraseña de acceso
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="********"
                    required
                  />
                </div>
              </div>

              {/* Datos administrador */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Administrador responsable
                  </label>
                  <input
                    type="text"
                    name="administrador"
                    value={formData.administrador}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Nombre completo"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Teléfono de contacto
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="+57 300 000 0000"
                    required
                  />
                </div>
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-semibold text-sm py-2.5 transition-colors"
              >
                {loading
                  ? 'Guardando...'
                  : editingId
                  ? 'Guardar cambios'
                  : 'Crear oficina'}
              </button>
            </form>
          </section>

          {/* Tabla de oficinas */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg shadow-black/40">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Oficinas registradas
              </h2>
              <span className="text-xs text-gray-400">
                Total: {oficinas.length}
              </span>
            </div>

            {oficinas.length === 0 ? (
              <p className="mt-6 text-sm text-gray-500">
                Aún no hay oficinas creadas. Crea la primera con el
                formulario de la izquierda.
              </p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-950/60 text-gray-300">
                    <tr>
                      <th className="px-3 py-2 text-left">Oficina</th>
                      <th className="px-3 py-2 text-left">Admin</th>
                      <th className="px-3 py-2 text-left">Correo</th>
                      <th className="px-3 py-2 text-left">Ciudad</th>
                      <th className="px-3 py-2 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                    {oficinas.map(oficina => (
                      <tr key={oficina.id}>
                        <td className="px-3 py-2">
                          <div className="font-medium">
                            {oficina.nombre}
                          </div>
                          <div className="text-xs text-gray-400">
                            {oficina.direccion}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="font-medium">
                            {oficina.administrador}
                          </div>
                          <div className="text-xs text-gray-400">
                            {oficina.telefono}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-xs bg-slate-800/80 px-2 py-1 rounded-full">
                            {oficina.email}
                          </span>
                        </td>
                        <td className="px-3 py-2">{oficina.ciudad}</td>
                        <td className="px-3 py-2 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleEdit(oficina)}
                              className="px-2 py-1 text-xs rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/40 hover:bg-sky-500/20 transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(oficina.id)}
                              className="px-2 py-1 text-xs rounded-md bg-red-500/10 text-red-400 border border-red-500/40 hover:bg-red-500/20 transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
