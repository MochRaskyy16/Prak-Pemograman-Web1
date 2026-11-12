// File: public/script.js
// Modul 7 - Full-Stack JavaScript CRUD Data Mahasiswa

// State utama data mahasiswa
let listMahasiswa = [];

// DOM Elements
const formMahasiswa = document.getElementById('form-mahasiswa');
const editIdInput = document.getElementById('edit-id');
const nimInput = document.getElementById('nim');
const namaInput = document.getElementById('nama');
const jurusanInput = document.getElementById('jurusan');
const emailInput = document.getElementById('email');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancel');
const formTitle = document.getElementById('form-title');

const searchInput = document.getElementById('search-input');
const btnClearSearch = document.getElementById('btn-clear-search');
const totalCounterEl = document.getElementById('total-mahasiswa-counter');
const tableBody = document.getElementById('table-body');
const btnRefresh = document.getElementById('btn-refresh');
const feedbackAlert = document.getElementById('feedback-alert');

// Helper: Tampilkan notifikasi status (sukses/gagal)
function showFeedback(message, type = 'success') {
  feedbackAlert.textContent = message;
  feedbackAlert.className = `feedback-alert ${type}`;
  feedbackAlert.classList.remove('hidden');

  setTimeout(() => {
    feedbackAlert.classList.add('hidden');
  }, 3500);
}

/**
 * FITUR 3 - Indikator Counter Total Mahasiswa
 * Menampilkan teks 'Total Mahasiswa Terdaftar: X Orang'
 * Otomatis diperbarui setiap kali data dimuat, ditambah, atau dihapus.
 */
function updateCounter() {
  const total = listMahasiswa.length;
  totalCounterEl.textContent = `Total Mahasiswa Terdaftar: ${total} Orang`;
}

// Render data mahasiswa ke tabel HTML
function renderTable(data = listMahasiswa) {
  tableBody.innerHTML = '';

  if (!data || data.length === 0) {
    const isSearching = searchInput.value.trim().length > 0;
    const message = isSearching
      ? 'Tidak ditemukan mahasiswa yang cocok dengan pencarian.'
      : 'Belum ada data mahasiswa.';
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted" style="padding: 24px;">${message}</td>
      </tr>
    `;
    return;
  }

  data.forEach((mhs, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td><span class="nim-code">${escapeHtml(mhs.nim)}</span></td>
      <td><strong>${escapeHtml(mhs.nama)}</strong></td>
      <td>${escapeHtml(mhs.jurusan)}</td>
      <td>${escapeHtml(mhs.email)}</td>
      <td class="text-center">
        <button type="button" class="btn-action-edit" data-id="${mhs.id}">Edit</button>
        <button type="button" class="btn-action-delete" data-id="${mhs.id}" data-nama="${escapeHtml(mhs.nama)}">Hapus</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Helper untuk sanitasi karakter HTML mencegah XSS
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * FITUR 1 - Kolom Pencarian Real-Time (Search Filter di JavaScript)
 * Event listener 'input' menyaring listMahasiswa secara instan menggunakan listMahasiswa.filter(...)
 */
searchInput.addEventListener('input', () => {
  const keyword = searchInput.value.trim().toLowerCase();

  // Tampilkan/sembunyikan tombol clear (x)
  if (keyword.length > 0) {
    btnClearSearch.classList.remove('hidden');
  } else {
    btnClearSearch.classList.add('hidden');
  }

  // Filter instan menggunakan listMahasiswa.filter(...)
  const hasilFilter = listMahasiswa.filter((mhs) => {
    const nama = (mhs.nama || '').toLowerCase();
    const nim = String(mhs.nim || '').toLowerCase();
    return nama.includes(keyword) || nim.includes(keyword);
  });

  renderTable(hasilFilter);
});

// Tombol Clear Pencarian
btnClearSearch.addEventListener('click', () => {
  searchInput.value = '';
  btnClearSearch.classList.add('hidden');
  renderTable(listMahasiswa);
  searchInput.focus();
});

// Ambil semua data mahasiswa dari server
async function loadMahasiswa() {
  try {
    const response = await fetch('/api/mahasiswa');
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    listMahasiswa = Array.isArray(data.results) ? data.results : [];

    // Perbarui counter (Fitur 3) dan render tabel
    updateCounter();

    // Jika search input ada isinya, terapkan filter kembali
    if (searchInput.value.trim()) {
      searchInput.dispatchEvent(new Event('input'));
    } else {
      renderTable(listMahasiswa);
    }
  } catch (err) {
    console.error('Gagal mengambil data mahasiswa:', err);
    showFeedback('Gagal memuat data dari server: ' + err.message, 'error');
  }
}

/**
 * FITUR 2 - Validasi Pencegahan NIM Duplikat di Frontend JavaScript
 * Menggunakan method .some() sebelum request dikirim via fetch()
 */
formMahasiswa.addEventListener('submit', async (e) => {
  e.preventDefault();

  const editId = editIdInput.value.trim();
  const nim = nimInput.value.trim();
  const nama = namaInput.value.trim();
  const jurusan = jurusanInput.value.trim();
  const email = emailInput.value.trim();

  // Validasi form dasar
  if (!nim || !nama || !jurusan || !email) {
    alert('Harap isi semua kolom formulir!');
    return;
  }

  // FITUR 2: Validasi NIM Duplikat dengan .some()
  const isDuplicate = editId
    ? listMahasiswa.some((mhs) => String(mhs.nim).trim() === nim && String(mhs.id) !== editId)
    : listMahasiswa.some((mhs) => String(mhs.nim).trim() === nim);

  if (isDuplicate) {
    alert('NIM sudah terdaftar!');
    nimInput.focus();
    return; // Batalkan submit jika NIM sudah terdaftar
  }

  // Payload data
  const payload = { nim, nama, jurusan, email };

  try {
    btnSubmit.disabled = true;
    btnSubmit.querySelector('.btn-text').textContent = 'Menyimpan...';

    let response;
    if (editId) {
      // Mode Edit (PUT)
      response = await fetch(`/api/mahasiswa/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      // Mode Tambah Baru (POST)
      response = await fetch('/api/mahasiswa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Gagal menyimpan data.');
    }

    // Reset Form dan Refresh Data
    resetForm();
    showFeedback(result.message || 'Data mahasiswa berhasil disimpan!', 'success');

    // Reload data & counter diperbarui (Fitur 3)
    await loadMahasiswa();
  } catch (err) {
    console.error('Error saat submit data:', err);
    showFeedback(err.message || 'Terjadi kesalahan pada server.', 'error');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.querySelector('.btn-text').textContent = editIdInput.value ? 'Perbarui Data' : 'Simpan Data';
  }
});

