import type { IUser } from "../types/IUser";
import type { Pedido, DetallePedido, UsuarioPedido } from "../types/order";
import { obtenerCarrito, vaciarCarrito } from "./cart";
import { getAuthUser } from "./auth";
import { fetchProductos } from "./products";

const PEDIDOS_STORAGE_KEY = "pedidos";
const USERS_STORAGE_KEY = "users";

interface CheckoutData {
  telefono: string;
  direccion: string;
  formaPago: string;
  notas?: string;
}


async function fetchPedidosBase(): Promise<Pedido[]> {
  const response = await fetch("/data/pedidos.json");

  if (!response.ok) {
    throw new Error("No se pudieron cargar los pedidos base");
  }

  return await response.json();
}

async function fetchUsuariosBase(): Promise<UsuarioPedido[]> {
  const response = await fetch("/data/usuarios.json");

  if (!response.ok) {
    throw new Error("No se pudieron cargar los usuarios base");
  }

  return await response.json();
}

export function obtenerPedidosLocales(): Pedido[] {
  const data = localStorage.getItem(PEDIDOS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function guardarPedidosLocales(pedidos: Pedido[]): void {
  localStorage.setItem(PEDIDOS_STORAGE_KEY, JSON.stringify(pedidos));
}

export async function obtenerTodosLosPedidos(): Promise<Pedido[]> {
  const pedidosBase = await fetchPedidosBase();
  const pedidosLocales = obtenerPedidosLocales();

  return [...pedidosBase, ...pedidosLocales];
}

async function obtenerUsuarioCompleto(authUser: IUser): Promise<UsuarioPedido> {
  const usuariosBase = await fetchUsuariosBase();

  const usuariosLocalesRaw = localStorage.getItem(USERS_STORAGE_KEY);
  const usuariosLocales = usuariosLocalesRaw ? JSON.parse(usuariosLocalesRaw) : [];

  const todosLosUsuarios = [...usuariosBase, ...usuariosLocales];

  const usuarioEncontrado = todosLosUsuarios.find(
    (usuario) => usuario.mail.toLowerCase() === authUser.mail.toLowerCase()
  );

  if (usuarioEncontrado) {
    return {
      id: usuarioEncontrado.id,
      nombre: usuarioEncontrado.nombre ?? "",
      apellido: usuarioEncontrado.apellido ?? "",
      mail: usuarioEncontrado.mail,
      celular: usuarioEncontrado.celular ?? "",
      rol: usuarioEncontrado.rol,
    };
  }

  return {
    id: authUser.id,
    nombre: "",
    apellido: "",
    mail: authUser.mail,
    celular: "",
    rol: authUser.rol,
  };
}

export async function crearPedidoDesdeCarrito(
  checkoutData: CheckoutData
): Promise<Pedido> {
  const authUser = getAuthUser();

  if (!authUser) {
    throw new Error("No hay usuario autenticado");
  }

  const carrito = obtenerCarrito();

  if (carrito.length === 0) {
    throw new Error("El carrito está vacío");
  }

  const productos = await fetchProductos();
  const usuarioDto = await obtenerUsuarioCompleto(authUser);
  const todosLosPedidos = await obtenerTodosLosPedidos();

  const maxId = todosLosPedidos.reduce(
    (acc, pedido) => Math.max(acc, pedido.id),
    0
  );

  const detalles: DetallePedido[] = carrito.map((item) => {
    const productoCompleto = productos.find(
      (producto) => producto.id === item.id
    );

    if (!productoCompleto) {
      throw new Error(`No se encontró el producto con id ${item.id}`);
    }

    return {
      cantidad: item.cantidad,
      subtotal: item.precio * item.cantidad,
      producto: productoCompleto,
    };
  });

  const subtotal = detalles.reduce(
    (acc, detalle) => acc + detalle.subtotal,
    0
  );

  const envio = subtotal > 0 ? 500 : 0;
  const total = subtotal + envio;

  const nuevoPedido: Pedido = {
    id: maxId + 1,
    fecha: new Date().toISOString().split("T")[0],
    estado: "PENDIENTE",
    total,
    formaPago: checkoutData.formaPago,
    detalles,
    usuarioDto,
    entrega: {
      telefono: checkoutData.telefono,
      direccion: checkoutData.direccion,
      notas: checkoutData.notas,
    },
  };

  const pedidosLocales = obtenerPedidosLocales();
  pedidosLocales.push(nuevoPedido);
  guardarPedidosLocales(pedidosLocales);

  vaciarCarrito();

  return nuevoPedido;
}