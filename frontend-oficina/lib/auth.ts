// Simple admin authentication for Panel de Oficina
// The backend doesn't have an auth endpoint, so we handle it client-side

const ADMIN_EMAIL = "admin@gotaagota.com"
const ADMIN_PASSWORD = "admin123"

const AUTH_KEY = "gota_gota_admin_auth"

export interface AuthUser {
  email: string
  name: string
  role: "admin"
}

export function loginAdmin(email: string, password: string): AuthUser | null {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const user: AuthUser = {
      email: ADMIN_EMAIL,
      name: "Administrador",
      role: "admin",
    }
    if (typeof window !== "undefined") {
      document.cookie = `${AUTH_KEY}=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
    }
    return user
  }
  return null
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  try {
    const cookies = document.cookie.split(";")
    const authCookie = cookies.find((c) => c.trim().startsWith(`${AUTH_KEY}=`))
    if (!authCookie) return null
    const value = authCookie.split("=").slice(1).join("=").trim()
    return JSON.parse(decodeURIComponent(value))
  } catch {
    return null
  }
}

export function logoutAdmin(): void {
  if (typeof window !== "undefined") {
    document.cookie = `${AUTH_KEY}=; path=/; max-age=0`
  }
}

export function isAuthenticated(): boolean {
  return getAuthUser() !== null
}
