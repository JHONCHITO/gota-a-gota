import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import type { Oficina } from '@/lib/types'

// GET - Listar todas las oficinas
export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'super_admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const oficinas = await db.collection<Oficina>('oficinas')
      .find({})
      .project({ passwordAdmin: 0 })
      .toArray()

    return NextResponse.json({ oficinas })
  } catch (error) {
    console.error('Error obteniendo oficinas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva oficina
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'super_admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { nombre, ciudad, direccion, telefono, responsable, emailContacto, descripcion, usuarioAdmin, passwordAdmin } = body

    if (!nombre || !ciudad || !direccion || !telefono || !usuarioAdmin || !passwordAdmin) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Verificar si ya existe una oficina con ese usuario
    const existingOficina = await db.collection<Oficina>('oficinas').findOne({ usuarioAdmin })
    if (existingOficina) {
      return NextResponse.json(
        { error: 'Ya existe una oficina con ese usuario admin' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(passwordAdmin, 12)

    const newOficina: Oficina = {
      nombre,
      ciudad,
      direccion,
      telefono,
      responsable: responsable || '',
      emailContacto: emailContacto || '',
      descripcion: descripcion || '',
      usuarioAdmin,
      passwordAdmin: hashedPassword,
      activa: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection<Oficina>('oficinas').insertOne(newOficina)

    return NextResponse.json({ 
      success: true, 
      id: result.insertedId,
      message: 'Oficina creada exitosamente'
    })
  } catch (error) {
    console.error('Error creando oficina:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
