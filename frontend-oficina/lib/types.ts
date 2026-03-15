// ============================================
// Types for Gota a Gota - Panel de Oficina
// Matches MongoDB backend at gota-a-gota-backend.onrender.com
// ============================================

export interface Cobrador {
  _id: string
  nombre: string
  celular: string
  direccion: string
  cedula: string
  usuario: string
  contrasena?: string
  createdAt: string
  updatedAt: string
}

export interface CobradorRef {
  _id: string
  nombre: string
  celular?: string
  cedula?: string
}

export interface Cliente {
  _id: string
  nombre: string
  cc: string
  direccion: string
  celular: string
  cobradorId: CobradorRef | string | null
  tipo: "nuevo" | "frecuente"
  createdAt: string
  updatedAt: string
}

export interface Pago {
  _id: string
  monto: number
  fecha: string
}

export interface Credito {
  _id: string
  fechaOrigen: string
  fechaPago: string
  montoPrestado: number
  montoPorPagar: number
  clienteId: {
    _id: string
    nombre: string
    cc: string
    direccion?: string
    celular?: string
  } | string
  cobradorId: CobradorRef | string | null
  estado: "pendiente" | "pagado"
  frecuencia: "diario" | "semanal" | "mensual"
  pagos: Pago[]
  createdAt: string
  updatedAt: string
}

// Form types for creating/editing
export interface CobradorForm {
  nombre: string
  celular: string
  direccion: string
  cedula: string
  usuario: string
  contrasena?: string
  estado?: "Activo" | "Inactivo"
}

export interface ClienteForm {
  nombre: string
  cc: string
  direccion: string
  celular: string
  cobradorId: string | null   // <--- aceptar null
  tipo: "nuevo" | "frecuente"
}

export interface CreditoForm {
  clienteId: string
  cobradorId: string
  montoPrestado: number
  montoPorPagar: number
  fechaOrigen: string
  fechaPago: string
  frecuencia: "diario" | "semanal" | "mensual"
}

export interface PagoForm {
  monto: number
  fecha: string
}

// Dashboard stats
export interface DashboardStats {
  totalCobradores: number
  totalClientes: number
  carteraTotal: number
  totalRecaudado: number
  porCobrar: number
  prestamosActivos: number
}

// Calendario
export interface Visita {
  id: string
  clienteNombre: string
  cobradorNombre: string
  fecha: string
  hora: string
  notas: string
}

// Inventario
export interface InventarioItem {
  id: string
  tipo: "celular" | "tablet" | "moto" | "otro"
  descripcion: string
  serie: string
  cobradorId: string
  cobradorNombre: string
  fechaAsignacion: string
  estado: "asignado" | "disponible" | "mantenimiento"
}
