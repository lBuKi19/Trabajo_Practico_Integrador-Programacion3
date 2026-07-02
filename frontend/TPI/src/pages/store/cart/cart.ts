import {
  obtenerCarrito,
  actualizarBadgeCarrito,
  vaciarCarrito,
  incrementarCantidad,
  decrementarCantidad,
  eliminarProductoCarrito,
} from "../../../utils/cart";
import { crearPedidoDesdeCarrito } from "../../../utils/order";
import { navigate } from "../../../utils/navigate";
import { logout } from "../../../utils/auth";

function calcularResumenCarrito() {
  const carrito = obtenerCarrito();

  const subtotal = carrito.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  const envio = carrito.length > 0 ? 500 : 0;
  const total = subtotal + envio;

  return {
    subtotal,
    envio,
    total,
  };
}

function renderizarCarrito(): void {
  const carrito = obtenerCarrito();

  const contenedor = document.getElementById("carrito");
  const totalElemento = document.getElementById("total-carrito");
  const envioElemento = document.getElementById("envio");
  const subtotalElemento = document.getElementById("subtotal");
  const resumenPedido = document.querySelector(".resumen-pedido") as HTMLElement | null;
  const btnCheckout = document.getElementById("checkout") as HTMLButtonElement | null;
  const btnVaciar = document.getElementById("vaciar-carrito") as HTMLButtonElement | null;

  if (
    !contenedor ||
    !totalElemento ||
    !envioElemento ||
    !subtotalElemento ||
    !resumenPedido
  ) {
    return;
  }

  if (carrito.length === 0) {
    contenedor.innerHTML = `
      <div class="carrito-vacio-card">
        <p id="carrito-vacio">Tu carrito está vacío</p>
        <a href="/src/pages/store/home/home.html" class="btn-volver-tienda">
          Volver a la tienda
        </a>
      </div>
    `;

    resumenPedido.style.display = "block";

    subtotalElemento.textContent = "$0";
    envioElemento.textContent = "$0";
    totalElemento.textContent = "Total: $0";

    if (btnCheckout) {
      btnCheckout.disabled = true;
      btnCheckout.classList.add("btn-disabled");
    }

    if (btnVaciar) {
      btnVaciar.disabled = true;
      btnVaciar.classList.add("btn-disabled");
    }

    return;
  }

  if (btnCheckout) {
    btnCheckout.disabled = false;
    btnCheckout.classList.remove("btn-disabled");
  }

  if (btnVaciar) {
    btnVaciar.disabled = false;
    btnVaciar.classList.remove("btn-disabled");
  }

  resumenPedido.style.display = "block";
  contenedor.innerHTML = "";

  carrito.forEach((item) => {
    contenedor.innerHTML += `
      <div class="producto-carrito">
        <div class="imagen-item">
          <img class="imagen-carrito" src="${item.imagen}" alt="${item.nombre}">
        </div>

        <div class="item">
          <h5>${item.nombre}</h5>
          <p class="item-descripcion">${item.descripcion}</p>
          <p class="item-precio">$${item.precio} c/u</p>
        </div>

        <div class="item-subtotal">
          <p>$${item.precio * item.cantidad}</p>
        </div>

        <div class="item-cantidad">
          <button type="button" class="btn-restar-carrito" data-id="${item.id}">-</button>
          <span>${item.cantidad}</span>
          <button type="button" class="btn-sumar-carrito" data-id="${item.id}">+</button>
        </div>

        <button type="button" class="btn-eliminar-carrito" data-id="${item.id}">
          🗑️
        </button>
      </div>
    `;
  });

  const resumen = calcularResumenCarrito();

  envioElemento.textContent = `$${resumen.envio}`;
  subtotalElemento.textContent = `$${resumen.subtotal}`;
  totalElemento.textContent = `Total: $${resumen.total}`;

  configurarBotonesCantidadCarrito();
}

function calcularTotalCarrito(): number {
  return calcularResumenCarrito().total;
}

