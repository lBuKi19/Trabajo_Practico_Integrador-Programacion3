import { authGuard } from "../../../main";
import { logout, getAuthUser } from "../../../utils/auth";
import { actualizarBadgeCarrito } from "../../../utils/cart";
import { obtenerTodosLosPedidos } from "../../../utils/order";
import type { Pedido, DetallePedido } from "../../../types/order";


let pedidosDelUsuario: Pedido[] = [];
let estadoSeleccionado: string = "TODOS";

function filtrarPedidosPorEstado(): Pedido[] {
  if (estadoSeleccionado === "TODOS") {
    return pedidosDelUsuario;
  }

  return pedidosDelUsuario.filter(
    (pedido) => pedido.estado === estadoSeleccionado
  );
}

function configurarFiltroEstado(): void {
  const selectFiltro = document.getElementById(
    "filtro-estado-pedidos"
  ) as HTMLSelectElement | null;

  if (!selectFiltro) return;

  selectFiltro.addEventListener("change", () => {
    estadoSeleccionado = selectFiltro.value;

    const pedidosFiltrados = filtrarPedidosPorEstado();

    renderPedidos(pedidosFiltrados);
  });
}

function getEstadoClass(estado: Pedido["estado"]): string {
  switch (estado) {
    case "PENDIENTE":
      return "estado-pendiente";
    case "CONFIRMADO":
      return "estado-confirmado";
    case "TERMINADO":
      return "estado-terminado";
    case "CANCELADO":
      return "estado-cancelado";
    default:
      return "";
  }
}

function getResumenProductos(detalles: DetallePedido[]): string {
  return detalles
    .slice(0, 3)
    .map((detalle) => `${detalle.producto.nombre} x${detalle.cantidad}`)
    .join(", ");
}

function renderEstadoVacio(): void {
  const contenedor = document.getElementById("contenedor-pedidos");
  const mensajeSinPedidos = document.getElementById("mensaje-sin-pedidos");

  if (!contenedor || !mensajeSinPedidos) return;

  contenedor.innerHTML = "";
  mensajeSinPedidos.style.display = "block";
}

function renderPedidos(pedidos: Pedido[]): void {
  const contenedor = document.getElementById("contenedor-pedidos");
  const mensajeSinPedidos = document.getElementById("mensaje-sin-pedidos");

  if (!contenedor || !mensajeSinPedidos) return;

  contenedor.innerHTML = "";

  if (pedidos.length === 0) {
    renderEstadoVacio();
    return;
  }

  mensajeSinPedidos.style.display = "none";

  pedidos.forEach((pedido) => {
    const tarjeta = document.createElement("article");
    tarjeta.classList.add("pedido-card");
    tarjeta.style.cursor = "pointer";

    tarjeta.innerHTML = `
      <div class="pedido-card-header">
        <h3>Pedido #${pedido.id}</h3>
        <span class="badge-estado ${getEstadoClass(pedido.estado)}">
          ${pedido.estado}
        </span>
      </div>

      <p><strong>Fecha:</strong> ${pedido.fecha}</p>
      <p><strong>Resumen:</strong> ${getResumenProductos(pedido.detalles)}</p>
      <p><strong>Total:</strong> $${pedido.total}</p>
    `;

    tarjeta.addEventListener("click", () => {
      abrirModalPedido(pedido);
    });

    contenedor.appendChild(tarjeta);
  });
}

function abrirModalPedido(pedido: Pedido): void {
  const modal = document.getElementById("pedido-modal");
  const modalContent = document.getElementById("pedido-modal-content");

  if (!modal || !modalContent) return;

  const productosHtml = pedido.detalles
    .map(
      (detalle) => `
        <li class="detalle-item">
          <p><strong>${detalle.producto.nombre}</strong></p>
          <p>Cantidad: ${detalle.cantidad}</p>
          <p>Precio unitario: $${detalle.producto.precio}</p>
          <p>Subtotal: $${detalle.subtotal}</p>
        </li>
      `
    )
    .join("");

  const subtotal = pedido.detalles.reduce(
    (acc, detalle) => acc + detalle.subtotal,
    0
  );

  const envio = pedido.total - subtotal;

  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>Detalle del Pedido #${pedido.id}</h2>
      <button id="cerrar-modal" class="cerrar-modal">X</button>
    </div>

    <div class="modal-body">
      <p>
        <strong>Estado:</strong>
        <span class="badge-estado ${getEstadoClass(pedido.estado)}">
          ${pedido.estado}
        </span>
      </p>

      <p><strong>Fecha:</strong> ${pedido.fecha}</p>
      <p><strong>Forma de pago:</strong> ${pedido.formaPago}</p>

      <div class="detalle-entrega">
        <h3>Información del cliente</h3>
        <p><strong>Cliente:</strong> ${pedido.usuarioDto.nombre} ${pedido.usuarioDto.apellido}</p>
        <p><strong>Mail:</strong> ${pedido.usuarioDto.mail}</p>
        <p><strong>Celular:</strong> ${pedido.usuarioDto.celular}</p>
      </div>

      <div class="detalle-productos">
        <h3>Productos</h3>
        <ul>
          ${productosHtml}
        </ul>
      </div>

      <div class="detalle-costos">
        <h3>Desglose de costos</h3>
        <p><strong>Subtotal:</strong> $${subtotal}</p>
        <p><strong>Envío:</strong> $${envio}</p>
        <p><strong>Total:</strong> $${pedido.total}</p>
      </div>
    </div>
  `;

  modal.style.display = "flex";

  const btnCerrar = document.getElementById("cerrar-modal") as HTMLButtonElement | null;
  btnCerrar?.addEventListener("click", cerrarModalPedido);
}

function cerrarModalPedido(): void {
  const modal = document.getElementById("pedido-modal");

  if (!modal) return;

  modal.style.display = "none";
}

function configurarEventosModal(): void {
  const modal = document.getElementById("pedido-modal");

  if (!modal) return;

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      cerrarModalPedido();
    }
  });
}

async function initOrders(): Promise<void> {
  authGuard();
  actualizarBadgeCarrito();
  configurarEventosModal();
  configurarFiltroEstado();

  try {
    const authUser = getAuthUser();

    if (!authUser) {
      throw new Error("No hay usuario autenticado");
    }

    const pedidos = await obtenerTodosLosPedidos();

    pedidosDelUsuario = pedidos.filter(
      (pedido) => pedido.usuarioDto.id === authUser.id
    );

    renderPedidos(filtrarPedidosPorEstado());
  } catch (error) {
    console.error("Error al cargar pedidos:", error);

    const contenedor = document.getElementById("contenedor-pedidos");

    if (contenedor) {
      contenedor.innerHTML = `<p>Ocurrió un error al cargar tus pedidos.</p>`;
    }
  }
}

const buttonLogout = document.getElementById("logoutButton") as HTMLButtonElement | null;

buttonLogout?.addEventListener("click", () => {
  logout();
});

initOrders();
