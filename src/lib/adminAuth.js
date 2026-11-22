import { cookies } from "next/headers";
import { COOKIE_SESION, leerSesion } from "@/src/lib/sesion";

/** Sesión del admin actual (`{ usuario }`) o `null`. Verifica la firma y la expiración. */
export async function sesionAdmin() {
  return leerSesion((await cookies()).get(COOKIE_SESION)?.value);
}

/** Para Server Actions: `null` si hay sesión válida; si no, el resultado de error a devolver. */
export async function rechazarSinSesion() {
  if (await sesionAdmin()) return null;
  return { ok: false, error: "Tu sesión expiró. Vuelve a iniciar sesión." };
}
