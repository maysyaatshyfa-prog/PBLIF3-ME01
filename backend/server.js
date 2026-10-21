/* global process, require, __dirname */

require("dotenv").config();

const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
const mysql = require("mysql2/promise");
const cors = require("cors");
const multer = require("multer");
const path = require("node:path");
const fs = require("node:fs");

// ==================================================
// KONFIGURASI APLIKASI
// ==================================================

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
];

app.use(
    cors({
        origin: allowedOrigins,
    })
);

app.use(express.json({ limit: "2mb" }));

// ==================================================
// VALIDASI ENVIRONMENT
// ==================================================

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

// ==================================================
// KONEKSI DATABASE
// ==================================================

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
});

// ==================================================
// KONFIGURASI UPLOAD DOKUMEN
// ==================================================

const uploadRoot = path.join(
    __dirname,
    "uploads",
    "bukti-pendukung"
);

fs.mkdirSync(uploadRoot, { recursive: true });

const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".pdf",
];

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
];

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadRoot);
    },

    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();

        const uniqueName =
            `${Date.now()}-${crypto.randomBytes(8).toString("hex")}` +
            extension;

        callback(null, uniqueName);
    },
});

const upload = multer({
    storage,

    limits: {
        fileSize: 10 * 1024 * 1024,
    },

    fileFilter: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();

        if (
            !allowedExtensions.includes(extension) ||
            !allowedMimeTypes.includes(file.mimetype)
        ) {
            const error = new Error(
                "Format file harus JPG, JPEG, PNG, atau PDF."
            );

            error.status = 400;
            return callback(error);
        }

        callback(null, true);
    },
});

// Untuk pengembangan lokal.
// Dokumen pribadi perlu dilindungi autentikasi sebelum aplikasi
// dipakai dengan data pengguna sungguhan.
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

// ==================================================
// FUNGSI BANTU
// ==================================================

function buatNomorPengajuan() {
    const tahun = new Date().getFullYear();

    const kodeAcak = crypto
        .randomBytes(6)
        .toString("hex")
        .toUpperCase();

    return `ZKT-${tahun}-${kodeAcak}`;
}

function buatTokenVerifikasi() {
    return crypto
        .randomBytes(8)
        .toString("hex")
        .toUpperCase();
}

async function hapusFile(jalurFile) {
    if (!jalurFile) return;

    try {
        await fs.promises.unlink(jalurFile);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error(
                "Gagal menghapus file:",
                error.message
            );
        }
    }
}

// ==================================================
// TES BACKEND
// ==================================================

app.get("/api", (req, res) => {
    res.status(200).json({
        message: "Backend ZAKATARA berhasil berjalan!",
    });
});

// ==================================================
// TES KONEKSI DATABASE
// ==================================================

