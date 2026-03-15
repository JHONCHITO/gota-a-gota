"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import { getCobradores, getClientes, getCreditos } from "@/lib/api"
import { formatDate, getClienteName, getCobradorName } from "@/lib/format"
import type { Credito } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"

const DAYS_ES = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]
const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

export default function CalendarioPage() {
  const { data: creditos } = useSWR("creditos", getCreditos)

  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  // Get creditos that have payments or are due on selected date
  const getVisitasForDate = useCallback(
    (date: Date): Credito[] => {
      if (!creditos) return []
      return creditos.filter((c) => {
        // Check if any payment was made on this date
        const hasPago = c.pagos?.some((p) => {
          const pagoDate = new Date(p.fecha)
          return isSameDay(pagoDate, date)
        })
        // Check if the fechaPago matches
        const fechaPago = new Date(c.fechaPago)
        const isDueDate = isSameDay(fechaPago, date)
        // Check if fechaOrigen matches
        const fechaOrigen = new Date(c.fechaOrigen)
        const isOrigin = isSameDay(fechaOrigen, date)
        return hasPago || isDueDate || isOrigin
      })
    },
    [creditos]
  )

  function hasEvents(day: number): boolean {
    const date = new Date(currentYear, currentMonth, day)
    return getVisitasForDate(date).length > 0
  }

  const selectedVisitas = selectedDate ? getVisitasForDate(selectedDate) : []

  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendario</h1>
          <p className="text-muted-foreground">Programa y gestiona visitas de cobro</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {MONTHS_ES[currentMonth]} {currentYear}
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Mes anterior">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Mes siguiente">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px">
              {DAYS_ES.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              {days.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="p-2" />
                }
                const date = new Date(currentYear, currentMonth, day)
                const isToday = isSameDay(date, today)
                const isSelected = selectedDate ? isSameDay(date, selectedDate) : false
                const events = hasEvents(day)

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={`relative flex flex-col items-center justify-center rounded-lg p-3 text-sm transition-colors
                      ${isToday ? "bg-primary/10 text-primary font-bold" : "text-foreground"}
                      ${isSelected ? "ring-2 ring-primary bg-primary/5" : ""}
                      hover:bg-muted
                    `}
                  >
                    {day}
                    {events && (
                      <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Side panel */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate
                ? formatDate(selectedDate.toISOString())
                : "Selecciona un dia"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="text-sm text-muted-foreground">
                Haz clic en un dia del calendario para ver las visitas
              </p>
            ) : selectedVisitas.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay eventos para este dia
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {selectedVisitas.map((credito) => (
                  <div
                    key={credito._id}
                    className="rounded-lg border border-border p-3"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {getClienteName(credito.clienteId)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Cobrador: {getCobradorName(credito.cobradorId as { nombre?: string } | string | null)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Estado: {credito.estado} | Frecuencia: {credito.frecuencia}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
