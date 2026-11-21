import { connection } from "next/server";
import { Suspense } from "react";
import TiendaClient from "@/src/components/TiendaClient";
import { ProductoService } from "@/src/services/ProductoService";
import { CATALOGO_DEMO } from "@/src/data/catalogoDemo";

async function Catalogo() {
  await connection(); // se lee en cada petición, nunca se prerenderiza
  let productos: Awaited<ReturnType<ProductoService["listarDisponibles"]>> = [];
  try {
    productos = await new ProductoService().listarDisponibles();
  } catch (err) {
    console.error("No se pudo leer el catálogo de MongoDB:", err);
  }
  // Mientras la base esté vacía mostramos el catálogo de muestra.
  return <TiendaClient productos={productos.length > 0 ? productos : CATALOGO_DEMO} />;
}

export default function Home() {
  return (
    <Suspense fallback={<div className="grid flex-1 place-items-center text-sm text-suave">Cargando tienda…</div>}>
      <Catalogo />
    </Suspense>
  );
}
