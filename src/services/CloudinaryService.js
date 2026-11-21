import { v2 as cloudinary } from "cloudinary";

// Solo se importa desde código de servidor. El SDK se autoconfigura con CLOUDINARY_URL.
export class CloudinaryService {
  static TRANSFORMACION = "f_auto,q_auto,w_500";
  static CARPETA = "yuan-store/productos";

  constructor(cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    this.cloudName = cloudName;
  }

  /** URL optimizada a partir del public id; `fallback` si no hay cloud o id. */
  url(publicId, { transformacion = CloudinaryService.TRANSFORMACION, fallback = "" } = {}) {
    if (!publicId || !this.cloudName) return fallback;
    const id = String(publicId).replace(/^\/+/, "");
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformacion}/${id}`;
  }

  /** Inserta la transformación optimizada en una URL de Cloudinary ya subida. */
  optimizar(secureUrl, transformacion = CloudinaryService.TRANSFORMACION) {
    return secureUrl.replace("/image/upload/", `/image/upload/${transformacion}/`);
  }

  /**
   * Sube una imagen (Buffer) a Cloudinary y devuelve la URL optimizada que se
   * guarda en MongoDB (solo texto, la base no almacena el archivo) y el
   * `publicId`, necesario únicamente para poder borrarla luego.
   */
  async subir(buffer) {
    const res = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: CloudinaryService.CARPETA,
            resource_type: "image",
            // Limita el original para no gastar almacenamiento de más.
            transformation: [{ width: 1000, height: 1000, crop: "limit" }],
          },
          (err, result) => (err ? reject(err) : resolve(result))
        )
        .end(buffer);
    });
    return { url: this.optimizar(res.secure_url), publicId: res.public_id };
  }

  /** Borra una imagen; nunca lanza (un huérfano en Cloudinary no debe romper el flujo). */
  async eliminar(publicId) {
    if (!publicId) return;
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error("No se pudo borrar la imagen de Cloudinary:", err);
    }
  }
}
