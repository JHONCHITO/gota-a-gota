import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getSession } from '@/lib/auth'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import type { Oficina } from '@/lib/types'

// PUT - Actualizar oficina
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'super_admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { nombre, ciudad, direccion, telefono, responsable, emailContacto, descripcion, usuarioAdmin, passwordAdmin } = body

    if (!nombre || !ciudad || !direccion || !telefono || !usuarioAdmin) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Verificar si ya existe otra oficina con ese usuario
    const existingOficina = await db.collection<Oficina>('oficinas').findOne({ 
      usuarioAdmin,
      _id: { $ne: new ObjectId(id) }
    })
    if (existingOficina) {
      return NextResponse.json(
        { error: 'Ya existe otra oficina con ese usuario admin' },
        { status: 400 }
      )
    }

    const updateData: Partial<Oficina> = {
      nombre,
      ciudad,
      direccion,
      telefono,
      responsable: responsable || '',
      emailContacto: emailContacto || '',
      descripcion: descripcion || '',
      usuarioAdmin,
      updatedAt: new Date(),
    }

    // Solo actualizar contraseña si se proporciona
    if (passwordAdmin) {
      updateData.passwordAdmin = await bcrypt.hash(passwordAdmin, 12)
    }

    await db.collection<Oficina>('oficinas').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    return NextResponse.json({ 
      success: true,
      message: 'Oficina actualizada exitosamente'
    })
  } catch (error) {
    console.error('Error actualizando oficina:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar oficina
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'super_admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const { db } = await connectToDatabase()

    await db.collection<Oficina>('oficinas').deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ 
      success: true,
      message: 'Oficina eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error eliminando oficina:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
