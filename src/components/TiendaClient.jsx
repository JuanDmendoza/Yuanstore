"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Carrito } from "@/src/domain/Carrito";
import { monedaPorPais } from "@/src/domain/monedas";
import { PedidoWhatsApp } from "@/src/domain/PedidoWhatsApp";
import { normalizarTexto } from "@/src/domain/texto";
import Navbar from "@/src/components/Navbar";
import ProductoCard from "@/src/components/ProductoCard";
import CarritoDrawer from "@/src/components/CarritoDrawer";
import WhatsAppFlotante, { ICONO_WHATSAPP, MENSAJE_WHATSAPP } from "@/src/components/WhatsAppFlotante";

const FILTROS = [
  { id: "todos", etiqueta: "Todos", coincide: () => true },
  { id: "best", etiqueta: "Best Seller", coincide: (p) => p.bestSeller },
  { id: "fruta", etiqueta: "Fruta", coincide: (p) => p.categoria === "Fruta" },
  { id: "gamepass", etiqueta: "Gamepass", coincide: (p) => p.categoria === "Gamepass" },
  { id: "skin", etiqueta: "Skin", coincide: (p) => p.categoria === "Skin" },
];

const NUMERO_WHATSAPP = String(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");

const REDES = [
  ...(NUMERO_WHATSAPP
    ? [
        {
          nombre: "WhatsApp",
          url: `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(MENSAJE_WHATSAPP)}`,
          icono: ICONO_WHATSAPP,
        },
      ]
    : []),
  {
    nombre: "TikTok",
    url: "https://www.tiktok.com/@yuan_blox_fruits",
    icono:
      "M19.6 6.7a4.8 4.8 0 0 1-3.8-4.2V2h-3.4v13.4a2.9 2.9 0 1 1-2-2.8V9.1a6.3 6.3 0 1 0 5.4 6.3V9a8.2 8.2 0 0 0 4.8 1.5V7.1a4.8 4.8 0 0 1-1-.4z",
  },
  {
    nombre: "Instagram",
    url: "https://www.instagram.com/juan_d_ok2/",
    icono:
      "M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 4 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.2-4.4-2.6-6.8-7-7C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9z",
  },
];

export default function TiendaClient({ productos, errorCatalogo = false, pais = "" }) {
  const [items, setItems] = useState([]);
  const [hidratado, setHidratado] = useState(false);
  const [descartados, setDescartados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [moneda, setMoneda] = useState(() => monedaPorPais(pais));
  const [drawerAbierto, setDrawerAbierto] = useState(false);

  const carrito = useMemo(() => new Carrito(items), [items]);

  // Carga el carrito persistido (solo en el cliente, tras hidratar).
  // Los precios y la disponibilidad guardados pueden estar desactualizados: se concilian
  // con el catálogo vigente. Si el catálogo no cargó, no se toca el carrito.
  useEffect(() => {
    // localStorage solo existe en el cliente: se lee tras hidratar para no romper el SSR.
    const guardado = Carrito.cargar();
    if (!errorCatalogo) guardado.reconciliar(productos);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(guardado.items);
    if (guardado.descartados?.length) setDescartados(guardado.descartados);
    setHidratado(true);
  }, [productos, errorCatalogo]);

  useEffect(() => {
    if (hidratado) carrito.guardar();
  }, [carrito, hidratado]);

  const agregar = useCallback((producto) => {
    setItems(new Carrito(items).agregar(producto).items);
  }, [items]);
  const cambiar = (id, delta) => setItems(new Carrito(items).cambiarCantidad(id, delta).items);
  const quitar = (id) => setItems(new Carrito(items).quitar(id).items);
  const vaciar = () => setItems([]);
  const cerrar = useCallback(() => setDrawerAbierto(false), []);

  // Con productos en el carrito, el botón flotante envía el pedido en vez de una consulta.
  const pedidoFlotante = useMemo(() => {
    const pedido = new PedidoWhatsApp({ carrito, moneda, nombreObligatorio: false });
    return pedido.valido ? pedido.url() : undefined;
  }, [carrito, moneda]);

  const visibles = useMemo(() => {
    const { coincide } = FILTROS.find((f) => f.id === filtro);
    const q = normalizarTexto(busqueda);
    return productos.filter((p) => coincide(p) && normalizarTexto(p.nombre).includes(q));
  }, [productos, filtro, busqueda]);

  return (
    <>
      <Navbar
        busqueda={busqueda}
        onBusqueda={setBusqueda}
        moneda={moneda}
        onMoneda={setMoneda}
        carrito={carrito}
        onAbrirCarrito={() => setDrawerAbierto(true)}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="sin-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {FILTROS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltro(f.id)}
                aria-pressed={filtro === f.id}
                className={`shrink-0 whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  filtro === f.id
                    ? "border-acento bg-acento text-fondo"
                    : "border-borde bg-superficie text-suave hover:border-acento hover:text-texto"
                }`}
              >
                {f.etiqueta}
              </button>
            ))}
          </div>
          <p className="hidden shrink-0 items-center gap-2 text-sm text-suave sm:flex">
            <span className="size-2 rounded-full bg-acento shadow-[0_0_8px_#00e639]" />
            {visibles.length} artículos disponibles
          </p>
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-suave sm:hidden">
          <span className="size-2 rounded-full bg-acento shadow-[0_0_8px_#00e639]" />
          {visibles.length} artículos disponibles
        </p>

        {errorCatalogo ? (
          <div role="alert" className="py-24 text-center">
            <p className="text-sm font-semibold text-texto">No pudimos cargar el catálogo.</p>
            <p className="mt-1 text-sm text-suave">Intenta de nuevo en unos minutos.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg border border-acento px-4 py-2 text-sm font-bold text-acento transition hover:bg-acento hover:text-fondo"
            >
              Reintentar
            </button>
          </div>
        ) : productos.length === 0 ? (
          <p className="py-24 text-center text-sm text-suave">Aún no hay productos disponibles. ¡Vuelve pronto!</p>
        ) : visibles.length === 0 ? (
          <p className="py-24 text-center text-sm text-suave">No encontramos productos con ese criterio.</p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visibles.map((p) => (
              <ProductoCard key={p.id} producto={p} moneda={moneda} onAgregar={agregar} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-borde px-4 py-6 text-center text-xs text-suave">
        <nav aria-label="Redes sociales" className="mb-4 flex flex-wrap items-center justify-center gap-3">
          {REDES.map((r) => (
            <a
              key={r.nombre}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Yuan Store en ${r.nombre}`}
              className="flex items-center gap-2 rounded-lg border border-borde bg-superficie px-3 py-2 text-sm font-semibold text-texto transition hover:border-acento hover:text-acento hover:shadow-[0_0_14px_rgba(0,230,57,0.2)]"
            >
              <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
                <path d={r.icono} />
              </svg>
              {r.nombre}
            </a>
          ))}
        </nav>
        <Link href="/terminos" className="mb-2 inline-block font-semibold underline-offset-2 hover:text-acento hover:underline">
          Términos y política de reembolso
        </Link>
        <br />
        © {new Date().getFullYear()} Yuan Store. Todos los derechos reservados.
      </footer>

      <WhatsAppFlotante
        href={pedidoFlotante}
        titulo={pedidoFlotante ? `Pedir por WhatsApp (${carrito.cantidadTotal} productos)` : undefined}
      />

      <CarritoDrawer
        abierto={drawerAbierto}
        onCerrar={cerrar}
        carrito={carrito}
        moneda={moneda}
        onCambiar={cambiar}
        onQuitar={quitar}
        onVaciar={vaciar}
        descartados={descartados}
        onCerrarAviso={() => setDescartados([])}
      />
    </>
  );
}
