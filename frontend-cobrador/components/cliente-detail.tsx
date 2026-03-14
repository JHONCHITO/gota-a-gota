"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import useSWR from "swr"
import { useAuth } from "@/lib/auth-context"
import { clientesApi, type Cliente, type Credito } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, CreditCard, User, Phone, MapPin, FileText, Loader2 } from "lucide-react"
import { CreditoModal } from "@/components/credito-modal"

export function ClienteDetail() {
  const { id } = useParams<{ id: string }>()
  const { cobrador } = useAuth()
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)

  const { data: cliente, isLoading: clienteLoading } = useSWR<Cliente>(
    id ? `cliente-${id}` : null,
    () => clientesApi.getById(id)
  )

  const { data: creditos, isLoading: creditosLoading, mutate: mutateCreditos } = useSWR<Credito[]>(
    id ? `cliente-${id}-creditos` : null,
    () => clientesApi.getCreditos(id)
  )

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount ?? 0)

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Sin fecha"
    return new Date(dateStr).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
  }

  if (clienteLoading) return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  if (!cliente) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">Cliente no encontrado</p>
      <Button onClick={() => router.back()}>Volver</Button>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/clientes")} aria-label="Volver">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">Detalle del Cliente</h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <Card className="mb-4">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-foreground">{cliente.nombre}</h2>
                <p className="text-sm text-muted-foreground">CC: {cliente.cc}</p>
                {cliente.tipo && <Badge variant="secondary" className="mt-1">{cliente.tipo}</Badge>}
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {cliente.celular && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />{cliente.celular}
                </div>
              )}
              {cliente.direccion && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />{cliente.direccion}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Button className="mb-4 w-full" onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />Hacer Credito
        </Button>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />Historial de Creditos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {creditosLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !creditos || creditos.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-muted-foreground">
                <CreditCard className="mb-2 h-8 w-8" />
                <p className="text-sm">Sin creditos registrados</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {creditos.map((credito) => {
                  if (!credito) return null
                  return (
                    <Card key={credito._id} className="cursor-pointer border-border/50 transition-shadow hover:shadow-sm"
                      onClick={() => router.push(`/creditos/${credito._id}`)}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {formatCurrency(credito.montoPrestado)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(credito.fechaOrigen)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">
                              Pagar: {formatCurrency(credito.montoPorPagar)}
                            </p>
                            <Badge variant={credito.estado === "pagado" ? "default" : "secondary"}>
                              {credito.estado || "pendiente"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <CreditoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        clienteId={id}
        cobradorId={cobrador?._id}
        onCreated={() => mutateCreditos()}
      />
    </div>
  )
}
