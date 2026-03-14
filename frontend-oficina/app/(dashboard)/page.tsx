"use client"

import useSWR from "swr"
import { getCobradores, getClientes, getCreditos } from "@/lib/api"
import { formatCurrency, calculateTotalPagado } from "@/lib/format"
import { StatsCard } from "@/components/stats-card"
import { Users, UserCheck, Wallet, TrendingUp, TrendingDown, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Credito } from "@/lib/types"

function getClienteNameFromCredito(credito: Credito): string {
  if (!credito.clienteId) return "Desconocido"
  if (typeof credito.clienteId === "string") return credito.clienteId
  return credito.clienteId.nombre || "Desconocido"
}

export default function DashboardPage() {
  const { data: cobradores, isLoading: loadingCob } = useSWR("cobradores", getCobradores)
  const { data: clientes, isLoading: loadingCli } = useSWR("clientes", getClientes)
  const { data: creditos, isLoading: loadingCred } = useSWR("creditos", getCreditos)

  const isLoading = loadingCob || loadingCli || loadingCred

  const totalCobradores = cobradores?.length || 0
  const totalClientes = clientes?.length || 0

  const carteraTotal = creditos?.reduce((sum, c) => sum + (c.montoPorPagar || 0), 0) || 0
  const totalRecaudado = creditos?.reduce((sum, c) => sum + calculateTotalPagado(c.pagos), 0) || 0
  const porCobrar = carteraTotal - totalRecaudado
  const prestamosActivos = creditos?.filter((c) => c.estado === "pendiente").length || 0

  const recentCreditos = creditos
    ?.slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del sistema</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard
          title="Cobradores"
          value={totalCobradores}
          icon={UserCheck}
        />
        <StatsCard
          title="Clientes"
          value={totalClientes}
          icon={Users}
        />
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
        />
        <StatsCard
          title="Por Cobrar"
          value={formatCurrency(porCobrar)}
          icon={TrendingDown}
          valueClassName="text-destructive"
        />
        <StatsCard
          title="Prestamos Activos"
          value={prestamosActivos}
          icon={CreditCard}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Ultimos Prestamos</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCreditos && recentCreditos.length > 0 ? (
              <div className="flex flex-col gap-3">
                {recentCreditos.map((credito) => (
                  <div
                    key={credito._id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {getClienteNameFromCredito(credito)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Capital: {formatCurrency(credito.montoPrestado)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(credito.montoPorPagar)}
                      </span>
                      <Badge
                        variant={credito.estado === "pagado" ? "default" : "secondary"}
                        className={
                          credito.estado === "pagado"
                            ? "bg-primary text-primary-foreground"
                            : "bg-destructive/10 text-destructive"
                        }
                      >
                        {credito.estado === "pagado" ? "Pagado" : "Pendiente"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay prestamos registrados</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Cobradores Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {cobradores && cobradores.length > 0 ? (
              <div className="flex flex-col gap-3">
                {cobradores.slice(0, 5).map((cobrador) => (
                  <div
                    key={cobrador._id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{cobrador.nombre}</p>
                      <p className="text-xs text-muted-foreground">CC: {cobrador.cedula}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{cobrador.celular}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay cobradores registrados</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
