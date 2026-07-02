import { logout, getAuthUser } from "../../../utils/auth";
import { authGuard } from "../../../main";
import type { product } from "../../../types/product";
import type { category } from "../../../types/category";
import type { Pedido } from "../../../types/order";
import { fetchProductos } from "../../../utils/products";
import { fetchCategorias } from "../../../utils/categories";
import { obtenerTodosLosPedidos } from "../../../utils/order";


function contarPedidosPorEstado(pedidos: Pedido[]): Record<string, number> {
  return pedidos.reduce<Record<string, number>>((acc, pedido) => {
    if (!acc[pedido.estado]) {
      acc[pedido.estado] = 0;
    }

    acc[pedido.estado]++;
    return acc;
  }, {});
}

function renderNombreAdmin(): void {
  const adminName = document.getElementById("admin-name");
  const authUser = getAuthUser();

  if (!adminName || !authUser) return;

  adminName.textContent = authUser.nombre ?? "Admin";
}

function renderCards(
  categorias: category[],
  productos: product[],
  pedidos: Pedido[]
): void {
  const totalCategorias = document.getElementById("total-categorias");
  const totalProductos = document.getElementById("total-productos");
  const totalPedidos = document.getElementById("total-pedidos");
  const productosDisponibles = document.getElementById("productos-disponibles");

  if (
    !totalCategorias ||
    !totalProductos ||
    !totalPedidos ||
    !productosDisponibles
  ) {
    return;
  }

  const totalCategoriasValue = categorias.length;
  const totalProductosValue = productos.length;
  const totalPedidosValue = pedidos.length;

  const productosDisponiblesValue = productos.filter(
    (producto) => producto.disponible === true && producto.eliminado !== true
  ).length;

  totalCategorias.textContent = String(totalCategoriasValue);
  totalProductos.textContent = String(totalProductosValue);
  totalPedidos.textContent = String(totalPedidosValue);
  productosDisponibles.textContent = String(productosDisponiblesValue);
}

function renderResumen(
  categorias: category[],
  productos: product[],
  pedidos: Pedido[]
): void {
  const resumen = document.getElementById("resumen-contenido");

  if (!resumen) return;

  const categoriasActivas = categorias.length;

  const productosActivos = productos.filter(
    (producto) => producto.disponible === true && producto.eliminado !== true
  ).length;

  const productosInactivos = productos.filter(
    (producto) => producto.disponible === false || producto.eliminado === true
  ).length;

  const pedidosPorEstado = contarPedidosPorEstado(pedidos);

  const pedidosEstadoHtml = Object.entries(pedidosPorEstado)
    .map(([estado, cantidad]) => `<li><strong>${estado}:</strong> ${cantidad}</li>`)
    .join("");

  resumen.innerHTML = `
    <div class="resumen-grid">
      <div class="resumen-item">
        <h4>Categorías activas</h4>
        <p>${categoriasActivas}</p>
      </div>

      <div class="resumen-item">
        <h4>Productos</h4>
        <p><strong>Activos:</strong> ${productosActivos}</p>
        <p><strong>Inactivos:</strong> ${productosInactivos}</p>
      </div>

      <div class="resumen-item">
        <h4>Pedidos por estado</h4>
        <ul>
          ${pedidosEstadoHtml || "<li>Sin pedidos</li>"}
        </ul>
      </div>
    </div>
  `;
}

async function initAdminHome(): Promise<void> {
  authGuard();
  renderNombreAdmin();

  try {
    const [categorias, productos, pedidos] = await Promise.all([
      fetchCategorias(),
      fetchProductos(),
      obtenerTodosLosPedidos()
    ]);

    renderCards(categorias, productos, pedidos);
    renderResumen(categorias, productos, pedidos);
  } catch (error) {
    console.error("Error al cargar el dashboard admin:", error);

    const resumen = document.getElementById("resumen-contenido");
    if (resumen) {
      resumen.innerHTML = "<p>Ocurrió un error al cargar las estadísticas.</p>";
    }
  }
}

const logoutButton = document.getElementById("logoutButton") as HTMLButtonElement | null;

logoutButton?.addEventListener("click", () => {
  logout();
});

initAdminHome();
