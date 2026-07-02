import type { IUser } from "../types/IUser"
import { removeUser } from "./localStorage";
import { navigate } from "./navigate";


export const logout = () => {
  removeUser();
  navigate("/src/pages/auth/login/login.html");
};


export function getAuthUser(): IUser | null {
  const userFromStorage = localStorage.getItem("authUser");

  if (!userFromStorage) {
    return null;
  }

  return JSON.parse(userFromStorage);
}

