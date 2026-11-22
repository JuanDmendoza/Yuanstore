"use client";

import { useCallback, useState, useTransition } from "react";
import { cambiarDisponibleAction, eliminarProductoAction } from "@/app/admin/actions";
import { logoutAction } from "@/app/admin/auth";
import { CATEGORIAS } from "@/src/domain/categorias";
import { MONEDAS, formatearPrecio } from "@/src/domain/monedas";
import { esFruta } from "@/src/domain/variantes";
import { normalizarTexto } from "@/src/domain/texto";
import ProductoForm from "./ProductoForm";

/** Filas de precio de un producto: las frutas muestran Perma y, si existe, Física. */
function variantes(p) {
  if (!esFruta(p)) return [{ etiqueta: null, datos: p }];
  return [
    { etiqueta: "Perma", datos: p, bloqueada: p.permaDisponible === false },
    ...(p.fisica ? [{ etiqueta: "Física", datos: p.fisica, bloqueada: p.fisica.disponible === false }] : []),
  ];
}

export default function AdminProductos({ productos }) {
  // `null` = cerrado, `{}` = nuevo, `{ producto }` = edición.
  const [edicion, setEdicion] = useState(null);
  const [error, setError] = useState(null);
  const [pendiente, startTransition] = useTransition();

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("Todos");

  const termino = normalizarTexto(busqueda);
  const visibles = productos.filter(
    (p) => (filtro === "Todos" || p.categoria === filtro) && normalizarTexto(p.nombre).includes(termino)
  );

  const cerrar = useCallback(() => setEdicion(null), []);

  function ejecutar(accion) {
    setError(null);
    startTransition(async () => {
      const res = await accion();
      if (!res.ok) setError(res.error);
    });
  }

  function eliminar(p) {
    if (!window.confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return;
    ejecutar(() => eliminarProductoAction(p.id));
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Productos</h1>
          <p className="text-sm text-suave">{productos.length} en el catálogo</p>
        </div>
        <div className="flex items-center gap-2">
          {!edicion && (
            <button
              type="button"
              onClick={() => setEdicion({})}
              className="rounded-lg bg-acento px-4 py-2 text-sm font-bold text-fondo transition hover:brightness-110"
            >
              + Nuevo producto
            </button>
          )}
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-borde px-3 py-2 text-sm text-suave transition hover:text-texto"
            >
              Salir
            </button>
          </form>
        </div>
      </header>

      {edicion && (
        <div className="mt-5">
          <ProductoForm
            key={edicion.producto?.id ?? "nuevo"}
            producto={edicion.producto}
            onListo={cerrar}
            onCancelar={cerrar}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {productos.length > 0 && (
        <div className="mt-5 grid gap-3">
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar producto..."
            aria-label="Buscar producto"
            className="w-full rounded-lg border border-borde bg-superficie px-3 py-2 text-sm text-texto outline-none transition placeholder:text-suave/60 focus:border-acento"
          />
          <div className="flex flex-wrap items-center gap-2">
            {["Todos", ...CATEGORIAS].map((c) => {
              const activo = filtro === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFiltro(c)}
                  className={`rounded-full border px-3.5 py-1 text-xs font-semibold transition ${
                    activo
                      ? "border-acento bg-acento text-fondo"
                      : "border-borde text-suave hover:border-acento hover:text-texto"
                  }`}
                >
                  {c}
                </button>
              );
            })}
            <span className="ml-auto text-xs text-suave">{visibles.length} resultados</span>
          </div>
        </div>
      )}

      {productos.length === 0 ? (
        <p className="mt-10 text-center text-sm text-suave">Aún no hay productos. Crea el primero.</p>
      ) : visibles.length === 0 ? (
        <p className="mt-10 text-center text-sm text-suave">Ningún producto coincide con la búsqueda.</p>
      ) : (
        <ul className={`mt-5 grid gap-2 ${pendiente ? "opacity-60" : ""}`}>
          {visibles.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-borde bg-superficie p-3"
            >
              <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-fondo">
                {p.imagen ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imagen} alt="" loading="lazy" className="size-full object-contain p-1" />
                ) : (
                  <span className="font-display text-xl font-bold text-borde">{p.nombre.charAt(0)}</span>
                )}
              </div>

              <div className="min-w-0 flex-1 basis-40">
                <p className="truncate font-semibold">{p.nombre}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-suave">
                  <span>{p.categoria}</span>
                  {variantes(p).map(({ etiqueta, datos, bloqueada }) => (
                    <span
                      key={etiqueta ?? "unico"}
                      className={`flex flex-wrap items-center gap-x-2 ${bloqueada ? "opacity-50" : ""}`}
                    >
                      {etiqueta && <span className="font-semibold text-texto">{etiqueta}</span>}
                      {bloqueada && <span className="font-bold text-red-300">BLOQUEADA</span>}
                      <span className="whitespace-nowrap font-bold text-acento">{formatearPrecio(datos)}</span>
                      {MONEDAS.slice(1).map((m) => (
                        <span key={m.codigo} className="whitespace-nowrap">
                          {formatearPrecio(datos, m)}
                          {datos.precios?.[m.codigo] !== undefined && " ✎"}
                        </span>
                      ))}
                    </span>
                  ))}
                  {p.bestSeller && (
                    <span className="rounded bg-acento px-1.5 py-0.5 text-[10px] font-bold text-fondo">
                      BEST SELLER
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  disabled={pendiente}
                  onClick={() => ejecutar(() => cambiarDisponibleAction(p.id, !p.disponible))}
                  className={`rounded-md border px-2.5 py-1.5 transition ${
                    p.disponible
                      ? "border-acento/50 text-acento"
                      : "border-borde text-suave hover:text-texto"
                  }`}
                >
                  {p.disponible ? "Disponible" : "Oculto"}
                </button>
                <button
                  type="button"
                  onClick={() => setEdicion({ producto: p })}
                  className="rounded-md border border-borde px-2.5 py-1.5 text-texto transition hover:border-acento"
                >
                  Editar
                </button>
                <button
                  type="button"
                  disabled={pendiente}
                  onClick={() => eliminar(p)}
                  className="rounded-md border border-borde px-2.5 py-1.5 text-red-300 transition hover:border-red-400"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
