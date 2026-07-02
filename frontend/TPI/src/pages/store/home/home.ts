import { logout } from "../../../utils/auth";
import { authGuard } from "../../../main";
import type { product } from "../../../types/product";
import type { category } from "../../../types/category";
import { agregarCarrito, actualizarBadgeCarrito } from "../../../utils/cart";
import { navigate } from "../../../utils/navigate";
import { fetchProductos } from "../../../utils/products";
import { fetchCategorias } from "../../../utils/categories";

let categorias: category[] = [];
let productosOriginales: product[] = [];

let categoriaSeleccionada: string = "Todas";
let textoBusqueda: string = "";
let ordenActual: string = "default";


// Carga dinamica de categorias
function cargarCategorias(): void {
  const listaCategorias = document.getElementById("lista-categorias");

  if (!listaCategorias) return;

  listaCategorias.innerHTML = "";

  const liTodos = document.createElement("li");
  const aTodos = document.createElement("a");

  aTodos.textContent = "Todas";
  aTodos.href = "#";

  aTodos.addEventListener("click", (e) => {
    e.preventDefault();
    categoriaSeleccionada = "Todas";
    aplicarFiltrosYOrden();
  });

  liTodos.appendChild(aTodos);
  listaCategorias.appendChild(liTodos);

  categorias.forEach((categoria) => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.textContent = categoria.nombre;
    a.href = "#";

    a.addEventListener("click", (e) => {
      e.preventDefault();
      categoriaSeleccionada = categoria.nombre;
      aplicarFiltrosYOrden();
    });

    li.appendChild(a);
    listaCategorias.appendChild(li);
  });
}


// Carga dinamica de productos
function cargarProductos(productos: product[]): void {
  const contenedor = document.getElementById("contenedor-productos");
  const mensajeNoResultados = document.getElementById("mensaje-no-resultados");

  if (!contenedor) return;

  contenedor.innerHTML = "";

  if (productos.length === 0) {
    if (mensajeNoResultados) {
      mensajeNoResultados.style.display = "block";
    }
    return;
  }

  if (mensajeNoResultados) {
    mensajeNoResultados.style.display = "none";
  }

  productos.forEach((producto) => {
    const article = document.createElement("article");
    article.classList.add("producto");
    article.style.cursor = "pointer";

    article.innerHTML = `
      <div class="producto-img-container">
        <img src="${producto.imagen}" alt="${producto.nombre}">
        
      </div>

      <h6>${producto.categoria.nombre}</h6>
      <h4>${producto.nombre}</h4>
      <p class="producto-descripcion">${producto.descripcion}</p>

      <div class="precio-boton">
        <span class="precio">$${producto.precio}</span>
        <button class="btn-agregar">AGREGAR</button>
      </div>
    `;

    // detalle del producto
    article.addEventListener("click", () => {
      navigate(`/src/pages/store/productDetail/detalle.html?id=${producto.id}`);
    });

    
    const boton = article.querySelector<HTMLButtonElement>(".btn-agregar");

    if (boton) {
      boton.addEventListener("click", (e) => {
        e.stopPropagation();

        agregarCarrito(
          producto.id,
          producto.nombre,
          producto.descripcion,
          producto.imagen,
          producto.precio
        );

        actualizarBadgeCarrito();
      });
    }

    contenedor.appendChild(article);
  });
}


// FILTROS + BÚSQUEDA + ORDENAMIENTO
function aplicarFiltrosYOrden(): void {
  let productosFiltrados = [...productosOriginales];

  // Filtrar por categoría
  if (categoriaSeleccionada !== "Todas") {
    productosFiltrados = productosFiltrados.filter(
      (producto) =>
        producto.categoria.nombre.toLowerCase() === categoriaSeleccionada.toLowerCase()
    );
  }

  // Búsqueda por nombre
  if (textoBusqueda) {
    productosFiltrados = productosFiltrados.filter((producto) =>
      producto.nombre.toLowerCase().includes(textoBusqueda.toLowerCase())
    );
  }

  // Ordenamiento
  switch (ordenActual) {
    case "nombre-asc":
      productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
      break;

    case "nombre-desc":
      productosFiltrados.sort((a, b) => b.nombre.localeCompare(a.nombre));
      break;

    case "precio-asc":
      productosFiltrados.sort((a, b) => a.precio - b.precio);
      break;

    case "precio-desc":
      productosFiltrados.sort((a, b) => b.precio - a.precio);
      break;
  }

  cargarProductos(productosFiltrados);
}


// BÚSQUEDA
function buscadorProductos(): void {
  const inputBuscador = document.getElementById("buscador") as HTMLInputElement;
  const formBusqueda = document.querySelector(".busqueda_productos") as HTMLFormElement;

  if (!inputBuscador) return;

  inputBuscador.addEventListener("input", () => {
    textoBusqueda = inputBuscador.value.trim();
    aplicarFiltrosYOrden();
  });

  // Evita recarga si dejás el botón BUSCAR
  formBusqueda?.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}


// Ordenamiento
function configurarOrdenamiento(): void {
  const selectOrden = document.getElementById("orden-productos") as HTMLSelectElement;

  if (!selectOrden) return;

  selectOrden.addEventListener("change", () => {
    ordenActual = selectOrden.value;
    aplicarFiltrosYOrden();
  });
}

// Iniciar home
async function initHome(): Promise<void> {
  authGuard();

  try {
    const [categoriasData, productosData] = await Promise.all([
      fetchCategorias(),
      fetchProductos(),
    ]);

    categorias = categoriasData;

    // Solo mostrar disponibles y no eliminados
    productosOriginales = productosData.filter(
      (producto) =>
        producto.disponible === true && producto.eliminado !== true
    );

    cargarCategorias();
    aplicarFiltrosYOrden();
    buscadorProductos();
    configurarOrdenamiento();
    actualizarBadgeCarrito();
  } catch (error) {
    console.error("Error al cargar home:", error);

    const contenedor = document.getElementById("contenedor-productos");
    if (contenedor) {
      contenedor.innerHTML = "<p>Error al cargar productos y categorías.</p>";
    }
  }
}


// LOGOUT
const buttonLogout = document.getElementById("logoutButton") as HTMLButtonElement;

buttonLogout?.addEventListener("click", () => {
  logout();
});

initHome();