import { Carrito } from "@/src/domain/Carrito";

export class PedidoWhatsApp {
  constructor({ carrito, nombre, usuarioRoblox = "", telefono = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER }) {
    this.carrito = carrito;
    this.nombre = (nombre ?? "").trim();
    this.usuarioRoblox = (usuarioRoblox ?? "").trim();
    this.telefono = String(telefono ?? "").replace(/\D/g, "");
  }

  get valido() {
    return this.nombre.length > 0 && !this.carrito.vacio && this.telefono.length > 0;
  }

  mensaje() {
    const lineas = ["*Nuevo pedido - Yuan Store*", "", `Nombre: ${this.nombre}`];
    if (this.usuarioRoblox) lineas.push(`Usuario de Roblox: ${this.usuarioRoblox}`);
    lineas.push("", "Pedido:");
    for (const i of this.carrito.items) {
      lineas.push(`- ${i.cantidad} x ${i.nombre} (${Carrito.formatearCOP(i.precio * i.cantidad)})`);
    }
    lineas.push("", `*Total: ${Carrito.formatearCOP(this.carrito.total)}*`);
    return lineas.join("\n");
  }

  url() {
    if (!this.valido) {
      throw new Error("Pedido inválido: faltan nombre, productos o número de WhatsApp");
    }
    return `https://wa.me/${this.telefono}?text=${encodeURIComponent(this.mensaje())}`;
  }
}
