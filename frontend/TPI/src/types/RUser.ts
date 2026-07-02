import type { Rol } from "./Rol";

export interface RUser {
  id: number,
  nombre: string;
  mail: string;
  password: string;
  rol: Rol;
}