app.get("/api/db-test", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT 1 AS connected"
        );

        res.status(200).json({
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

/* ==================================================
   REGISTRASI CALON PENERIMA
================================================== */

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
            password,
            konfirmasi_password,
        } = req.body;

        // 1. Validasi data wajib
        if (
            !nik ||
            !nama_lengkap ||
            !tempat_lahir ||
            !tanggal_lahir ||
            !jenis_kelamin ||
            !no_hp ||
            !password ||
            !konfirmasi_password
        ) {
            return res.status(400).json({
                message: "Data wajib belum lengkap.",
            });
        }

        // 2. Normalisasi data
        const nikValue = String(nik).trim();
        const namaValue = String(nama_lengkap).trim();
        const tempatValue = String(tempat_lahir).trim();
        const noHpValue = String(no_hp).trim();
        const emailValue = email
            ? String(email).trim().toLowerCase() || null
            : null;

        // 3. Validasi NIK
        if (!/^\d{16}$/.test(nikValue)) {
            return res.status(400).json({
                message: "NIK harus terdiri dari 16 digit.",
            });
        }

        // 4. Validasi nama
        if (!namaValue || !tempatValue || !noHpValue) {
            return res.status(400).json({
                message: "Nama, tempat lahir, dan nomor HP wajib diisi.",
            });
        }

        // 5. Validasi jenis kelamin
        if (
            !["Laki-laki", "Perempuan"].includes(jenis_kelamin)
        ) {
            return res.status(400).json({
                message: "Jenis kelamin tidak valid.",
            });
        }

        // 6. Validasi password
        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({
                message: "Password minimal 8 karakter.",
            });
        }

        if (password !== konfirmasi_password) {
            return res.status(400).json({
                message: "Password dan konfirmasi password tidak cocok.",
            });
        }

        // 7. Validasi tanggal lahir
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
            sekarang.getMonth() < tanggalLahir.getMonth() ||
            (
                sekarang.getMonth() === tanggalLahir.getMonth() &&
                sekarang.getDate() < tanggalLahir.getDate()
            );

        if (belumUlangTahun) {
            usia--;
        }

        // 8. Validasi jumlah tanggungan
        const tanggungan = Number(jumlah_tanggungan ?? 0);

        if (
            !Number.isInteger(tanggungan) ||
            tanggungan < 0
        ) {
            return res.status(400).json({
                message: "Jumlah tanggungan tidak valid.",
            });
        }

        // 9. Hash password sebelum disimpan
        const passwordHash = await bcrypt.hash(password, 10);

        // 10. Simpan data termasuk password_hash
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
                password_hash,
                kecamatan,
                kelurahan,
                alamat_lengkap,
                status_pernikahan,
                jumlah_tanggungan,
                pekerjaan
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            nikValue,
            namaValue,
            tempatValue,
            tanggal_lahir,
            usia,
            jenis_kelamin,
            emailValue,
            noHpValue,
            passwordHash,
            kecamatan || null,
            kelurahan || null,
            alamat_lengkap || null,
            status_pernikahan || null,
            tanggungan,
            pekerjaan || null,
        ];

        await db.execute(sql, values);

        return res.status(201).json({
            message: "Data calon penerima berhasil disimpan.",
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
            message: "Gagal menyimpan data ke database.",
        });
    }
});

// ==================================================
// SIMPAN JAWABAN KUESIONER
// ==================================================

