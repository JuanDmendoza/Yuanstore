import { MONEDA_DEFECTO, formatearMonto } from "@/src/domain/monedas";

export class PedidoWhatsApp {
  constructor({
    carrito,
    nombre,
    usuarioRoblox = "",
    moneda = MONEDA_DEFECTO,
    telefono = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    // El botón flotante de WhatsApp arma el pedido sin pasar por el formulario del drawer.
    nombreObligatorio = true,
  }) {
    this.carrito = carrito;
    this.nombre = (nombre ?? "").trim();
    this.usuarioRoblox = (usuarioRoblox ?? "").trim();
    this.moneda = moneda ?? MONEDA_DEFECTO;
    this.telefono = String(telefono ?? "").replace(/\D/g, "");
    this.nombreObligatorio = nombreObligatorio;
  }

  get valido() {
    const nombreOk = !this.nombreObligatorio || this.nombre.length > 0;
    return nombreOk && !this.carrito.vacio && this.telefono.length > 0;
  }

  /** Mensaje del pedido con los montos en la moneda/país seleccionado (los mismos que ve el cliente). */
  mensaje() {
    const { moneda, carrito } = this;
    const lineas = ["*Nuevo pedido - Yuan Store*", ""];
    if (this.nombre) lineas.push(`Nombre: ${this.nombre}`);
    if (this.usuarioRoblox) lineas.push(`Usuario de Roblox: ${this.usuarioRoblox}`);
    lineas.push(`País/Moneda: ${moneda.bandera} ${moneda.codigo}`);
    lineas.push("", "Pedido:");
    for (const i of carrito.items) {
      lineas.push(`- ${i.cantidad} x ${i.nombre} (${formatearMonto(carrito.subtotalEn(i, moneda), moneda)})`);
    }
    lineas.push("", `*Total: ${formatearMonto(carrito.totalEn(moneda), moneda)}*`);
    return lineas.join("\n");
  }

  url() {
    if (!this.valido) {
      throw new Error("Pedido inválido: faltan nombre, productos o número de WhatsApp");
    }
    return `https://wa.me/${this.telefono}?text=${encodeURIComponent(this.mensaje())}`;
  }
}
