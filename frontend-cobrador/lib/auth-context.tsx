"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Cobrador } from "@/lib/api"

interface AuthContextType {
  cobrador: Cobrador | null
  login: (cobrador: Cobrador) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [cobrador, setCobrador] = useState<Cobrador | null>(() => {
    if (typeof window === "undefined") return null
    const saved = sessionStorage.getItem("cobrador")
    return saved ? JSON.parse(saved) : null
  })

  const login = useCallback((cobrador: Cobrador) => {
    setCobrador(cobrador)
    sessionStorage.setItem("cobrador", JSON.stringify(cobrador))
  }, [])

  const logout = useCallback(() => {
    setCobrador(null)
    sessionStorage.removeItem("cobrador")
  }, [])

  return (
    <AuthContext.Provider
      value={{ cobrador, login, logout, isAuthenticated: !!cobrador }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
