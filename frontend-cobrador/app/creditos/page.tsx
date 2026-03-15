"use client"

import { AuthGuard } from "@/components/auth-guard"
import { CreditosList } from "@/components/creditos-list"

export default function CreditosPage() {
  return (
    <AuthGuard>
      <CreditosList />
    </AuthGuard>
  )
}
