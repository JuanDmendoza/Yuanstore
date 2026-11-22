import { NextResponse } from "next/server";
import { COOKIE_SESION, leerSesion } from "@/src/lib/sesion";

// Todo /admin/* sin sesión válida responde 404 (como si el panel no existiera).
// La única excepción es /admin/login, al que se entra escribiendo la URL.
export async function proxy(request) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const sesion = await leerSesion(request.cookies.get(COOKIE_SESION)?.value);
  if (sesion) return NextResponse.next();

  return NextResponse.rewrite(new URL("/_no-encontrado", request.url), { status: 404 });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
