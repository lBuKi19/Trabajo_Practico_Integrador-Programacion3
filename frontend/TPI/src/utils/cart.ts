import type { ItemCarrito } from "../types/product";

const STORAGE_KEY = "carrito";

export function obtenerCarrito(): ItemCarrito[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function guardarCarrito(carrito: ItemCarrito[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
}

export function agregarCarrito(
  id: number,
  nombre: string,
  descripcion: string,
  imagen: string,
  precio: number,
  cantidad: number = 1
): void {
  const carrito = obtenerCarrito();
  const producto = carrito.find((item) => item.id === id);

  if (producto) {
    producto.cantidad += cantidad;
  } else {
    carrito.push({
      id,
      nombre,
      descripcion,
      imagen,
      precio,
      cantidad,
    });
  }

  guardarCarrito(carrito);
  alert("Producto agregado al carrito");
}

export function incrementarCantidad(id: number): void {
  const carrito = obtenerCarrito();

  const producto = carrito.find((item) => item.id === id);

  if (!producto) return;

  producto.cantidad++;

  guardarCarrito(carrito);
}

export function decrementarCantidad(id: number): void {
  const carrito = obtenerCarrito();

  const producto = carrito.find((item) => item.id === id);

  if (!producto) return;

  if (producto.cantidad > 1) {
    producto.cantidad--;
    guardarCarrito(carrito);
    return;
  }

  const carritoActualizado = carrito.filter((item) => item.id !== id);
  guardarCarrito(carritoActualizado);
}

export function eliminarProductoCarrito(id: number): void {
  const carrito = obtenerCarrito();
  const carritoActualizado = carrito.filter((item) => item.id !== id);

  guardarCarrito(carritoActualizado);
}

export function vaciarCarrito(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function obtenerCantidadItems(): number {
  const carrito = obtenerCarrito();
  return carrito.reduce((acc, item) => acc + item.cantidad, 0);
}

export function actualizarBadgeCarrito(): void {
  const badge = document.getElementById("cart-badge");

  if (!badge) return;

  badge.textContent = String(obtenerCantidadItems());
}