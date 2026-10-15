/* global process, require */

require("dotenv").config();

const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Middleware
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
        ],
    })
);

app.use(express.json());

// Periksa konfigurasi database
const requiredEnv = [
    "DB_HOST",
    "DB_PORT",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
];

const missingEnv = requiredEnv.filter(
    (key) => !process.env[key]
);

if (missingEnv.length > 0) {
    console.error(
        "Konfigurasi .env belum lengkap:",
        missingEnv.join(", ")
    );

    process.exit(1);
}

// Koneksi ke MySQL
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
});

// Membuat nomor pengajuan
function buatNomorPengajuan() {
    const tahun = new Date().getFullYear();
    const kodeAcak = crypto
        .randomBytes(6)
        .toString("hex")
        .toUpperCase();

    return `ZKT-${tahun}-${kodeAcak}`;
}

// Membuat token cek status
function buatTokenVerifikasi() {
    return crypto
        .randomBytes(8)
        .toString("hex")
        .toUpperCase();
}

// Tes backend
app.get("/api", (req, res) => {
    res.json({
        message: "Backend ZAKATARA berhasil berjalan!",
    });
});

// Tes koneksi database
app.get("/api/db-test", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT 1 AS connected"
        );

        res.json({
            message: "Koneksi database berhasil!",
            database: process.env.DB_NAME,
            connected: rows[0].connected,
        });
    } catch (error) {
        console.error(
            "Koneksi database gagal:",
            error.message
        );

        res.status(500).json({
            message: "Koneksi database gagal.",
        });
    }
});

