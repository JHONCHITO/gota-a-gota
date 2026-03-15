// ─────────────────────────────────────────────────────────
// 🔥 BASE URL (PRODUCCIÓN READY)
// ─────────────────────────────────────────────────────────

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://gota-a-gota-backend.onrender.com"

// ─────────────────────────────────────────────────────────
// 🔥 FETCH BASE CON MEJOR MANEJO DE ERRORES
// ─────────────────────────────────────────────────────────

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20000)

    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok) {
      let errorMessage = `Error ${res.status}`

      try {
        const error = await res.json()
        errorMessage = error.error || error.message || errorMessage
      } catch {}

      throw new Error(errorMessage)
    }

    return res.json()
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("El servidor no respondió (timeout)")
    }
    throw new Error(err.message || "Error de conexión")
  }
}

// ─────────────────────────────────────────────────────────
// 🔐 COBRADORES
// ─────────────────────────────────────────────────────────

export const cobradoresApi = {
  login: (usuario: string, contrasena: string) =>
    apiFetch<Cobrador>("/cobradores/login", {
      method: "POST",
      body: JSON.stringify({ usuario, contrasena }),
    }),

  getById: (id: string) =>
    apiFetch<Cobrador>(`/cobradores/${id}`),

  getClientes: (id: string) =>
    apiFetch<Cliente[]>(`/cobradores/${id}/clientes`),
}

// ─────────────────────────────────────────────────────────
// 👥 CLIENTES
// ─────────────────────────────────────────────────────────

export const clientesApi = {
  getAll: () =>
    apiFetch<Cliente[]>("/clientes"),

  getById: (id: string) =>
    apiFetch<Cliente>(`/clientes/${id}`),

  getCreditos: (id: string) =>
    apiFetch<Credito[]>(`/clientes/${id}/creditos`),

  create: (data: ClienteCreate) =>
    apiFetch<Cliente>("/clientes", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

// ─────────────────────────────────────────────────────────
// 💰 CREDITOS
// ─────────────────────────────────────────────────────────

export const creditosApi = {
  getAll: () =>
    apiFetch<Credito[]>("/creditos"),

  getById: (id: string) =>
    apiFetch<Credito>(`/creditos/${id}`),

  create: (data: CreditoCreate) =>
    apiFetch<Credito>("/creditos", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: Partial<CreditoCreate> & { pagos?: Pago[] }
  ) =>
    apiFetch<Credito>(`/creditos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  registrarPago: (id: string, monto: number) =>
    apiFetch<Credito>(`/creditos/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        $push: {
          pagos: {
            monto,
            fecha: new Date().toISOString(),
          },
        },
      }),
    }),
}

// ─────────────────────────────────────────────────────────
// 🧠 TYPES
// ─────────────────────────────────────────────────────────

export interface Cobrador {
  _id: string
  nombre: string
  celular: string
  direccion: string
  cedula: string
  usuario: string
  estado?: string
}

export interface Cliente {
  _id: string
  nombre: string
  cc: string
  celular: string
  direccion: string
  cobradorId?: string
  tipo?: string
}

export interface Credito {
  _id: string
  clienteId: string | Cliente
  cobradorId?: string
  fechaOrigen: string
  fechaPago: string
  montoPrestado: number
  montoPorPagar: number
  frecuencia?: string
  estado?: string
  pagos?: Pago[]
}

export interface Pago {
  _id?: string
  monto: number
  fecha: string
}

export interface ClienteCreate {
  nombre: string
  cc: string
  celular: string
  direccion: string
  cobradorId?: string
  tipo?: string
}

export interface CreditoCreate {
  clienteId: string
  cobradorId?: string
  fechaOrigen: string
  fechaPago: string
  montoPrestado: number
  montoPorPagar: number
  frecuencia?: string
}