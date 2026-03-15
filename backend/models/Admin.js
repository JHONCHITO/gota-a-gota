import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nombre: { type: String, required: true },
    role: { type: String, default: 'super_admin' },
  },
  { timestamps: true }
)

const Admin = mongoose.model('Admin', adminSchema)

export default Admin
