// Sesión del admin: token firmado con HMAC-SHA256 (Web Crypto), guardado en una cookie httpOnly.
// Sirve tanto en el proxy como en Server Actions y Server Components.

export const COOKIE_SESION = "yuan_admin";
export const DURACION_SESION_S = 60 * 60 * 8; // 8 horas

const enc = new TextEncoder();

function secreto() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("Falta SESSION_SECRET (mínimo 32 caracteres) en las variables de entorno");
  }
  return s;
}

function clave() {
  return crypto.subtle.importKey("raw", enc.encode(secreto()), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

const aB64 = (bytes) => Buffer.from(bytes).toString("base64url");

/** Crea el token "payload.firma" para el usuario dado. */
export async function firmarSesion(usuario) {
  const payload = aB64(
    enc.encode(JSON.stringify({ u: usuario, exp: Math.floor(Date.now() / 1000) + DURACION_SESION_S }))
  );
  const firma = await crypto.subtle.sign("HMAC", await clave(), enc.encode(payload));
  return `${payload}.${aB64(new Uint8Array(firma))}`;
}

/** Devuelve `{ usuario }` si el token es válido y no ha expirado; si no, `null`. */
export async function leerSesion(token) {
  try {
    const [payload, firma] = String(token ?? "").split(".");
    if (!payload || !firma) return null;
    const valida = await crypto.subtle.verify(
      "HMAC",
      await clave(),
      Buffer.from(firma, "base64url"),
      enc.encode(payload)
    );
    if (!valida) return null;
    const datos = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!datos.u || datos.exp < Math.floor(Date.now() / 1000)) return null;
    return { usuario: datos.u };
  } catch {
    return null;
  }
}
