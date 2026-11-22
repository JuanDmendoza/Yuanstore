import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    usuario: { type: String, required: true, unique: true, trim: true, lowercase: true },
    // "sal:hash" (scrypt). Nunca se guarda la contraseña en claro.
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Admin ?? mongoose.model("Admin", AdminSchema);
