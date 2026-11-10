// File: script.js
// Modul 6 - Employee Directory App (Versi Modifikasi)

document.addEventListener("DOMContentLoaded", () => {
    const btnLoad = document.getElementById("btnLoad");
    const feedback = document.getElementById("feedback");
    const employeeContainer = document.getElementById("employeeContainer");

    // Endpoint berbeda dari contoh asli
    const API_URL = "https://jsonplaceholder.typicode.com/users";

    // Helper: ubah status feedback
    const setFeedback = (message, isError = false) => {
        feedback.textContent = message;
        feedback.classList.toggle("is-error", isError);
    };

    // Fungsi utama: ambil data karyawan
    const loadEmployees = async () => {
        // Tampilkan status loading
        btnLoad.disabled = true;
        btnLoad.textContent = "⏳ Memuat...";
        setFeedback("Sedang menghubungi server...");
        employeeContainer.replaceChildren();

        try {
            // Request ke API
            const res = await fetch(API_URL);

            // Validasi status HTTP
            if (!res.ok) {
                throw new Error(`HTTP ${res.status} - ${res.statusText}`);
            }

            // Parsing JSON
            const data = await res.json();

            // Sukses
            setFeedback(`✅ Berhasil memuat ${data.length} karyawan.`);
            tampilkanKaryawan(data);
        } catch (err) {
            // Tangani error
            setFeedback(`❌ Gagal memuat: ${err.message}`, true);
        } finally {
            // Selalu aktifkan tombol kembali
            btnLoad.disabled = false;
            btnLoad.textContent = "🔄 Ambil Data Karyawan";
        }
    };

    // Fungsi render kartu karyawan
    const tampilkanKaryawan = (data) => {
        // Gunakan fragment agar lebih efisien
        const fragment = document.createDocumentFragment();

        data.forEach((karyawan, index) => {
            const item = document.createElement("article");
            item.className = "employee-item";

            // Avatar inisial
            const inisial = karyawan.name
                .split(" ")
                .map((k) => k[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

            item.innerHTML = `
                <div class="avatar">${inisial}</div>
                <div class="employee-detail">
                    <h3 class="employee-name">${karyawan.name}</h3>
                    <p class="employee-email">📧 ${karyawan.email}</p>
                    <p class="employee-company">🏢 ${karyawan.company.name}</p>
                    <p class="employee-city">📍 ${karyawan.address.city}</p>
                </div>
                <span class="employee-index">#${String(index + 1).padStart(2, "0")}</span>
            `;

            fragment.appendChild(item);
        });

        employeeContainer.appendChild(fragment);
    };

    // Event listener
    btnLoad.addEventListener("click", loadEmployees);
});