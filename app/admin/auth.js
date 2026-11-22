"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESION, DURACION_SESION_S, firmarSesion } from "@/src/lib/sesion";
import { AdminService } from "@/src/services/AdminService";

const MAX_INTENTOS = 5;
const VENTANA_MS = 15 * 60 * 1000;

// Límite de intentos fallidos por IP (en memoria: frena la fuerza bruta en una instancia;
// en despliegues con varias instancias conviene moverlo a un almacén compartido).
const intentos = globalThis.__loginIntentos ?? (globalThis.__loginIntentos = new Map());

function estado(ip) {
  const ahora = Date.now();
  const e = intentos.get(ip);
  if (!e || ahora - e.inicio > VENTANA_MS) {
    const nuevo = { inicio: ahora, fallos: 0 };
    intentos.set(ip, nuevo);
    return nuevo;
  }
  return e;
}

async function ipCliente() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
}

/** Inicia sesión. Pensada para `useActionState`. */
export async function loginAction(_estado, formData) {
  const ip = await ipCliente();
  const e = estado(ip);
  if (e.fallos >= MAX_INTENTOS) {
    return { error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." };
  }

  let valido = false;
  try {
    valido = await new AdminService().autenticar(formData.get("usuario"), formData.get("password"));
  } catch (err) {
    console.error(err);
    return { error: "Ocurrió un error inesperado. Intenta de nuevo." };
  }

  if (!valido) {
    e.fallos += 1;
    return { error: "Credenciales inválidas." };
  }

  intentos.delete(ip);
  (await cookies()).set(COOKIE_SESION, await firmarSesion(String(formData.get("usuario")).trim().toLowerCase()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: DURACION_SESION_S,
  });
  redirect("/admin");
}

export async function logoutAction() {
  (await cookies()).delete(COOKIE_SESION);
  redirect("/");
}
