"use client"

import { useState } from "react"
import useSWR from "swr"
import { getCobradores, getClientes, getCreditos, createCobrador, updateCobrador, deleteCobrador } from "@/lib/api"
import { calculateTotalPagado } from "@/lib/format"
import type { CobradorForm, Cobrador, Cliente, Credito } from "@/lib/types"
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
import { Search, Plus, Pencil, Trash2, Users, Wallet } from "lucide-react"
import { toast } from "sonner"

function countClientesByCobrador(clientes: Cliente[], cobradorId: string): number {
  return clientes.filter(
    (c) =>
      (typeof c.cobradorId === "object" && c.cobradorId?._id === cobradorId) ||
      c.cobradorId === cobradorId
  ).length
}

function calcCarteraByCobrador(creditos: Credito[], cobradorId: string): number {
  return creditos
    .filter(
      (c) =>
        (typeof c.cobradorId === "object" && c.cobradorId?._id === cobradorId) ||
        c.cobradorId === cobradorId
    )
    .reduce((sum, c) => sum + (c.montoPorPagar || 0) - calculateTotalPagado(c.pagos), 0)
}

const emptyForm: CobradorForm = {
  nombre: "",
  celular: "",
  direccion: "",
  cedula: "",
  usuario: "",
  contrasena: "",
  estado: "Activo",
}

export default function CobradoresPage() {
  const { data: cobradores, isLoading, mutate } = useSWR("cobradores", getCobradores)
  const { data: clientes } = useSWR("clientes", getClientes)
  const { data: creditos } = useSWR("creditos", getCreditos)

  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Cobrador | null>(null)
  const [form, setForm] = useState<CobradorForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Cobrador | null>(null)

  const filtered = cobradores?.filter(
    (c) =>
      c.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      c.cedula?.includes(search) ||
      c.celular?.includes(search)
  )

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(cobrador: Cobrador) {
    setEditing(cobrador)
    setForm({
      nombre: cobrador.nombre ?? "",
      celular: cobrador.celular ?? "",
      direccion: cobrador.direccion ?? "",
      cedula: cobrador.cedula ?? "",
      usuario: cobrador.usuario ?? "",
      contrasena: "", // 🔥 agregado
    })
    setDialogOpen(true)
  }

  async function handleSave() {
  setSaving(true)

  try {
    if (editing) {

      // 🔥 CLONAMOS EL FORM
      const dataToSend = { ...form }

      // 🔥 SI LA CONTRASEÑA ESTA VACÍA, LA ELIMINAMOS
      if (!dataToSend.contrasena) {
        delete dataToSend.contrasena
      }

      await updateCobrador(editing._id, dataToSend)
      toast.success("Cobrador actualizado")

    } else {
      await createCobrador(form)
      toast.success("Cobrador creado")
    }

    await mutate()
    setDialogOpen(false)

  } catch (err) {
    toast.error("Error al guardar cobrador")
    console.error(err)
  }

  setSaving(false)
}

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteCobrador(deleteTarget._id)
      toast.success("Cobrador eliminado")
      await mutate()
    } catch (err) {
      toast.error("Error al eliminar cobrador")
      console.error(err)
    }
    setDeleteTarget(null)
  }

  const totalFiltered = filtered?.length || 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cobradores</h1>
          <p className="text-muted-foreground">Gestiona los cobradores del sistema</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Cobrador
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, cedula o telefono..."
                value={search ?? ""}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {totalFiltered} cobradores encontrados
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
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Zona</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Clientes</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cartera</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered?.map((cobrador) => {
                    const numClientes = clientes ? countClientesByCobrador(clientes, cobrador._id) : 0
                    const cartera = creditos ? calcCarteraByCobrador(creditos, cobrador._id) : 0
                    const isActive = numClientes > 0
                    return (
                      <tr key={cobrador._id} className="border-b border-border last:border-0">
                        <td className="px-4 py-4 font-medium text-foreground">{cobrador.nombre}</td>
                        <td className="px-4 py-4 text-foreground">{cobrador.cedula}</td>
                        <td className="px-4 py-4 text-foreground">{cobrador.celular}</td>
                        <td className="px-4 py-4 text-muted-foreground">{cobrador.direccion || "-"}</td>
                        <td className="px-4 py-4">
                          <span className="flex items-center gap-1 text-foreground">
                            <Users className="h-4 w-4 text-muted-foreground" /> {numClientes}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="flex items-center gap-1 text-foreground">
                            <Wallet className="h-4 w-4 text-muted-foreground" />{" "}
                            $ {cartera.toLocaleString("es-CO")}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="secondary">
                            {isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(cobrador)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget(cobrador)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {filtered?.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                        No se encontraron cobradores
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Cobrador" : "Nuevo Cobrador"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
  <div className="mb-4 p-3 rounded-lg bg-muted text-sm space-y-1">
    <p>
      <strong>Clientes:</strong>{" "}
      {clientes ? countClientesByCobrador(clientes, editing._id) : 0}
    </p>

    <p>
      <strong>Cartera:</strong>{" "}
      $
      {creditos
        ? calcCarteraByCobrador(creditos, editing._id).toLocaleString("es-CO")
        : 0}
    </p>

    <p>
      <strong>Estado:</strong>{" "}
      {clientes && countClientesByCobrador(clientes, editing._id) > 0
        ? "Activo"
        : "Inactivo"}
    </p>
  </div>
)}
          <div className="flex flex-col gap-4 py-4">
            <Input value={form.nombre ?? ""} onChange={(e)=>setForm({...form,nombre:e.target.value})}/>
            <Input value={form.cedula ?? ""} onChange={(e)=>setForm({...form,cedula:e.target.value})}/>
            <Input value={form.celular ?? ""} onChange={(e)=>setForm({...form,celular:e.target.value})}/>
            <Input value={form.direccion ?? ""} onChange={(e)=>setForm({...form,direccion:e.target.value})}/>
            <Input value={form.usuario ?? ""} onChange={(e)=>setForm({...form,usuario:e.target.value})}/>
            {!editing && (
              <Input type="password" value={form.contrasena ?? ""} onChange={(e)=>setForm({...form,contrasena:e.target.value})}/>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : editing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={()=>setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cobrador</AlertDialogTitle>
            <AlertDialogDescription>
              {"Esta seguro de eliminar a "}{deleteTarget?.nombre}{"? Esta accion no se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}