// File: script.js
document.addEventListener("DOMContentLoaded", () => {
    // 1. Ambil elemen DOM
    const todoForm = document.querySelector("#todoForm");
    const taskInput = document.querySelector("#taskInput");
    const inputError = document.querySelector("#inputError");
    const todoList = document.querySelector("#todoList");
    const taskCounter = document.querySelector("#taskCounter");
    const clearCompletedBtn = document.querySelector("#clearCompletedBtn");

    // Elemen Pop-up / Modal Konfirmasi Hapus
    const confirmModal = document.querySelector("#confirmModal");
    const cancelDeleteBtn = document.querySelector("#cancelDeleteBtn");
    const confirmDeleteBtn = document.querySelector("#confirmDeleteBtn");
    let pendingDeleteIndex = null;

    // 2. Fungsi membaca dan menyimpan ke LocalStorage
    const getTasks = () => JSON.parse(localStorage.getItem("todo_tasks")) || [];
    const saveTasks = (tasks) => localStorage.setItem("todo_tasks", JSON.stringify(tasks));

    // Fitur 1: Fungsi memperbarui penghitung jumlah tugas (Task Counter)
    const updateCounter = (tasks) => {
        const total = tasks.length;
        const completed = tasks.filter((task) => task.completed).length;
        const pending = total - completed;
        taskCounter.textContent = `Total: ${total} Tugas | Selesai: ${completed} | Belum Selesai: ${pending}`;
    };

    // 3. Fungsi menampilkan daftar tugas ke layar
    const renderTasks = () => {
        const tasks = getTasks();
        updateCounter(tasks);
        todoList.innerHTML = "";

        if (tasks.length === 0) {
            todoList.innerHTML = "<p style='text-align:center; color:#64748b; font-size:13px; padding:10px;'>Belum ada tugas tersimpan.</p>";
            return;
        }

        tasks.forEach((task, index) => {
            const li = document.createElement("li");
            li.className = `todo-item ${task.completed ? 'completed' : ''}`;

            li.innerHTML = `
                <span class="todo-text">${task.text}</span>
                <div class="todo-actions">
                    <button type="button" class="action-btn complete-btn" data-index="${index}">
                        ${task.completed ? 'Batal' : 'Selesai'}
                    </button>
                    <button type="button" class="action-btn delete-btn" data-index="${index}">Hapus</button>
                </div>
            `;
            todoList.appendChild(li);
        });
    };

    // 4. Tambah tugas saat formulir dikirim
    todoForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const taskText = taskInput.value.trim();

        // Validasi input sederhana
        if (taskText.length < 3) {
            taskInput.classList.add("error");
            inputError.style.display = "block";
            return;
        }

        // Jika valid, hilangkan pesan error
        taskInput.classList.remove("error");
        inputError.style.display = "none";

        // Simpan tugas baru ke array LocalStorage
        const tasks = getTasks();
        tasks.push({ text: taskText, completed: false });
        saveTasks(tasks);

        taskInput.value = "";
        renderTasks();
    });

    // 5. Tangani klik tombol Selesai dan Hapus menggunakan Event Listener pada todoList
    todoList.addEventListener("click", (e) => {
        const index = e.target.dataset.index;
        if (index === undefined) return;

        const tasks = getTasks();
        const numIndex = Number(index);

        if (e.target.classList.contains("complete-btn")) {
            tasks[numIndex].completed = !tasks[numIndex].completed;
            saveTasks(tasks);
            renderTasks();
        } else if (e.target.classList.contains("delete-btn")) {
            // Fitur 3: Buka Pop-up Konfirmasi kustom (bukan alert/confirm bawaan browser)
            pendingDeleteIndex = numIndex;
            confirmModal.classList.add("show");
        }
    });

    // Tangani tombol Batal pada Pop-up
    cancelDeleteBtn.addEventListener("click", () => {
        pendingDeleteIndex = null;
        confirmModal.classList.remove("show");
    });

    // Tangani tombol Hapus pada Pop-up
    confirmDeleteBtn.addEventListener("click", () => {
        if (pendingDeleteIndex !== null) {
            const tasks = getTasks();
            tasks.splice(pendingDeleteIndex, 1);
            saveTasks(tasks);
            renderTasks();
        }
        pendingDeleteIndex = null;
        confirmModal.classList.remove("show");
    });

    // 6. Fitur 2: Tombol 'Bersihkan Tugas Selesai'
    clearCompletedBtn.addEventListener("click", () => {
        const tasks = getTasks();
        const activeTasks = tasks.filter((task) => !task.completed);
        saveTasks(activeTasks);
        renderTasks();
    });

    // Render pertama kali saat halaman selesai dimuat
    renderTasks();
});
