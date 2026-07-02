import type { category } from "../types/category";

export async function fetchCategorias(): Promise<category[]> {
  const response = await fetch("/data/categorias.json");

  if (!response.ok) {
    throw new Error("No se pudieron cargar las categorías");
  }

  return await response.json();
}