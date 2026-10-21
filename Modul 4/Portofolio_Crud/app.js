/* ============================================================
   PORTFOLIO TRACKER — CRUD TERSTRUKTUR
   ============================================================
   Setiap operasi CRUD dipisah ke fungsi khusus agar jelas:
   - CREATE : handleFormSubmit()
   - READ   : renderProjects() + renderStats()
   - UPDATE : handleEditClick() + handleToggleClick()
   - DELETE : handleDeleteClick()
   ============================================================ */

// ============================================================
// STATE
// ============================================================
let projects = [
  {
    id: 1700000000001,
    title: "Sistem Inventaris Keuangan",
    category: "Web App",
    budget: 2500000,
    completed: true,
  },
  {
    id: 1700000000002,
    title: "Sistem Kasir Digital POS",
    category: "Desktop App",
    budget: 5000000,
    completed: true,
  },
  {
    id: 1700000000003,
    title: "Landing Page Profil Perusahaan",
    category: "Web App",
    budget: 1500000,
    completed: false,
  },
  {
    id: 1700000000004,
    title: "Aplikasi Presensi GPS Mobile",
    category: "Mobile App",
    budget: 4500000,
    completed: false,
  },
];

let searchQuery = "";
let editingId = null; // null = CREATE, angka = UPDATE

// ============================================================
// UTILS
// ============================================================
const formatRupiah = (angka) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(angka);

const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// ============================================================
// DOM ELEMENTS
// ============================================================
const projectList = document.getElementById("project-list");
const searchInput = document.getElementById("search-input");
const statTotalProjects = document.getElementById("stat-total-projects");
const statTotalBudget = document.getElementById("stat-total-budget");
const statCompletedProjects = document.getElementById("stat-completed-projects");

const modalRoot = document.getElementById("modal-root");
const modalTitle = document.getElementById("modal-title");
const form = document.getElementById("project-form");
const inputTitle = document.getElementById("input-title");
const inputCategory = document.getElementById("input-category");
const inputBudget = document.getElementById("input-budget");
const inputCompleted = document.getElementById("input-completed");
const formError = document.getElementById("form-error");

const btnTambah = document.getElementById("btn-tambah");

// ============================================================
// 🔵 READ — Render daftar proyek
// ============================================================
const renderProjects = () => {
  const q = searchQuery.trim().toLowerCase();
  const filtered =
    q === ""
      ? projects
      : projects.filter((p) => p.title.toLowerCase().includes(q));

  if (filtered.length === 0) {
    projectList.innerHTML = `
      <div class="empty-state">
        ${
          projects.length === 0
            ? "Belum ada proyek. Klik \"Tambah Proyek Baru\" untuk memulai."
            : "Tidak ada proyek yang cocok dengan pencarian."
        }
      </div>
    `;
    return;
  }

  projectList.innerHTML = filtered
    .map((p) => {
      const statusText = p.completed ? "✓ Selesai" : "⏳ Dalam Pengerjaan";
      return `
        <div class="project-card ${p.completed ? "is-done" : ""}">
          <div class="project-info">
            <span class="project-category">${escapeHtml(p.category)}</span>
            <h3 class="project-title">${escapeHtml(p.title)}</h3>
            <p class="project-budget">${formatRupiah(p.budget)}</p>
          </div>
          <div class="project-actions">
            <button
              type="button"
              class="btn-sm btn-toggle ${p.completed ? "is-done" : ""}"
              data-action="toggle"
              data-id="${p.id}"
            >${statusText}</button>
            <button
              type="button"
              class="btn-sm btn-edit"
              data-action="edit"
              data-id="${p.id}"
            >✏️ Edit</button>
            <button
              type="button"
              class="btn-sm btn-delete"
              data-action="delete"
              data-id="${p.id}"
            >🗑 Hapus</button>
          </div>
        </div>
      `;
    })
    .join("");
};

// ============================================================
// 🔵 READ — Render statistik (ringkasan finansial)
// ============================================================
const renderStats = () => {
  const total = projects.length;
  const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
  const completed = projects.filter((p) => p.completed).length;

  statTotalProjects.textContent = total;
  statTotalBudget.textContent = formatRupiah(totalBudget);
  statCompletedProjects.textContent = completed;
};

