// Catálogo de muestra: se usa mientras la base de datos esté vacía o no responda.
const p = (id, nombre, categoria, precio, bestSeller = false, fisica = null) => ({
  id: `demo-${id}`,
  nombre,
  categoria,
  precio,
  precios: {},
  fisica: fisica ? { precio: fisica, precios: {} } : null,
  bestSeller,
  imagen: "",
});

export const CATALOGO_DEMO = [
  p(1, "Kitsune", "Fruta", 91000, true, 60000),
  p(2, "Buddha", "Fruta", 24000, true, 15000),
  p(3, "Dragon", "Fruta", 115000, false, 80000),
  p(4, "Gas", "Fruta", 68000),
  p(5, "Venom", "Fruta", 34500),
  p(6, "2x Mastery", "Gamepass", 11500),
  p(7, "+1 Fruit Storage", "Gamepass", 10200),
  p(8, "2x Boss Drops", "Gamepass", 8900),
  p(9, "Perm Portal", "Gamepass", 48000),
  p(10, "Dark Blade", "Gamepass", 31000),
  p(11, "Fast Boats", "Gamepass", 8500),
  p(12, "2x Money", "Gamepass", 11500, true),
  p(13, "Dark Blade Skin", "Skin", 22000),
  p(14, "Kitsune Aura Skin", "Skin", 35000),
  p(15, "Neon Cyber Skin", "Skin", 18500, true),
];
