import 'dotenv/config'
import dns from 'node:dns/promises'

dns.setServers(['1.1.1.1', '8.8.8.8'])

import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import Admin from './models/Admin.js' // modelo de super admin

// ─────────────────────────────────────────
// 🔥 IMPORTAR RUTAS
// ─────────────────────────────────────────

import cobradoresRouter from './routes/cobradores.js'
import clientesRouter from './routes/clientes.js'
import creditosRouter from './routes/creditos.js'
import inventarioRouter from './routes/inventario.js'

const app = express()

// ─────────────────────────────────────────
// 🔥 CORS PROFESIONAL PARA VERCEL + LOCAL
// ─────────────────────────────────────────

const allowedOrigins = [
  'http://localhost:3000',               // oficina/superadmin si usas 3000
  'http://localhost:3001',               // pruebas directas al backend
  'http://localhost:3002',               // superadmin local (Next)
  'https://gota-a-gota-cobrador.vercel.app',
  'https://gota-a-gota-oficina.vercel.app',
  'https://gota-a-gota-gray.vercel.app',
]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true) // curl, Postman, etc.

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true)
      }

      console.log('❌ CORS bloqueado:', origin)
      callback(new Error('No permitido por CORS'))
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

// Soporte explícito para preflight
app.options('*', cors())

// ─────────────────────────────────────────
// 🔥 MIDDLEWARES
// ─────────────────────────────────────────

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Log básico de requests
app.use((req, _res, next) => {
  console.log(`📡 ${req.method} ${req.originalUrl}`)
  next()
})

// ─────────────────────────────────────────
// 🔥 CONEXIÓN A MONGODB
// ─────────────────────────────────────────

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI no definida en variables de entorno')
  process.exit(1)
}

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
  })
  .then(() => console.log('✅ MongoDB conectado correctamente'))
  .catch((err) => {
    console.error('❌ Error conectando a MongoDB:', err)
    process.exit(1)
  })

// ─────────────────────────────────────────
// 🔥 RUTAS PRINCIPALES
// ─────────────────────────────────────────

app.use('/cobradores', cobradoresRouter)
app.use('/clientes', clientesRouter)
app.use('/creditos', creditosRouter)
app.use('/inventario', inventarioRouter)

// ─────────────────────────────────────────
// 🔥 RUTAS DE SUPER ADMIN
// ─────────────────────────────────────────

// Semilla para crear un super admin inicial
app.post('/admin/seed-superadmin', async (_req, res, next) => {
  try {
    console.log('📌 Seed superadmin: inicio')

    const existing = await Admin.findOne({})
    if (existing) {
      return res.json({
        message: 'Ya existe un super admin',
        email: existing.email,
      })
    }

    const email = 'superadmin@gmail.com'
    const plainPassword = 'admin123' // cámbiala luego

    const hashedPassword = await bcrypt.hash(plainPassword, 12)

    const admin = await Admin.create({
      email,
      password: hashedPassword,
      nombre: 'Super Administrador',
      role: 'super_admin',
    })

    console.log('📌 Seed superadmin: creado', admin._id)

    return res.json({
      message: 'Super admin creado exitosamente',
      email,
      password: `${plainPassword} (cámbiala después)`,
    })
  } catch (err) {
    next(err)
  }
})

// Login de super admin
app.post('/admin/login', async (req, res, next) => {
  try {
    console.log('📌 Admin login:', req.body)

    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y contraseña son requeridos',
      })
    }

    const admin = await Admin.findOne({ email })
    if (!admin) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const isValid = await bcrypt.compare(password, admin.password)
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    return res.json({
      id: admin._id,
      email: admin.email,
      nombre: admin.nombre,
      role: admin.role,
    })
  } catch (err) {
    next(err)
  }
})

// ─────────────────────────────────────────
// 🔥 RUTA RAÍZ
// ─────────────────────────────────────────

app.get('/', (_req, res) => {
  res.json({
    status: 'OK',
    mensaje: 'API Gota a Gota funcionando correctamente',
    entorno: process.env.NODE_ENV || 'development',
  })
})

// ─────────────────────────────────────────
// 🔥 404 HANDLER
// ─────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
  })
})

// ─────────────────────────────────────────
// 🔥 MANEJO GLOBAL DE ERRORES
// ─────────────────────────────────────────

app.use((err, _req, res, _next) => {
  console.error('🔥 Error global:', err)

  res.status(500).json({
    error: err.message || 'Error interno del servidor',
  })
})

// ─────────────────────────────────────────
// 🔥 INICIAR SERVIDOR
// ─────────────────────────────────────────

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
})