app.post(
    "/api/jawaban-kuesioner",
    async (req, res) => {
        let connection;
        let transactionStarted = false;

        try {
            const { nik_penerima, jawaban } = req.body;

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

            const nik = String(nik_penerima).trim();

            const jawabanValid = jawaban.map((item) => ({
                id_kriteria: Number(item.id_kriteria),
                nilai_jawaban: item.nilai_jawaban,
            }));

            const idKriteria = jawabanValid.map(
                (item) => item.id_kriteria
            );

            if (
                jawabanValid.some(
                    (item) =>
                        !Number.isInteger(item.id_kriteria) ||
                        item.id_kriteria <= 0 ||
                        !["Ya", "Tidak"].includes(
                            item.nilai_jawaban
                        )
                ) ||
                new Set(idKriteria).size !== idKriteria.length
            ) {
                return res.status(400).json({
                    message:
                        "Data jawaban atau ID kriteria tidak valid.",
                });
            }

            connection = await db.getConnection();

            const [penerimaAwal] = await connection.execute(
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

            const placeholders = idKriteria
                .map(() => "?")
                .join(", ");

            const [kriteria] = await connection.execute(
                `SELECT id_kriteria
                 FROM kriteria_pakar
                 WHERE id_kriteria IN (${placeholders})`,
                idKriteria
            );

            if (kriteria.length !== new Set(idKriteria).size) {
                return res.status(400).json({
                    message:
                        "Ada kriteria yang belum tersedia di database.",
                });
            }

            await connection.beginTransaction();
            transactionStarted = true;

            const [dataPenerima] = await connection.execute(
                `SELECT nik, nomor_pengajuan, token_verifikasi
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

            // Mengganti jawaban lama dengan jawaban terbaru.
            await connection.execute(
                `DELETE FROM jawaban_kuesioner
                 WHERE nik_penerima = ?`,
                [nik]
            );

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

            const nomorPengajuan =
                penerima.nomor_pengajuan ||
                buatNomorPengajuan();

            const tokenVerifikasi =
                penerima.token_verifikasi ||
                buatTokenVerifikasi();

            await connection.execute(
                `UPDATE penerima
                 SET nomor_pengajuan = ?,
                     token_verifikasi = ?
                 WHERE nik = ?`,
                [
                    nomorPengajuan,
                    tokenVerifikasi,
                    nik,
                ]
            );

            const [hasilPengajuan] = await connection.execute(
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

            await connection.commit();
            transactionStarted = false;

            return res.status(201).json({
                message: "Jawaban kuesioner berhasil disimpan.",
                jumlah_jawaban: jawabanValid.length,
                pengajuan: hasilPengajuan[0],
            });
        } catch (error) {
            if (connection && transactionStarted) {
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
                message: "Gagal menyimpan jawaban kuesioner.",
            });
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
);

// ==================================================
// SIMPAN DOKUMEN PENDUKUNG
// ==================================================
// Frontend perlu mengirim FormData dengan:
// - file
// - nik_penerima
// - id_kriteria
//
// Jawaban kuesioner harus sudah disimpan terlebih dahulu.

app.post(
    "/api/bukti-pendukung",
    upload.single("file"),
    async (req, res) => {
        let connection;
        let transactionStarted = false;

        try {
            const nik = String(
                req.body.nik_penerima || ""
            ).trim();

            const idKriteria = Number(
                req.body.id_kriteria
            );

            if (!nik || !Number.isInteger(idKriteria) || idKriteria <= 0) {
                await hapusFile(req.file?.path);

                return res.status(400).json({
                    message:
                        "NIK penerima dan ID kriteria wajib diisi.",
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    message: "File bukti pendukung wajib diunggah.",
                });
            }

            connection = await db.getConnection();

            const [penerima] = await connection.execute(
                `SELECT nik
                 FROM penerima
                 WHERE nik = ?`,
                [nik]
            );

            if (penerima.length === 0) {
                await hapusFile(req.file.path);

                return res.status(404).json({
                    message:
                        "Data calon penerima tidak ditemukan.",
                });
            }

            const [jawaban] = await connection.execute(
                `SELECT id_kriteria
                 FROM jawaban_kuesioner
                 WHERE nik_penerima = ?
                   AND id_kriteria = ?
                   AND nilai_jawaban = 'Ya'
                 LIMIT 1`,
                [nik, idKriteria]
            );

            if (jawaban.length === 0) {
                await hapusFile(req.file.path);

                return res.status(400).json({
                    message:
                        "Dokumen hanya dapat diunggah untuk pertanyaan yang dijawab Ya.",
                });
            }

            await connection.beginTransaction();
            transactionStarted = true;

            const [dokumenLama] = await connection.execute(
                `SELECT path_file
                 FROM bukti_pendukung
                 WHERE nik_penerima = ?
                   AND id_kriteria = ?`,
                [nik, idKriteria]
            );

            // Satu dokumen aktif per pertanyaan.
            await connection.execute(
                `DELETE FROM bukti_pendukung
                 WHERE nik_penerima = ?
                   AND id_kriteria = ?`,
                [nik, idKriteria]
            );

            const pathPublik =
                `/uploads/bukti-pendukung/${req.file.filename}`;

            await connection.execute(
                `INSERT INTO bukti_pendukung (
                    nik_penerima,
                    id_kriteria,
                    nama_file,
                    nama_file_simpan,
                    path_file,
                    tipe_file,
                    ukuran_file
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    nik,
                    idKriteria,
                    req.file.originalname,
                    req.file.filename,
                    pathPublik,
                    req.file.mimetype,
                    req.file.size,
                ]
            );

            await connection.commit();
            transactionStarted = false;

            // Hapus file lama setelah penggantian berhasil.
            for (const dokumen of dokumenLama) {
                if (dokumen.path_file) {
                    const namaLama = path.basename(
                        dokumen.path_file
                    );

                    await hapusFile(
                        path.join(uploadRoot, namaLama)
                    );
                }
            }

            return res.status(201).json({
                message:
                    "Dokumen pendukung berhasil disimpan.",
                dokumen: {
                    nama_file: req.file.originalname,
                    id_kriteria: idKriteria,
                    path_file: pathPublik,
                },
            });
        } catch (error) {
            if (connection && transactionStarted) {
                try {
                    await connection.rollback();
                } catch (rollbackError) {
                    console.error(
                        "Gagal membatalkan transaksi dokumen:",
                        rollbackError.message
                    );
                }
            }

            await hapusFile(req.file?.path);

            console.error(
                "Gagal menyimpan dokumen pendukung:",
                error.message
            );

            return res.status(500).json({
                message:
                    "Gagal menyimpan dokumen pendukung.",
            });
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
);

// ==================================================
// AMBIL INFORMASI PENGAJUAN CALON PENERIMA
// ==================================================


app.get("/api/pengajuan/:nik", async (req, res) => {
    try {
        const nik = String(req.params.nik || "").trim();

        if (!nik) {
            return res.status(400).json({
                message: "NIK wajib diisi.",
            });
        }

        const [rows] = await db.execute(
            `SELECT
                nama_lengkap,
                nomor_pengajuan,
                DATE_FORMAT(
                    created_at,
                    '%Y-%m-%d %H:%i:%s'
                ) AS tanggal_pengajuan,
                status_pengajuan,
                status_akun,
                token_verifikasi,
                golongan_mustahik,
                catatan_admin,
                tanggal_verifikasi
             FROM penerima
             WHERE nik = ?
             LIMIT 1`,
            [nik]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Data pengajuan tidak ditemukan.",
            });
        }

        const data = rows[0];

        const nomorPengajuan =
            data.nomor_pengajuan || buatNomorPengajuan();

        const tokenVerifikasi =
            data.token_verifikasi || buatTokenVerifikasi();

        if (!data.nomor_pengajuan || !data.token_verifikasi) {
            await db.execute(
                `UPDATE penerima
                 SET nomor_pengajuan = ?,
                     token_verifikasi = ?
                 WHERE nik = ?`,
                [nomorPengajuan, tokenVerifikasi, nik]
            );
        }

        return res.status(200).json({
            message: "Informasi pengajuan berhasil diambil.",
            pengajuan: {
                ...data,
                nomor_pengajuan: nomorPengajuan,
                token_verifikasi: tokenVerifikasi,
            },
        });
    } catch (error) {
        console.error(
            "Gagal mengambil informasi pengajuan:",
            error.message
        );

        return res.status(500).json({
            message: "Gagal mengambil informasi pengajuan.",
        });
    }
});


// ==================================================
// CEK STATUS PENGAJUAN MENGGUNAKAN TOKEN
// ==================================================

app.get("/api/cek-status/:token", async (req, res) => {
    try {
        const token = String(
            req.params.token || ""
        ).trim().toUpperCase();

        if (!token) {
            return res.status(400).json({
                message: "Token wajib diisi.",
            });
        }

        const [rows] = await db.execute(
            `SELECT
                nama_lengkap,
                nomor_pengajuan,
                DATE_FORMAT(
                    created_at,
                    '%Y-%m-%d %H:%i:%s'
                ) AS tanggal_pengajuan,
                status_pengajuan,
                status_akun,
                golongan_mustahik,
                catatan_admin,
                tanggal_verifikasi,
                token_verifikasi
             FROM penerima
             WHERE token_verifikasi = ?
             LIMIT 1`,
            [token]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message:
                    "Token tidak ditemukan. Periksa kembali token Anda.",
            });
        }

        return res.status(200).json({
            message: "Status pengajuan berhasil ditemukan.",
            pengajuan: rows[0],
        });
    } catch (error) {
        console.error(
            "Gagal mengecek status pengajuan:",
            error.message
        );

        return res.status(500).json({
            message:
                "Terjadi kesalahan saat mengecek status pengajuan.",
        });
    }
});


