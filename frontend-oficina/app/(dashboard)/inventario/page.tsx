"use client"

import { useState, useEffect, useCallback } from "react"
import useSWR from "swr"
import { getCobradores } from "@/lib/api"
import type { InventarioItem } from "@/lib/types"
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

interface ItemForm {
  tipo: "celular" | "tablet" | "moto" | "otro"
  descripcion: string
  serie: string
  cobradorId: string
  estado: "asignado" | "disponible" | "mantenimiento"
}

const emptyForm: ItemForm = {
  tipo: "celular",
  descripcion: "",
  serie: "",
  cobradorId: "",
  estado: "disponible",
}

// --------- llamadas al backend ---------

async function fetchInventario(): Promise<InventarioItem[]> {
  const res = await fetch(`${API_URL}/inventario`, { cache: "no-store" })
  if (!res.ok) throw new Error("Error cargando inventario")
  const data = await res.json()

  return data.map((item: any) => ({
    id: item._id,
    tipo: item.tipo,
    descripcion: item.descripcion,
    serie: item.serie,
    cobradorId: item.cobrador,
    cobradorNombre: item.cobrador?.nombre,
    fechaAsignacion: item.fechaAsignacion || item.createdAt,
    estado: item.estado,
  }))
}

async function crearInventario(data: ItemForm) {
  const res = await fetch(`${API_URL}/inventario`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tipo: data.tipo,
      descripcion: data.descripcion,
      serie: data.serie,
      // si no eliges cobrador, por ahora usa Juan por defecto
      cobrador: data.cobradorId || "699b8afd62782fff16414f89",
      // estado fijo "Activo" igual que en tu prueba de Postman
      estado: "Activo",
    }),
  })
  if (!res.ok) throw new Error("Error creando inventario")
  return res.json()
}

// --------- componente ---------

export default function InventarioPage() {
  const { data: cobradores } = useSWR("cobradores", getCobradores)
  const [items, setItems] = useState<InventarioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterCobrador, setFilterCobrador] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<InventarioItem | null>(null)
  const [form, setForm] = useState<ItemForm>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<InventarioItem | null>(null)

  useEffect(() => {
    fetchInventario()
      .then((data) => setItems(data))
      .catch((err) => {
        console.error(err)
        toast.error("Error cargando inventario")
      })
      .finally(() => setLoading(false))
  }, [])

  const getCobradorNombre = useCallback(
    (id: string) => {
      if (!id || !cobradores) return "Sin asignar"
      const c = cobradores.find((cob) => cob._id === id)
      return c?.nombre || "Sin asignar"
    },
    [cobradores]
  )

  const filtered = items.filter((item) => {
    const matchSearch =
      item.descripcion.toLowerCase().includes(search.toLowerCase()) ||
      item.serie.toLowerCase().includes(search.toLowerCase())
    const matchCobrador =
      filterCobrador === "all" || item.cobradorId === filterCobrador
    return matchSearch && matchCobrador
  })

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(item: InventarioItem) {
    setEditing(item)
    setForm({
      tipo: item.tipo,
      descripcion: item.descripcion,
      serie: item.serie,
      cobradorId: item.cobradorId,
      estado: item.estado,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    try {
      if (editing) {
        const updated = items.map((i) =>
          i.id === editing.id
            ? {
                ...i,
                ...form,
                cobradorNombre: getCobradorNombre(form.cobradorId),
              }
            : i
        )
        setItems(updated)
        toast.success("Item actualizado")
      } else {
        const creado = await crearInventario(form)
        const newItem: InventarioItem = {
          id: creado._id,
          tipo: creado.tipo,
          descripcion: creado.descripcion,
          serie: creado.serie,
          cobradorId: creado.cobrador,
          cobradorNombre: getCobradorNombre(form.cobradorId),
          fechaAsignacion: creado.fechaAsignacion || creado.createdAt,
          estado: creado.estado,
        }
        const updated = [...items, newItem]
        setItems(updated)
        toast.success("Item creado")
      }
      setDialogOpen(false)
    } catch (err) {
      console.error(err)
      toast.error("Error guardando inventario")
    }
  }

  function handleDelete() {
    if (!deleteTarget) return
    const updated = items.filter((i) => i.id !== deleteTarget.id)
    setItems(updated)
    toast.success("Item eliminado")
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventario</h1>
          <p className="text-muted-foreground">
            Gestiona los recursos asignados a cobradores
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Item
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por descripcion o cobrador..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterCobrador} onValueChange={setFilterCobrador}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Todos los cobradores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los cobradores</SelectItem>
                {cobradores?.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <p className="text-muted-foreground">Cargando inventario...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Descripcion
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Serie
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Cobrador
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Fecha Asignacion
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-4 capitalize text-foreground">
                        {item.tipo}
                      </td>
                      <td className="px-4 py-4 text-foreground">
                        {item.descripcion}
                      </td>
                      <td className="px-4 py-4 text-foreground">
                        {item.serie}
                      </td>
                      <td className="px-4 py-4 text-foreground">
                        {item.cobradorNombre ||
                          getCobradorNombre(item.cobradorId)}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {new Date(
                          item.fechaAsignacion
                        ).toLocaleDateString("es-CO")}
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          className={
                            item.estado === "asignado"
                              ? "bg-primary/10 text-primary"
                              : item.estado === "disponible"
                              ? "bg-accent/50 text-accent-foreground"
                              : "bg-destructive/10 text-destructive"
                          }
                        >
                          {item.estado.charAt(0).toUpperCase() +
                            item.estado.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(item)}
                            aria-label={`Editar ${item.descripcion}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(item)}
                            className="text-destructive hover:text-destructive"
                            aria-label={`Eliminar ${item.descripcion}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-muted-foreground"
                      >
                        No hay items en el inventario
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
              {editing ? "Editar Item" : "Nuevo Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label>Tipo</Label>
              <Select
                value={form.tipo}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    tipo: v as "celular" | "tablet" | "moto" | "otro",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="celular">Celular</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="moto">Moto</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Descripcion</Label>
              <Input
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
                placeholder="Descripcion del item"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Serie / Identificacion</Label>
              <Input
                value={form.serie}
                onChange={(e) => setForm({ ...form, serie: e.target.value })}
                placeholder="Numero de serie"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Cobrador</Label>
              <Select
                value={form.cobradorId || "none"}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    cobradorId: v === "none" ? "" : v,
                  })
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
              <Label>Estado</Label>
              <Select
                value={form.estado}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    estado: v as
                      | "asignado"
                      | "disponible"
                      | "mantenimiento",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="asignado">Asignado</SelectItem>
                  <SelectItem value="mantenimiento">
                    Mantenimiento
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar item</AlertDialogTitle>
            <AlertDialogDescription>
              {"Esta seguro de eliminar "}
              {deleteTarget?.descripcion}
              {"? Esta accion no se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
