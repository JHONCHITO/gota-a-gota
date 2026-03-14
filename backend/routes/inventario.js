// backend/routes/inventario.js
import { Router } from 'express'
import Inventario from '../models/Inventario.js'

const router = Router()

// Crear item de inventario
router.post('/', async (req, res, next) => {
  try {
    console.log('📦 BODY inventario:', req.body)       // log para debug
    const item = await Inventario.create(req.body)
    console.log('✅ CREADO inventario:', item)         // log para ver lo creado
    return res.status(201).json(item)
  } catch (err) {
    console.error('❌ Error creando inventario:', err)
    next(err)
  }
})

// Listar inventario (con filtros opcionales)
router.get('/', async (req, res, next) => {
  try {
    const { q, cobradorId } = req.query

    const filtro = {}
    if (q) filtro.descripcion = new RegExp(q, 'i')
    if (cobradorId) filtro.cobrador = cobradorId

    const items = await Inventario.find(filtro)
      .populate('cobrador')
      .sort({ createdAt: -1 })

    console.log('📋 ITEMS inventario encontrados:', items.length)
    return res.json(items)
  } catch (err) {
    console.error('❌ Error listando inventario:', err)
    next(err)
  }
})

export default router
