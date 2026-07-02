import type { product } from "./product";

export type PedidoEstado =
  | "PENDIENTE"
  | "CONFIRMADO"
  | "TERMINADO"
  | "CANCELADO";

export interface UsuarioPedido {
  id: number;
  nombre: string;
  apellido: string;
  mail: string;
  celular: string;
  rol: string;
}

export interface DetallePedido {
  cantidad: number;
  subtotal: number;
  producto: product;
}


export interface DatosEntrega {
  telefono: string;
  direccion: string;
  notas?: string;
}


export interface Pedido {
  id: number;
  fecha: string;
  estado: PedidoEstado;
  total: number;
  formaPago: string;
  detalles: DetallePedido[];
  usuarioDto: UsuarioPedido;
  entrega?: DatosEntrega;
}
