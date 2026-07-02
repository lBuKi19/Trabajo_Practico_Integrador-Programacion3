
//funcion que intercepta carga de pagina
export function authGuard() {
  const path = window.location.pathname;

  if (
    path.includes("/pages/auth/login") ||
    path.includes("/pages/auth/registro")
  ) {
    return;
  }

  const authUserRaw = localStorage.getItem("authUser");

  // si no hay sesion
  if (!authUserRaw) {
    window.location.replace("/src/pages/auth/login/login.html");
    return;
  }

  let authUser;
  try {
    authUser = JSON.parse(authUserRaw);
  } catch {
    localStorage.removeItem("authUser");
    window.location.replace("/src/pages/auth/login/login.html");
    return;
  }

  const role = authUser.role;

  // si cliente intenta acceder a panel admin por URL
  if (role === "client" && path.includes("/pages/admin/")) {
    window.location.replace("/src/pages/store/home/home.html");
    return;
  }

  // si admin intenta acceder a panel client por URL
  if (role === "admin" && path.includes("/pages/client/")) {
    window.location.replace("/src/pages/admin/adminHome/adminHome.html");
    return;
  }

}