// ==================================================
// DAFTAR PENGAJUAN ADMIN
// ==================================================

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

// ==================================================
// DETAIL PENGAJUAN ADMIN
// ==================================================

app.get("/api/admin/pengajuan/:nik", async (req, res) => {
    try {
        const nik = String(req.params.nik || "").trim();

        if (!nik) {
            return res.status(400).json({
                message: "NIK pengajuan wajib diisi.",
            });
        }

        const [rows] = await db.execute(
            `SELECT
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
                pekerjaan,
                nomor_pengajuan,
                created_at,
                status_pengajuan,
                status_akun,
                hasil_sistem_pakar,
                file_bukti_pendukung
             FROM penerima
             WHERE nik = ?
             LIMIT 1`,
            [nik]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Pengajuan tidak ditemukan.",
            });
        }

        const [jawaban] = await db.execute(
            `SELECT
                jk.id_kriteria,
                kp.nama_kriteria,
                jk.nilai_jawaban
             FROM jawaban_kuesioner AS jk
             LEFT JOIN kriteria_pakar AS kp
                ON kp.id_kriteria = jk.id_kriteria
             WHERE jk.nik_penerima = ?
             ORDER BY jk.id_kriteria`,
            [nik]
        );

        const [dokumen] = await db.execute(
            `SELECT
                id_bukti,
                id_kriteria,
                nama_file,
                path_file,
                tipe_file,
                ukuran_file,
                created_at
             FROM bukti_pendukung
             WHERE nik_penerima = ?
             ORDER BY id_kriteria`,
            [nik]
        );

        return res.status(200).json({
            message: "Detail pengajuan berhasil diambil.",
            pengajuan: rows[0],
            jawaban,
            dokumen,
        });
    } catch (error) {
        console.error(
            "Gagal mengambil detail pengajuan:",
            error.message
        );

        return res.status(500).json({
            message: "Gagal mengambil detail pengajuan.",
        });
    }
});


