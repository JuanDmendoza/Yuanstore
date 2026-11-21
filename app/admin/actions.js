"use server";

import { revalidatePath } from "next/cache";
import { MONEDAS_EXTRA } from "@/src/domain/monedas";
import { ProductoError, ProductoService } from "@/src/services/ProductoService";

// TODO(auth): estas acciones son endpoints públicos. Cuando se agregue el login
// del administrador, verificar la sesión al inicio de cada una.

function refrescar() {
  revalidatePath("/");
  revalidatePath("/admin");
}

function mensajeDeError(err) {
  if (err instanceof ProductoError) return err.message;
  console.error(err);
  return "Ocurrió un error inesperado. Intenta de nuevo.";
}

/** Crea o edita (si viene `id`) un producto. Pensada para `useActionState`. */
export async function guardarProductoAction(_estado, formData) {
  const id = String(formData.get("id") ?? "");
  const datos = {
    nombre: formData.get("nombre"),
    categoria: formData.get("categoria"),
    precio: formData.get("precio"),
    precios: Object.fromEntries(
      MONEDAS_EXTRA.map(({ codigo }) => [codigo, formData.get(`precio_${codigo}`)])
    ),
    precioFisica: formData.get("fisica_precio"),
    preciosFisica: Object.fromEntries(
      MONEDAS_EXTRA.map(({ codigo }) => [codigo, formData.get(`fisica_${codigo}`)])
    ),
    bestSeller: formData.get("bestSeller") === "on",
    disponible: formData.get("disponible") === "on",
  };
  const archivo = formData.get("imagen");

  try {
    const servicio = new ProductoService();
    if (id) await servicio.actualizar(id, datos, archivo);
    else await servicio.crear(datos, archivo);
  } catch (err) {
    return { ok: false, error: mensajeDeError(err) };
  }
  refrescar();
  return { ok: true, error: null, marca: Date.now() };
}

export async function cambiarDisponibleAction(id, disponible) {
  try {
    await new ProductoService().cambiarDisponible(id, disponible);
  } catch (err) {
    return { ok: false, error: mensajeDeError(err) };
  }
  refrescar();
  return { ok: true, error: null };
}

export async function eliminarProductoAction(id) {
  try {
    await new ProductoService().eliminar(id);
  } catch (err) {
    return { ok: false, error: mensajeDeError(err) };
  }
  refrescar();
  return { ok: true, error: null };
}
