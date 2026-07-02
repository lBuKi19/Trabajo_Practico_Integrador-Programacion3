import type { Rol } from "./Rol";

export interface IUser {
  id: number,
  nombre: string,
  mail: string;
  loggedIn: boolean;
  rol: Rol;
}
