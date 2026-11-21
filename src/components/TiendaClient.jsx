"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Carrito } from "@/src/domain/Carrito";
import { MONEDA_DEFECTO } from "@/src/domain/monedas";
import Navbar from "@/src/components/Navbar";
import ProductoCard from "@/src/components/ProductoCard";
import CarritoDrawer from "@/src/components/CarritoDrawer";

const FILTROS = [
  { id: "todos", etiqueta: "Todos", coincide: () => true },
  { id: "best", etiqueta: "Best Seller", coincide: (p) => p.bestSeller },
  { id: "fruta", etiqueta: "Fruta", coincide: (p) => p.categoria === "Fruta" },
  { id: "gamepass", etiqueta: "Gamepass", coincide: (p) => p.categoria === "Gamepass" },
  { id: "skin", etiqueta: "Skin", coincide: (p) => p.categoria === "Skin" },
];

export default function TiendaClient({ productos }) {
  const [items, setItems] = useState([]);
  const [hidratado, setHidratado] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [moneda, setMoneda] = useState(MONEDA_DEFECTO);
  const [drawerAbierto, setDrawerAbierto] = useState(false);

  const carrito = useMemo(() => new Carrito(items), [items]);

  // Carga el carrito persistido (solo en el cliente, tras hidratar).
  useEffect(() => {
    // localStorage solo existe en el cliente: se lee tras hidratar para no romper el SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(Carrito.cargar().items);
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (hidratado) carrito.guardar();
  }, [carrito, hidratado]);

  const agregar = useCallback((producto) => {
    setItems(new Carrito(items).agregar(producto).items);
  }, [items]);
  const cambiar = (id, delta) => setItems(new Carrito(items).cambiarCantidad(id, delta).items);
  const quitar = (id) => setItems(new Carrito(items).quitar(id).items);
  const cerrar = useCallback(() => setDrawerAbierto(false), []);

  const visibles = useMemo(() => {
    const { coincide } = FILTROS.find((f) => f.id === filtro);
    const q = busqueda.trim().toLowerCase();
    return productos.filter((p) => coincide(p) && p.nombre.toLowerCase().includes(q));
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

        {visibles.length === 0 ? (
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
        © {new Date().getFullYear()} Yuan Store. Todos los derechos reservados.
      </footer>

      <CarritoDrawer
        abierto={drawerAbierto}
        onCerrar={cerrar}
        carrito={carrito}
        moneda={moneda}
        onCambiar={cambiar}
        onQuitar={quitar}
      />
    </>
  );
}
