import { logout, getAuthUser } from "../../../utils/auth";
import { authGuard } from "../../../main";
import { obtenerTodosLosPedidos } from "../../../utils/order";
import type { Pedido, PedidoEstado } from "../../../types/order";

interface UsuarioJson {
  id: number;
  nombre: string;
  apellido: string;
  mail: string;
  celular: string;
  rol: string;
}

let pedidos: Pedido[] = [];
let usuarios: UsuarioJson[] = [];
let estadoSeleccionado: string = "TODOS";
let pedidoSeleccionadoId: number | null = null;

const estadosPedido: PedidoEstado[] = [
  "PENDIENTE",
  "CONFIRMADO",
  "TERMINADO",
  "CANCELADO",
];

async function fetchUsuarios(): Promise<UsuarioJson[]> {
  const response = await fetch("/data/usuarios.json");

  if (!response.ok) {
    throw new Error("No se pudieron cargar los usuarios");
  }

  return await response.json();
}

function renderNombreAdmin(): void {
  const adminName = document.getElementById("admin-name");
  const authUser = getAuthUser();

  if (!adminName || !authUser) return;

  adminName.textContent = authUser.mail ?? "Admin";
}

function getClienteNombre(pedido: Pedido): string {
  const usuarioEncontrado = usuarios.find(
    (usuario) => usuario.id === pedido.usuarioDto.id
  );

  if (usuarioEncontrado) {
    return `${usuarioEncontrado.nombre} ${usuarioEncontrado.apellido}`;
  }

  return `${pedido.usuarioDto.nombre} ${pedido.usuarioDto.apellido}`;
}

