import { connection } from "next/server";
import { Suspense } from "react";
import TiendaClient from "@/src/components/TiendaClient";
import { ProductoService } from "@/src/services/ProductoService";

async function Catalogo() {
  await connection(); // se lee en cada petición, nunca se prerenderiza
  let productos: Awaited<ReturnType<ProductoService["listarDisponibles"]>> = [];
  let errorCatalogo = false;
  try {
    productos = await new ProductoService().listarDisponibles();
  } catch (err) {
    console.error("No se pudo leer el catálogo de MongoDB:", err);
    errorCatalogo = true;
  }
  return <TiendaClient productos={productos} errorCatalogo={errorCatalogo} />;
}

export default function Home() {
  return (
    <Suspense fallback={<div className="grid flex-1 place-items-center text-sm text-suave">Cargando tienda…</div>}>
      <Catalogo />
    </Suspense>
  );
}
