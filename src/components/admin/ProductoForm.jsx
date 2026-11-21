"use client";

import { useActionState, useEffect, useState } from "react";
import { guardarProductoAction } from "@/app/admin/actions";
import { CATEGORIAS } from "@/src/domain/categorias";
import { MONEDAS_EXTRA, formatearMonto, precioEn } from "@/src/domain/monedas";

const campo =
  "w-full rounded-lg border border-borde bg-fondo px-3 py-2 text-sm text-texto outline-none transition placeholder:text-suave/60 focus:border-acento";

/** Precio en COP + precios opcionales por moneda para una modalidad (Perma, Física o único). */
function GrupoPrecios({ titulo, nameBase, namePrefijo, obligatorio, base, onBase, datos, ayuda }) {
  return (
    <div className="grid gap-2">
      <p className="text-xs font-semibold text-texto">{titulo}</p>
      <div className="grid grid-cols-3 gap-3">
        <label className="grid gap-1 text-xs text-suave">
          🇨🇴 COP{obligatorio ? " *" : ""}
          <input
            name={nameBase}
            type="number"
            min="0"
            step="1"
            required={obligatorio}
            value={base}
            onChange={(e) => onBase(e.target.value)}
            className={campo}
          />
        </label>
        {MONEDAS_EXTRA.map((m) => {
          const auto = base !== "" ? precioEn({ precio: Number(base) }, m) : null;
          return (
            <label key={m.codigo} className="grid gap-1 text-xs text-suave">
              {m.bandera} {m.codigo}
              <input
                name={`${namePrefijo}${m.codigo}`}
                type="number"
                min="0"
                step="0.01"
                // Al editar se muestra el precio vigente (el fijado a mano o, si no hay, el convertido).
                defaultValue={datos ? precioEn(datos, m) : undefined}
                placeholder={auto === null ? "Auto" : `Auto: ${formatearMonto(auto, m)}`}
                className={campo}
              />
            </label>
          );
        })}
      </div>
      {ayuda && <p className="text-[11px] text-suave">{ayuda}</p>}
    </div>
  );
}

/** Formulario de alta/edición. Si recibe `producto`, edita; si no, crea. */
export default function ProductoForm({ producto, onListo, onCancelar }) {
  const [estado, accion, pendiente] = useActionState(guardarProductoAction, null);
  const [vista, setVista] = useState(null);
  const [precio, setPrecio] = useState(producto?.precio?.toString() ?? "");
  const [precioFisica, setPrecioFisica] = useState(producto?.fisica?.precio?.toString() ?? "");
  const [categoria, setCategoria] = useState(producto?.categoria ?? CATEGORIAS[0]);
  const esFruta = categoria === "Fruta";

  useEffect(() => {
    if (estado?.ok) onListo();
  }, [estado, onListo]);

  useEffect(() => () => vista && URL.revokeObjectURL(vista), [vista]);

  const imagenActual = vista ?? producto?.imagen ?? "";

  return (
    <form
      action={accion}
      className="rounded-xl border border-borde bg-superficie p-4 sm:p-5"
    >
      <h2 className="font-display text-lg font-bold">
        {producto ? "Editar producto" : "Nuevo producto"}
      </h2>
      {producto && <input type="hidden" name="id" value={producto.id} />}

      <div className="mt-4 grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
        <label className="grid min-w-0 cursor-pointer content-start gap-2 text-xs text-suave">
          <span className="grid aspect-square place-items-center overflow-hidden rounded-lg border border-dashed border-borde bg-fondo">
            {imagenActual ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagenActual} alt="" className="size-full object-contain p-2" />
            ) : (
              <span className="px-2 text-center">Subir imagen</span>
            )}
          </span>
          <input
            type="file"
            name="imagen"
            accept="image/*"
            className="w-full min-w-0 text-[11px] file:mr-2 file:rounded file:border-0 file:bg-borde file:px-2 file:py-1 file:text-texto"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setVista(f ? URL.createObjectURL(f) : null);
            }}
          />
          <span>Máx. 4 MB. Se guarda en Cloudinary.</span>
        </label>

        <div className="grid content-start gap-3">
          <label className="grid gap-1 text-xs text-suave">
            Nombre *
            <input name="nombre" required defaultValue={producto?.nombre} className={campo} />
          </label>
          <label className="grid gap-1 text-xs text-suave">
            Categoría *
            <select
              name="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className={campo}
            >
              {CATEGORIAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>

          <GrupoPrecios
            titulo={esFruta ? "Perma" : "Precio"}
            nameBase="precio"
            namePrefijo="precio_"
            obligatorio
            base={precio}
            onBase={setPrecio}
            datos={producto}
          />
          {esFruta && (
            <GrupoPrecios
              titulo="Física"
              nameBase="fisica_precio"
              namePrefijo="fisica_"
              base={precioFisica}
              onBase={setPrecioFisica}
              datos={producto?.fisica}
              ayuda="Opcional: si lo dejas vacío, la fruta se vende solo como Perma."
            />
          )}
          <p className="-mt-1 text-[11px] text-suave">
            Si MXN o PEN quedan vacíos o iguales al precio convertido, se mantiene la conversión automática desde COP.
          </p>
          <div className="flex flex-wrap gap-5 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="bestSeller"
                defaultChecked={producto?.bestSeller ?? false}
                className="size-4 accent-acento"
              />
              Best Seller
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="disponible"
                defaultChecked={producto?.disponible ?? true}
                className="size-4 accent-acento"
              />
              Disponible
            </label>
          </div>
        </div>
      </div>

      {estado?.error && (
        <p role="alert" className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {estado.error}
        </p>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-lg border border-borde px-4 py-2 text-sm text-suave transition hover:text-texto"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pendiente}
          className="rounded-lg bg-acento px-4 py-2 text-sm font-bold text-fondo transition hover:brightness-110 disabled:opacity-60"
        >
          {pendiente ? "Guardando…" : producto ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