const render = () => {
  renderProjects();
  renderStats();
};

// ============================================================
// 🟢 CREATE & UPDATE — Buka modal form
// ============================================================
const openModal = (project = null) => {
  editingId = project ? project.id : null;
  formError.textContent = "";
  form.reset();

  if (project) {
    // MODE UPDATE
    modalTitle.textContent = "Edit Proyek";
    inputTitle.value = project.title;
    inputCategory.value = project.category;
    inputBudget.value = project.budget;
    inputCompleted.checked = project.completed;
  } else {
    // MODE CREATE
    modalTitle.textContent = "Tambah Proyek";
  }

  modalRoot.classList.add("is-open");
  setTimeout(() => inputTitle.focus(), 100);
};

const closeModal = () => {
  modalRoot.classList.remove("is-open");
  editingId = null;
  form.reset();
  formError.textContent = "";
};

// ============================================================
// 🟢 CREATE & UPDATE — Handle form submit
// ============================================================
const handleFormSubmit = (e) => {
  e.preventDefault();

  const title = inputTitle.value.trim();
  const category = inputCategory.value;
  const budgetRaw = inputBudget.value;
  const budget = Number(budgetRaw);
  const completed = inputCompleted.checked;

  // VALIDASI
  let error = "";
  if (title === "") {
    error = "⚠ Judul proyek tidak boleh kosong.";
  } else if (category === "") {
    error = "⚠ Kategori harus dipilih.";
  } else if (!budgetRaw || isNaN(budget) || budget <= 0) {
    error = "⚠ Estimasi anggaran harus lebih besar dari 0.";
  }

  if (error) {
    formError.textContent = error;
    return;
  }

  if (editingId !== null) {
    // === UPDATE ===
    projects = projects.map((p) =>
      p.id === editingId
        ? { ...p, title, category, budget, completed }
        : p
    );
  } else {
    // === CREATE ===
    projects = [
      {
        id: Date.now(),
        title,
        category,
        budget,
        completed,
      },
      ...projects,
    ];
  }

  closeModal();
  render();
};

// ============================================================
// 🟡 UPDATE — Toggle status (Selesai ↔ Dalam Pengerjaan)
// ============================================================
const handleToggleClick = (id) => {
  projects = projects.map((p) =>
    p.id === id ? { ...p, completed: !p.completed } : p
  );
  render();
};

// ============================================================
// 🔴 DELETE — Hapus proyek
// ============================================================
const handleDeleteClick = (id) => {
  const proyek = projects.find((p) => p.id === id);
  if (!proyek) return;

  const yakin = confirm(`Hapus proyek "${proyek.title}"?`);
  if (!yakin) return;

  projects = projects.filter((p) => p.id !== id);
  render();
};

// ============================================================
// 🟡 UPDATE — Edit proyek (buka modal dengan data lama)
// ============================================================
const handleEditClick = (id) => {
  const proyek = projects.find((p) => p.id === id);
  if (proyek) openModal(proyek);
};

// ============================================================
// EVENT DELEGATION — Aksi tombol di kartu
// ============================================================
projectList.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.getAttribute("data-action");
  const id = Number(btn.getAttribute("data-id"));

  if (action === "toggle") return handleToggleClick(id);
  if (action === "edit") return handleEditClick(id);
  if (action === "delete") return handleDeleteClick(id);
});

// ============================================================
// SEARCH — Live filter
// ============================================================
searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderProjects(); // cukup render daftar, stats tidak berubah
});

// ============================================================
// BINDING TOMBOL & FORM
// ============================================================
btnTambah.addEventListener("click", () => openModal(null));
form.addEventListener("submit", handleFormSubmit);

// Tutup modal via backdrop / tombol close
modalRoot.addEventListener("click", (e) => {
  if (e.target.closest("[data-action='close-modal']")) closeModal();
});

// Tutup modal via Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalRoot.classList.contains("is-open")) {
    closeModal();
  }
});

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", render);