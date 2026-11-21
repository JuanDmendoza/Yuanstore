"use client";

import { formatearPrecio } from "@/src/domain/monedas";
import { aItemCarrito, esFruta } from "@/src/domain/variantes";

/**
 * Card minimalista (precio Perma por defecto). Las frutas que también se venden
 * físicas abren un modal para elegir modalidad en lugar de agregarse directo.
 */
export default function ProductoCard({ producto, moneda, onAgregar, onElegir }) {
  const badge = producto.bestSeller ? "BEST SELLER" : producto.categoria.toUpperCase();
  const abreModal = esFruta(producto) && Boolean(producto.fisica);
  const accion = () => (abreModal ? onElegir(producto) : onAgregar(aItemCarrito(producto)));

  return (
    <article className="group flex flex-col rounded-xl border border-borde bg-superficie p-2.5 transition hover:border-acento hover:shadow-[0_0_18px_rgba(0,230,57,0.18)] sm:p-3">
      <div
        className={`relative grid aspect-square place-items-center overflow-hidden rounded-lg bg-fondo ${
          abreModal ? "cursor-pointer" : ""
        }`}
        onClick={abreModal ? accion : undefined}
      >
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

      <h3 className="mt-3 text-sm font-semibold leading-snug sm:text-base">
        {abreModal ? (
          <button type="button" onClick={accion} className="text-left hover:text-acento">
            {producto.nombre}
          </button>
        ) : (
          producto.nombre
        )}
      </h3>

      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        <span className="whitespace-nowrap text-[13px] font-bold text-acento sm:text-sm">
          {formatearPrecio(producto, moneda)}
        </span>
        <button
          type="button"
          onClick={accion}
          aria-label={
            abreModal
              ? `Elegir modalidad de ${producto.nombre}`
              : `Agregar ${producto.nombre} al carrito`
          }
          className="grid size-8 shrink-0 place-items-center rounded-md bg-borde text-lg font-bold leading-none text-texto transition hover:bg-acento hover:text-fondo"
        >
          +
        </button>
      </div>
    </article>
  );
}
