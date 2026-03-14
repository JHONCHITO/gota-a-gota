"use client"

import { AuthGuard } from "@/components/auth-guard"
import { ClientesList } from "@/components/clientes-list"

export default function ClientesPage() {
  return (
    <AuthGuard>
      <ClientesList />
    </AuthGuard>
  )
}