// Event delegation untuk tombol Edit dan Hapus pada tabel
tableBody.addEventListener('click', async (e) => {
  const target = e.target;

  // Tombol Edit
  if (target.classList.contains('btn-action-edit')) {
    const id = target.getAttribute('data-id');
    const mahasiswa = listMahasiswa.find((mhs) => String(mhs.id) === String(id));

    if (mahasiswa) {
      editIdInput.value = mahasiswa.id;
      nimInput.value = mahasiswa.nim;
      namaInput.value = mahasiswa.nama;
      jurusanInput.value = mahasiswa.jurusan;
      emailInput.value = mahasiswa.email;

      formTitle.textContent = 'Edit Data Mahasiswa';
      btnSubmit.querySelector('.btn-text').textContent = 'Perbarui Data';
      btnCancel.classList.remove('hidden');

      nimInput.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return;
  }

  // Tombol Hapus
  if (target.classList.contains('btn-action-delete')) {
    const id = target.getAttribute('data-id');
    const nama = target.getAttribute('data-nama');

    const confirmed = confirm(`Apakah Anda yakin ingin menghapus data mahasiswa "${nama}"?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/mahasiswa/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Gagal menghapus data.');
      }

      showFeedback(result.message || 'Data mahasiswa berhasil dihapus!', 'success');

      // Reload data mahasiswa & counter otomatis terupdate (Fitur 3)
      await loadMahasiswa();
    } catch (err) {
      console.error('Gagal menghapus mahasiswa:', err);
      showFeedback('Gagal menghapus data: ' + err.message, 'error');
    }
  }
});

// Reset Form & Kembalikan ke Mode Tambah Baru
function resetForm() {
  formMahasiswa.reset();
  editIdInput.value = '';
  formTitle.textContent = 'Tambah Mahasiswa Baru';
  btnSubmit.querySelector('.btn-text').textContent = 'Simpan Data';
  btnCancel.classList.add('hidden');
}

// Tombol Batal Edit
btnCancel.addEventListener('click', () => {
  resetForm();
});

// Tombol Refresh Manual
btnRefresh.addEventListener('click', () => {
  loadMahasiswa();
});

// Inisialisasi saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  loadMahasiswa();
});
