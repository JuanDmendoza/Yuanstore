"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MONEDAS, formatearMonto } from "@/src/domain/monedas";

export default function Navbar({ busqueda, onBusqueda, moneda, onMoneda, carrito, onAbrirCarrito }) {
  const [menuMoneda, setMenuMoneda] = useState(false);
  const selectorMoneda = useRef(null);

  // Cierra el menú de monedas al hacer clic/tocar fuera de él o al pulsar Escape.
  useEffect(() => {
    if (!menuMoneda) return;
    const alPulsarFuera = (e) => {
      if (!selectorMoneda.current?.contains(e.target)) setMenuMoneda(false);
    };
    const alTeclear = (e) => e.key === "Escape" && setMenuMoneda(false);
    document.addEventListener("pointerdown", alPulsarFuera);
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("pointerdown", alPulsarFuera);
      document.removeEventListener("keydown", alTeclear);
    };
  }, [menuMoneda]);

  const buscador = (
    <label className="relative block w-full">
      <span className="sr-only">Buscar</span>
      <svg
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-suave"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={busqueda}
        onChange={(e) => onBusqueda(e.target.value)}
        placeholder="Buscar frutas, gamepasses o skins..."
        className="h-10 w-full rounded-lg border border-borde bg-fondo pl-9 pr-3 text-sm text-texto placeholder:text-suave outline-none transition focus:border-acento focus:shadow-[0_0_0_1px_#00e639,0_0_14px_rgba(0,230,57,0.25)]"
      />
    </label>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-borde bg-superficie/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-yuan.jpeg" alt="Yuan Store" className="size-9 rounded-lg object-cover" />
          <span className="font-display text-lg font-bold tracking-tight">YUAN STORE</span>
        </Link>

        {/* Buscador: centro en escritorio */}
        <div className="order-3 w-full md:order-none md:mx-auto md:w-auto md:max-w-xl md:flex-1">
          {buscador}
        </div>

        {/* Derecha */}
        <div className="ml-auto flex items-center gap-2">
          <div ref={selectorMoneda} className="relative">
            <button
              type="button"
              onClick={() => setMenuMoneda((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={menuMoneda}
              className="flex h-10 items-center gap-1.5 rounded-lg border border-borde bg-fondo px-3 text-sm font-semibold transition hover:border-acento"
            >
              <span>{moneda.bandera}</span>
              <span>{moneda.codigo}</span>
              <span className="text-[10px] text-suave">▾</span>
            </button>
            {menuMoneda && (
              <ul
                role="listbox"
                className="absolute right-0 mt-2 min-w-28 overflow-hidden rounded-lg border border-borde bg-superficie shadow-xl"
              >
                {MONEDAS.map((m) => (
                  <li key={m.codigo}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={m.codigo === moneda.codigo}
                      onClick={() => {
                        onMoneda(m);
                        setMenuMoneda(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-borde"
                    >
                      <span>{m.bandera}</span>
                      <span>{m.codigo}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={onAbrirCarrito}
            aria-label="Abrir carrito"
            className="flex h-10 items-center gap-2 rounded-lg border border-acento px-3 text-sm font-bold text-acento transition hover:shadow-[0_0_14px_rgba(0,230,57,0.35)]"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
              <path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h9a1 1 0 0 0 1-.8L20.5 7H6" />
            </svg>
            {/* `key` reinicia el rebote cada vez que cambia la cantidad. */}
            <span
              key={carrito.cantidadTotal}
              className={`grid min-w-5 place-items-center rounded-full bg-acento px-1.5 text-xs font-extrabold text-fondo ${
                carrito.vacio ? "" : "animar-rebote"
              }`}
            >
              {carrito.cantidadTotal}
            </span>
            {!carrito.vacio && (
              <span className="hidden whitespace-nowrap sm:inline">
                {formatearMonto(carrito.totalEn(moneda), moneda)}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
