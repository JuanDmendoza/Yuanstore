"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESION, DURACION_SESION_S, firmarSesion } from "@/src/lib/sesion";
import { AdminService } from "@/src/services/AdminService";
import { LimiteLoginService } from "@/src/services/LimiteLoginService";

async function ipCliente() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
}

/** Inicia sesión. Pensada para `useActionState`. */
export async function loginAction(_estado, formData) {
  const ip = await ipCliente();
  const limite = new LimiteLoginService();

  try {
    if (await limite.bloqueada(ip)) {
      return { error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." };
    }
    const valido = await new AdminService().autenticar(formData.get("usuario"), formData.get("password"));
    if (!valido) {
      await limite.registrarFallo(ip);
      return { error: "Credenciales inválidas." };
    }
    await limite.limpiar(ip);
  } catch (err) {
    console.error(err);
    return { error: "Ocurrió un error inesperado. Intenta de nuevo." };
  }

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
