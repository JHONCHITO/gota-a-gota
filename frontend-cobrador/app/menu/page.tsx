"use client"

import { AuthGuard } from "@/components/auth-guard"
import { MenuPage } from "@/components/menu-page"

export default function Menu() {
  return (
    <AuthGuard>
      <MenuPage />
    </AuthGuard>
  )
}
