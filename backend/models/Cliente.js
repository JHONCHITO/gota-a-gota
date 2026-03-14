import mongoose from 'mongoose';

const clienteSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    cc: {
      type: String,
      required: [true, 'La cedula (C.C.) es obligatoria'],
      unique: true,
      trim: true,
    },
    direccion: {
      type: String,
      required: [true, 'La direccion es obligatoria'],
      trim: true,
    },
    celular: {
      type: String,
      required: [true, 'El celular es obligatorio'],
      trim: true,
    },
    cobradorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cobrador',
      required: [true, 'El cobradorId es obligatorio'],
    },
    tipo: {
      type: String,
      enum: ['regular', 'nuevo', 'frecuente', 'moroso'],
      default: 'nuevo',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model('Cliente', clienteSchema);
