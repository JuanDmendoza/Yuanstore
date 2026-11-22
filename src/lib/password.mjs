// Hash de contraseñas con scrypt (incluido en Node, sin dependencias).
// Es .mjs para poder usarlo también desde scripts/crear-admin.mjs.
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const LONGITUD = 64;

function derivar(password, sal) {
  return new Promise((resolve, reject) => {
    scrypt(password, sal, LONGITUD, (err, clave) => (err ? reject(err) : resolve(clave)));
  });
}

/** Devuelve "sal:hash" (ambos en hex). */
export async function hashPassword(password) {
  const sal = randomBytes(16);
  const clave = await derivar(password, sal);
  return `${sal.toString("hex")}:${clave.toString("hex")}`;
}

/** Comparación en tiempo constante. */
export async function verificarPassword(password, guardado) {
  const [salHex, hashHex] = String(guardado ?? "").split(":");
  if (!salHex || !hashHex) return false;
  const esperado = Buffer.from(hashHex, "hex");
  const clave = await derivar(password, Buffer.from(salHex, "hex"));
  return esperado.length === clave.length && timingSafeEqual(esperado, clave);
}
