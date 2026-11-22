"use client";

import { useState } from "react";
import { formatearPrecio } from "@/src/domain/monedas";
import {
  TIPOS_FRUTA,
  TIPO_FRUTA_DEFECTO,
  aItemCarrito,
  esFruta,
  precioDeVariante,
  varianteDisponible,
} from "@/src/domain/variantes";

/**
 * Card minimalista. Las frutas que también se venden físicas muestran pestañas
 * [Perma] [Física]: el precio cambia al instante y el botón + agrega la modalidad elegida.
 */
export default function ProductoCard({ producto, moneda, onAgregar }) {
  const [tipo, setTipo] = useState(TIPO_FRUTA_DEFECTO);
  const badge = producto.bestSeller ? "BEST SELLER" : producto.categoria.toUpperCase();
  const tieneVariantes = esFruta(producto) && Boolean(producto.fisica);
  // Si la modalidad elegida está bloqueada, se muestra la primera que sí esté disponible.
  const elegido = tieneVariantes ? tipo : TIPO_FRUTA_DEFECTO;
  const tipoActivo = varianteDisponible(producto, elegido)
    ? elegido
    : (TIPOS_FRUTA.find((t) => tieneVariantes && varianteDisponible(producto, t.id))?.id ?? elegido);
  const agotado = !varianteDisponible(producto, tipoActivo);
  // Las modalidades bloqueadas no se muestran; si queda una sola, se ve sola para que el cliente sepa cuál es.
  const tiposVisibles = TIPOS_FRUTA.filter((t) => varianteDisponible(producto, t.id));

  return (
    <article className="group flex flex-col rounded-xl border border-borde bg-superficie p-2.5 transition hover:border-acento hover:shadow-[0_0_18px_rgba(0,230,57,0.18)] sm:p-3">
      <div className="relative grid aspect-square place-items-center overflow-hidden rounded-lg bg-fondo">
        <span
          className={`absolute left-2 top-2 z-10 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${
            producto.bestSeller ? "bg-acento text-fondo" : "bg-superficie/90 text-suave"
          }`}
        >
          {badge}
        </span>
        {producto.imagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={producto.imagen}
            alt={producto.nombre}
            loading="lazy"
            className="size-full object-contain p-3"
          />
        ) : (
          <span className="font-display text-4xl font-bold text-borde" aria-hidden>
            {producto.nombre.charAt(0)}
          </span>
        )}
      </div>

      <h3 className="mt-3 text-sm font-semibold leading-snug sm:text-base">{producto.nombre}</h3>

      {tieneVariantes && tiposVisibles.length > 0 && (
        <div
          role="radiogroup"
          aria-label="Modalidad"
          className={`mt-2 grid gap-1 rounded-md bg-fondo p-0.5 ${
            tiposVisibles.length > 1 ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {tiposVisibles.map((t) => {
            const activo = tipoActivo === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={activo}
                onClick={() => setTipo(t.id)}
                className={`rounded py-1 text-[11px] font-bold transition ${
                  activo ? "bg-acento text-fondo" : "text-suave hover:text-texto"
                }`}
              >
                {t.etiqueta}
              </button>
            );
          })}
        </div>
      )}

      {!tieneVariantes && !esFruta(producto) && (
        <button
          type="button"
          disabled={agotado}
          onClick={() => onAgregar(aItemCarrito(producto, tipoActivo))}
          className="mt-2 w-full rounded-md border border-acento/40 bg-fondo py-1 text-[11px] font-bold text-acento transition hover:bg-acento hover:text-fondo disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-fondo disabled:hover:text-acento"
        >
          {agotado ? "AGOTADO" : "Agregar al carrito"}
        </button>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        <span
          className={`whitespace-nowrap text-[13px] font-bold sm:text-sm ${
            agotado ? "text-suave" : "text-acento"
          }`}
        >
          {agotado ? "AGOTADO" : formatearPrecio(precioDeVariante(producto, tipoActivo), moneda)}
        </span>
        <button
          type="button"
          disabled={agotado}
          onClick={() => onAgregar(aItemCarrito(producto, tipoActivo))}
          aria-label={`Agregar ${producto.nombre}${tieneVariantes ? ` (${tipoActivo})` : ""} al carrito`}
          className="grid size-8 shrink-0 place-items-center rounded-md bg-borde text-lg font-bold leading-none text-texto transition hover:bg-acento hover:text-fondo disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-borde disabled:hover:text-texto"
        >
          +
        </button>
      </div>
    </article>
  );
}
