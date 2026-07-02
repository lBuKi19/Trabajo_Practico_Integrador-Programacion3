import type { RUser } from "../../../types/RUser";
import type { Rol } from "../../../types/Rol";
import type { IUser } from "../../../types/IUser";
import { navigate } from "../../../utils/navigate";

const form = document.getElementById("form_registro") as HTMLFormElement;
const nombre_registro = document.getElementById("nombre_registro") as HTMLInputElement;
const email_registro = document.getElementById("email_registro") as HTMLInputElement;
const password_registro = document.getElementById("password_registro") as HTMLInputElement;

const usuario_rol: Rol = "USUARIO";

async function fetchUsuariosBase(): Promise<RUser[]> {
  const response = await fetch("/data/usuarios.json");

  if (!response.ok) {
    throw new Error("No se pudieron cargar los usuarios");
  }

  return await response.json();
}

function obtenerUsuariosLocales(): RUser[] {
  const usersFromStorage = localStorage.getItem("users");
  return usersFromStorage ? JSON.parse(usersFromStorage) : [];
}

form?.addEventListener("submit", async (e: SubmitEvent) => {
  e.preventDefault();

  const mail = email_registro.value.trim();
  const password = password_registro.value.trim();
  const nombre = nombre_registro.value.trim();

  if (!mail || !password || !nombre) {
    alert("Todos los campos son obligatorios");
    return;
  }

  try {
    const usuariosBase = await fetchUsuariosBase();
    const usuariosLocales = obtenerUsuariosLocales();

    const todosLosUsuarios = [...usuariosBase, ...usuariosLocales];

    const userFound = todosLosUsuarios.find(
      (user) => user.mail.toLowerCase() === mail.toLowerCase()
    );

    if (userFound) {
      alert("El Email ingresado ya está asociado a una cuenta");
      return;
    }

    const nuevoId =
      todosLosUsuarios.length > 0
        ? Math.max(...todosLosUsuarios.map((user) => user.id)) + 1
        : 1;

    const newUser: RUser = {
      id: nuevoId,
      nombre,
      mail,
      password: password,
      rol: usuario_rol,
    };

    usuariosLocales.push(newUser);
    localStorage.setItem("users", JSON.stringify(usuariosLocales));

    const authUser: IUser = {
      id: newUser.id,
      nombre: newUser.nombre,
      mail: newUser.mail,
      rol: newUser.rol,
      loggedIn: true,
    };

    localStorage.setItem("authUser", JSON.stringify(authUser));

    alert("Usuario registrado correctamente");
    form.reset();

    navigate("/src/pages/store/home/home.html");
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    alert("Ocurrió un error al registrar el usuario");
  }
});