/* ==================================================
   SIMPAN HASIL VERIFIKASI ADMIN
================================================== */

app.put("/api/admin/pengajuan/:nik/verifikasi", async (req, res) => {
    console.log("ROUTE VERIFIKASI TERPANGGIL");
    console.log("NIK:", req.params.nik);
    console.log("BODY:", req.body);

    try {
        const nik = String(req.params.nik || "").trim();
        const { hasil, golongan, catatan } = req.body;

        if (!nik) {
            return res.status(400).json({
                message: "NIK pengajuan wajib diisi.",
            });
        }

        if (!["Diterima", "Ditolak"].includes(hasil)) {
            return res.status(400).json({
                message: "Hasil verifikasi tidak valid.",
            });
        }

        const daftarGolongan = [
            "Fakir",
            "Miskin",
            "Amil",
            "Muallaf",
            "Riqab",
            "Gharim",
            "Fisabilillah",
            "Ibnu Sabil",
        ];

        if (!daftarGolongan.includes(golongan)) {
            return res.status(400).json({
                message: "Golongan mustahik tidak valid.",
            });
        }

        const [rows] = await db.execute(
            "SELECT nik FROM penerima WHERE nik = ? LIMIT 1",
            [nik]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Pengajuan tidak ditemukan.",
            });
        }

        const statusAkun =
            hasil === "Diterima"
                ? "Penerima Lolos"
                : "Calon Penerima";

        await db.execute(
            `UPDATE penerima
             SET status_pengajuan = ?,
                 status_akun = ?,
                 golongan_mustahik = ?,
                 catatan_admin = ?,
                 tanggal_verifikasi = CURRENT_TIMESTAMP
             WHERE nik = ?`,
            [
                hasil,
                statusAkun,
                golongan,
                catatan || null,
                nik,
            ]
        );

        return res.status(200).json({
            message: "Hasil verifikasi berhasil disimpan.",
            status_pengajuan: hasil,
            status_akun: statusAkun,
            golongan_mustahik: golongan,
        });
    } catch (error) {
        console.error("Gagal menyimpan verifikasi:", error);

        return res.status(500).json({
            message: "Gagal menyimpan hasil verifikasi.",
        });
    }
});


