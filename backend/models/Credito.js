import mongoose from 'mongoose';

const pagoSchema = new mongoose.Schema({
  monto: { type: Number, required: true },
  fecha: { type: Date, required: true },
}, { _id: true })

const creditoSchema = new mongoose.Schema(
  {
    fechaOrigen: {
      type: Date,
      required: [true, 'La fecha de origen es obligatoria'],
    },
    fechaPago: {
      type: Date,
      required: [true, 'La fecha de pago es obligatoria'],
    },
    montoPrestado: {
      type: Number,
      required: [true, 'El monto prestado es obligatorio'],
      min: [0, 'El monto prestado no puede ser negativo'],
    },
    montoPorPagar: {
      type: Number,
      required: [true, 'El monto por pagar es obligatorio'],
      min: [0, 'El monto por pagar no puede ser negativo'],
    },
    clienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente',
      required: [true, 'El clienteId es obligatorio'],
    },
    cobradorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cobrador',
      required: [true, 'El cobradorId es obligatorio'],
    },
    estado: {
      type: String,
      enum: { values: ['pagado', 'pendiente'], message: 'El estado debe ser "pagado" o "pendiente"' },
      default: 'pendiente',
    },
    frecuencia: {
      type: String,
      enum: ['diario', 'semanal', 'quincenal', 'mensual'],
      default: 'diario',
    },
    pagos: [pagoSchema],
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('Credito', creditoSchema);
