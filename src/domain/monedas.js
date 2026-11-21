/**
 * Monedas/países soportados. Para agregar uno nuevo basta una entrada más:
 * `tasa` = unidades de la moneda por 1 COP (los precios base están en COP).
 */
export const MONEDAS = [
  { codigo: "COP", bandera: "🇨🇴", locale: "es-CO", tasa: 1 },
];

export const MONEDA_DEFECTO = MONEDAS[0];

export function formatearPrecio(precioCOP, moneda = MONEDA_DEFECTO) {
  const valor = Math.round(precioCOP * moneda.tasa);
  return `$ ${new Intl.NumberFormat(moneda.locale, { maximumFractionDigits: 0 }).format(valor)} ${moneda.codigo}`;
}
