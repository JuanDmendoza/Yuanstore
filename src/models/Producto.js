import mongoose from "mongoose";
import { CATEGORIAS } from "@/src/domain/categorias";

export { CATEGORIAS };

const ProductoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    categoria: { type: String, required: true, enum: CATEGORIAS, index: true },
    precio: { type: Number, required: true, min: 0 }, // en COP (moneda base)
    // Precios fijados a mano por moneda, ej. { MXN: 50, PEN: 10 }. Sin entrada = conversión automática.
    precios: { type: Map, of: { type: Number, min: 0 }, default: {} },
    // Solo frutas: precio de la versión Física (COP) y sus precios por moneda. null = no se vende física.
    precioFisica: { type: Number, min: 0, default: null },
    preciosFisica: { type: Map, of: { type: Number, min: 0 }, default: {} },
    // La imagen vive en Cloudinary: aquí solo se guarda su URL optimizada.
    imagenUrl: { type: String, trim: true, default: "" },
    // Necesario solo para reemplazar/borrar la imagen en Cloudinary.
    cloudinaryPublicId: { type: String, trim: true, default: "" },
    disponible: { type: Boolean, default: true, index: true },
    bestSeller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Con hot reload, `mongoose.models` conserva un modelo con el esquema antiguo y descarta
// en silencio los campos nuevos (strict). Si falta un campo, se recompila el modelo.
if (mongoose.models.Producto && !mongoose.models.Producto.schema.path("precioFisica")) {
  mongoose.deleteModel("Producto");
}

export default mongoose.models.Producto ?? mongoose.model("Producto", ProductoSchema);
