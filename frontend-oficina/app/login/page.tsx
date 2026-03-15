"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { loginAdmin } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const user = loginAdmin(email, password)
    if (user) {
      router.push("/")
    } else {
      setError("Credenciales incorrectas")
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-sm border-0 shadow-lg">
        <CardContent className="flex flex-col items-center gap-6 pt-8 pb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <DollarSign className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Gota a Gota</h1>
            <p className="text-sm text-muted-foreground">Panel de Oficina</p>
          </div>

          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Usuario</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@gotaagota.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-muted"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Contrasena</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-muted"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Ingresando..." : "Iniciar Sesion"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
