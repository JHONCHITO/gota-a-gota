import type {
  Cobrador,
  CobradorForm,
  Cliente,
  ClienteForm,
  Credito,
  CreditoForm,
  PagoForm,
} from "./types"

// 🔥 URL del backend (Render)
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://gota-a-gota-backend.onrender.com"

// 🔥 Función base para todas las peticiones
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error")
    throw new Error(`API Error ${res.status}: ${errorText}`)
  }

  return res.json()
}

// =====================================================
// 🔐 LOGIN
// =====================================================

export async function loginCobrador(
  usuario: string,
  contrasena: string
): Promise<Cobrador> {
  return fetchAPI<Cobrador>("/cobradores/login", {
    method: "POST",
    body: JSON.stringify({ usuario, contrasena }),
  })
}

// =====================================================
// 👤 COBRADORES
// =====================================================

export async function getCobradores(): Promise<Cobrador[]> {
  return fetchAPI<Cobrador[]>("/cobradores")
}

export async function getCobrador(id: string): Promise<Cobrador> {
  return fetchAPI<Cobrador>(`/cobradores/${id}`)
}

export async function createCobrador(
  data: CobradorForm
): Promise<Cobrador> {
  return fetchAPI<Cobrador>("/cobradores", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateCobrador(
  id: string,
  data: Partial<CobradorForm>
): Promise<Cobrador> {
  return fetchAPI<Cobrador>(`/cobradores/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteCobrador(id: string): Promise<void> {
  await fetchAPI(`/cobradores/${id}`, { method: "DELETE" })
}

export async function getCobradorClientes(
  id: string
): Promise<Cliente[]> {
  return fetchAPI<Cliente[]>(`/cobradores/${id}/clientes`)
}

// =====================================================
// 👥 CLIENTES
// =====================================================

export async function getClientes(): Promise<Cliente[]> {
  return fetchAPI<Cliente[]>("/clientes")
}

export async function getCliente(id: string): Promise<Cliente> {
  return fetchAPI<Cliente>(`/clientes/${id}`)
}

export async function createCliente(
  data: ClienteForm
): Promise<Cliente> {
  return fetchAPI<Cliente>("/clientes", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateCliente(
  id: string,
  data: Partial<ClienteForm>
): Promise<Cliente> {
  return fetchAPI<Cliente>(`/clientes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteCliente(id: string): Promise<void> {
  await fetchAPI(`/clientes/${id}`, { method: "DELETE" })
}

export async function getClienteCreditos(
  id: string
): Promise<Credito[]> {
  return fetchAPI<Credito[]>(`/clientes/${id}/creditos`)
}

// =====================================================
// 💰 CREDITOS
// =====================================================

export async function getCreditos(): Promise<Credito[]> {
  return fetchAPI<Credito[]>("/creditos")
}

export async function getCredito(id: string): Promise<Credito> {
  return fetchAPI<Credito>(`/creditos/${id}`)
}

export async function createCredito(
  data: CreditoForm
): Promise<Credito> {
  return fetchAPI<Credito>("/creditos", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateCredito(
  id: string,
  data: Partial<CreditoForm>
): Promise<Credito> {
  return fetchAPI<Credito>(`/creditos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteCredito(id: string): Promise<void> {
  await fetchAPI(`/creditos/${id}`, { method: "DELETE" })
}

export async function registrarPago(
  creditoId: string,
  pago: PagoForm
): Promise<Credito> {
  return fetchAPI<Credito>(`/creditos/${creditoId}`, {
    method: "PUT",
    body: JSON.stringify({
      $push: { pagos: pago },
    }),
  })
}