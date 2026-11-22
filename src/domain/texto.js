/** Minúsculas, sin acentos/tildes y sin espacios extremos: "Física " y "fisica" coinciden. */
export function normalizarTexto(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}
