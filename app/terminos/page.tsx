import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y política de reembolso | Yuan Store",
  description: "Condiciones de compra, entrega y reembolsos de Yuan Store.",
};

// Plazo (en horas, desde la entrega) para reportar un problema con el pedido. Ajústalo a tu política real.
const PLAZO_RECLAMO_HORAS = 48;
const ACTUALIZADO = "22 de noviembre de 2026";

const numero = String(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-bold text-texto">{titulo}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-suave">{children}</div>
    </section>
  );
}

export default function Terminos() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
      <Link href="/" className="text-sm font-semibold text-acento hover:underline">
        ← Volver a la tienda
      </Link>

      <h1 className="font-display mt-6 text-2xl font-bold sm:text-3xl">Términos y política de reembolso</h1>
      <p className="mt-1 text-xs text-suave">Última actualización: {ACTUALIZADO}</p>

      <Seccion titulo="1. Qué vendemos">
        <p>
          Yuan Store vende ítems digitales de videojuegos (frutas, gamepasses, skins y similares de Blox Fruits). No
          vendemos productos físicos: la modalidad &quot;Física&quot; de una fruta es una variante dentro del juego.
        </p>
        <p>
          Yuan Store es un negocio independiente y no está afiliado, patrocinado ni respaldado por Roblox Corporation ni
          por los creadores de Blox Fruits. Todas las marcas pertenecen a sus dueños.
        </p>
      </Seccion>

      <Seccion titulo="2. Cómo se hace un pedido">
        <p>
          El carrito de la tienda no cobra. Al pulsar &quot;Pedir por WhatsApp&quot; se abre un chat con el resumen de tu
          pedido, y la compra se confirma cuando te respondemos por ese chat y acuerdas el pago con nosotros.
        </p>
        <p>
          Los precios mostrados pueden cambiar sin previo aviso y los montos en monedas distintas al peso colombiano son
          referenciales. El precio final es el que confirmemos por WhatsApp antes de que pagues.
        </p>
      </Seccion>

      <Seccion titulo="3. Pago">
        <p>
          El pago se coordina directamente por WhatsApp y se realiza fuera del sitio. Los métodos disponibles te los
          indicamos en el chat. Algunos métodos (por ejemplo PayPal) pueden incluir una comisión que ya va reflejada en el
          precio mostrado.
        </p>
        <p>Entregamos el pedido una vez confirmado el pago. Guarda tu comprobante hasta recibir el ítem.</p>
      </Seccion>

      <Seccion titulo="4. Entrega">
        <p>
          Para entregarte el ítem necesitamos tu usuario de Roblox y que estés disponible para recibirlo dentro del juego.
          La entrega se coordina por WhatsApp y su tiempo depende de la disponibilidad de ambas partes.
        </p>
        <p>
          Eres responsable de darnos un usuario correcto. Si el ítem se entrega a un usuario que nos indicaste por error,
          no podemos recuperarlo ni reembolsarlo.
        </p>
      </Seccion>

      <Seccion titulo="5. Política de reembolso">
        <p>
          Por ser ítems digitales que se entregan al instante dentro del juego, <strong className="text-texto">no hay
          reembolso una vez que el ítem fue entregado correctamente</strong>, ni por arrepentimiento ni por cambios en el
          juego posteriores a la entrega.
        </p>
        <p>Sí te reembolsamos (o te reponemos el ítem, a tu elección) en estos casos:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Pagaste y no pudimos entregarte el ítem.</li>
          <li>Entregamos un ítem distinto al que pediste.</li>
          <li>El ítem entregado no corresponde a lo acordado (por ejemplo, modalidad Perma o Física equivocada).</li>
        </ul>
        <p>
          Debes reportarlo por WhatsApp dentro de las {PLAZO_RECLAMO_HORAS} horas siguientes a la entrega (o a la fecha
          acordada, si no se entregó), con tu comprobante de pago y, si es posible, capturas del problema. Los reembolsos se
          hacen por el mismo medio de pago, descontando las comisiones que cobre la plataforma de pago cuando apliquen.
        </p>
      </Seccion>

      <Seccion titulo="6. Cuentas y riesgos del juego">
        <p>
          Nunca te pediremos tu contraseña de Roblox. Si alguien que dice ser de Yuan Store te la pide, no la compartas.
        </p>
        <p>
          Roblox y Blox Fruits pueden modificar o eliminar ítems, o sancionar cuentas, según sus propias reglas. No nos
          hacemos responsables por sanciones o cambios del juego ajenos a nuestro control.
        </p>
      </Seccion>

      <Seccion titulo="7. Datos personales">
        <p>
          Solo usamos el nombre y el usuario de Roblox que nos das en el pedido para gestionarlo y entregártelo. No los
          vendemos ni los compartimos con terceros. El carrito se guarda únicamente en tu propio navegador.
        </p>
      </Seccion>

      <Seccion titulo="8. Contacto">
        <p>
          Para dudas, reclamos o reembolsos escríbenos
          {numero ? (
            <>
              {" "}
              por{" "}
              <a
                href={`https://wa.me/${numero}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-acento hover:underline"
              >
                WhatsApp
              </a>
            </>
          ) : (
            " por WhatsApp"
          )}
          . Al comprar en Yuan Store aceptas estos términos, que podemos actualizar; aplica la versión vigente al momento de
          tu pedido.
        </p>
      </Seccion>
    </main>
  );
}
