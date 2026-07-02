import { logout, getAuthUser } from "../../../utils/auth";
import { authGuard } from "../../../main";
import type { category } from "../../../types/category";
import { fetchCategorias } from "../../../utils/categories";

let categorias: category[] = [];
let editingCategoryId: number | null = null;


function renderNombreAdmin(): void {
  const adminName = document.getElementById("admin-name");
  const authUser = getAuthUser();

  if (!adminName || !authUser) return;

  adminName.textContent = authUser.mail ?? "Admin";
}

function getCategoryImage(categoria: category): string {
  return categoria.imagen || "https://via.placeholder.com/60?text=Cat";
}

function renderCategorias(): void {
  const tableBody = document.getElementById(
    "categories-table-body"
  ) as HTMLTableSectionElement | null;

  if (!tableBody) return;

  tableBody.innerHTML = "";

  if (categorias.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5">No hay categorías cargadas.</td>
      </tr>
    `;
    return;
  }

  categorias.forEach((categoria) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${categoria.id}</td>

      <td>
        <img
          src="${getCategoryImage(categoria)}"
          alt="${categoria.nombre}"
          class="category-thumbnail"
        />
      </td>

      <td>${categoria.nombre}</td>
      <td>${categoria.descripcion}</td>

      <td>
        <button class="btn-edit-category" data-id="${categoria.id}">
          Editar
        </button>

        <button class="btn-delete-category" data-id="${categoria.id}">
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
    ".btn-edit-category"
  );

  const deleteButtons = document.querySelectorAll<HTMLButtonElement>(
    ".btn-delete-category"
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
      eliminarCategoria(id);
    });
  });
}

function abrirModalCreacion(): void {
  editingCategoryId = null;

  const modal = document.getElementById("category-modal");
  const modalTitle = document.getElementById("category-modal-title");
  const form = document.getElementById("category-form") as HTMLFormElement | null;

  if (!modal || !modalTitle || !form) return;

  modalTitle.textContent = "Nueva Categoría";
  form.reset();

  modal.style.display = "flex";
}

function abrirModalEdicion(id: number): void {
  const categoria = categorias.find((cat) => cat.id === id);

  if (!categoria) return;

  editingCategoryId = id;

  const modal = document.getElementById("category-modal");
  const modalTitle = document.getElementById("category-modal-title");
  const inputId = document.getElementById("category-id") as HTMLInputElement;
  const inputName = document.getElementById("category-name") as HTMLInputElement;
  const inputDescription = document.getElementById(
    "category-description"
  ) as HTMLTextAreaElement;
  const inputImage = document.getElementById("category-image") as HTMLInputElement;

  if (
    !modal ||
    !modalTitle ||
    !inputId ||
    !inputName ||
    !inputDescription ||
    !inputImage
  ) {
    return;
  }

  modalTitle.textContent = "Editar Categoría";

  inputId.value = String(categoria.id);
  inputName.value = categoria.nombre;
  inputDescription.value = categoria.descripcion;
  inputImage.value = categoria.imagen || "";

  modal.style.display = "flex";
}

function cerrarModalCategoria(): void {
  const modal = document.getElementById("category-modal");
  const form = document.getElementById("category-form") as HTMLFormElement | null;

  if (!modal) return;

  modal.style.display = "none";
  form?.reset();
  editingCategoryId = null;
}

function generarNuevoId(): number {
  if (categorias.length === 0) return 1;

  return Math.max(...categorias.map((categoria) => categoria.id)) + 1;
}

function guardarCategoria(event: SubmitEvent): void {
  event.preventDefault();

  const inputName = document.getElementById("category-name") as HTMLInputElement;
  const inputDescription = document.getElementById(
    "category-description"
  ) as HTMLTextAreaElement;
  const inputImage = document.getElementById("category-image") as HTMLInputElement;

  const nombre = inputName.value.trim();
  const descripcion = inputDescription.value.trim();
  const imagen = inputImage.value.trim();

  if (!nombre || !descripcion || !imagen) {
    alert("Todos los campos son obligatorios");
    return;
  }

  if (editingCategoryId === null) {
    const nuevaCategoria: category = {
      id: generarNuevoId(),
      eliminado: false,
      nombre,
      descripcion,
      imagen,
    };

    categorias.push(nuevaCategoria);
  } else {
    categorias = categorias.map((categoria) => {
      if (categoria.id === editingCategoryId) {
        return {
          ...categoria,
          nombre,
          descripcion,
          imagen,
        };
      }

      return categoria;
    });
  }

  renderCategorias();
  cerrarModalCategoria();
}

function eliminarCategoria(id: number): void {
  const categoria = categorias.find((cat) => cat.id === id);

  if (!categoria) return;

  const confirmar = confirm(
    `¿Seguro que querés eliminar la categoría "${categoria.nombre}"?`
  );

  if (!confirmar) return;

  categorias = categorias.filter((categoria) => categoria.id !== id);

  renderCategorias();
}

function configurarModal(): void {
  const btnOpenCreate = document.getElementById("btn-open-create-category");
  const btnCloseModal = document.getElementById("btn-close-category-modal");
  const modal = document.getElementById("category-modal");
  const form = document.getElementById("category-form") as HTMLFormElement | null;

  btnOpenCreate?.addEventListener("click", abrirModalCreacion);
  btnCloseModal?.addEventListener("click", cerrarModalCategoria);

  form?.addEventListener("submit", guardarCategoria);

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      cerrarModalCategoria();
    }
  });
}

async function initCategories(): Promise<void> {
  authGuard();
  renderNombreAdmin();
  configurarModal();

  try {
    categorias = await fetchCategorias();
    renderCategorias();
  } catch (error) {
    console.error("Error al cargar categorías:", error);

    const tableBody = document.getElementById("categories-table-body");

    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5">No se pudieron cargar las categorías.</td>
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

initCategories();