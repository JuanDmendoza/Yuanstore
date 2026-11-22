import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { sesionAdmin } from "@/src/lib/adminAuth";
import { Suspense } from "react";
import AdminProductos from "@/src/components/admin/AdminProductos";
import { ProductoService } from "@/src/services/ProductoService";

export const metadata: Metadata = {
  title: "Admin · Yuan Store",
  robots: { index: false, follow: false },
};

async function Lista() {
  await connection(); // se lee en cada petición, nunca se prerenderiza
  if (!(await sesionAdmin())) notFound(); // segunda barrera, además del proxy
  const productos = await new ProductoService().listarTodos();
  return <AdminProductos productos={productos} />;
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={<div className="grid flex-1 place-items-center text-sm text-suave">Cargando productos…</div>}
    >
      <Lista />
    </Suspense>
  );
}
