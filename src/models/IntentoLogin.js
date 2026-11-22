import mongoose from "mongoose";

/**
 * Intentos fallidos de login del panel admin, por IP (guardada como hash SHA-256).
 * El índice TTL sobre `expiraEn` hace que MongoDB borre el documento solo al vencer la ventana.
 * Ojo: el monitor TTL corre cada ~60 s, así que el servicio también compara `expiraEn` con la hora actual.
 */
const IntentoLoginSchema = new mongoose.Schema({
  clave: { type: String, required: true, unique: true },
  fallos: { type: Number, required: true, default: 0 },
  expiraEn: { type: Date, required: true, expires: 0 },
});

export default mongoose.models.IntentoLogin ?? mongoose.model("IntentoLogin", IntentoLoginSchema);
