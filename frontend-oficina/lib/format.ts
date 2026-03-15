// Format utilities for Colombian pesos and dates

export function formatCurrency(amount: number): string {
  return `$ ${amount.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "-"
  const date = new Date(dateStr)
  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatDateLong(dateStr: string): string {
  if (!dateStr) return "-"
  const date = new Date(dateStr)
  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function getCobradorName(cobrador: { nombre?: string } | string | null | undefined): string {
  if (!cobrador) return "Sin asignar"
  if (typeof cobrador === "string") return cobrador
  return cobrador.nombre || "Sin asignar"
}

export function getClienteName(cliente: { nombre?: string } | string | null | undefined): string {
  if (!cliente) return "Desconocido"
  if (typeof cliente === "string") return cliente
  return cliente.nombre || "Desconocido"
}

export function calculateTotalPagado(pagos: { monto: number }[]): number {
  if (!pagos || !Array.isArray(pagos)) return 0
  return pagos.reduce((sum, p) => sum + (p.monto || 0), 0)
}

export function calculateProgress(pagado: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(Math.round((pagado / total) * 100), 100)
}
