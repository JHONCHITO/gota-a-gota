import { Router } from 'express';
import Cobrador from '../models/Cobrador.js';
import Cliente from '../models/Cliente.js';

const router = Router();

// ── POST /cobradores/login  →  Login de cobrador ────────
router.post('/login', async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
      return res.status(400).json({ error: 'Usuario y contrasena son obligatorios' });
    }

    const cobrador = await Cobrador.findOne({ usuario: usuario.toLowerCase() });

    if (!cobrador) {
      return res.status(401).json({ error: 'Usuario o contrasena incorrectos' });
    }

    if (cobrador.contrasena !== contrasena) {
      return res.status(401).json({ error: 'Usuario o contrasena incorrectos' });
    }

    // Retornar cobrador sin la contrasena
    const { contrasena: _, ...cobradorData } = cobrador.toObject();
    res.json(cobradorData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /cobradores  →  Crear cobrador ─────────────────
router.post('/', async (req, res) => {
  try {
    const cobrador = await Cobrador.create(req.body);
    res.status(201).json(cobrador);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── GET /cobradores  →  Listar todos los cobradores ─────
router.get('/', async (_req, res) => {
  try {
    const cobradores = await Cobrador.find().select('-contrasena');
    res.json(cobradores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /cobradores/:id  →  Obtener cobrador por ID ─────
router.get('/:id', async (req, res) => {
  try {
    const cobrador = await Cobrador.findById(req.params.id).select('-contrasena');
    if (!cobrador) {
      return res.status(404).json({ error: 'Cobrador no encontrado' });
    }
    res.json(cobrador);
  } catch (err) {
    res.status(400).json({ error: 'ID invalido' });
  }
});

// ── PUT /cobradores/:id  →  Actualizar cobrador ─────────
router.put('/:id', async (req, res) => {
  try {
    const cobrador = await Cobrador.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!cobrador) {
      return res.status(404).json({ error: 'Cobrador no encontrado' });
    }
    res.json(cobrador);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── DELETE /cobradores/:id  →  Eliminar cobrador ────────
router.delete('/:id', async (req, res) => {
  try {
    const cobrador = await Cobrador.findByIdAndDelete(req.params.id);
    if (!cobrador) {
      return res.status(404).json({ error: 'Cobrador no encontrado' });
    }
    res.json({ mensaje: 'Cobrador eliminado correctamente' });
  } catch (err) {
    res.status(400).json({ error: 'ID invalido' });
  }
});

// ── GET /cobradores/:id/clientes  →  Clientes de un cobrador ──
router.get('/:id/clientes', async (req, res) => {
  try {
    // Verificar que el cobrador existe
    const cobrador = await Cobrador.findById(req.params.id);
    if (!cobrador) {
      return res.status(404).json({ error: 'Cobrador no encontrado' });
    }
    const clientes = await Cliente.find({ cobradorId: req.params.id });
    res.json(clientes);
  } catch (err) {
    res.status(400).json({ error: 'ID invalido' });
  }
});

export default router;
