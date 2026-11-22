"use client";

import { useEffect, useState } from "react";
import { PedidoWhatsApp } from "@/src/domain/PedidoWhatsApp";
import { formatearMonto } from "@/src/domain/monedas";

export default function CarritoDrawer({ abierto, onCerrar, carrito, moneda, onCambiar, onQuitar, onVaciar, descartados = [], onCerrarAviso }) {
  const [nombre, setNombre] = useState("");
  const [usuarioRoblox, setUsuarioRoblox] = useState("");
  const [intentado, setIntentado] = useState(false);
  const [confirmandoVaciar, setConfirmandoVaciar] = useState(false);
  // Carrito y moneda con los que se abrió WhatsApp. Si el cliente cambia algo después, el aviso desaparece.
  const [enviado, setEnviado] = useState(null);
  const pedidoIniciado = enviado?.carrito === carrito && enviado?.moneda === moneda && !carrito.vacio;

  useEffect(() => {
    if (!abierto) {
      // Al cerrar el drawer se descarta una confirmación pendiente.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConfirmandoVaciar(false);
      return;
    }
    const alTeclear = (e) => e.key === "Escape" && onCerrar();
    document.addEventListener("keydown", alTeclear);
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = previo;
    };
  }, [abierto, onCerrar]);

  const nombreInvalido = intentado && nombre.trim() === "";

  function pedir(e) {
    e.preventDefault();
    setIntentado(true);
    if (nombre.trim() === "" || carrito.vacio) return;
    try {
      const url = new PedidoWhatsApp({ carrito, nombre, usuarioRoblox, moneda }).url();
      window.open(url, "_blank", "noopener,noreferrer");
      setEnviado({ carrito, moneda });
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <>
      <div
        onClick={onCerrar}
        aria-hidden
        className={`fixed inset-0 z-40 bg-black/70 transition-opacity ${
          abierto ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-label="Carrito"
        aria-hidden={!abierto}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-borde bg-superficie transition-transform duration-300 ${
          abierto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-borde px-5 py-4">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-bold">Tu Carrito</h2>
            <span className="grid min-w-6 place-items-center rounded-full bg-acento px-2 text-xs font-extrabold text-fondo">
              {carrito.cantidadTotal}
            </span>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar carrito"
            className="grid size-9 place-items-center rounded-lg bg-borde text-lg transition hover:bg-fondo"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {descartados.length > 0 && (
            <div role="status" className="flex items-start gap-2 rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-xs text-yellow-200">
              <p className="flex-1">
                Quitamos de tu carrito productos que ya no están disponibles: {descartados.join(", ")}.
              </p>
              <button type="button" onClick={onCerrarAviso} aria-label="Cerrar aviso" className="text-yellow-200/70 hover:text-yellow-100">
                ✕
              </button>
            </div>
          )}
          {!carrito.vacio && (
            <div className="flex items-center justify-end gap-2 text-xs">
              {confirmandoVaciar ? (
                <>
                  <span className="text-suave">¿Vaciar todo el carrito?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onVaciar();
                      setConfirmandoVaciar(false);
                    }}
                    className="rounded-md bg-red-500/90 px-2.5 py-1 font-bold text-white hover:bg-red-500"
                  >
                    Sí, vaciar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmandoVaciar(false)}
                    className="rounded-md bg-borde px-2.5 py-1 font-semibold hover:bg-fondo"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmandoVaciar(true)}
                  className="font-semibold text-suave underline-offset-2 transition hover:text-red-400 hover:underline"
                >
                  Vaciar carrito
                </button>
              )}
            </div>
          )}
          {carrito.vacio ? (
            <p className="py-16 text-center text-sm text-suave">Tu carrito está vacío.</p>
          ) : (
            carrito.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl border border-borde bg-fondo p-3">
                <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-superficie">
                  {item.imagen ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imagen} alt="" loading="lazy" className="size-full object-contain" />
                  ) : (
                    <span className="font-display text-xl font-bold text-borde">{item.nombre.charAt(0)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.nombre}</p>
                  <p className="whitespace-nowrap text-xs text-suave">
                    {formatearMonto(carrito.subtotalEn(item, moneda), moneda)}
                  </p>
                </div>
                <div className="flex items-center rounded-lg bg-superficie">
                  <button
                    type="button"
                    onClick={() => onCambiar(item.id, -1)}
                    aria-label={`Quitar una unidad de ${item.nombre}`}
                    className="size-8 text-lg hover:text-acento"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-bold">{item.cantidad}</span>
                  <button
                    type="button"
                    onClick={() => onCambiar(item.id, 1)}
                    aria-label={`Agregar una unidad de ${item.nombre}`}
                    className="size-8 text-lg text-acento"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onQuitar(item.id)}
                  aria-label={`Eliminar ${item.nombre}`}
                  className="text-suave hover:text-texto"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        <form onSubmit={pedir} className="space-y-3 border-t border-borde px-5 py-4" noValidate>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-suave">Tu Nombre *</span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Mateo Gómez"
              aria-invalid={nombreInvalido}
              className={`h-11 w-full rounded-lg border bg-fondo px-3 text-sm outline-none placeholder:text-suave focus:border-acento ${
                nombreInvalido ? "border-red-500" : "border-borde"
              }`}
            />
            {nombreInvalido && <span className="mt-1 block text-xs text-red-400">Escribe tu nombre.</span>}
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-suave">Usuario de Roblox (Opcional)</span>
            <input
              value={usuarioRoblox}
              onChange={(e) => setUsuarioRoblox(e.target.value)}
              placeholder="Ej. @MateoBlox99"
              className="h-11 w-full rounded-lg border border-borde bg-fondo px-3 text-sm outline-none placeholder:text-suave focus:border-acento"
            />
          </label>

          <div className="flex items-center justify-between rounded-lg bg-fondo px-4 py-3">
            <span className="text-sm font-semibold text-suave">Total</span>
            <span className="whitespace-nowrap text-lg font-bold text-acento">
              {formatearMonto(carrito.totalEn(moneda), moneda)}
            </span>
          </div>

          {pedidoIniciado ? (
            <div role="status" className="space-y-3 rounded-lg border border-acento/50 bg-acento/10 p-3">
              <p className="text-sm font-bold text-acento">✓ Pedido iniciado en WhatsApp</p>
              <p className="text-xs text-suave">
                Envía el mensaje en el chat para confirmar tu pedido. Cuando lo hayas enviado, puedes vaciar el carrito.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="submit"
                  className="h-11 rounded-lg border border-acento text-sm font-bold text-acento transition hover:bg-acento/10"
                >
                  Abrir WhatsApp de nuevo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onVaciar();
                    setEnviado(null);
                    setIntentado(false);
                    onCerrar();
                  }}
                  className="h-11 rounded-lg bg-acento text-sm font-extrabold text-fondo transition hover:brightness-110"
                >
                  Vaciar carrito
                </button>
              </div>
            </div>
          ) : (
            <button
              type="submit"
              disabled={carrito.vacio}
              className="h-12 w-full rounded-lg bg-acento font-extrabold text-fondo shadow-[0_0_20px_rgba(0,230,57,0.3)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              Pedir por WhatsApp
            </button>
          )}
        </form>
      </aside>
    </>
  );
}
