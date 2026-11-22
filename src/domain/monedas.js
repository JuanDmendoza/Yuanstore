/**
 * Monedas/países soportados. Para agregar uno nuevo basta una entrada más:
 * `tasa` = unidades de la moneda por 1 COP (los precios base están en COP).
 * Cada producto puede fijar un precio propio por moneda (`producto.precios`);
 * si no lo tiene, se convierte desde COP con esta tasa (aproximada: ajústala aquí).
 */
export const MONEDAS = [
  { codigo: "COP", bandera: "🇨🇴", locale: "es-CO", tasa: 1, decimales: 0 },
  { codigo: "MXN", bandera: "🇲🇽", locale: "es-MX", tasa: 0.00555, decimales: 2 }, // Google, 21-nov-2026: 1000 COP = 5,55 MXN
  { codigo: "PEN", bandera: "🇵🇪", locale: "es-PE", tasa: 0.001, decimales: 2 }, // Google, 21-nov-2026: 1000 COP = 1,00 PEN
  { codigo: "USD", bandera: "🇺🇸", locale: "en-US", tasa: 0.000292, decimales: 2, comision: 0.054 }, // Google, 21-nov-2026: 87.000 COP = 25,41 USD; comisión PayPal ~5,4%
];

export const MONEDA_DEFECTO = MONEDAS[0];

/** Monedas distintas a la base (COP), cuyo precio se puede fijar a mano. */
export const MONEDAS_EXTRA = MONEDAS.filter((m) => m !== MONEDA_DEFECTO);

function redondear(valor, decimales) {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/** Precio de un ítem ({ precio en COP, precios?: { MXN, PEN } }) en la moneda dada. */
export function precioEn(item, moneda = MONEDA_DEFECTO) {
  const fijo = item.precios?.[moneda.codigo];
  if (Number.isFinite(fijo)) return fijo;
  // `comision` (ej. 0.054 = 5,4% de PayPal): se grosa el precio para que, tras el descuento, te quede el neto.
  const bruto = moneda.comision ? 1 - moneda.comision : 1;
  return redondear((item.precio * moneda.tasa) / bruto, moneda.decimales ?? 0);
}

/** Formatea un monto que ya está en la moneda dada (sin convertir). */
export function formatearMonto(valor, moneda = MONEDA_DEFECTO) {
  const decimales = moneda.decimales ?? 0;
  const numero = new Intl.NumberFormat(moneda.locale, {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(valor);
  return `$ ${numero} ${moneda.codigo}`;
}

/** Atajo: precio de un ítem formateado en la moneda dada. */
export function formatearPrecio(item, moneda = MONEDA_DEFECTO) {
  return formatearMonto(precioEn(item, moneda), moneda);
}