// ==================================================
// LOGIN ADMIN, MUSTAHIQ, MUZAKKI 
// ==================================================

app.post("/api/login", async (req, res) => {
    try {
        const { login, password } = req.body;

        if (!login?.trim() || !password) {
            return res.status(400).json({
                message: "Email/no. HP dan kata sandi wajib diisi.",
            });
        }

        const identifier = login.trim();

        // 1. Periksa akun admin
        const [admins] = await db.execute(
            `SELECT id_admin AS id, nama_lengkap, email,
                    no_hp, password
             FROM admin
             WHERE email = ? OR no_hp = ?
             LIMIT 1`,
            [identifier, identifier]
        );

        if (admins.length > 0) {
            const akun = admins[0];

            if (
                akun.password &&
                await bcrypt.compare(password, akun.password)
            ) {
                return res.json({
                    message: "Login admin berhasil.",
                    role: "admin",
                    akun: {
                        id: akun.id,
                        nama_lengkap: akun.nama_lengkap,
                        email: akun.email,
                    },
                });
            }
        }

        // 2. Periksa akun penerima yang sudah diterima
        const [penerima] = await db.execute(
            `SELECT nik AS id, nama_lengkap, email, no_hp,
                    password_hash, status_pengajuan
             FROM penerima
             WHERE email = ? OR no_hp = ?
             LIMIT 1`,
            [identifier, identifier]
        );

        if (penerima.length > 0) {
            const akun = penerima[0];

            if (akun.status_pengajuan !== "Diterima") {
                return res.status(403).json({
                    message:
                        "Akun belum diterima sebagai penerima zakat.",
                });
            }

            if (
                akun.password_hash &&
                await bcrypt.compare(password, akun.password_hash)
            ) {
                return res.json({
                    message: "Login penerima berhasil.",
                    role: "penerima",
                    akun: {
                        id: akun.id,
                        nama_lengkap: akun.nama_lengkap,
                        email: akun.email,
                    },
                });
            }
        }

        // 3. Periksa akun pemberi zakat
        const [pemberi] = await db.execute(
            `SELECT id_pemberi AS id, nama_lengkap, email,
                    no_hp, password
             FROM pemberi
             WHERE email = ? OR no_hp = ?
             LIMIT 1`,
            [identifier, identifier]
        );

        if (pemberi.length > 0) {
            const akun = pemberi[0];

            if (
                akun.password &&
                await bcrypt.compare(password, akun.password)
            ) {
                return res.json({
                    message: "Login pemberi berhasil.",
                    role: "pemberi",
                    akun: {
                        id: akun.id,
                        nama_lengkap: akun.nama_lengkap,
                        email: akun.email,
                    },
                });
            }
        }

        return res.status(401).json({
            message: "Email/no. HP atau kata sandi tidak sesuai.",
        });
    } catch (error) {
        console.error("Gagal login:", error.message);

        return res.status(500).json({
            message: "Terjadi kesalahan pada server.",
        });
    }
});


/* ==================================================
   UPDATE PROFIL PENERIMA
================================================== */

