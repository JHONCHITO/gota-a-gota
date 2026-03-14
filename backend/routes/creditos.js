import { Router } from 'express';
import Credito from '../models/Credito.js';
import Cliente from '../models/Cliente.js';
import Cobrador from '../models/Cobrador.js';

const router = Router();

// ── POST /creditos  →  Crear credito ────────────────────
router.post('/', async (req, res) => {
  try {
    const clienteId = req.body.clienteId || req.body.cliente
    const cobradorId = req.body.cobradorId || req.body.cobrador

    const cliente = await Cliente.findById(clienteId)
    if (!cliente) {
      return res.status(400).json({ error: 'El clienteId no corresponde a un cliente existente' })
    }
    const cobrador = await Cobrador.findById(cobradorId)
    if (!cobrador) {
      return res.status(400).json({ error: 'El cobradorId no corresponde a un cobrador existente' })
    }
    const credito = await Credito.create({ ...req.body, clienteId, cobradorId })
    res.status(201).json(credito)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ── GET /creditos  →  Listar todos los creditos ─────────
router.get('/', async (_req, res) => {
  try {
    const creditos = await Credito.find()
      .populate('clienteId', 'nombre cc celular direccion')
      .populate('cobradorId', 'nombre cedula')
    res.json(creditos)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /creditos/:id  →  Obtener credito por ID ────────
router.get('/:id', async (req, res) => {
  try {
    const credito = await Credito.findById(req.params.id)
      .populate('clienteId', 'nombre cc celular direccion')
      .populate('cobradorId', 'nombre cedula')
    if (!credito) {
      return res.status(404).json({ error: 'Credito no encontrado' })
    }
    res.json(credito)
  } catch (err) {
    res.status(400).json({ error: 'ID invalido' })
  }
})

// ── PUT /creditos/:id  →  Actualizar credito ────────────
router.put('/:id', async (req, res) => {
  try {
    const clienteId = req.body.clienteId || req.body.cliente
    const cobradorId = req.body.cobradorId || req.body.cobrador

    if (clienteId) {
      const cliente = await Cliente.findById(clienteId)
      if (!cliente) {
        return res.status(400).json({ error: 'El clienteId no corresponde a un cliente existente' })
      }
    }
    if (cobradorId) {
      const cobrador = await Cobrador.findById(cobradorId)
      if (!cobrador) {
        return res.status(400).json({ error: 'El cobradorId no corresponde a un cobrador existente' })
      }
    }

    // ── Auto cambiar estado a "pagado" si totalPagado >= montoPorPagar ──
    if (req.body.pagos) {
      const creditoActual = await Credito.findById(req.params.id)
      if (creditoActual) {
        const totalPagado = req.body.pagos.reduce(
          (sum, p) => sum + (Number(p.monto) || 0), 0
        )
        if (totalPagado >= creditoActual.montoPorPagar) {
          req.body.estado = 'pagado'
        } else {
          req.body.estado = 'pendiente'
        }
      }
    }

    const credito = await Credito.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!credito) {
      return res.status(404).json({ error: 'Credito no encontrado' })
    }
    res.json(credito)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ── DELETE /creditos/:id  →  Eliminar credito ───────────
router.delete('/:id', async (req, res) => {
  try {
    const credito = await Credito.findByIdAndDelete(req.params.id)
    if (!credito) {
      return res.status(404).json({ error: 'Credito no encontrado' })
    }
    res.json({ mensaje: 'Credito eliminado correctamente' })
  } catch (err) {
    res.status(400).json({ error: 'ID invalido' })
  }
})

export default router;
