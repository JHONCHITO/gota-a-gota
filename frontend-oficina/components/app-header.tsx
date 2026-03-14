"use client"

import { useRouter } from "next/navigation"
import { getAuthUser, logoutAdmin } from "@/lib/auth"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AppHeader() {
  const router = useRouter()
  const user = getAuthUser()

  function handleLogout() {
    logoutAdmin()
    router.push("/login")
  }

  return (
    <header className="flex h-16 items-center justify-between bg-header-bg px-6 shrink-0">
      <div />
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-header-foreground">
            {user?.name || "Administrador"}
          </p>
          <p className="text-xs text-header-foreground/70">
            {user?.email || "admin@gotaagota.com"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-header-foreground hover:bg-header-bg/80"
          aria-label="Cerrar sesion"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
