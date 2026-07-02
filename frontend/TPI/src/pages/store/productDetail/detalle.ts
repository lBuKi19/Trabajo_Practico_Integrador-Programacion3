import { logout } from "../../../utils/auth";
import { authGuard } from "../../../main";
import type { product } from "../../../types/product";
import { agregarCarrito, actualizarBadgeCarrito } from "../../../utils/cart";
import { navigate } from "../../../utils/navigate";
import { fetchProductos } from "../../../utils/products";


let cantidadSeleccionada = 1;

// Obtener id desde url
function getProductIdFromUrl(): number | null {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return null;

  const parsedId = Number(id);

  if (isNaN(parsedId)) return null;

  return parsedId;
}

// Render de producto
function renderProductoDetalle(producto: product): void {
  const contenedor = document.getElementById("detalle-producto");
  cantidadSeleccionada = 1;

  if (!contenedor) return;

  contenedor.innerHTML = `
    
      <section class="detalle-card">
       
          <img class="imagen-detalle" src="${producto.imagen}" alt="${producto.nombre}">
        

        <div class="detalle-info">
          <p class="detalle-categoria">${producto.categoria.nombre}</p>
          <h3 class="detalle-nombre">${producto.nombre}</h3>
          <p class="detalle-descripcion">${producto.descripcion}</p>

          <p class="detalle-precio">$${producto.precio}</p>

          <span class="badge-disponibilidad ${producto.disponible ? "disponible" : "no-disponible"}">
            ${producto.disponible ? `Disponible (Stock: ${producto.stock})` : "No disponible"}
          </span>

          <div class="detalle-cantidad">
            <label>Cantidad:</label>

            <div class="cantidad-control">
              <button id="btn-restar-detalle" type="button">-</button>
              <input id="cantidad-detalle" type="number" value="1" min="1" readonly />
              <button id="btn-sumar-detalle" type="button">+</button>
            </div>
          </div>

          <div class="detalle-acciones">
            <button id="btn-agregar-detalle" ${!producto.disponible ? "disabled" : ""}>
              AGREGAR AL CARRITO
            </button>

            <button id="btn-volver-home">
              VOLVER
            </button>
          </div>
        </div>
      </section>
    
    
  
  `;

  const botonAgregar = document.getElementById("btn-agregar-detalle") as HTMLButtonElement | null;
  const botonVolver = document.getElementById("btn-volver-home") as HTMLButtonElement | null;
  const btnRestar = document.getElementById("btn-restar-detalle") as HTMLButtonElement | null;
  const btnSumar = document.getElementById("btn-sumar-detalle") as HTMLButtonElement | null;
  const inputCantidad = document.getElementById("cantidad-detalle") as HTMLInputElement | null;

  btnRestar?.addEventListener("click", () => {
    if (cantidadSeleccionada > 1) {
      cantidadSeleccionada--;
    }

    if (inputCantidad) {
      inputCantidad.value = String(cantidadSeleccionada);
    }
  });

  btnSumar?.addEventListener("click", () => {

    if (cantidadSeleccionada < producto.stock) {
        cantidadSeleccionada++;
      }

    if (inputCantidad) {
      inputCantidad.value = String(cantidadSeleccionada);
    }
  });

  botonAgregar?.addEventListener("click", () => {
  if (!producto.disponible) {
    alert("Este producto no está disponible");
    return;
  }

  if (producto.stock <= 0) {
    alert("No hay stock disponible");
    return;
  }

  if (cantidadSeleccionada > producto.stock) {
    alert("La cantidad seleccionada supera el stock disponible");
    return;
  }

  agregarCarrito(
    producto.id,
    producto.nombre,
    producto.descripcion,
    producto.imagen,
    producto.precio,
    cantidadSeleccionada
  );

  actualizarBadgeCarrito();
  });


  botonVolver?.addEventListener("click", () => {
    navigate("/src/pages/store/home/home.html");
  });


}


// MANEJO DE ERRORES
function renderMensajeError(mensaje: string): void {
  const contenedor = document.getElementById("detalle-producto");

  if (!contenedor) return;

  contenedor.innerHTML = `
    <section class="detalle-error">
      <h2>${mensaje}</h2>
      <button id="btn-volver-home">Volver al Home</button>
    </section>
  `;

  const botonVolver = document.getElementById("btn-volver-home") as HTMLButtonElement | null;

  botonVolver?.addEventListener("click", () => {
    navigate("/src/pages/store/home/home.html");
  });
}


// Inicar detalle
async function initProductDetail(): Promise<void> {
  authGuard();
  actualizarBadgeCarrito();

  try {
    const productId = getProductIdFromUrl();

    if (productId === null) {
      renderMensajeError("No se encontró el ID del producto.");
      return;
    }

    const productos = await fetchProductos();

    const productoEncontrado = productos.find(
      (producto) => producto.id === productId
    );

    if (!productoEncontrado) {
      renderMensajeError("Producto no encontrado.");
      return;
    }

    // Si en algún momento aparece eliminado:true, lo bloquea
    if (productoEncontrado.eliminado === true) {
      renderMensajeError("Este producto no está disponible.");
      return;
    }

    renderProductoDetalle(productoEncontrado);
  } catch (error) {
    console.error("Error al cargar detalle:", error);
    renderMensajeError("Ocurrió un error al cargar el detalle del producto.");
  }
}


const buttonLogout = document.getElementById("logoutButton") as HTMLButtonElement | null;

buttonLogout?.addEventListener("click", () => {
  logout();
});

initProductDetail();