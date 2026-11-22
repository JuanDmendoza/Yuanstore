import mongoose from "mongoose";
import { connectDB } from "@/src/lib/mongodb";
import Producto, { CATEGORIAS } from "@/src/models/Producto";
import { MONEDAS_EXTRA, precioEn } from "@/src/domain/monedas";
import { CloudinaryService } from "@/src/services/CloudinaryService";

export class ProductoError extends Error {}

export class ProductoService {
  static MAX_IMAGEN_BYTES = 4 * 1024 * 1024;

  constructor(cloudinary = new CloudinaryService()) {
    this.cloudinary = cloudinary;
  }

  /** Catálogo activo, serializado a objetos planos (seguros para Client Components). */
  async listarDisponibles() {
    await connectDB();
    const docs = await Producto.find({ disponible: true })
      .sort({ bestSeller: -1, precio: -1, nombre: 1 }) // Best Sellers primero; luego precio Perma de mayor a menor
      .lean();
    return docs.map((d) => this.serializar(d));
  }

  /** Todos los productos (incluye no disponibles) para el panel de administración. */
  async listarTodos() {
    await connectDB();
    const docs = await Producto.find().sort({ createdAt: -1 }).lean();
    return docs.map((d) => this.serializar(d));
  }

  /** Crea un producto; si llega `archivo`, lo sube a Cloudinary y guarda solo la URL. */
  async crear(datos, archivo) {
    const campos = this.validar(datos);
    const imagen = await this.subirImagen(archivo);
    await connectDB();
    try {
      const doc = await Producto.create({
        ...campos,
        imagenUrl: imagen?.url ?? "",
        cloudinaryPublicId: imagen?.publicId ?? "",
      });
      return this.serializar(doc.toObject());
    } catch (err) {
      await this.cloudinary.eliminar(imagen?.publicId);
      throw err;
    }
  }

  /** Actualiza un producto; si llega `archivo`, reemplaza la imagen anterior. */
  async actualizar(id, datos, archivo) {
    this.validarId(id);
    const campos = this.validar(datos);
    await connectDB();
    const actual = await Producto.findById(id);
    if (!actual) throw new ProductoError("El producto no existe");

    const imagen = await this.subirImagen(archivo);
    const publicIdAnterior = actual.cloudinaryPublicId;
    actual.set(campos);
    if (imagen) {
      actual.imagenUrl = imagen.url;
      actual.cloudinaryPublicId = imagen.publicId;
    }
    try {
      await actual.save();
    } catch (err) {
      await this.cloudinary.eliminar(imagen?.publicId);
      throw err;
    }
    if (imagen) await this.cloudinary.eliminar(publicIdAnterior);
    return this.serializar(actual.toObject());
  }

  async cambiarDisponible(id, disponible) {
    this.validarId(id);
    await connectDB();
    await Producto.findByIdAndUpdate(id, { disponible: Boolean(disponible) });
  }

  async eliminar(id) {
    this.validarId(id);
    await connectDB();
    const doc = await Producto.findByIdAndDelete(id);
    if (doc) await this.cloudinary.eliminar(doc.cloudinaryPublicId);
  }

  // --- Internos ---------------------------------------------------------

  /** Normaliza y valida los campos de texto/número/booleanos de un producto. */
  validar({ nombre, categoria, precio, precios, precioFisica, preciosFisica, bestSeller, disponible, permaDisponible, fisicaDisponible }) {
    const nombreLimpio = String(nombre ?? "").trim();
    if (!nombreLimpio) throw new ProductoError("El nombre es obligatorio");
    if (!CATEGORIAS.includes(categoria)) throw new ProductoError("Categoría inválida");
    const precioNum = Number(precio);
    if (!Number.isFinite(precioNum) || precioNum < 0) {
      throw new ProductoError("El precio debe ser un número válido (COP)");
    }
    const preciosFijos = this.validarPreciosPorMoneda(precios, precioNum);
    // La versión Física solo existe en frutas y es opcional.
    let fisica = null;
    let fisicaFijos = {};
    const hayFisica = categoria === "Fruta" && String(precioFisica ?? "").trim() !== "";
    if (hayFisica) {
      fisica = Number(precioFisica);
      if (!Number.isFinite(fisica) || fisica < 0) {
        throw new ProductoError("El precio físico debe ser un número válido (COP)");
      }
      fisica = Math.round(fisica);
      fisicaFijos = this.validarPreciosPorMoneda(preciosFisica, fisica);
    }
    return {
      nombre: nombreLimpio,
      categoria,
      precio: Math.round(precioNum),
      precios: preciosFijos,
      precioFisica: fisica,
      preciosFisica: fisicaFijos,
      // El bloqueo por modalidad solo aplica a frutas.
      permaDisponible: categoria === "Fruta" ? Boolean(permaDisponible) : true,
      fisicaDisponible: categoria === "Fruta" ? Boolean(fisicaDisponible) : true,
      bestSeller: Boolean(bestSeller),
      disponible: Boolean(disponible),
    };
  }

  /** Precios fijados a mano por moneda; vacío/ausente = conversión automática desde COP. */
  validarPreciosPorMoneda(precios, precioCOP) {
    const fijos = {};
    for (const moneda of MONEDAS_EXTRA) {
      const { codigo } = moneda;
      const crudo = precios?.[codigo];
      if (crudo === undefined || crudo === null || String(crudo).trim() === "") continue;
      const n = Number(crudo);
      if (!Number.isFinite(n) || n < 0) {
        throw new ProductoError(`El precio en ${codigo} debe ser un número válido`);
      }
      const valor = Math.round(n * 100) / 100;
      // Igual al convertido = sigue siendo automático (así sigue la tasa si cambia).
      if (valor !== precioEn({ precio: precioCOP }, moneda)) fijos[codigo] = valor;
    }
    return fijos;
  }

  validarId(id) {
    if (!mongoose.isValidObjectId(id)) throw new ProductoError("Id de producto inválido");
  }

  /** Sube el archivo (File) si existe y es una imagen válida; `null` si no hay archivo. */
  async subirImagen(archivo) {
    if (!archivo || typeof archivo === "string" || archivo.size === 0) return null;
    if (!archivo.type?.startsWith("image/")) throw new ProductoError("El archivo debe ser una imagen");
    if (archivo.size > ProductoService.MAX_IMAGEN_BYTES) {
      throw new ProductoError("La imagen no puede superar 4 MB");
    }
    return this.cloudinary.subir(Buffer.from(await archivo.arrayBuffer()));
  }

  mapaAObjeto(mapa) {
    return mapa instanceof Map ? Object.fromEntries(mapa) : { ...mapa };
  }

  serializar(doc) {
    return {
      id: String(doc._id),
      nombre: doc.nombre,
      categoria: doc.categoria,
      precio: doc.precio,
      precios: this.mapaAObjeto(doc.precios),
      permaDisponible: doc.permaDisponible !== false,
      fisicaDisponible: doc.fisicaDisponible !== false,
      fisica:
        doc.categoria === "Fruta" && Number.isFinite(doc.precioFisica)
          ? {
              precio: doc.precioFisica,
              precios: this.mapaAObjeto(doc.preciosFisica),
              disponible: doc.fisicaDisponible !== false,
            }
          : null,
      bestSeller: Boolean(doc.bestSeller),
      disponible: doc.disponible !== false,
      // Productos antiguos sin URL guardada: se construye desde el public id.
      imagen: doc.imagenUrl || this.cloudinary.url(doc.cloudinaryPublicId),
    };
  }
}
