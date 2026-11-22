import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

// URL pública del sitio: necesaria para que las imágenes de Open Graph sean absolutas.
// Define NEXT_PUBLIC_SITE_URL (ej. https://yuanstore.com); en Vercel se usa el dominio de producción.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

const titulo = "Yuan Store";
const descripcion = "Frutas permanentes, gamepasses y skins de Blox Fruits. Pide fácil por WhatsApp.";
const logo = { url: "/logo-yuan.jpeg", width: 200, height: 200, alt: "Logo de Yuan Store" };

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: titulo,
  description: descripcion,
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: titulo,
    title: titulo,
    description: descripcion,
    url: "/",
    images: [logo],
  },
  twitter: {
    card: "summary",
    title: titulo,
    description: descripcion,
    images: [logo.url],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-fondo text-texto">{children}</body>
    </html>
  );
}
