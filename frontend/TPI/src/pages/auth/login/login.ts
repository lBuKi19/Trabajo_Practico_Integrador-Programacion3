import type { IUser } from "../../../types/IUser";
import type { RUser } from "../../../types/RUser";
import { navigate } from "../../../utils/navigate";

const form = document.getElementById("form_login") as HTMLFormElement;
const inputEmail = document.getElementById("email") as HTMLInputElement;
const inputPassword = document.getElementById("password") as HTMLInputElement;

form.addEventListener("submit", async (e: SubmitEvent) => {
  e.preventDefault();

  const email_login = inputEmail.value.trim();
  const password_login = inputPassword.value.trim();

  // Validación de campos requeridos
  if (!email_login || !password_login) {
    alert("Todos los campos son obligatorios");
    return;
  }

  try {
    const response = await fetch("/data/usuarios.json");

    if (!response.ok) {
      throw new Error("No se pudo cargar el archivo de usuarios");
    }

    const users: RUser[] = await response.json();

    // Busco usuario por email
    const userFound = users.find(
      (user) => user.mail.toLowerCase() === email_login.toLowerCase()
    );

    if (!userFound) {
      alert("El usuario no existe");
      form.reset();
      return;
    }

    // Verificacion de contraseña
    if (userFound.password !== password_login) {
      alert("La contraseña ingresada es incorrecta");
      form.reset();
      return;
    }

    const user: IUser = {
      id: userFound.id,
      nombre: userFound.nombre,
      mail: userFound.mail,
      rol: userFound.rol,
      loggedIn: true,
    };

    localStorage.setItem("authUser", JSON.stringify(user));

    alert("Sesión iniciada correctamente");
    form.reset();

    if (userFound.rol === "ADMIN") {
      navigate("/src/pages/admin/adminHome/adminHome.html");
    } else if (userFound.rol === "USUARIO") {
      navigate("/src/pages/store/home/home.html");
    }

  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    alert("Ocurrió un error al intentar iniciar sesión");
  }
});