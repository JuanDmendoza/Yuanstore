// Las frutas se venden en dos modalidades: Perma (precio base del producto) y Física.
export const TIPOS_FRUTA = [
  { id: "perma", etiqueta: "Perma" },
  { id: "fisica", etiqueta: "Física" },
];

export const TIPO_FRUTA_DEFECTO = "perma";

export const esFruta = (producto) => producto.categoria === "Fruta";

/** ¿La modalidad se puede comprar? (no bloqueada desde el admin) */
export function varianteDisponible(producto, tipo) {
  if (tipo === "fisica") return Boolean(producto.fisica) && producto.fisica.disponible !== false;
  return producto.permaDisponible !== false;
}

/** Datos de precio ({ precio COP, precios por moneda }) de la modalidad elegida. */
export function precioDeVariante(producto, tipo = TIPO_FRUTA_DEFECTO) {
  if (tipo === "fisica" && producto.fisica) return producto.fisica;
  return { precio: producto.precio, precios: producto.precios };
}

/** Ítem listo para el carrito: una modalidad de fruta es una línea distinta. */
export function aItemCarrito(producto, tipo = TIPO_FRUTA_DEFECTO) {
  if (!esFruta(producto)) return producto;
  const etiqueta = TIPOS_FRUTA.find((t) => t.id === tipo)?.etiqueta ?? "Perma";
  return {
    ...producto,
    ...precioDeVariante(producto, tipo),
    id: `${producto.id}:${tipo}`,
    nombre: `${producto.nombre} (${etiqueta})`,
  };
}