app.put("/api/penerima/profil/:nik", async (req, res) => {
    try {
        const nik = String(req.params.nik || "").trim();

        if (!/^\d{16}$/.test(nik)) {
            return res.status(400).json({
                message: "NIK tidak valid.",
            });
        }

        const {
            nama_lengkap,
            tempat_lahir,
            tanggal_lahir,
            jenis_kelamin,
            email,
            no_hp,
            provinsi,
            kota,
            kecamatan,
            kelurahan,
            alamat_lengkap,
            status_pernikahan,
            jumlah_tanggungan,
            pekerjaan,
        } = req.body;

        // Validasi data wajib
        if (
            !nama_lengkap?.trim() ||
            !tempat_lahir?.trim() ||
            !tanggal_lahir ||
            !["Laki-laki", "Perempuan"].includes(jenis_kelamin) ||
            !no_hp?.trim()
        ) {
            return res.status(400).json({
                message: "Data profil wajib belum lengkap.",
            });
        }

        // Validasi tanggal lahir
        const tanggalLahir = String(tanggal_lahir || "").trim();

        if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggalLahir)) {
            return res.status(400).json({
                message: "Format tanggal lahir harus YYYY-MM-DD.",
            });
        }

        const [tahun, bulan, hari] = tanggalLahir.split("-").map(Number);

        const tanggal = new Date(tahun, bulan - 1, hari);
        const sekarang = new Date();

        // Pastikan tanggal benar-benar valid
        if (
            tanggal.getFullYear() !== tahun ||
            tanggal.getMonth() !== bulan - 1 ||
            tanggal.getDate() !== hari ||
            tanggal > sekarang
        ) {
            return res.status(400).json({
                message: "Tanggal lahir tidak valid.",
            });
        }

        // Hitung ulang usia
        let usia =
            sekarang.getFullYear() - tanggal.getFullYear();

        if (
            sekarang.getMonth() < tanggal.getMonth() ||
            (
                sekarang.getMonth() === tanggal.getMonth() &&
                sekarang.getDate() < tanggal.getDate()
            )
        ) {
            usia--;
        }

        // Validasi jumlah tanggungan
        const tanggungan = Number(jumlah_tanggungan ?? 0);

        if (
            !Number.isInteger(tanggungan) ||
            tanggungan < 0
        ) {
            return res.status(400).json({
                message: "Jumlah tanggungan tidak valid.",
            });
        }

        const nama = nama_lengkap.trim();
        const tempat = tempat_lahir.trim();
        const noHp = no_hp.trim();
        const emailValue = email?.trim()
            ? email.trim().toLowerCase()
            : null;

        // Pastikan penerima tersedia
        const [rows] = await db.execute(
            `SELECT nik FROM penerima WHERE nik = ? LIMIT 1`,
            [nik]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Data penerima tidak ditemukan.",
            });
        }

        // Perbarui hanya kolom profil yang diizinkan
        await db.execute(
            `UPDATE penerima SET
                nama_lengkap = ?,
                tempat_lahir = ?,
                tanggal_lahir = ?,
                usia = ?,
                jenis_kelamin = ?,
                email = ?,
                no_hp = ?,
                provinsi = ?,
                kota = ?,
                kecamatan = ?,
                kelurahan = ?,
                alamat_lengkap = ?,
                status_pernikahan = ?,
                jumlah_tanggungan = ?,
                pekerjaan = ?
             WHERE nik = ?`,
            [
                nama,
                tempat,
                tanggal_lahir,
                usia,
                jenis_kelamin,
                emailValue,
                noHp,
                provinsi?.trim() || null,
                kota?.trim() || null,
                kecamatan?.trim() || null,
                kelurahan?.trim() || null,
                alamat_lengkap?.trim() || null,
                status_pernikahan?.trim() || null,
                tanggungan,
                pekerjaan?.trim() || null,
                nik,
            ]
        );

        // Ambil profil terbaru setelah berhasil disimpan
        const [profil] = await db.execute(
            `SELECT
                nik,
                nama_lengkap,
                tempat_lahir,
                tanggal_lahir,
                usia,
                jenis_kelamin,
                email,
                no_hp,
                provinsi,
                kota,
                kecamatan,
                kelurahan,
                alamat_lengkap,
                status_pernikahan,
                jumlah_tanggungan,
                pekerjaan
             FROM penerima
             WHERE nik = ?
             LIMIT 1`,
            [nik]
        );

        return res.status(200).json({
            message: "Profil berhasil diperbarui.",
            penerima: profil[0],
        });
    } catch (error) {
        console.error("Gagal memperbarui profil:", error.message);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Email atau data unik lainnya sudah digunakan.",
            });
        }

        return res.status(500).json({
            message: "Gagal memperbarui profil.",
        });
    }
});


