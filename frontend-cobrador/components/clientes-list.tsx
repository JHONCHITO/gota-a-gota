"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { useAuth } from "@/lib/auth-context"
import { cobradoresApi, clientesApi, type Cliente, type ClienteCreate } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Search, User, Loader2, Plus } from "lucide-react"

export function ClientesList() {
  const { cobrador } = useAuth()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [errorCreate, setErrorCreate] = useState("")

  const [nombre, setNombre] = useState("")
  const [cc, setCc] = useState("")
  const [celular, setCelular] = useState("")
  const [direccion, setDireccion] = useState("")
  const [tipo, setTipo] = useState("")

  const {
    data: clientes,
    isLoading,
    mutate,
  } = useSWR<Cliente[]>(
    cobrador ? `cobrador-${cobrador._id}-clientes` : null,
    () => cobradoresApi.getClientes(cobrador!._id)
  )

  const filtered = useMemo(() => {
    if (!clientes) return []
    if (!search.trim()) return clientes
    const q = search.toLowerCase()
    return clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.cc.toLowerCase().includes(q)
    )
  }, [clientes, search])

  const resetForm = () => {
    setNombre("")
    setCc("")
    setCelular("")
    setDireccion("")
    setTipo("")
    setErrorCreate("")
  }

  const handleCrearCliente = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !cc.trim() || !celular.trim() || !direccion.trim()) {
      setErrorCreate("Nombre, cédula, celular y dirección son obligatorios")
      return
    }
    setErrorCreate("")
    setLoadingCreate(true)
    try {
      const data: ClienteCreate = {
        nombre: nombre.trim(),
        cc: cc.trim(),
        celular: celular.trim(),
        direccion: direccion.trim(),
        tipo: tipo || undefined,
        cobradorId: cobrador?._id,
      }
      await clientesApi.create(data)
      await mutate()
      resetForm()
      setModalOpen(false)
    } catch (err) {
      setErrorCreate(
        err instanceof Error ? err.message : "Error al crear cliente"
      )
    } finally {
      setLoadingCreate(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/menu")}
              aria-label="Volver"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold text-foreground">Clientes</h1>
          </div>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Agregar
          </Button>
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Buscar por nombre o cedula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Lista */}
      <main className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-muted-foreground">
            <User className="mb-2 h-10 w-10" />
            <p>No se encontraron clientes</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar primer cliente
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((cliente) => (
              <Card
                key={cliente._id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => router.push(`/clientes/${cliente._id}`)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {cliente.nombre}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      CC: {cliente.cc}
                    </p>
                    {cliente.celular && (
                      <p className="text-xs text-muted-foreground">
                        Tel: {cliente.celular}
                      </p>
                    )}
                  </div>
                  {cliente.tipo && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                      {cliente.tipo}
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Modal agregar cliente */}
      <Dialog
        open={modalOpen}
        onOpenChange={(v) => {
          if (!v) { resetForm(); setModalOpen(false) }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Cliente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCrearCliente} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nombre">Nombre <span className="text-destructive">*</span></Label>
              <Input
                id="nombre"
                placeholder="Nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cc">Cédula <span className="text-destructive">*</span></Label>
              <Input
                id="cc"
                placeholder="Número de cédula"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="celular">Celular <span className="text-destructive">*</span></Label>
              <Input
                id="celular"
                placeholder="Número de celular"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="direccion">Dirección <span className="text-destructive">*</span></Label>
              <Input
                id="direccion"
                placeholder="Dirección del cliente"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tipo">Tipo de Cliente</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="frecuente">Frecuente</SelectItem>
                  <SelectItem value="moroso">Moroso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {errorCreate && (
              <p className="text-sm text-destructive" role="alert">{errorCreate}</p>
            )}
            <DialogFooter className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => { resetForm(); setModalOpen(false) }} disabled={loadingCreate}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loadingCreate}>
                {loadingCreate ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</>
                ) : "Agregar Cliente"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
