"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Wallet,
  CalendarDays,
  Package,
  DollarSign,
} from "lucide-react"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cobradores", label: "Cobradores", icon: UserCheck },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/cartera", label: "Cartera", icon: Wallet },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/inventario", label: "Inventario", icon: Package },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <aside className="flex w-64 flex-col bg-sidebar text-sidebar-foreground min-h-screen shrink-0">
      <div className="flex items-center gap-3 px-6 py-5 bg-header-bg">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <DollarSign className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-header-foreground">GOTA A GOTA</h1>
          <p className="text-xs text-header-foreground/70">Panel de Oficina</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-4 border-accent"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
