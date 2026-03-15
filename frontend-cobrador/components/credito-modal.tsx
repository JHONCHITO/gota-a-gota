"use client"

import { useState, useEffect } from "react"
import { creditosApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface CreditoModalProps {
  open: boolean
  onClose: () => void
  clienteId: string
  cobradorId?: string
  onCreated: () => void
}

export function CreditoModal({ open, onClose, clienteId, cobradorId, onCreated }: CreditoModalProps) {
  const [fechaOrigen, setFechaOrigen] = useState("")
  const [fechaPago, setFechaPago] = useState("")
  const [montoPrestado, setMontoPrestado] = useState("")
  const [montoPorPagar, setMontoPorPagar] = useState("")
  const [frecuencia, setFrecuencia] = useState("diario")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      const today = new Date().toISOString().split("T")[0]
      setFechaOrigen(today)
    }
  }, [open])

  useEffect(() => {
    if (montoPrestado) {
      const val = Number(montoPrestado)
      if (!isNaN(val) && val > 0) {
        setMontoPorPagar(String(Math.round(val * 1.2)))
      }
    } else {
      setMontoPorPagar("")
    }
  }, [montoPrestado])

  const resetForm = () => {
    setFechaOrigen("")
    setFechaPago("")
    setMontoPrestado("")
    setMontoPorPagar("")
    setFrecuencia("diario")
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await creditosApi.create({
        clienteId,
        cobradorId,
        fechaOrigen,          // ← nombre correcto
        fechaPago,
        montoPrestado: Number(montoPrestado),
        montoPorPagar: Number(montoPorPagar),  // ← nombre correcto
        frecuencia,
      })
      onCreated()
      resetForm()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el credito")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { resetForm(); onClose() } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Credito</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Fecha Origen</Label>
            <Input type="date" value={fechaOrigen} onChange={(e) => setFechaOrigen(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Fecha Pago</Label>
            <Input type="date" value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Monto Prestado</Label>
            <Input type="number" placeholder="0" value={montoPrestado} onChange={(e) => setMontoPrestado(e.target.value)} required min="1" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Monto a Pagar <span className="text-xs text-muted-foreground">(auto: +20%)</span></Label>
            <Input type="number" placeholder="0" value={montoPorPagar} onChange={(e) => setMontoPorPagar(e.target.value)} required min="1" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Frecuencia</Label>
            <Select value={frecuencia} onValueChange={setFrecuencia}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar frecuencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diario">Diario</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="quincenal">Quincenal</SelectItem>
                <SelectItem value="mensual">Mensual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={() => { resetForm(); onClose() }}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creando...</> : "Hacer Credito"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
