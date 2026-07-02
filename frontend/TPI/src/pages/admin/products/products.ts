import { logout, getAuthUser } from "../../../utils/auth";
import { authGuard } from "../../../main";
import type { product } from "../../../types/product";
import type { category } from "../../../types/category";
import { fetchProductos } from "../../../utils/products";
import { fetchCategorias } from "../../../utils/categories";

let productos: product[] = [];
let categorias: category[] = [];
let editingProductId: number | null = null;



function renderNombreAdmin(): void {
  const adminName = document.getElementById("admin-name");
  const authUser = getAuthUser();

  if (!adminName || !authUser) return;

  adminName.textContent = authUser.mail ?? "Admin";
}

function renderCategoriasSelect(): void {
  const select = document.getElementById("product-category") as HTMLSelectElement | null;

  if (!select) return;

  select.innerHTML = `<option value="">Seleccionar categoría</option>`;

  categorias.forEach((categoria) => {
    const option = document.createElement("option");

    option.value = String(categoria.id);
    option.textContent = categoria.nombre;

    select.appendChild(option);
  });
}

function renderProductos(): void {
  const tableBody = document.getElementById(
    "products-table-body"
  ) as HTMLTableSectionElement | null;

  if (!tableBody) return;

  tableBody.innerHTML = "";

  const productosVisibles = productos.filter(
    (producto) => producto.eliminado !== true
  );

  if (productosVisibles.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9">No hay productos cargados.</td>
      </tr>
    `;
    return;
  }

  productosVisibles.forEach((producto) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${producto.id}</td>

      <td>
        <img
          src="${producto.imagen}"
          alt="${producto.nombre}"
          class="product-thumbnail"
        />
      </td>

      <td>${producto.nombre}</td>
      <td>${producto.descripcion}</td>
      <td>$${producto.precio}</td>
      <td>${producto.categoria.nombre}</td>
      <td>${producto.stock}</td>

      <td>
        <span class="product-status ${producto.disponible ? "status-active" : "status-inactive"}">
          ${producto.disponible ? "Disponible" : "No disponible"}
        </span>
      </td>

      <td>
        <button class="btn-edit-product" data-id="${producto.id}">
          Editar
        </button>

        <button class="btn-delete-product" data-id="${producto.id}">
          Eliminar
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  configurarBotonesAcciones();
}

function configurarBotonesAcciones(): void {
  const editButtons = document.querySelectorAll<HTMLButtonElement>(
    ".btn-edit-product"
  );

  const deleteButtons = document.querySelectorAll<HTMLButtonElement>(
    ".btn-delete-product"
  );

  editButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      abrirModalEdicion(id);
    });
  });

  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      eliminarProducto(id);
    });
  });
}

function abrirModalCreacion(): void {
  editingProductId = null;

  const modal = document.getElementById("product-modal");
  const modalTitle = document.getElementById("product-modal-title");
  const form = document.getElementById("product-form") as HTMLFormElement | null;

  if (!modal || !modalTitle || !form) return;

  modalTitle.textContent = "Nuevo Producto";
  form.reset();

  modal.style.display = "flex";
}

function abrirModalEdicion(id: number): void {
  const producto = productos.find((prod) => prod.id === id);

  if (!producto) return;

  editingProductId = id;

  const modal = document.getElementById("product-modal");
  const modalTitle = document.getElementById("product-modal-title");

  const inputId = document.getElementById("product-id") as HTMLInputElement;
  const inputName = document.getElementById("product-name") as HTMLInputElement;
  const inputDescription = document.getElementById(
    "product-description"
  ) as HTMLTextAreaElement;
  const inputImage = document.getElementById("product-image") as HTMLInputElement;
  const inputPrice = document.getElementById("product-price") as HTMLInputElement;
  const inputStock = document.getElementById("product-stock") as HTMLInputElement;
  const selectCategory = document.getElementById("product-category") as HTMLSelectElement;
  const selectAvailable = document.getElementById("product-available") as HTMLSelectElement;

  if (
    !modal ||
    !modalTitle ||
    !inputId ||
    !inputName ||
    !inputDescription ||
    !inputImage ||
    !inputPrice ||
    !inputStock ||
    !selectCategory ||
    !selectAvailable
  ) {
    return;
  }

  modalTitle.textContent = "Editar Producto";

  inputId.value = String(producto.id);
  inputName.value = producto.nombre;
  inputDescription.value = producto.descripcion;
  inputImage.value = producto.imagen;
  inputPrice.value = String(producto.precio);
  inputStock.value = String(producto.stock);
  selectCategory.value = String(producto.categoria.id);
  selectAvailable.value = String(producto.disponible);

  modal.style.display = "flex";
}

function cerrarModalProducto(): void {
  const modal = document.getElementById("product-modal");
  const form = document.getElementById("product-form") as HTMLFormElement | null;

  if (!modal) return;

  modal.style.display = "none";
  form?.reset();
  editingProductId = null;
}

function generarNuevoId(): number {
  if (productos.length === 0) return 1;

  return Math.max(...productos.map((producto) => producto.id)) + 1;
}

function obtenerCategoriaPorId(id: number): category | undefined {
  return categorias.find((categoria) => categoria.id === id);
}

function guardarProducto(event: SubmitEvent): void {
  event.preventDefault();

  const inputName = document.getElementById("product-name") as HTMLInputElement;
  const inputDescription = document.getElementById(
    "product-description"
  ) as HTMLTextAreaElement;
  const inputImage = document.getElementById("product-image") as HTMLInputElement;
  const inputPrice = document.getElementById("product-price") as HTMLInputElement;
  const inputStock = document.getElementById("product-stock") as HTMLInputElement;
  const selectCategory = document.getElementById("product-category") as HTMLSelectElement;
  const selectAvailable = document.getElementById("product-available") as HTMLSelectElement;

  const nombre = inputName.value.trim();
  const descripcion = inputDescription.value.trim();
  const imagen = inputImage.value.trim();
  const precio = Number(inputPrice.value);
  const stock = Number(inputStock.value);
  const categoriaId = Number(selectCategory.value);
  const disponible = selectAvailable.value === "true";

  if (
    !nombre ||
    !descripcion ||
    !imagen ||
    !precio ||
    stock < 0 ||
    !categoriaId
  ) {
    alert("Todos los campos son obligatorios y deben ser válidos");
    return;
  }

  const categoria = obtenerCategoriaPorId(categoriaId);

  if (!categoria) {
    alert("La categoría seleccionada no es válida");
    return;
  }

  if (editingProductId === null) {
    const nuevoProducto: product = {
      id: generarNuevoId(),
      nombre,
      descripcion,
      imagen,
      precio,
      stock,
      disponible,
      eliminado: false,
      categoria,
    };

    productos.push(nuevoProducto);
  } else {
    productos = productos.map((producto) => {
      if (producto.id === editingProductId) {
        return {
          ...producto,
          nombre,
          descripcion,
          imagen,
          precio,
          stock,
          disponible,
          categoria,
        };
      }

      return producto;
    });
  }

  renderProductos();
  cerrarModalProducto();
}

function eliminarProducto(id: number): void {
  const producto = productos.find((prod) => prod.id === id);

  if (!producto) return;

  const confirmar = confirm(
    `¿Seguro que querés eliminar el producto "${producto.nombre}"?`
  );

  if (!confirmar) return;

  // Eliminación lógica en memoria
  productos = productos.map((prod) => {
    if (prod.id === id) {
      return {
        ...prod,
        eliminado: true,
      };
    }

    return prod;
  });

  renderProductos();
}

function configurarModal(): void {
  const btnOpenCreate = document.getElementById("btn-open-create-product");
  const btnCloseModal = document.getElementById("btn-close-product-modal");
  const modal = document.getElementById("product-modal");
  const form = document.getElementById("product-form") as HTMLFormElement | null;

  btnOpenCreate?.addEventListener("click", abrirModalCreacion);
  btnCloseModal?.addEventListener("click", cerrarModalProducto);

  form?.addEventListener("submit", guardarProducto);

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      cerrarModalProducto();
    }
  });
}

async function initProducts(): Promise<void> {
  authGuard();
  renderNombreAdmin();
  configurarModal();

  try {
    const [productosData, categoriasData] = await Promise.all([
      fetchProductos(),
      fetchCategorias(),
    ]);

    productos = productosData.map((producto) => ({
      ...producto,
      eliminado: producto.eliminado ?? false,
    }));

    categorias = categoriasData;

    renderCategoriasSelect();
    renderProductos();
  } catch (error) {
    console.error("Error al cargar productos:", error);

    const tableBody = document.getElementById("products-table-body");

    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="9">No se pudieron cargar los productos.</td>
        </tr>
      `;
    }
  }
}

const logoutButton = document.getElementById(
  "logoutButton"
) as HTMLButtonElement | null;

logoutButton?.addEventListener("click", () => {
  logout();
});

initProducts();