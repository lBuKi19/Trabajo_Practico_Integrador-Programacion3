import type { product } from "../types/product";

export async function fetchProductos(): Promise<product[]> {
  const response = await fetch("/data/productos.json");

  if (!response.ok) {
    throw new Error("No se pudieron cargar los productos");
  }

  return await response.json();
}