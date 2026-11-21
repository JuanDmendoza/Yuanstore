import { connectDB } from "@/src/lib/mongodb";
import Producto from "@/src/models/Producto";
import { CloudinaryService } from "@/src/services/CloudinaryService";

export class ProductoService {
  constructor(cloudinary = new CloudinaryService()) {
    this.cloudinary = cloudinary;
  }

  /** Catálogo activo, serializado a objetos planos (seguros para Client Components). */
  async listarDisponibles() {
    await connectDB();
    const docs = await Producto.find({ disponible: true })
      .sort({ bestSeller: -1, categoria: 1, nombre: 1 })
      .lean();
    return docs.map((d) => this.serializar(d));
  }

  serializar(doc) {
    return {
      id: String(doc._id),
      nombre: doc.nombre,
      categoria: doc.categoria,
      precio: doc.precio,
      bestSeller: Boolean(doc.bestSeller),
      imagen: this.cloudinary.url(doc.cloudinaryPublicId, { fallback: doc.imagenUrl || "" }),
    };
  }
}
