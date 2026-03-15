"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { creditosApi, type Credito, type Cliente } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, CreditCard, Loader2 } from "lucide-react"

export function CreditosList() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: creditos, isLoading } = useSWR<Credito[]>(
    mounted ? "all-creditos" : null,
    () => creditosApi.getAll()
  )

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount ?? 0)

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Sin fecha"
    return new Date(dateStr).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const getClienteName = (cliente: string | Cliente | undefined | null) => {
    if (!cliente) return "Sin cliente"
    if (typeof cliente === "string") return cliente
    return cliente.nombre || "Sin nombre"
  }

  // 🔥 CALCULAR TOTAL PAGADO
  const calcularTotalPagado = (pagos?: { monto: number }[]) => {
    if (!pagos || pagos.length === 0) return 0
    return pagos.reduce((sum, p) => sum + p.monto, 0)
  }

  // 🔥 CALCULAR PORCENTAJE
  const calcularPorcentaje = (credito: Credito) => {
    const totalPagado = calcularTotalPagado(credito.pagos)
    if (!credito.montoPorPagar || credito.montoPorPagar === 0) return 0
    return Math.min(100, (totalPagado / credito.montoPorPagar) * 100)
  }

  const filtered = useMemo(() => {
    if (!creditos) return []
    if (!search.trim()) return creditos
    const q = search.toLowerCase()
    return creditos.filter((c) => {
      if (!c) return false
      const name = getClienteName(c.clienteId)
      return (
        name.toLowerCase().includes(q) ||
        String(c.montoPrestado).includes(q)
      )
    })
  }, [creditos, search])

  if (!mounted) return null

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/menu")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">Creditos</h1>
        </div>

        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Buscar creditos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <main className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !creditos || filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-muted-foreground">
            <CreditCard className="mb-2 h-10 w-10" />
            <p>No se encontraron creditos</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((credito) => {
              if (!credito) return null

              const totalPagado = calcularTotalPagado(credito.pagos)
              const porcentaje = calcularPorcentaje(credito)

              return (
                <Card
                  key={credito._id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => router.push(`/creditos/${credito._id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>

                        <div>
                          <p className="font-medium text-foreground">
                            {getClienteName(credito.clienteId)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(credito.fechaOrigen)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {formatCurrency(credito.montoPrestado)}
                        </p>

                        <Badge
                          variant={
                            porcentaje >= 100
                              ? "default"
                              : "secondary"
                          }
                        >
                          {porcentaje.toFixed(1)} %
                        </Badge>
                      </div>
                    </div>

                    {/* 🔥 Barra de progreso */}
                    <div className="mt-3">
                      <div className="h-2 w-full rounded bg-gray-200">
                        <div
                          className="h-2 rounded bg-green-500 transition-all"
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>

                      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                        <span>
                          Pagado: {formatCurrency(totalPagado)}
                        </span>
                        <span>
                          Restante:{" "}
                          {formatCurrency(
                            credito.montoPorPagar - totalPagado
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}