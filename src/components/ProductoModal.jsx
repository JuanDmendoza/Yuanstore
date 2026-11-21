"use client";

import { useEffect, useState } from "react";
import { formatearPrecio } from "@/src/domain/monedas";
import {
  TIPOS_FRUTA,
  TIPO_FRUTA_DEFECTO,
  aItemCarrito,
  precioDeVariante,
} from "@/src/domain/variantes";

/** Modal para elegir la modalidad (Perma o Física) de una fruta y agregarla al carrito. */
export default function ProductoModal({ producto, moneda, onAgregar, onCerrar }) {
  const [tipo, setTipo] = useState(TIPO_FRUTA_DEFECTO);

  useEffect(() => {
    const alTeclear = (e) => e.key === "Escape" && onCerrar();
    document.addEventListener("keydown", alTeclear);
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = previo;
    };
  }, [onCerrar]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onCerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={producto.nombre}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-borde bg-superficie p-4 shadow-[0_0_30px_rgba(0,230,57,0.15)]"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-xl font-bold">{producto.nombre}</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="grid size-8 shrink-0 place-items-center rounded-md text-suave transition hover:bg-borde hover:text-texto"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 grid aspect-square max-h-56 w-full place-items-center overflow-hidden rounded-xl bg-fondo">
          {producto.imagen ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={producto.imagen} alt={producto.nombre} className="size-full object-contain p-4" />
          ) : (
            <span className="font-display text-6xl font-bold text-borde" aria-hidden>
              {producto.nombre.charAt(0)}
            </span>
          )}
        </div>

        <div role="radiogroup" aria-label="Modalidad" className="mt-4 grid grid-cols-2 gap-2">
          {TIPOS_FRUTA.map((t) => {
            const activo = tipo === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={activo}
                onClick={() => setTipo(t.id)}
                className={`rounded-lg border px-3 py-2.5 text-left transition ${
                  activo
                    ? "border-acento bg-acento/10 shadow-[0_0_14px_rgba(0,230,57,0.25)]"
                    : "border-borde hover:border-acento/60"
                }`}
              >
                <span className={`block text-sm font-bold ${activo ? "text-acento" : "text-texto"}`}>
                  {t.etiqueta}
                </span>
                <span className="block whitespace-nowrap text-xs text-suave">
                  {formatearPrecio(precioDeVariante(producto, t.id), moneda)}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            onAgregar(aItemCarrito(producto, tipo));
            onCerrar();
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-acento py-3 text-sm font-extrabold text-fondo transition hover:brightness-110"
        >
          Agregar al carrito ·
          <span className="whitespace-nowrap">
            {formatearPrecio(precioDeVariante(producto, tipo), moneda)}
          </span>
        </button>
      </div>
    </div>
  );
}
