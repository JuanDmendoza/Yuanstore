"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/auth";

const campo =
  "w-full rounded-lg border border-borde bg-fondo px-3 py-2 text-sm text-texto outline-none transition placeholder:text-suave/60 focus:border-acento";

export default function LoginForm() {
  const [estado, accion, pendiente] = useActionState(loginAction, null);

  return (
    <form action={accion} className="grid w-full max-w-sm gap-4 rounded-xl border border-borde bg-superficie p-6">
      <h1 className="font-display text-xl font-bold">Acceso</h1>
      <label className="grid gap-1 text-xs text-suave">
        Usuario
        <input name="usuario" autoComplete="username" required autoFocus className={campo} />
      </label>
      <label className="grid gap-1 text-xs text-suave">
        Contraseña
        <input name="password" type="password" autoComplete="current-password" required className={campo} />
      </label>
      {estado?.error && (
        <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {estado.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pendiente}
        className="rounded-lg bg-acento px-4 py-2 text-sm font-bold text-fondo transition hover:brightness-110 disabled:opacity-60"
      >
        {pendiente ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
