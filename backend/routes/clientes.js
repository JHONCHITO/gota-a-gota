import { Router } from 'express';
import Cliente from '../models/Cliente.js';
import Cobrador from '../models/Cobrador.js';
import Credito from '../models/Credito.js';

const router = Router();

// ── POST /clientes  →  Crear cliente ────────────────────
router.post('/', async (req, res) => {
  try {
    // Acepta tanto "cobrador" como "cobradorId" desde el frontend
    const cobradorId = req.body.cobradorId || req.body.cobrador
    const cobrador = await Cobrador.findById(cobradorId)
    if (!cobrador) {
      return res.status(400).json({ error: 'El cobradorId no corresponde a un cobrador existente' })
    }
    const cliente = await Cliente.create({ ...req.body, cobradorId })
    res.status(201).json(cliente)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ── GET /clientes  →  Listar todos los clientes ─────────
router.get('/', async (_req, res) => {
  try {
    const clientes = await Cliente.find().populate('cobradorId', 'nombre cedula celular')
    res.json(clientes)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /clientes/:id  →  Obtener cliente por ID ────────
router.get('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id).populate('cobradorId', 'nombre cedula celular')
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' })
    }
    res.json(cliente)
  } catch (err) {
    res.status(400).json({ error: 'ID invalido' })
  }
})

// ── PUT /clientes/:id  →  Actualizar cliente ────────────
router.put('/:id', async (req, res) => {
  try {
    const cobradorId = req.body.cobradorId || req.body.cobrador
    if (cobradorId) {
      const cobrador = await Cobrador.findById(cobradorId)
      if (!cobrador) {
        return res.status(400).json({ error: 'El cobradorId no corresponde a un cobrador existente' })
      }
    }
    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' })
    }
    res.json(cliente)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ── DELETE /clientes/:id  →  Eliminar cliente ───────────
router.delete('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id)
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' })
    }
    res.json({ mensaje: 'Cliente eliminado correctamente' })
  } catch (err) {
    res.status(400).json({ error: 'ID invalido' })
  }
})

// ── GET /clientes/:id/creditos  →  Creditos de un cliente ──
router.get('/:id/creditos', async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id)
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' })
    }
    // Busca por "clienteId" o "cliente" para compatibilidad
    const creditos = await Credito.find({
      $or: [
        { clienteId: req.params.id },
        { cliente: req.params.id }
      ]
    }).populate('cobradorId', 'nombre cedula')
      .populate('cliente', 'nombre cedula')
    res.json(creditos)
  } catch (err) {
    res.status(400).json({ error: 'ID invalido' })
  }
})

export default router;