function getEstadoClass(estado: PedidoEstado): string {
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

function ordenarPedidosPorFechaDesc(pedidosAOrdenar: Pedido[]): Pedido[] {
  return [...pedidosAOrdenar].sort((a, b) => {
    const fechaA = new Date(a.fecha).getTime();
    const fechaB = new Date(b.fecha).getTime();

    return fechaB - fechaA;
  });
}

function filtrarPedidos(): Pedido[] {
  let resultado = [...pedidos];

  if (estadoSeleccionado !== "TODOS") {
    resultado = resultado.filter(
      (pedido) => pedido.estado === estadoSeleccionado
    );
  }

  return ordenarPedidosPorFechaDesc(resultado);
}

function getCantidadProductos(pedido: Pedido): number {
  return pedido.detalles.reduce(
    (acc, detalle) => acc + detalle.cantidad,
    0
  );
}

function renderPedidos(): void {
  const contenedor = document.getElementById("admin-orders-container");
  const emptyMessage = document.getElementById("admin-orders-empty");

  if (!contenedor || !emptyMessage) return;

  const pedidosFiltrados = filtrarPedidos();

  contenedor.innerHTML = "";

  if (pedidosFiltrados.length === 0) {
    emptyMessage.style.display = "block";
    return;
  }

  emptyMessage.style.display = "none";

  pedidosFiltrados.forEach((pedido) => {
    const card = document.createElement("article");
    card.classList.add("admin-order-card");
    card.style.cursor = "pointer";

    card.innerHTML = `
      <div class="admin-order-card-header">
        <h3>Pedido #${pedido.id}</h3>
        <span class="badge-estado ${getEstadoClass(pedido.estado)}">
          ${pedido.estado}
        </span>
      </div>

      <p><strong>Cliente:</strong> ${getClienteNombre(pedido)}</p>
      <p><strong>Fecha:</strong> ${pedido.fecha}</p>
      <p><strong>Productos:</strong> ${getCantidadProductos(pedido)}</p>
      <p><strong>Total:</strong> $${pedido.total}</p>
    `;

    card.addEventListener("click", () => {
      abrirModalPedido(pedido.id);
    });

    contenedor.appendChild(card);
  });
}

function abrirModalPedido(id: number): void {
  const pedido = pedidos.find((pedido) => pedido.id === id);

  if (!pedido) return;

  pedidoSeleccionadoId = id;

  const modal = document.getElementById("admin-order-modal");
  const modalTitle = document.getElementById("admin-order-modal-title");
  const modalBody = document.getElementById("admin-order-modal-body");

  if (!modal || !modalTitle || !modalBody) return;

  modalTitle.textContent = `Detalle del Pedido #${pedido.id}`;

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

  const optionsEstados = estadosPedido
    .map(
      (estado) => `
        <option value="${estado}" ${pedido.estado === estado ? "selected" : ""}>
          ${estado}
        </option>
      `
    )
    .join("");

  modalBody.innerHTML = `
    <div class="admin-order-detail">
      <p>
        <strong>Estado actual:</strong>
        <span class="badge-estado ${getEstadoClass(pedido.estado)}">
          ${pedido.estado}
        </span>
      </p>

      <p><strong>Cliente:</strong> ${getClienteNombre(pedido)}</p>
      <p><strong>Mail:</strong> ${pedido.usuarioDto.mail}</p>
      <p><strong>Celular:</strong> ${pedido.usuarioDto.celular}</p>
      <p><strong>Fecha:</strong> ${pedido.fecha}</p>
      <p><strong>Forma de pago:</strong> ${pedido.formaPago}</p>

      <div class="form-group">
        <label for="admin-order-status">Cambiar estado</label>
        <select id="admin-order-status">
          ${optionsEstados}
        </select>
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

      <div class="admin-modal-actions">
        <button id="btn-update-order-status" class="btn-update-order">
          Guardar Estado
        </button>

        <button id="btn-delete-order" class="btn-delete-order">
          Eliminar Pedido
        </button>
      </div>
    </div>
  `;

  modal.style.display = "flex";

  const btnUpdate = document.getElementById(
    "btn-update-order-status"
  ) as HTMLButtonElement | null;

  const btnDelete = document.getElementById(
    "btn-delete-order"
  ) as HTMLButtonElement | null;

  btnUpdate?.addEventListener("click", actualizarEstadoPedido);
  btnDelete?.addEventListener("click", eliminarPedidoSeleccionado);
}

function cerrarModalPedido(): void {
  const modal = document.getElementById("admin-order-modal");

  if (!modal) return;

  modal.style.display = "none";
  pedidoSeleccionadoId = null;
}

function actualizarEstadoPedido(): void {
  if (pedidoSeleccionadoId === null) return;

  const selectEstado = document.getElementById(
    "admin-order-status"
  ) as HTMLSelectElement | null;

  if (!selectEstado) return;

  const nuevoEstado = selectEstado.value as PedidoEstado;

  pedidos = pedidos.map((pedido) => {
    if (pedido.id === pedidoSeleccionadoId) {
      return {
        ...pedido,
        estado: nuevoEstado,
      };
    }

    return pedido;
  });

  renderPedidos();
  cerrarModalPedido();
}

function eliminarPedidoSeleccionado(): void {
  if (pedidoSeleccionadoId === null) return;

  const pedido = pedidos.find((pedido) => pedido.id === pedidoSeleccionadoId);

  if (!pedido) return;

  const confirmar = confirm(
    `¿Seguro que querés eliminar el pedido #${pedido.id}?`
  );

  if (!confirmar) return;

  pedidos = pedidos.filter((pedido) => pedido.id !== pedidoSeleccionadoId);

  renderPedidos();
  cerrarModalPedido();
}

function configurarFiltroEstado(): void {
  const selectEstado = document.getElementById(
    "filter-order-status"
  ) as HTMLSelectElement | null;

  if (!selectEstado) return;

  selectEstado.addEventListener("change", () => {
    estadoSeleccionado = selectEstado.value;
    renderPedidos();
  });
}

function configurarModal(): void {
  const modal = document.getElementById("admin-order-modal");
  const btnClose = document.getElementById("btn-close-order-modal");

  btnClose?.addEventListener("click", cerrarModalPedido);

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      cerrarModalPedido();
    }
  });
}

async function initAdminOrders(): Promise<void> {
  authGuard();
  renderNombreAdmin();
  configurarFiltroEstado();
  configurarModal();

  try {
    const [pedidosData, usuariosData] = await Promise.all([
      obtenerTodosLosPedidos(),
      fetchUsuarios(),
    ]);

    pedidos = ordenarPedidosPorFechaDesc(pedidosData);
    usuarios = usuariosData;

    renderPedidos();
  } catch (error) {
    console.error("Error al cargar pedidos admin:", error);

    const contenedor = document.getElementById("admin-orders-container");

    if (contenedor) {
      contenedor.innerHTML = "<p>No se pudieron cargar los pedidos.</p>";
    }
  }
}

const logoutButton = document.getElementById(
  "logoutButton"
) as HTMLButtonElement | null;

logoutButton?.addEventListener("click", () => {
  logout();
});

initAdminOrders();