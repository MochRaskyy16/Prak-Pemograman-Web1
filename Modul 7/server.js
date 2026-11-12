const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

//konfigurasi koneksi database
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "database_mahasiswa"
});

db.connect((err) => {
    if (err) {
        console.error('Koneksi database gagal:', err.message);
        return;
    }
    console.log('Mantap database nyolok boss');
});


//Mengambil semua data mahasiswa
app.get('/api/mahasiswa', (req, res) => {
    db.query('SELECT * FROM mahasiswa ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({
            success: false,
            message: err.message
        });
        res.json({results});
        
    });
});


//menambahkan data mahasiswa
app.post('/api/mahasiswa', (req, res) => {
    const { nim, nama, jurusan, email } = req.body;
    const sql = 'INSERT INTO mahasiswa (nim, nama, jurusan, email) VALUES (?, ?, ?, ?)';
    db.query(sql, [nim, nama, jurusan, email], (err, result) => {
        if (err) return res.status(500).json({
            success: false,
            message: err.message
        });
        res.json({
            success: true,
            message: 'Mahasiswa tos lebet boss',
        });
    });
});

//
app.put('/api/mahasiswa/:id', (req, res) => {
    const { id } = req.params;
    const { nim, nama, jurusan, email } = req.body;
    const sql = 'UPDATE mahasiswa SET nim = ?, nama = ?, jurusan = ?, email = ? WHERE id = ?';
    db.query(sql, [nim, nama, jurusan, email, id], (err, result) => {
        if (err) return res.status(500).json({
            success: false,
            message: err.message
        });
        res.json({
            success: true,
            message: 'Data mahasiswa tos diupdate boss',
        });
    });
});

app.delete('/api/mahasiswa/:id', (req, res) => {
    
    const { id } = req.params;
    db.query('DELETE FROM mahasiswa WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({
            success: false,
            message: err.message
        });
        res.json({
            success: true,
            message: 'Data mahasiswa tos dihapus boss',
        });
    });
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});