/* ==================================================
   DASHBOARD PENERIMA
================================================== */

app.get("/api/penerima/dashboard/:nik", async (req, res) => {
    try {
        const nik = String(req.params.nik || "").trim();

        if (!/^\d{16}$/.test(nik)) {
            return res.status(400).json({
                message: "NIK tidak valid.",
            });
        }

        // Ambil data penerima
        const [penerimaRows] = await db.execute(
            `SELECT
               nik,
              nomor_pengajuan,
              nama_lengkap,
              tempat_lahir,
              tanggal_lahir,
              usia,
              jenis_kelamin,
              email,
              no_hp,
              provinsi,
              kota,
              kecamatan,
              kelurahan,
              alamat_lengkap,
              status_pernikahan,
              jumlah_tanggungan,
              pekerjaan,
              status_akun,
              status_pengajuan,
              created_at,
              golongan_mustahik
              FROM penerima
              WHERE nik = ?
              LIMIT 1`,
             [nik]
        );

        if (penerimaRows.length === 0) {
            return res.status(404).json({
                message: "Data penerima tidak ditemukan.",
            });
        }

        const penerima = penerimaRows[0];

        // Hitung total bantuan yang sudah disalurkan
        const [totalRows] = await db.execute(
            `SELECT
                COALESCE(SUM(nominal_bantuan), 0)
                    AS total_bantuan,
                COUNT(*) AS jumlah_bantuan
             FROM distribusi_dana
             WHERE nik_penerima = ?`,
            [nik]
        );

        // Ambil bantuan terakhir
        const [terakhirRows] = await db.execute(
            `SELECT
                id_distribusi,
                nominal_bantuan,
                keterangan_bantuan,
                tanggal_penyaluran
             FROM distribusi_dana
             WHERE nik_penerima = ?
             ORDER BY tanggal_penyaluran DESC,
                      id_distribusi DESC
             LIMIT 1`,
            [nik]
        );

        // Ambil riwayat bantuan
        const [riwayatRows] = await db.execute(
            `SELECT
                id_distribusi,
                nominal_bantuan,
                keterangan_bantuan,
                tanggal_penyaluran
             FROM distribusi_dana
             WHERE nik_penerima = ?
             ORDER BY tanggal_penyaluran DESC,
                      id_distribusi DESC`,
            [nik]
        );

        return res.status(200).json({
            message: "Data dashboard berhasil diambil.",
            penerima,
            statistik: {
                total_bantuan: Number(
                    totalRows[0].total_bantuan
                ),
                jumlah_bantuan: Number(
                    totalRows[0].jumlah_bantuan
                ),
            },
            bantuan_terakhir: terakhirRows[0] || null,
            riwayat_bantuan: riwayatRows,
        });
    } catch (error) {
        console.error(
            "Gagal mengambil dashboard penerima:",
            error.message
        );

        return res.status(500).json({
            message: "Gagal mengambil data dashboard.",
        });
    }
});

// ==================================================
// ENDPOINT TIDAK DITEMUKAN
// ==================================================

app.use("/api", (req, res) => {
    res.status(404).json({
        message: `Endpoint tidak ditemukan: ${req.method} ${req.originalUrl}`,
    });
});

// ================================================
// MIDDLEWARE ERROR UPLOAD DAN SERVER
// ================================================
app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    if (error instanceof multer.MulterError) {
        const message =
            error.code === "LIMIT_FILE_SIZE"
                ? "Ukuran file maksimal 10 MB."
                : "Upload dokumen gagal.";

        return res.status(400).json({ message });
    }

    console.error("Error server:", error.message);

    return res.status(500).json({
        message: "Terjadi kesalahan pada server.",
    });
});

// ==================================================
// JALANKAN SERVER
// ==================================================

app.listen(PORT, () => {
    console.log(
        `Backend ZAKATARA berjalan di http://localhost:${PORT}`
    );
});