"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, CreditCard, LogOut, DollarSign } from "lucide-react"

export function MenuPage() {
  const { cobrador, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <DollarSign className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Gota a Gota</p>
            <p className="text-xs text-muted-foreground">
              {cobrador?.nombre || "Cobrador"} - CC: {cobrador?.cedula}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Cerrar sesion">
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      {/* Menu Content */}
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <h2 className="text-xl font-bold text-foreground">Menu Principal</h2>
        <div className="flex w-full max-w-sm flex-col gap-4">
          <Card
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => router.push("/clientes")}
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Clientes</h3>
                <p className="text-sm text-muted-foreground">
                  Ver y gestionar clientes
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => router.push("/creditos")}
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <CreditCard className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Creditos</h3>
                <p className="text-sm text-muted-foreground">
                  Ver y gestionar creditos
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
