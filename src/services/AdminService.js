import { connectDB } from "@/src/lib/mongodb";
import { hashPassword, verificarPassword } from "@/src/lib/password.mjs";
import Admin from "@/src/models/Admin";

export class AdminService {
  // Hash de relleno: si el usuario no existe se verifica igual, para que el tiempo
  // de respuesta no delate si el usuario es válido.
  static HASH_FALSO = `${"0".repeat(32)}:${"0".repeat(128)}`;

  /** `true` si usuario y contraseña son correctos. */
  async autenticar(usuario, password) {
    await connectDB();
    const nombre = String(usuario ?? "").trim().toLowerCase();
    const admin = nombre ? await Admin.findOne({ usuario: nombre }).lean() : null;
    const valido = await verificarPassword(String(password ?? ""), admin?.passwordHash ?? AdminService.HASH_FALSO);
    return Boolean(admin) && valido;
  }

  /** Crea el admin o actualiza su contraseña. */
  async guardar(usuario, password) {
    await connectDB();
    const passwordHash = await hashPassword(password);
    await Admin.findOneAndUpdate(
      { usuario: String(usuario).trim().toLowerCase() },
      { passwordHash },
      { upsert: true }
    );
  }
}
