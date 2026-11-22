/**
 * Carrito puro: ítems, cantidades, totales y persistencia en localStorage.
 * Cada ítem: { id, nombre, precio, imagen, cantidad }.
 */
import { precioEn } from "@/src/domain/monedas";
import { TIPO_FRUTA_DEFECTO, aItemCarrito, varianteDisponible } from "@/src/domain/variantes";

export class Carrito {
  static STORAGE_KEY = "yuanstore:carrito";

  constructor(items = []) {
    this.items = items.map((i) => ({ ...i }));
  }

  agregar(producto, cantidad = 1) {
    const existente = this.items.find((i) => i.id === producto.id);
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      this.items.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        precios: producto.precios ?? {},
        imagen: producto.imagen ?? "",
        cantidad,
      });
    }
    return this;
  }

  /** Cambia la cantidad en `delta`; si llega a 0 o menos, elimina el ítem. */
  cambiarCantidad(id, delta) {
    const item = this.items.find((i) => i.id === id);
    if (!item) return this;
    item.cantidad += delta;
    if (item.cantidad <= 0) return this.quitar(id);
    return this;
  }

  quitar(id) {
    this.items = this.items.filter((i) => i.id !== id);
    return this;
  }

  vaciar() {
    this.items = [];
    return this;
  }

  get cantidadTotal() {
    return this.items.reduce((n, i) => n + i.cantidad, 0);
  }

  get total() {
    return this.items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  }

  /** Total del carrito en la moneda dada (respeta los precios fijados por moneda). */
  totalEn(moneda) {
    const total = this.items.reduce((s, i) => s + precioEn(i, moneda) * i.cantidad, 0);
    return Math.round(total * 100) / 100;
  }

  /** Subtotal de una línea en la moneda dada. */
  subtotalEn(item, moneda) {
    return Math.round(precioEn(item, moneda) * item.cantidad * 100) / 100;
  }

  /**
   * Sincroniza los ítems con el catálogo vigente: refresca nombre, precios (COP y por
   * moneda) e imagen, y descarta los productos que ya no existen o cuya modalidad está
   * agotada. Los nombres descartados quedan en `this.descartados`.
   */
  reconciliar(productos) {
    const porId = new Map(productos.map((p) => [p.id, p]));
    const vigentes = [];
    this.descartados = [];
    for (const item of this.items) {
      const [idProducto, tipo = TIPO_FRUTA_DEFECTO] = String(item.id).split(":");
      const producto = porId.get(idProducto);
      if (!producto || !varianteDisponible(producto, tipo)) {
        this.descartados.push(item.nombre);
        continue;
      }
      const actual = aItemCarrito(producto, tipo);
      vigentes.push({
        id: item.id,
        nombre: actual.nombre,
        precio: actual.precio,
        precios: actual.precios ?? {},
        imagen: actual.imagen ?? "",
        cantidad: item.cantidad,
      });
    }
    this.items = vigentes;
    return this;
  }

  get vacio() {
    return this.items.length === 0;
  }

  subtotalItem(id) {
    const i = this.items.find((x) => x.id === id);
    return i ? i.precio * i.cantidad : 0;
  }

  guardar(storage = globalThis.localStorage) {
    try {
      storage?.setItem(Carrito.STORAGE_KEY, JSON.stringify(this.items));
    } catch {
      /* cuota llena o modo privado: se ignora */
    }
  }

  static cargar(storage = globalThis.localStorage) {
    try {
      const raw = storage?.getItem(Carrito.STORAGE_KEY);
      const items = raw ? JSON.parse(raw) : [];
      const validos = Array.isArray(items)
        ? items.filter(
            // Los `demo-*` venían del antiguo catálogo de muestra: no son productos reales.
            (i) => i && i.id && !String(i.id).startsWith("demo-") && Number.isFinite(i.precio) && i.cantidad > 0
          )
        : [];
      return new Carrito(validos);
    } catch {
      return new Carrito();
    }
  }

  static formatearCOP(valor) {
    return `$ ${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(valor)} COP`;
  }
}
