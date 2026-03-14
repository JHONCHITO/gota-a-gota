"use client"

import { useState } from "react"
import useSWR from "swr"
import { getClientes, getCobradores, createCliente, updateCliente, deleteCliente } from "@/lib/api"
import { getCobradorName } from "@/lib/format"
import type { ClienteForm, Cliente } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

const emptyForm: ClienteForm = {
  nombre: "",
  cc: "",
  direccion: "",
  celular: "",
  cobradorId: null, // <‑‑ ahora null por defecto
  tipo: "nuevo",
}

export default function ClientesPage() {
  const { data: clientes, isLoading, mutate } = useSWR("clientes", getClientes)
  const { data: cobradores } = useSWR("cobradores", getCobradores)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [form, setForm] = useState<ClienteForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null)

  const filtered = clientes?.filter(
    (c) =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.cc.includes(search) ||
      c.celular.includes(search)
  )

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(cliente: Cliente) {
    setEditing(cliente)
    const cobId =
      typeof cliente.cobradorId === "object" && cliente.cobradorId
        ? cliente.cobradorId._id
        : (cliente.cobradorId as string) || ""
    setForm({
      nombre: cliente.nombre,
      cc: cliente.cc,
      direccion: cliente.direccion,
      celular: cliente.celular,
      cobradorId: cobId,
      tipo: cliente.tipo || "nuevo",
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload: ClienteForm = {
        ...form,
        // cobradorId ya es string | null, no hace falta “|| null”
      }
      if (editing) {
        await updateCliente(editing._id, payload)
        toast.success("Cliente actualizado")
      } else {
        await createCliente(payload)
        toast.success("Cliente creado")
      }
      await mutate()
      setDialogOpen(false)
    } catch (err) {
      toast.error("Error al guardar cliente")
      console.error(err)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteCliente(deleteTarget._id)
      toast.success("Cliente eliminado")
      await mutate()
    } catch (err) {
      toast.error("Error al eliminar cliente")
      console.error(err)
    }
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">Gestiona los clientes del sistema</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, cedula o telefono..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {filtered?.length || 0} clientes encontrados
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nombre</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cedula</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Telefono</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Direccion</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cobrador</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered?.map((cliente) => (
                    <tr key={cliente._id} className="border-b border-border last:border-0">
                      <td className="px-4 py-4 font-medium text-foreground">{cliente.nombre}</td>
                      <td className="px-4 py-4 text-foreground">{cliente.cc}</td>
                      <td className="px-4 py-4 text-foreground">{cliente.celular}</td>
                      <td className="px-4 py-4 text-muted-foreground">{cliente.direccion}</td>
                      <td className="px-4 py-4 text-foreground">
                        {getCobradorName(cliente.cobradorId as { nombre?: string } | string | null)}
                      </td>
                      <td className="px-4 py-4">
                        <Badge className="bg-primary/10 text-primary">
                          {cliente.tipo === "frecuente" ? "Frecuente" : "Activo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(cliente)}
                            aria-label={`Editar ${cliente.nombre}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(cliente)}
                            className="text-destructive hover:text-destructive"
                            aria-label={`Eliminar ${cliente.nombre}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered?.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                        No se encontraron clientes
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Cliente" : "Nuevo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label>Nombre</Label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Cedula</Label>
              <Input
                value={form.cc}
                onChange={(e) => setForm({ ...form, cc: e.target.value })}
                placeholder="Numero de cedula"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Telefono</Label>
              <Input
                value={form.celular}
                onChange={(e) => setForm({ ...form, celular: e.target.value })}
                placeholder="Numero de celular"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Direccion</Label>
              <Input
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                placeholder="Direccion"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Cobrador</Label>
              <Select
                value={form.cobradorId ?? "none"}                // muestra “none” cuando es null
                onValueChange={(v) =>
                  setForm({ ...form, cobradorId: v === "none" ? null : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cobrador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {cobradores?.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Tipo</Label>
              <Select
                value={form.tipo}
                onValueChange={(v) => setForm({ ...form, tipo: v as "nuevo" | "frecuente" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="frecuente">Frecuente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : editing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cliente</AlertDialogTitle>
            <AlertDialogDescription>
              {"Esta seguro de eliminar a "}{deleteTarget?.nombre}{"? Esta accion no se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
