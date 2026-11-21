export class CloudinaryService {
  static TRANSFORMACION = "f_auto,q_auto,w_500";

  constructor(cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    this.cloudName = cloudName;
  }

  /** URL optimizada a partir del public id; `fallback` si no hay cloud o id. */
  url(publicId, { transformacion = CloudinaryService.TRANSFORMACION, fallback = "" } = {}) {
    if (!publicId || !this.cloudName) return fallback;
    const id = String(publicId).replace(/^\/+/, "");
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformacion}/${id}`;
  }
}
