import type { category } from "./category";

export interface product {
    id: number;
    eliminado?: boolean;
    createdAt?: string;
    nombre: string;
    precio: number;
    descripcion: string;
    stock: number;
    imagen: string;
    disponible: boolean;
    categoria: category; 
}


export interface ItemCarrito {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  precio: number;
  cantidad: number;
}