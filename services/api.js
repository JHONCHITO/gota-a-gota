const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiFetch(endpoint, options = {}) {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_token")
        : null;

    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      ...options,
    });

    // Manejo de errores HTTP
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Error en la API");
    }

    // Retornar JSON si todo está bien
    return await res.json();
  } catch (error) {
    console.error("apiFetch error:", error);
    return { error: true, message: error.message };
  }
}