import { createHash } from "node:crypto";
import { connectDB } from "@/src/lib/mongodb";
import IntentoLogin from "@/src/models/IntentoLogin";

/**
 * Límite de intentos fallidos de login por IP, compartido entre todas las instancias
 * serverless gracias a MongoDB Atlas. Ventana fija: tras MAX_INTENTOS fallos, la IP queda
 * bloqueada hasta que vence la ventana (el índice TTL borra el registro).
 */
export class LimiteLoginService {
  static MAX_INTENTOS = 5;
  static VENTANA_MS = 15 * 60 * 1000;

  /** No se guarda la IP en claro. */
  static clave(ip) {
    return createHash("sha256").update(String(ip)).digest("hex");
  }

  /** `true` si la IP agotó sus intentos en la ventana actual. */
  async bloqueada(ip) {
    await connectDB();
    const registro = await IntentoLogin.exists({
      clave: LimiteLoginService.clave(ip),
      fallos: { $gte: LimiteLoginService.MAX_INTENTOS },
      expiraEn: { $gt: new Date() },
    });
    return Boolean(registro);
  }

  /**
   * Suma un fallo de forma atómica. Si no hay registro o la ventana ya venció
   * (aunque el TTL aún no lo haya borrado), arranca una ventana nueva con 1 fallo.
   */
  async registrarFallo(ip) {
    await connectDB();
    const ahora = new Date();
    const vence = new Date(ahora.getTime() + LimiteLoginService.VENTANA_MS);
    const vigente = { $gt: ["$expiraEn", ahora] };
    await IntentoLogin.updateOne(
      { clave: LimiteLoginService.clave(ip) },
      [
        {
          $set: {
            fallos: { $cond: [vigente, { $add: [{ $ifNull: ["$fallos", 0] }, 1] }, 1] },
            expiraEn: { $cond: [vigente, "$expiraEn", vence] },
          },
        },
      ],
      { upsert: true, updatePipeline: true }
    );
  }

  /** Borra el contador tras un login correcto. */
  async limpiar(ip) {
    await connectDB();
    await IntentoLogin.deleteOne({ clave: LimiteLoginService.clave(ip) });
  }
}