function configurarBotonesCantidadCarrito(): void {
  const botonesSumar = document.querySelectorAll<HTMLButtonElement>(
    ".btn-sumar-carrito"
  );

  const botonesRestar = document.querySelectorAll<HTMLButtonElement>(
    ".btn-restar-carrito"
  );

  const botonesEliminar = document.querySelectorAll<HTMLButtonElement>(
    ".btn-eliminar-carrito"
  );

  botonesSumar.forEach((boton) => {
    boton.addEventListener("click", () => {
      const id = Number(boton.dataset.id);

      incrementarCantidad(id);
      renderizarCarrito();
      actualizarBadgeCarrito();
    });
  });

  botonesRestar.forEach((boton) => {
    boton.addEventListener("click", () => {
      const id = Number(boton.dataset.id);

      decrementarCantidad(id);
      renderizarCarrito();
      actualizarBadgeCarrito();
    });
  });

  botonesEliminar.forEach((boton) => {
    boton.addEventListener("click", () => {
      const id = Number(boton.dataset.id);

      eliminarProductoCarrito(id);
      renderizarCarrito();
      actualizarBadgeCarrito();
    });
  });
}


function abrirModalCheckout(): void {
  const modal = document.getElementById("checkout-modal");
  const checkoutTotal = document.getElementById("checkout-total");

  if (!modal || !checkoutTotal) return;

  checkoutTotal.textContent = `$${calcularTotalCarrito()}`;
  modal.style.display = "flex";
}

function cerrarModalCheckout(): void {
  const modal = document.getElementById("checkout-modal");
  const form = document.getElementById("checkout-form") as HTMLFormElement | null;

  if (!modal) return;

  modal.style.display = "none";
  form?.reset();
}

function configurarCheckout(): void {
  const btnCheckout = document.getElementById("checkout") as HTMLButtonElement | null;
  const btnCloseModal = document.getElementById("close-checkout-modal") as HTMLButtonElement | null;
  const modal = document.getElementById("checkout-modal");
  const form = document.getElementById("checkout-form") as HTMLFormElement | null;

  btnCheckout?.addEventListener("click", () => {
    const carrito = obtenerCarrito();

    if (carrito.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    abrirModalCheckout();
  });

  btnCloseModal?.addEventListener("click", cerrarModalCheckout);

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      cerrarModalCheckout();
    }
  });

  form?.addEventListener("submit", confirmarPedido);

}

async function confirmarPedido(event: SubmitEvent): Promise<void> {
  event.preventDefault();

  const inputTelefono = document.getElementById("checkout-phone") as HTMLInputElement;
  const inputDireccion = document.getElementById("checkout-address") as HTMLTextAreaElement;
  const selectPago = document.getElementById("checkout-payment") as HTMLSelectElement;
  const inputNotas = document.getElementById("checkout-notes") as HTMLTextAreaElement;

  const telefono = inputTelefono.value.trim();
  const direccion = inputDireccion.value.trim();
  const formaPago = selectPago.value;
  const notas = inputNotas.value.trim();

  if (!telefono || !direccion || !formaPago) {
    alert("Teléfono, dirección y método de pago son obligatorios");
    return;
  }

  try {
    await crearPedidoDesdeCarrito({
      telefono,
      direccion,
      formaPago,
      notas,
    });

    alert("Pedido realizado correctamente");

    cerrarModalCheckout();
    actualizarBadgeCarrito();

    navigate("/src/pages/client/orders/pedidos.html");
  } catch (error) {
    console.error("Error al confirmar pedido:", error);

    if (error instanceof Error) {
      alert(error.message);
    } else {
      alert("Ocurrió un error al confirmar el pedido");
    }
  }
}

function configurarVaciarCarrito(): void {
  const btnVaciar = document.getElementById("vaciar-carrito") as HTMLButtonElement | null;

  btnVaciar?.addEventListener("click", () => {
    const carrito = obtenerCarrito();

    if (carrito.length === 0) {
      alert("El carrito ya está vacío");
      return;
    }

    const confirmar = confirm("¿Seguro que querés vaciar el carrito?");

    if (!confirmar) return;

    vaciarCarrito();
    renderizarCarrito();
    actualizarBadgeCarrito();

    alert("Carrito vaciado correctamente");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderizarCarrito();
  configurarCheckout();
  configurarVaciarCarrito();
  actualizarBadgeCarrito();
});

const buttonLogout = document.getElementById("logoutButton") as HTMLButtonElement;

buttonLogout?.addEventListener("click", () => {
  logout();
});