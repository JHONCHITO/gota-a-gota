import { ObjectId } from 'mongodb'

export interface SuperAdmin {
  _id?: ObjectId
  email: string
  password: string
  nombre: string
  createdAt: Date
  updatedAt: Date
}

export interface Oficina {
  _id?: ObjectId
  nombre: string
  ciudad: string
  direccion: string
  telefono: string
  responsable?: string
  emailContacto?: string
  descripcion?: string
  usuarioAdmin: string
  passwordAdmin: string
  activa: boolean
  createdAt: Date
  updatedAt: Date
}