// ================================================
// REGISTRASI CALON PENERIMA
// ================================================
app.post("/api/penerima", async (req, res) => {
    try {
        const {
            nik,
            nama_lengkap,
            tempat_lahir,
            tanggal_lahir,
            jenis_kelamin,
            email,
            no_hp,
            kecamatan,
            kelurahan,
            alamat_lengkap,
            status_pernikahan,
            jumlah_tanggungan,
            pekerjaan,
        } = req.body;

        // Validasi data wajib
        if (
            !nik ||
            !nama_lengkap ||
            !tempat_lahir ||
            !tanggal_lahir ||
            !jenis_kelamin ||
            !no_hp
        ) {
            return res.status(400).json({
                message: "Data wajib belum lengkap.",
            });
        }

        // Validasi jenis kelamin
        if (
            !["Laki-laki", "Perempuan"].includes(
                jenis_kelamin
            )
        ) {
            return res.status(400).json({
                message: "Jenis kelamin tidak valid.",
            });
        }

        // Menghitung usia
        const tanggalLahir = new Date(
            `${tanggal_lahir}T00:00:00`
        );

        const sekarang = new Date();

        if (
            Number.isNaN(tanggalLahir.getTime()) ||
            tanggalLahir > sekarang
        ) {
            return res.status(400).json({
                message: "Tanggal lahir tidak valid.",
            });
        }

        let usia =
            sekarang.getFullYear() -
            tanggalLahir.getFullYear();

        const belumUlangTahun =
            sekarang.getMonth() <
                tanggalLahir.getMonth() ||
            (
                sekarang.getMonth() ===
                    tanggalLahir.getMonth() &&
                sekarang.getDate() <
                    tanggalLahir.getDate()
            );

        if (belumUlangTahun) {
            usia--;
        }

        const tanggungan = Number(
            jumlah_tanggungan ?? 0
        );

        if (
            !Number.isInteger(tanggungan) ||
            tanggungan < 0
        ) {
            return res.status(400).json({
                message: "Jumlah tanggungan tidak valid.",
            });
        }

        const sql = `
            INSERT INTO penerima (
                nik,
                nama_lengkap,
                tempat_lahir,
                tanggal_lahir,
                usia,
                jenis_kelamin,
                email,
                no_hp,
                kecamatan,
                kelurahan,
                alamat_lengkap,
                status_pernikahan,
                jumlah_tanggungan,
                pekerjaan
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            nik.trim(),
            nama_lengkap.trim(),
            tempat_lahir.trim(),
            tanggal_lahir,
            usia,
            jenis_kelamin,
            email?.trim() || null,
            no_hp.trim(),
            kecamatan || null,
            kelurahan || null,
            alamat_lengkap || null,
            status_pernikahan || null,
            tanggungan,
            pekerjaan || null,
        ];

        await db.execute(sql, values);

        return res.status(201).json({
            message:
                "Data calon penerima berhasil disimpan.",
        });
    } catch (error) {
        console.error(
            "Gagal menyimpan data penerima:",
            error.message
        );

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message:
                    "NIK, email, atau nomor HP sudah terdaftar.",
            });
        }

        return res.status(500).json({
            message:
                "Gagal menyimpan data ke database.",
        });
    }
});

// ================================================
// SIMPAN JAWABAN KUESIONER
// ================================================
app.post(
    "/api/jawaban-kuesioner",
    async (req, res) => {
        let connection;
        let transactionStarted = false;

        try {
            const {
                nik_penerima,
                jawaban,
            } = req.body;

            // Validasi permintaan
            if (
                !nik_penerima ||
                !Array.isArray(jawaban) ||
                jawaban.length === 0
            ) {
                return res.status(400).json({
                    message:
                        "NIK dan jawaban kuesioner wajib diisi.",
                });
            }

            const nik = String(
                nik_penerima
            ).trim();

            // Validasi jawaban
            const jawabanValid = jawaban.map(
                (item) => ({
                    id_kriteria: Number(
                        item.id_kriteria
                    ),
                    nilai_jawaban:
                        item.nilai_jawaban,
                })
            );

            const idKriteria = jawabanValid.map(
                (item) => item.id_kriteria
            );

            if (
                jawabanValid.some(
                    (item) =>
                        !Number.isInteger(
                            item.id_kriteria
                        ) ||
                        !["Ya", "Tidak"].includes(
                            item.nilai_jawaban
                        )
                ) ||
                new Set(idKriteria).size !==
                    idKriteria.length
            ) {
                return res.status(400).json({
                    message:
                        "Data jawaban atau ID kriteria tidak valid.",
                });
            }

            connection = await db.getConnection();

            // Memeriksa calon penerima
            const [penerimaAwal] =
                await connection.execute(
                    `SELECT nik
                     FROM penerima
                     WHERE nik = ?`,
                    [nik]
                );

            if (penerimaAwal.length === 0) {
                return res.status(404).json({
                    message:
                        "Data calon penerima tidak ditemukan.",
                });
            }

            // Memeriksa kriteria yang tersedia
            const placeholders = idKriteria
                .map(() => "?")
                .join(", ");

            const [kriteria] =
                await connection.execute(
                    `SELECT id_kriteria
                     FROM kriteria_pakar
                     WHERE id_kriteria IN (${placeholders})`,
                    idKriteria
                );

            if (
                kriteria.length !==
                new Set(idKriteria).size
            ) {
                return res.status(400).json({
                    message:
                        "Ada kriteria yang belum tersedia di database.",
                });
            }

            // Memulai transaksi
            await connection.beginTransaction();
            transactionStarted = true;

            // Mengunci data penerima selama transaksi
            const [dataPenerima] =
                await connection.execute(
                    `SELECT
                        nik,
                        nomor_pengajuan,
                        token_verifikasi
                     FROM penerima
                     WHERE nik = ?
                     FOR UPDATE`,
                    [nik]
                );

            if (dataPenerima.length === 0) {
                throw new Error(
                    "Data calon penerima tidak ditemukan."
                );
            }

            const penerima = dataPenerima[0];

            // Mengganti jawaban lama dengan jawaban terbaru
            await connection.execute(
                `DELETE FROM jawaban_kuesioner
                 WHERE nik_penerima = ?`,
                [nik]
            );

            // Menyimpan seluruh jawaban
            for (const item of jawabanValid) {
                await connection.execute(
                    `INSERT INTO jawaban_kuesioner (
                        nik_penerima,
                        id_kriteria,
                        nilai_jawaban
                    )
                    VALUES (?, ?, ?)`,
                    [
                        nik,
                        item.id_kriteria,
                        item.nilai_jawaban,
                    ]
                );
            }

            // Membuat nomor pengajuan jika belum tersedia
            const nomorPengajuan =
                penerima.nomor_pengajuan ||
                buatNomorPengajuan();

            // Membuat token jika belum tersedia
            const tokenVerifikasi =
                penerima.token_verifikasi ||
                buatTokenVerifikasi();

            // Menyimpan nomor dan token
            await connection.execute(
                `UPDATE penerima
                 SET
                    nomor_pengajuan = ?,
                    token_verifikasi = ?
                 WHERE nik = ?`,
                [
                    nomorPengajuan,
                    tokenVerifikasi,
                    nik,
                ]
            );

            // Mengambil informasi pengajuan terbaru
            const [hasilPengajuan] =
                await connection.execute(
                    `SELECT
                        nama_lengkap,
                        nomor_pengajuan,
                        DATE_FORMAT(
                            created_at,
                            '%Y-%m-%d %H:%i:%s'
                        ) AS tanggal_pengajuan,
                        status_pengajuan,
                        token_verifikasi
                     FROM penerima
                     WHERE nik = ?`,
                    [nik]
                );

            // Menyelesaikan transaksi
            await connection.commit();
            transactionStarted = false;

            return res.status(201).json({
                message:
                    "Jawaban kuesioner berhasil disimpan.",
                jumlah_jawaban:
                    jawabanValid.length,
                pengajuan: hasilPengajuan[0],
            });
        } catch (error) {
            if (
                connection &&
                transactionStarted
            ) {
                try {
                    await connection.rollback();
                } catch (rollbackError) {
                    console.error(
                        "Gagal membatalkan transaksi:",
                        rollbackError.message
                    );
                }
            }

            console.error(
                "Gagal menyimpan jawaban kuesioner:",
                error.message
            );

            return res.status(500).json({
                message:
                    "Gagal menyimpan jawaban kuesioner.",
            });
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
);

// ================================================
// AMBIL INFORMASI PENGAJUAN
// ================================================
app.get(
    "/api/pengajuan/:nik",
    async (req, res) => {
        try {
            const nik = String(
                req.params.nik || ""
            ).trim();

            if (!nik) {
                return res.status(400).json({
                    message: "NIK wajib diisi.",
                });
            }

            // Memeriksa calon penerima
            const [rows] = await db.execute(
                `SELECT
                    nomor_pengajuan,
                    token_verifikasi
                 FROM penerima
                 WHERE nik = ?`,
                [nik]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    message:
                        "Data pengajuan tidak ditemukan.",
                });
            }

            const data = rows[0];

            // Membuat nomor dan token bila belum tersedia
            const nomorPengajuan =
                data.nomor_pengajuan ||
                buatNomorPengajuan();

            const tokenVerifikasi =
                data.token_verifikasi ||
                buatTokenVerifikasi();

            if (
                !data.nomor_pengajuan ||
                !data.token_verifikasi
            ) {
                await db.execute(
                    `UPDATE penerima
                     SET
                        nomor_pengajuan = ?,
                        token_verifikasi = ?
                     WHERE nik = ?`,
                    [
                        nomorPengajuan,
                        tokenVerifikasi,
                        nik,
                    ]
                );
            }

            // Mengambil detail pengajuan
            const [hasil] = await db.execute(
                `SELECT
                    nama_lengkap,
                    nomor_pengajuan,
                    DATE_FORMAT(
                        created_at,
                        '%Y-%m-%d %H:%i:%s'
                    ) AS tanggal_pengajuan,
                    status_pengajuan,
                    token_verifikasi
                 FROM penerima
                 WHERE nik = ?`,
                [nik]
            );

            return res.json({
                pengajuan: hasil[0],
            });
        } catch (error) {
            console.error(
                "Gagal mengambil informasi pengajuan:",
                error.message
            );

            return res.status(500).json({
                message:
                    "Gagal mengambil informasi pengajuan.",
            });
        }
    }
);

// ================================================
// CEK STATUS PENGAJUAN MENGGUNAKAN TOKEN
// ================================================
app.get("/api/cek-status/:token", async (req, res) => {
    try {
        // Mengambil token dari URL
        const token = String(
            req.params.token || ""
        ).trim().toUpperCase();

        if (!token) {
            return res.status(400).json({
                message: "Token wajib diisi."
            });
        }

        // Mencari pengajuan berdasarkan token
        const [rows] = await db.execute(
            `SELECT
                nama_lengkap,
                nomor_pengajuan,
                status_pengajuan
             FROM penerima
             WHERE token_verifikasi = ?
             LIMIT 1`,
            [token]
        );

        // Jika token tidak ditemukan
        if (rows.length === 0) {
            return res.status(404).json({
                message: "Token tidak ditemukan. Periksa kembali token Anda."
            });
        }

        // Mengirim informasi pengajuan ke frontend
        return res.status(200).json({
            message: "Status pengajuan berhasil ditemukan.",
            pengajuan: rows[0]
        });

    } catch (error) {
        console.error(
            "Gagal mengecek status pengajuan:",
            error.message
        );

        return res.status(500).json({
            message: "Terjadi kesalahan saat mengecek status pengajuan."
        });
    }
});

// ================================================
// DAFTAR PENGAJUAN ADMIN
// ================================================
app.get("/api/admin/pengajuan", async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT
                nik,
                nama_lengkap,
                nomor_pengajuan,
                created_at,
                status_pengajuan
             FROM penerima
             WHERE nomor_pengajuan IS NOT NULL
               AND nomor_pengajuan <> ''
             ORDER BY created_at DESC`
        );

        return res.status(200).json({
            message: "Daftar pengajuan berhasil diambil.",
            total: rows.length,
            pengajuan: rows,
        });
    } catch (error) {
        console.error(
            "Gagal mengambil daftar pengajuan:",
            error.message
        );

        return res.status(500).json({
            message: "Gagal mengambil daftar pengajuan.",
        });
    }
});

