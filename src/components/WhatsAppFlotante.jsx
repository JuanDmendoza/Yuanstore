/** Trazo SVG (viewBox 24x24) del logo de WhatsApp; compartido con el footer. */
export const ICONO_WHATSAPP =
  "M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6l.4-.5c.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-2.9-.4-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z";

export const MENSAJE_WHATSAPP = "Hola Yuan Store, tengo una duda sobre un producto.";
const MENSAJE = MENSAJE_WHATSAPP;

/**
 * Botón circular flotante para consultas sin armar un pedido. Va debajo del drawer
 * (z-30 < z-40) para que no tape el carrito al abrirlo.
 */
export default function WhatsAppFlotante({ telefono = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER }) {
  const numero = String(telefono ?? "").replace(/\D/g, "");
  if (!numero) return null;

  return (
    <a
      href={`https://wa.me/${numero}?text=${encodeURIComponent(MENSAJE)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      title="¿Dudas? Escríbenos"
      className="fixed bottom-4 right-4 z-30 grid size-12 place-items-center rounded-full bg-acento text-fondo shadow-[0_0_20px_rgba(0,230,57,0.45)] transition hover:scale-105 hover:brightness-110 sm:bottom-6 sm:right-6 sm:size-14"
    >
      <svg viewBox="0 0 24 24" className="size-6 fill-current sm:size-7" aria-hidden>
        <path d={ICONO_WHATSAPP} />
      </svg>
    </a>
  );
}
