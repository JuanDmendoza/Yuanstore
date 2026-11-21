import mongoose from "mongoose";

export const CATEGORIAS = ["Fruta", "Gamepass"];

const ProductoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    categoria: { type: String, required: true, enum: CATEGORIAS, index: true },
    precio: { type: Number, required: true, min: 0 }, // en COP
    cloudinaryPublicId: { type: String, trim: true, default: "" },
    imagenUrl: { type: String, trim: true, default: "" }, // respaldo si no hay publicId
    disponible: { type: Boolean, default: true, index: true },
    bestSeller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Producto ?? mongoose.model("Producto", ProductoSchema);
