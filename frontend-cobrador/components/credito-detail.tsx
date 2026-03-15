"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import useSWR from "swr"
import { creditosApi, type Credito, type Cliente } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ArrowLeft, Calendar, DollarSign, Loader2, Plus, Receipt } from "lucide-react"

export function CreditoDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [pagoModalOpen, setPagoModalOpen] = useState(false)
  const [pagoMonto, setPagoMonto] = useState("")
  const [pagoLoading, setPagoLoading] = useState(false)
  const [pagoError, setPagoError] = useState("")

  const { data: credito, isLoading, mutate } = useSWR<Credito>(
    id ? `credito-${id}` : null,
    () => creditosApi.getById(id)
  )

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount ?? 0)

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Sin fecha"
    return new Date(dateStr).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
  }

  const getClienteName = (cliente?: string | Cliente) => {
    if (!cliente) return "Sin cliente"
    if (typeof cliente === "string") return cliente
    return cliente.nombre || "Sin nombre"
  }

  const montoPorPagar = credito?.montoPorPagar ?? 0
  const totalPagado = credito?.pagos?.reduce((sum, p) => sum + (p.monto ?? 0), 0) ?? 0
  const saldoPendiente = Math.max(0, montoPorPagar - totalPagado)
  const porcentajePagado = montoPorPagar > 0 ? Math.min(100, (totalPagado / montoPorPagar) * 100) : 0

  const handlePago = async (e: React.FormEvent) => {
    e.preventDefault()
    setPagoError("")
    setPagoLoading(true)
    try {
      const pagosActuales = credito?.pagos || []
      await creditosApi.update(id, {
        pagos: [...pagosActuales, { monto: Number(pagoMonto), fecha: new Date().toISOString() }],
      })
      mutate()
      setPagoMonto("")
      setPagoModalOpen(false)
    } catch (err) {
      setPagoError(err instanceof Error ? err.message : "Error al registrar el pago")
    } finally {
      setPagoLoading(false)
    }
  }

  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  if (!credito) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">Credito no encontrado</p>
      <Button onClick={() => router.back()}>Volver</Button>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Volver">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">Detalle del Credito</h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <Card className="mb-4">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {getClienteName(credito.clienteId)}
              </h2>
              <Badge variant={credito.estado === "pagado" ? "default" : "secondary"}>
                {credito.estado || "pendiente"}
              </Badge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />Fecha Origen
                </span>
                <span className="text-sm font-medium text-foreground">
                  {formatDate(credito.fechaOrigen)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />Fecha Pago
                </span>
                <span className="text-sm font-medium text-foreground">
                  {formatDate(credito.fechaPago)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <DollarSign className="h-3 w-3" />Monto Prestado
                </span>
                <span className="text-sm font-bold text-foreground">
                  {formatCurrency(credito.montoPrestado)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <DollarSign className="h-3 w-3" />Monto a Pagar
                </span>
                <span className="text-sm font-bold text-foreground">
                  {formatCurrency(montoPorPagar)}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Pagado: {formatCurrency(totalPagado)}</span>
                <span>Pendiente: {formatCurrency(saldoPendiente)}</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${porcentajePagado}%` }} />
              </div>
              <p className="mt-1 text-right text-xs text-muted-foreground">{porcentajePagado.toFixed(0)}% pagado</p>
            </div>
          </CardContent>
        </Card>

        {credito.estado !== "pagado" && (
          <Button className="mb-4 w-full" onClick={() => setPagoModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />Registrar Pago
          </Button>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-4 w-4" />Historial de Pagos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!credito.pagos || credito.pagos.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-muted-foreground">
                <Receipt className="mb-2 h-8 w-8" />
                <p className="text-sm">Sin pagos registrados</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {credito.pagos.map((pago, index) => (
                  <div key={pago._id || index} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Pago #{index + 1}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(pago.fecha)}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-foreground">{formatCurrency(pago.monto)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={pagoModalOpen} onOpenChange={(v) => { if (!v) { setPagoMonto(""); setPagoError(""); setPagoModalOpen(false) } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Registrar Pago</DialogTitle></DialogHeader>
          <form onSubmit={handlePago} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="pagoMonto">Monto del Pago</Label>
              <Input id="pagoMonto" type="number" placeholder="0" value={pagoMonto}
                onChange={(e) => setPagoMonto(e.target.value)} required min="1"
                max={saldoPendiente > 0 ? saldoPendiente : undefined} />
              <p className="text-xs text-muted-foreground">Saldo pendiente: {formatCurrency(saldoPendiente)}</p>
            </div>
            {pagoError && <p className="text-sm text-destructive" role="alert">{pagoError}</p>}
            <DialogFooter className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => { setPagoMonto(""); setPagoError(""); setPagoModalOpen(false) }}>Cancelar</Button>
              <Button type="submit" disabled={pagoLoading}>
                {pagoLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Registrando...</> : "Registrar Pago"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
