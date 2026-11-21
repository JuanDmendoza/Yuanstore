# Contexto del Proyecto: Yuan Store

Estamos construyendo **Yuan Store**, una tienda web e-commerce minimalista y mobile-first para la venta de ítems digitales de juegos (Blox Fruits: frutas permanentes, gamepasses y best sellers), con catálogo de ~100 productos, carrito persistente y checkout directo vía WhatsApp.

## 1. Stack Tecnológico
- **Framework:** Next.js (App Router) + Tailwind CSS
- **Base de Datos:** MongoDB Atlas con Mongoose (`MONGODB_URI`)
- **Imágenes / CDN:** Cloudinary (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`) usando transformaciones `f_auto,q_auto,w_500` para optimizar créditos y velocidad.
- **Checkout:** Generación de enlace `https://wa.me/<telefono>?text=<mensaje_codificado>` (`NEXT_PUBLIC_WHATSAPP_NUMBER`).

## 2. Identidad Visual y Paleta de Colores (Estricto)
Inspirado en el logo oficial ubicado en `public/logo-yuan.jpeg` (fondo negro abismo, luna verde neón y tipografía blanca cromada):
- **Fondo Principal:** `#060907` (negro profundo)
- **Superficies (Navbar, Cards, Drawer):** `#0D130F` (verde bosque muy oscuro)
- **Bordes sutiles:** `#1B2820` (con efecto glow `#00E639` en hover/activo)
- **Color de Acento Principal:** `#00E639` (verde neón luna; texto negro `#060907` en negrita sobre botones verdes)
- **Texto Principal:** `#F8FAFC` (blanco cromado)
- **Texto Secundario:** `#8A9990` (gris menta suave)

*(Si existen capturas de referencia en `.tmp/stitch-desktop.png` y `.tmp/stitch-mobile.png`, úsalas como guía visual base respetando estas mejoras).*

## 3. Reglas de Diseño UI/UX (Mobile-First + Desktop)
- **CRÍTICO EN MÓVIL:** Es una página web responsive, **NO** una app nativa. **NO pongas barra de navegación inferior ni barra fija abajo.** Todo va en el **Header superior sticky**.
- **Navbar Superior Sticky:**
  - Izquierda: Logo (`public/logo-yuan.jpeg`) + título **"YUAN STORE"**.
  - Centro (o segunda fila en móvil): Buscador en tiempo real (`"Buscar frutas o gamepasses..."`).
  - Derecha: Selector de país/moneda empezando con **"🇨🇴 COP"** (arquitectura preparada para agregar más países/tasas en el futuro) + Botón de **Carrito** con contador y subtotal que abre el drawer lateral.
  - *Sin ícono de perfil/login y sin links redundantes en el navbar.*
- **Barra de Filtros (Píldoras horizontales):**
  - `"Todos"`, `"Best Seller"`, `"Fruta"`, `"Gamepass"` + contador de artículos disponibles.
- **Grid de Productos y Cards Minimalistas:**
  - Responsive: **2 columnas en móvil**, **4 a 5 columnas en escritorio**.
  - **Sin relleno:** Nada de descripciones largas ni ratings. Cada card lleva únicamente:
    1. Recuadro superior oscuro con badge en esquina superior izquierda (`BEST SELLER`, `GAMEPASS`, `FRUTA` / rareza) e imagen centrada desde Cloudinary (`loading="lazy"`).
    2. Nombre del producto limpio (sin truncar en exceso).
    3. Fila inferior con precio formateado en **una sola línea** (`whitespace-nowrap`, ej: `$ 10.200 COP`) a la izquierda y botón cuadrado **`+`** a la derecha.
- **Drawer Lateral del Carrito:**
  - Lista de productos agregados con miniatura, nombre, controles `- 1 +` y subtotal.
  - Formulario de cierre: **Tu Nombre \*** (obligatorio), **Usuario de Roblox (Opcional)**, Total en COP y botón verde neón **`#00E639`** **"Pedir por WhatsApp"**.

## 4. Arquitectura de Carpetas y Clases
Mantén separada la lógica de dominio de los componentes visuales:
- `src/lib/mongodb.js`: Conexión singleton cacheada a MongoDB Atlas.
- `src/models/Producto.js`: Esquema Mongoose (`nombre`, `categoria`, `precio`, `cloudinaryPublicId`, `imagenUrl`, `disponible`, `bestSeller`).
- `src/services/CloudinaryService.js`: Clase para construir URLs optimizadas (`f_auto,q_auto,w_500`).
- `src/services/ProductoService.js`: Clase repositorio para consultar y serializar el catálogo activo desde MongoDB.
- `src/domain/Carrito.js`: Clase pura para gestión de ítems, cantidades, persistencia en `localStorage` y cálculo de totales.
- `src/domain/PedidoWhatsApp.js`: Clase para formatear el mensaje del pedido (nombre, usuario de juego, lista de ítems y total) y generar la URL `wa.me`.
- `src/components/`: Componentes React (`TiendaClient.jsx`, `Navbar.jsx`, `ProductoCard.jsx`, `CarritoDrawer.jsx`).

## 5. Notas del repo
- `app/` está en la raíz (no en `src/`); el alias `@/*` apunta a la raíz, así que se importa como `@/src/...`.
- Next.js 16 con `cacheComponents: true`: lee `node_modules/next/dist/docs/` antes de escribir código de páginas/datos (ver `AGENTS.md`).
