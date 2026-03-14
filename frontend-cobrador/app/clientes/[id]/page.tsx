"use client"

import { AuthGuard } from "@/components/auth-guard"
import { ClienteDetail } from "@/components/cliente-detail"

export default function ClienteDetailPage() {
  return (
    <AuthGuard>
      <ClienteDetail />
    </AuthGuard>
  )
}
