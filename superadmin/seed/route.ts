import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import type { SuperAdmin } from '@/lib/types'

export async function POST(_request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    const email = 'superadmin@gmail.com'
    const plainPassword = '123456'

    // ¿ya existe?
    const existing = await db
      .collection<SuperAdmin>('super_admins')
      .findOne({ email })

    if (existing) {
      return NextResponse.json(
        { message: 'Super admin ya existe' },
        { status: 200 }
      )
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10)

    const result = await db.collection<SuperAdmin>('super_admins').insertOne({
      email,
      password: hashedPassword,
      createdAt: new Date(),
      role: 'super_admin',
    } as any)

    return NextResponse.json(
      {
        success: true,
        id: result.insertedId,
        email,
        password: plainPassword,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error en seed superadmin:', error)
    return NextResponse.json(
      { error: 'Error creando super admin' },
      { status: 500 }
    )
  }
}
