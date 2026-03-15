import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  className?: string
  valueClassName?: string
}

export function StatsCard({ title, value, icon: Icon, className, valueClassName }: StatsCardProps) {
  return (
    <Card className={cn("border-0 shadow-sm", className)}>
      <CardContent className="flex flex-col gap-2 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
        </div>
        <p className={cn("text-2xl font-bold text-foreground", valueClassName)}>{value}</p>
      </CardContent>
    </Card>
  )
}
