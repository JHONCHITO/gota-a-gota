"use client"

import { AuthGuard } from "@/components/auth-guard"
import { CreditoDetail } from "@/components/credito-detail"

export default function CreditoDetailPage() {
  return (
    <AuthGuard>
      <CreditoDetail />
    </AuthGuard>
  )
}
