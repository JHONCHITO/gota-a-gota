import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'https://gota-a-gota-backend.onrender.com'
const OFICINA_APP_URL = 'https://gota-a-gota-oficina.vercel.app'

export async function POST(request: NextRequest) {
  try {
    const { usuario, password } = await request.json()

    if (!usuario || !password) {
      return NextResponse.json(
        { error: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Conectar con el backend en Render para autenticar
    const backendResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: usuario, 
        password: password 
      }),
    })

    const backendData = await backendResponse.json()

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: backendData.message || backendData.error || 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Si el login es exitoso, devolver la URL de redirección con el token
    const token = backendData.token || backendData.accessToken
    
    return NextResponse.json({ 
      success: true,
      token: token,
      user: backendData.user || backendData.usuario,
      // Redirigir a la app de oficina existente con el token
      redirectUrl: `${OFICINA_APP_URL}/dashboard?token=${token}`
    })
  } catch (error) {
    console.error('Error en login oficina:', error)
    return NextResponse.json(
      { error: 'Error al conectar con el servidor' },
      { status: 500 }
    )
  }
}