// ================================================
// LOGIN ADMIN
// ================================================
app.post("/api/login/admin", async (req, res) => {
    try {
        const { login, password } = req.body;

        // Validasi input
        if (!login || !password) {
            return res.status(400).json({
                message: "Email/No. HP dan kata sandi wajib diisi."
            });
        }

        const identifier = String(login).trim();

        // Cari admin berdasarkan email atau nomor HP
        const [rows] = await db.execute(
            `SELECT
                id_admin,
                nama_lengkap,
                email,
                no_hp,
                password
             FROM admin
             WHERE email = ? OR no_hp = ?
             LIMIT 1`,
            [identifier, identifier]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                message: "Email/No. HP atau kata sandi tidak sesuai."
            });
        }

        const admin = rows[0];

        // Pastikan password sudah disimpan dalam bentuk hash
        if (
            !admin.password ||
            !admin.password.startsWith("$2")
        ) {
            return res.status(500).json({
                message: "Password admin belum dikonfigurasi dengan aman."
            });
        }

        // Bandingkan password input dengan hash database
        const passwordCocok = await bcrypt.compare(
            password,
            admin.password
        );

        if (!passwordCocok) {
            return res.status(401).json({
                message: "Email/No. HP atau kata sandi tidak sesuai."
            });
        }

        // Login berhasil
        return res.status(200).json({
            message: "Login admin berhasil.",
            admin: {
                id_admin: admin.id_admin,
                nama_lengkap: admin.nama_lengkap,
                email: admin.email
            }
        });

    } catch (error) {
        console.error(
            "Gagal login admin:",
            error.message
        );

        return res.status(500).json({
            message: "Terjadi kesalahan saat login admin."
        });
    }
});

// ================================================
// JALANKAN SERVER
// ================================================
app.listen(PORT, () => {
    console.log(
        `Backend ZAKATARA berjalan di http://localhost:${PORT}`
    );
});