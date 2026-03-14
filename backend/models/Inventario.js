// backend/models/Inventario.js
import mongoose from 'mongoose'

const InventarioSchema = new mongoose.Schema(
  {
    tipo: { type: String, required: true },
    descripcion: { type: String, required: true },
    serie: { type: String, required: true },
    cobrador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cobrador',
      required: true
    },
    fechaAsignacion: { type: Date, default: Date.now },
    estado: {
      type: String,
      enum: ['Activo', 'Inactivo', 'Perdido'],
      default: 'Activo'
    }
  },
  {
    timestamps: true
  }
)

// Evita recompilar el modelo si hot‑reload
export default mongoose.models.Inventario ||
  mongoose.model('Inventario', InventarioSchema)
