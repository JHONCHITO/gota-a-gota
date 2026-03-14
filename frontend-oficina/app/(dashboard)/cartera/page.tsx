"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  getCreditos,
  getCobradores,
  getClientes,
  createCredito,
  updateCredito,
  deleteCredito,
} from "@/lib/api"
import {
  formatCurrency,
  calculateTotalPagado,
  calculateProgress,
  getClienteName,
  getCobradorName,
} from "@/lib/format"
import type { CreditoForm, Credito } from "@/lib/types"
import { StatsCard } from "@/components/stats-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
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
import { Search, Plus, DollarSign, Wallet, TrendingUp, TrendingDown, CreditCard } from "lucide-react"
import { toast } from "sonner"

const emptyCredito: CreditoForm & { porcentaje?: number } = {
  clienteId: "",
  cobradorId: "",
  montoPrestado: 0,
  montoPorPagar: 0,
  porcentaje: 20, // 👈 porcentaje editable
  fechaOrigen: new Date().toISOString().split("T")[0],
  fechaPago: "",
  frecuencia: "diario",
}

export default function CarteraPage() {
  const { data: creditos, isLoading, mutate } = useSWR("creditos", getCreditos)
  const { data: cobradores } = useSWR("cobradores", getCobradores)
  const { data: clientes } = useSWR("clientes", getClientes)

  const [search, setSearch] = useState("")
  const [filterCobrador, setFilterCobrador] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<CreditoForm>(emptyCredito)
  const [saving, setSaving] = useState(false)

  // Payment dialog
  const [pagoDialogOpen, setPagoDialogOpen] = useState(false)
  const [pagoCredito, setPagoCredito] = useState<Credito | null>(null)
  const [pagoMonto, setPagoMonto] = useState("")
  const [savingPago, setSavingPago] = useState(false)

  // KPIs
  const carteraTotal = creditos?.reduce((sum, c) => sum + (c.montoPorPagar || 0), 0) || 0
  const totalRecaudado = creditos?.reduce((sum, c) => sum + calculateTotalPagado(c.pagos), 0) || 0
  const porCobrar = carteraTotal - totalRecaudado
  const prestamosActivos = creditos?.filter((c) => c.estado === "pendiente").length || 0

  // Filtered creditos
  const filtered = creditos?.filter((c) => {
    const clienteNombre =
      typeof c.clienteId === "object" && c.clienteId ? c.clienteId.nombre : ""
    const matchSearch = clienteNombre
      .toLowerCase()
      .includes(search.toLowerCase())
    const cobrId =
      typeof c.cobradorId === "object" && c.cobradorId ? c.cobradorId._id : c.cobradorId
    const matchCobrador = filterCobrador === "all" || cobrId === filterCobrador
    return matchSearch && matchCobrador
  })

  async function handleCreatePrestamo() {
    setSaving(true)
    try {
      await createCredito(form)
      toast.success("Prestamo creado")
      await mutate()
      setDialogOpen(false)
    } catch (err) {
      toast.error("Error al crear prestamo")
      console.error(err)
    }
    setSaving(false)
  }

  function openPago(credito: Credito) {
    setPagoCredito(credito)
    setPagoMonto("")
    setPagoDialogOpen(true)
  }

  async function handlePago() {
    if (!pagoCredito || !pagoMonto) return
    setSavingPago(true)
    try {
      const monto = Number(pagoMonto)
      const currentPagos = pagoCredito.pagos || []
      const newPago = { monto, fecha: new Date().toISOString(), _id: "" }
      const newTotalPagado = calculateTotalPagado(currentPagos) + monto
      const newEstado = newTotalPagado >= pagoCredito.montoPorPagar ? "pagado" : "pendiente"

      await updateCredito(pagoCredito._id, {
        ...({
          pagos: [...currentPagos, newPago],
          estado: newEstado,
        } as Record<string, unknown>),
      } as Partial<CreditoForm>)

      toast.success(`Pago de ${formatCurrency(monto)} registrado`)
      await mutate()
      setPagoDialogOpen(false)
    } catch (err) {
      toast.error("Error al registrar pago")
      console.error(err)
    }
    setSavingPago(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cartera</h1>
          <p className="text-muted-foreground">Gestiona los prestamos y pagos</p>
        </div>
        <Button
          onClick={() => {
            setForm(emptyCredito)
            setDialogOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Prestamo
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Cartera Total"
          value={formatCurrency(carteraTotal)}
          icon={Wallet}
        />
        <StatsCard
          title="Total Recaudado"
          value={formatCurrency(totalRecaudado)}
          icon={TrendingUp}
          valueClassName="text-primary"
          className="bg-accent/20"
        />
        <StatsCard
          title="Por Cobrar"
          value={formatCurrency(porCobrar)}
          icon={TrendingDown}
          valueClassName="text-destructive"
          className="bg-destructive/5"
        />
        <StatsCard
          title="Prestamos Activos"
          value={prestamosActivos}
          icon={CreditCard}
        />
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre de cliente..."
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

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-3 text-left font-medium text-muted-foreground">Cliente</th>
                    <th className="px-3 py-3 text-left font-medium text-muted-foreground">Cobrador</th>
                    <th className="px-3 py-3 text-left font-medium text-muted-foreground">Capital</th>
                    <th className="px-3 py-3 text-left font-medium text-muted-foreground">Total</th>
                    <th className="px-3 py-3 text-left font-medium text-muted-foreground">Pagado</th>
                    <th className="px-3 py-3 text-left font-medium text-muted-foreground">Pendiente</th>
                    <th className="px-3 py-3 text-left font-medium text-muted-foreground">Progreso</th>
                    <th className="px-3 py-3 text-left font-medium text-muted-foreground">Estado</th>
                    <th className="px-3 py-3 text-left font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered?.map((credito) => {
                    const pagado = calculateTotalPagado(credito.pagos)
                    const pendiente = credito.montoPorPagar - pagado
                    const progress = calculateProgress(pagado, credito.montoPorPagar)
                    const isPagado = credito.estado === "pagado"
                    const enMora = !isPagado && pendiente > 0 && new Date(credito.fechaPago) < new Date()

                    return (
                      <tr key={credito._id} className="border-b border-border last:border-0">
                        <td className="px-3 py-4 font-medium text-foreground">
                          {getClienteName(credito.clienteId)}
                        </td>
                        <td className="px-3 py-4 text-foreground">
                          {getCobradorName(credito.cobradorId as { nombre?: string } | string | null)}
                        </td>
                        <td className="px-3 py-4 text-foreground">
                          {formatCurrency(credito.montoPrestado)}
                        </td>
                        <td className="px-3 py-4 text-foreground">
                          {formatCurrency(credito.montoPorPagar)}
                        </td>
                        <td className="px-3 py-4 text-primary font-medium">
                          {formatCurrency(pagado)}
                        </td>
                        <td className="px-3 py-4 text-destructive font-medium">
                          {formatCurrency(pendiente)}
                        </td>
                        <td className="px-3 py-4 min-w-[220px]">
                          <div className="flex flex-col gap-2">
                             <div className="flex justify-between text-xs text-muted-foreground">
                               <span>{progress}%</span>
                               <span>
                                 {formatCurrency(pagado)} / {formatCurrency(credito.montoPorPagar)}
                               </span>
                             </div>

                             <Progress value={progress} className="h-2 w-full" />

                             <div className="text-xs text-muted-foreground">
                               Restante:{" "}
                               <span className="font-medium text-destructive">
                                 {formatCurrency(pendiente)}
                               </span>
                             </div>
                           </div>
                         </td>
                        <td className="px-3 py-4">
                          <Badge
                            className={
                              isPagado
                                ? "bg-primary/10 text-primary"
                                : enMora
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-accent/50 text-accent-foreground"
                            }
                          >
                            {isPagado ? "Pagado" : enMora ? "En mora" : "Pendiente"}
                          </Badge>
                        </td>
                        <td className="px-3 py-4">
                          {!isPagado && (
                            <Button
                              size="sm"
                              onClick={() => openPago(credito)}
                              className="gap-1"
                            >
                              <DollarSign className="h-3 w-3" />
                              Pago
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {filtered?.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-3 py-10 text-center text-muted-foreground">
                        No se encontraron prestamos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Prestamo Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Prestamo</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label>Cliente</Label>
              <Select
                value={form.clienteId}
                onValueChange={(v) => setForm({ ...form, clienteId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes?.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Cobrador</Label>
              <Select
                value={form.cobradorId}
                onValueChange={(v) => setForm({ ...form, cobradorId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cobrador" />
                </SelectTrigger>
                <SelectContent>
                  {cobradores?.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">

              {/* Monto Prestado */}
              <div className="flex flex-col gap-2"></div>
                <Label>Monto Prestado</Label>
                <Input
                  type="number"
                  value={form.montoPrestado || ""}
                  onChange={(e) => {
                    const montoPrestado = Number(e.target.value)
                    const porcentaje = (form as any).porcentaje || 0
                    const montoPorPagar =
                      montoPrestado + (montoPrestado * porcentaje) / 100

                    setForm({
                      ...form,
                      montoPrestado,
                      montoPorPagar,
                    } as any)
                 }}
                 placeholder="500000"
                />
              </div>  

             {/* NUEVO CAMPO PORCENTAJE */}
             <div className="flex flex-col gap-2">
               <Label>Porcentaje (%)</Label>
               <Input
                 type="number"
                 value={(form as any).porcentaje || ""}
                 onChange={(e) => {
                   const porcentaje = Number(e.target.value)
                   const montoPrestado = form.montoPrestado || 0
                   const montoPorPagar =
                     montoPrestado + (montoPrestado * porcentaje) / 100 

                   setForm({
                     ...form,
                     porcentaje,
                     montoPorPagar,
                   } as any)
               }}
               placeholder="20"
             />
           </div>  

           {/* Monto a Pagar */}
           <div className="flex flex-col gap-2">
             <Label>Monto a Pagar</Label>
             <Input
               type="number"
               value={form.montoPorPagar || ""}
               readOnly
               placeholder="600000"
             />
           </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Fecha Origen</Label>
                <Input
                  type="date"
                  value={form.fechaOrigen}
                  onChange={(e) => setForm({ ...form, fechaOrigen: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Fecha Pago</Label>
                <Input
                  type="date"
                  value={form.fechaPago}
                  onChange={(e) => setForm({ ...form, fechaPago: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Frecuencia</Label>
              <Select
                value={form.frecuencia}
                onValueChange={(v) =>
                  setForm({ ...form, frecuencia: v as "diario" | "semanal" | "mensual" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diario">Diario</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensual">Mensual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePrestamo} disabled={saving}>
              {saving ? "Creando..." : "Crear Prestamo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={pagoDialogOpen} onOpenChange={setPagoDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
          </DialogHeader>
          {pagoCredito && (
            <div className="flex flex-col gap-4 py-4">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium text-foreground">
                  {getClienteName(pagoCredito.clienteId)}
                </p>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Pendiente:</span>
                  <span className="font-medium text-destructive">
                    {formatCurrency(
                      pagoCredito.montoPorPagar - calculateTotalPagado(pagoCredito.pagos)
                    )}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Monto del pago</Label>
                <Input
                  type="number"
                  value={pagoMonto}
                  onChange={(e) => setPagoMonto(e.target.value)}
                  placeholder="Ingrese el monto"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPagoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePago} disabled={savingPago || !pagoMonto}>
              {savingPago ? "Guardando..." : "Registrar Pago"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
