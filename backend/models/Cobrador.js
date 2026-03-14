import mongoose from 'mongoose';

const cobradorSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    celular: {
      type: String,
      required: [true, 'El celular es obligatorio'],
      trim: true,
    },
    direccion: {
      type: String,
      required: [true, 'La direccion es obligatoria'],
      trim: true,
    },
    cedula: {
      type: String,
      required: [true, 'La cedula es obligatoria'],
      unique: true,
      trim: true,
    },
    usuario: {
      type: String,
      required: [true, 'El usuario es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    contrasena: {
      type: String,
      required: [true, 'La contrasena es obligatoria'],
    },
    estado: {
  type: String,
  enum: ["Activo", "Inactivo"],
  default: "Activo"
}
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model('Cobrador', cobradorSchema);
