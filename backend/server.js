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


/* ==================================================
   REGISTRASI AKUN MUZAKKI
================================================== */

app.post("/api/pemberi", async (req, res) => {
    try {
        const {
            nama_lengkap,
            alamat_lengkap,
            email,
            no_hp,
            nik,
            npwp,
            password,
            konfirmasi_password,
        } = req.body;

        // 1. Validasi data wajib
        if (
            !nama_lengkap?.trim() ||
            !email?.trim() ||
            !no_hp?.trim() ||
            !password ||
            !konfirmasi_password
        ) {
            return res.status(400).json({
                message: "Data wajib belum lengkap.",
            });
        }

        // 2. Normalisasi data
        const namaValue = nama_lengkap.trim();
        const alamatValue = alamat_lengkap?.trim() || null;
        const emailValue = email.trim().toLowerCase();
        const noHpValue = no_hp.trim();
        const nikValue = nik?.trim() || null;
        const npwpValue = npwp?.trim() || null;

        // 3. Validasi email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(emailValue)) {
            return res.status(400).json({
                message: "Format email tidak valid.",
            });
        }

        // 4. Validasi nomor HP
        if (!/^\d{10,15}$/.test(noHpValue)) {
            return res.status(400).json({
                message: "Nomor HP harus terdiri dari 10-15 digit angka.",
            });
        }

        // 5. Validasi NIK jika diisi
        if (nikValue && !/^\d{16}$/.test(nikValue)) {
            return res.status(400).json({
                message: "NIK harus terdiri dari 16 digit angka.",
            });
        }

        // 6. Validasi NPWP jika diisi
        if (npwpValue && !/^\d{16}$/.test(npwpValue)) {
            return res.status(400).json({
                message: "NPWP harus terdiri dari 16 digit angka.",
            });
        }

        // 7. Validasi password
        if (password.length < 8) {
            return res.status(400).json({
                message: "Password minimal 8 karakter.",
            });
        }

        if (password !== konfirmasi_password) {
            return res.status(400).json({
                message: "Konfirmasi password tidak sesuai.",
            });
        }

        // 8. Enkripsi password
        const passwordHash = await bcrypt.hash(password, 10);

        // 9. Simpan data ke tabel pemberi
        const [hasil] = await db.execute(
            `INSERT INTO pemberi (
                nama_lengkap,
                alamat_lengkap,
                email,
                no_hp,
                password,
                nik,
                npwp
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                namaValue,
                alamatValue,
                emailValue,
                noHpValue,
                passwordHash,
                nikValue,
                npwpValue,
            ]
        );

        return res.status(201).json({
            message: "Registrasi akun Muzakki berhasil.",
            akun: {
                id_pemberi: hasil.insertId,
                nama_lengkap: namaValue,
                email: emailValue,
            },
        });

    } catch (error) {
        console.error("Gagal registrasi Muzakki:", error);

        // Email, nomor HP, NIK, atau NPWP sudah digunakan
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Email, nomor HP, NIK, atau NPWP sudah terdaftar.",
            });
        }

        return res.status(500).json({
            message: "Terjadi kesalahan saat registrasi akun Muzakki.",
        });
    }
});


 // ==================================================
// AMBIL JAWABAN KUESIONER BERDASARKAN NIK
// ==================================================

app.get("/api/jawaban-kuesioner", async (req, res) => {
    try {
        const nik = String(req.query.nik_penerima || "").trim();

        if (!/^\d{16}$/.test(nik)) {
            return res.status(400).json({
                message: "NIK penerima harus terdiri dari 16 digit.",
            });
        }

        const [rows] = await db.execute(
            `SELECT
                jk.id_jawaban,
                jk.nik_penerima,
                jk.id_pertanyaan,
                jk.id_kriteria,
                pk.pertanyaan,
                kp.nama_kriteria,
                jk.nilai_jawaban
             FROM jawaban_kuesioner AS jk
             LEFT JOIN pertanyaan_kuesioner AS pk
                ON pk.id_pertanyaan = jk.id_pertanyaan
             LEFT JOIN kriteria_pakar AS kp
                ON kp.id_kriteria = jk.id_kriteria
             WHERE jk.nik_penerima = ?
             ORDER BY jk.id_jawaban ASC`,
            [nik]
        );

        return res.status(200).json({
            message: "Jawaban kuesioner berhasil diambil.",
            total: rows.length,
            data: rows,
        });
    } catch (error) {
        console.error("Gagal mengambil jawaban kuesioner:", error.message);
        return res.status(500).json({
            message: "Gagal mengambil jawaban kuesioner.",
        });
    }
});

// ==================================================
// SIMPAN JAWABAN KUESIONER
// ==================================================


app.post("/api/jawaban-kuesioner", async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        const { nik_penerima, jawaban } = req.body;
        const nik = String(nik_penerima || "").trim();

        if (!/^\d{16}$/.test(nik)) {
            return res.status(400).json({
                message: "NIK penerima harus terdiri dari 16 digit.",
            });
        }

        if (!Array.isArray(jawaban) || jawaban.length === 0) {
            return res.status(400).json({
                message: "Jawaban kuesioner wajib diisi.",
            });
        }

        // Setiap jawaban harus memiliki ID pertanyaan.
        const jawabanValid = jawaban.map((item) => ({
            id_pertanyaan: Number(item.id_pertanyaan),
            nilai_jawaban: item.nilai_jawaban,
        }));

        const idPertanyaan = jawabanValid.map(
            (item) => item.id_pertanyaan
        );

        if (
            jawabanValid.some(
                (item) =>
                    !Number.isInteger(item.id_pertanyaan) ||
                    item.id_pertanyaan <= 0 ||
                    item.nilai_jawaban === undefined ||
                    item.nilai_jawaban === null ||
                    (
                        typeof item.nilai_jawaban === "string" &&
                        item.nilai_jawaban.trim() === ""
                    )
            ) ||
            new Set(idPertanyaan).size !== idPertanyaan.length
        ) {
            return res.status(400).json({
                message: "ID pertanyaan atau nilai jawaban tidak valid.",
            });
        }

        connection = await db.getConnection();

        // Pastikan penerima terdaftar.
        const [penerima] = await connection.execute(
            `SELECT nik, nomor_pengajuan, token_verifikasi
             FROM penerima
             WHERE nik = ?
             LIMIT 1`,
            [nik]
        );

        if (penerima.length === 0) {
            return res.status(404).json({
                message: "Data calon penerima tidak ditemukan.",
            });
        }

        // Ambil pertanyaan dan kriteria langsung dari database.
        const placeholders = idPertanyaan.map(() => "?").join(", ");

        const [pertanyaanRows] = await connection.execute(
            `SELECT
                id_pertanyaan,
                id_kriteria,
                tipe_jawaban,
                opsi_jawaban,
                wajib_diisi
             FROM pertanyaan_kuesioner
             WHERE id_pertanyaan IN (${placeholders})`,
            idPertanyaan
        );

        if (pertanyaanRows.length !== idPertanyaan.length) {
            return res.status(400).json({
                message: "Ada ID pertanyaan yang tidak ditemukan.",
            });
        }

        const pertanyaanMap = new Map(
            pertanyaanRows.map((item) => [
                Number(item.id_pertanyaan),
                item,
            ])
        );

        const jawabanUntukDisimpan = [];

        for (const item of jawabanValid) {
            const pertanyaan = pertanyaanMap.get(
                item.id_pertanyaan
            );

            const nilai = item.nilai_jawaban;

            let opsi = pertanyaan.opsi_jawaban;

            if (typeof opsi === "string") {
                try {
                    opsi = JSON.parse(opsi);
                } catch {
                    opsi = [];
                }
            }

            // Normalisasi pilihan, tanpa membedakan huruf besar/kecil.
            if (
                ["pilihan", "dropdown"].includes(
                    pertanyaan.tipe_jawaban
                )
            ) {
                if (!Array.isArray(opsi)) {
                    return res.status(400).json({
                        message:
                            `Pilihan pertanyaan ID ${item.id_pertanyaan} tidak valid.`,
                    });
                }

                const pilihanCocok = opsi.find(
                    (pilihan) =>
                        String(pilihan).toLowerCase() ===
                        String(nilai).trim().toLowerCase()
                );

                if (pilihanCocok === undefined) {
                    return res.status(400).json({
                        message:
                            `Jawaban tidak sesuai pilihan pertanyaan ID ${item.id_pertanyaan}.`,
                    });
                }

                jawabanUntukDisimpan.push({
                    id_pertanyaan: Number(item.id_pertanyaan),
                    id_kriteria: Number(pertanyaan.id_kriteria),
                    nilai_jawaban: String(pilihanCocok),
                });

                continue;
            }

            // Checkbox menyimpan beberapa pilihan sebagai JSON.
            if (pertanyaan.tipe_jawaban === "checkbox") {
                if (
                    !Array.isArray(nilai) ||
                    !Array.isArray(opsi) ||
                    nilai.length === 0 ||
                    nilai.some(
                        (pilihan) =>
                            !opsi.some(
                                (opsiItem) =>
                                    String(opsiItem) ===
                                    String(pilihan)
                            )
                    )
                ) {
                    return res.status(400).json({
                        message:
                            `Jawaban checkbox pertanyaan ID ${item.id_pertanyaan} tidak valid.`,
                    });
                }

                jawabanUntukDisimpan.push({
                    id_pertanyaan: Number(item.id_pertanyaan),
                    id_kriteria: Number(pertanyaan.id_kriteria),
                    nilai_jawaban: JSON.stringify(nilai),
                });

                continue;
            }

            // Tipe lain disimpan sebagai teks.
            if (
                !["singkat", "paragraf", "tanggal", "waktu", "skala", "file"].includes(
                    pertanyaan.tipe_jawaban
                ) ||
                typeof nilai !== "string" ||
                nilai.trim() === ""
            ) {
                return res.status(400).json({
                    message:
                        `Format jawaban pertanyaan ID ${item.id_pertanyaan} tidak valid.`,
                });
            }

            jawabanUntukDisimpan.push({
                id_pertanyaan: Number(item.id_pertanyaan),
                id_kriteria: Number(pertanyaan.id_kriteria),
                nilai_jawaban: nilai.trim(),
            });
        }

        // Mulai transaksi setelah seluruh jawaban divalidasi.
        await connection.beginTransaction();
        transactionStarted = true;

        await connection.execute(
            `DELETE FROM jawaban_kuesioner
             WHERE nik_penerima = ?`,
            [nik]
        );

        for (const item of jawabanUntukDisimpan) {
            await connection.execute(
                `INSERT INTO jawaban_kuesioner (
                    nik_penerima,
                    id_pertanyaan,
                    id_kriteria,
                    nilai_jawaban
                ) VALUES (?, ?, ?, ?)`,
                [
                    nik,
                    item.id_pertanyaan,
                    item.id_kriteria,
                    item.nilai_jawaban,
                ]
            );
        }

        const nomorPengajuan =
            penerima[0].nomor_pengajuan || buatNomorPengajuan();

        const tokenVerifikasi =
            penerima[0].token_verifikasi || buatTokenVerifikasi();

        await connection.execute(
            `UPDATE penerima
             SET nomor_pengajuan = ?,
                 token_verifikasi = ?
             WHERE nik = ?`,
            [nomorPengajuan, tokenVerifikasi, nik]
        );

        await connection.commit();
        transactionStarted = false;

        return res.status(201).json({
            message: "Jawaban kuesioner berhasil disimpan.",
            jumlah_jawaban: jawabanUntukDisimpan.length,
            pengajuan: {
                nik_penerima: nik,
                nomor_pengajuan: nomorPengajuan,
                token_verifikasi: tokenVerifikasi,
            },
        });
    } catch (error) {
        if (connection && transactionStarted) {
            await connection.rollback().catch(() => {});
        }

        console.error(
            "Gagal menyimpan jawaban kuesioner:",
            error
        );

        return res.status(500).json({
            message: "Gagal menyimpan jawaban kuesioner.",
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// ==================================================
// SIMPAN DOKUMEN PENDUKUNG
// ==================================================

app.post(
    "/api/bukti-pendukung",
    upload.single("file"),
    async (req, res) => {
        let connection;
        let transactionStarted = false;

        try {
            const nik = String(req.body.nik_penerima || "").trim();
            const idPertanyaan = Number(req.body.id_pertanyaan);

            if (
                !/^\d{16}$/.test(nik) ||
                !Number.isInteger(idPertanyaan) ||
                idPertanyaan <= 0
            ) {
                await hapusFile(req.file?.path);
                return res.status(400).json({
                    message: "NIK penerima dan ID pertanyaan wajib diisi dengan benar.",
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    message: "File bukti pendukung wajib diunggah.",
                });
            }

            connection = await db.getConnection();

            const [penerima] = await connection.execute(
                `SELECT nik FROM penerima WHERE nik = ? LIMIT 1`,
                [nik]
            );

            if (penerima.length === 0) {
                await hapusFile(req.file.path);
                return res.status(404).json({
                    message: "Data calon penerima tidak ditemukan.",
                });
            }

            // ID kriteria dan aturan upload diambil dari pertanyaan terkait.
            const [pertanyaanRows] = await connection.execute(
                `SELECT
                    id_pertanyaan,
                    id_kriteria,
                    tampilkan_upload_jika_ya,
                    upload_wajib,
                    label_upload
                 FROM pertanyaan_kuesioner
                 WHERE id_pertanyaan = ?
                 LIMIT 1`,
                [idPertanyaan]
            );

            if (pertanyaanRows.length === 0) {
                await hapusFile(req.file.path);
                return res.status(404).json({
                    message: "Pertanyaan kuesioner tidak ditemukan.",
                });
            }

            const pertanyaan = pertanyaanRows[0];
            const idKriteria = Number(pertanyaan.id_kriteria);

            if (!Number(pertanyaan.tampilkan_upload_jika_ya)) {
                await hapusFile(req.file.path);
                return res.status(400).json({
                    message: "Pertanyaan ini tidak menyediakan unggah bukti pendukung.",
                });
            }

            // Bukti hanya diterima jika jawaban untuk pertanyaan yang sama adalah Ya.
            const [jawaban] = await connection.execute(
                `SELECT id_jawaban
                 FROM jawaban_kuesioner
                 WHERE nik_penerima = ?
                   AND id_pertanyaan = ?
                   AND LOWER(TRIM(nilai_jawaban)) = 'ya'
                 LIMIT 1`,
                [nik, idPertanyaan]
            );

            if (jawaban.length === 0) {
                await hapusFile(req.file.path);
                return res.status(400).json({
                    message: "Bukti hanya dapat diunggah untuk pertanyaan yang dijawab Ya.",
                });
            }

            await connection.beginTransaction();
            transactionStarted = true;

            // Ambil file lama hanya untuk pertanyaan ini, bukan semua pertanyaan di kriterianya.
            const [dokumenLama] = await connection.execute(
                `SELECT path_file
                 FROM bukti_pendukung
                 WHERE nik_penerima = ?
                   AND id_pertanyaan = ?`,
                [nik, idPertanyaan]
            );

            await connection.execute(
                `DELETE FROM bukti_pendukung
                 WHERE nik_penerima = ?
                   AND id_pertanyaan = ?`,
                [nik, idPertanyaan]
            );

            const pathPublik = `/uploads/bukti-pendukung/${req.file.filename}`;

            await connection.execute(
                `INSERT INTO bukti_pendukung (
                    nik_penerima,
                    id_pertanyaan,
                    id_kriteria,
                    nama_file,
                    nama_file_simpan,
                    path_file,
                    tipe_file,
                    ukuran_file
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    nik,
                    idPertanyaan,
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

            // File lama dihapus setelah transaksi database berhasil.
            for (const dokumen of dokumenLama) {
                if (dokumen.path_file) {
                    await hapusFile(path.join(uploadRoot, path.basename(dokumen.path_file)));
                }
            }

            return res.status(201).json({
                message: "Dokumen pendukung berhasil disimpan.",
                dokumen: {
                    nama_file: req.file.originalname,
                    id_pertanyaan: idPertanyaan,
                    id_kriteria: idKriteria,
                    path_file: pathPublik,
                },
            });
        } catch (error) {
            if (connection && transactionStarted) {
                await connection.rollback().catch((rollbackError) => {
                    console.error("Gagal rollback transaksi dokumen:", rollbackError.message);
                });
            }

            await hapusFile(req.file?.path);
            console.error("Gagal menyimpan dokumen pendukung:", error.message);
            return res.status(500).json({
                message: "Gagal menyimpan dokumen pendukung.",
            });
        } finally {
            if (connection) connection.release();
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


/* ==================================================
   DETAIL PENGAJUAN ADMIN
================================================== */

app.get("/api/admin/pengajuan/:nik", async (req, res) => {
    try {
        const nik = String(req.params.nik || "").trim();

        if (!/^\d{16}$/.test(nik)) {
            return res.status(400).json({
                message: "NIK pengajuan tidak valid.",
            });
        }

        // 1. Ambil data lengkap penerima
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
                provinsi,
                kota,
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
                file_bukti_pendukung,
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
                message: "Pengajuan tidak ditemukan.",
            });
        }

        const pengajuan = rows[0];

        // 2. Ambil jawaban kuesioner beserta nama kriteria
        const [jawaban] = await db.execute(
            `SELECT
                jk.id_jawaban,
                jk.id_pertanyaan,
                jk.id_kriteria,
                pk.pertanyaan,
                kp.nama_kriteria,
                jk.nilai_jawaban
             FROM jawaban_kuesioner AS jk
             LEFT JOIN pertanyaan_kuesioner AS pk
                ON pk.id_pertanyaan = jk.id_pertanyaan
             LEFT JOIN kriteria_pakar AS kp
                ON kp.id_kriteria = jk.id_kriteria
             WHERE jk.nik_penerima = ?
             ORDER BY jk.id_pertanyaan ASC, jk.id_jawaban ASC`,
            [nik]
        );

        // 3. Ambil dokumen pendukung
        const [dokumen] = await db.execute(
            `SELECT
                bp.id_bukti,
                bp.id_pertanyaan,
                bp.id_kriteria,
                pk.pertanyaan,
                bp.nama_file,
                bp.path_file,
                bp.tipe_file,
                bp.ukuran_file,
                bp.created_at
             FROM bukti_pendukung AS bp
             LEFT JOIN pertanyaan_kuesioner AS pk
                ON pk.id_pertanyaan = bp.id_pertanyaan
             WHERE bp.nik_penerima = ?
             ORDER BY bp.id_pertanyaan ASC, bp.id_bukti ASC`,
            [nik]
        );

        // 4. Kirim seluruh data ke frontend
        return res.status(200).json({
            message: "Detail pengajuan berhasil diambil.",
            pengajuan,
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

// ==================================================
// DAFTAR ADMIN
// ==================================================

app.get("/api/admin", async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT
                id_admin,
                nama_lengkap,
                alamat_lengkap,
                email,
                no_hp,
                created_at
             FROM admin
             ORDER BY id_admin DESC`
        );

        return res.status(200).json({
            admins: rows,
        });
    } catch (error) {
        console.error(
            "Gagal mengambil daftar admin:",
            error.message
        );

        return res.status(500).json({
            message: "Gagal mengambil daftar admin.",
        });
    }
});


// ==================================================
// TAMBAH ADMIN
// ==================================================

app.post("/api/admin", async (req, res) => {
    try {
        const {
            nama_lengkap,
            alamat_lengkap,
            email,
            no_hp,
            password,
        } = req.body;

        if (
            !nama_lengkap?.trim() ||
            !alamat_lengkap?.trim() ||
            !email?.trim() ||
            !no_hp?.trim() ||
            !password
        ) {
            return res.status(400).json({
                message:
                    "Semua kolom wajib diisi.",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message:
                    "Password minimal 8 karakter.",
            });
        }

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email.trim()
            )
        ) {
            return res.status(400).json({
                message: "Format email tidak valid.",
            });
        }

        const [existing] = await db.execute(
            `SELECT id_admin
             FROM admin
             WHERE email = ? OR no_hp = ?
             LIMIT 1`,
            [email.trim(), no_hp.trim()]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message:
                    "Email atau nomor HP sudah terdaftar.",
            });
        }

        const passwordHash = await bcrypt.hash(
            password,
            10
        );

        const [result] = await db.execute(
            `INSERT INTO admin (
                nama_lengkap,
                alamat_lengkap,
                email,
                no_hp,
                password
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                nama_lengkap.trim(),
                alamat_lengkap.trim(),
                email.trim(),
                no_hp.trim(),
                passwordHash,
            ]
        );

        const [rows] = await db.execute(
            `SELECT
                id_admin,
                nama_lengkap,
                alamat_lengkap,
                email,
                no_hp,
                created_at
             FROM admin
             WHERE id_admin = ?
             LIMIT 1`,
            [result.insertId]
        );

        return res.status(201).json({
            message: "Admin berhasil ditambahkan.",
            admin: rows[0],
        });
    } catch (error) {
        console.error(
            "Gagal menambahkan admin:",
            error.message
        );

        return res.status(500).json({
            message: "Gagal menambahkan admin.",
        });
    }
});


/* ==================================================
   SIMPAN HASIL VERIFIKASI ADMIN
================================================== */

app.put("/api/admin/pengajuan/:nik/verifikasi", async (req, res) => {
    try {
        const nik = String(req.params.nik || "").trim();
        const { hasil, golongan, catatan } = req.body;

        if (!/^\d{16}$/.test(nik)) {
            return res.status(400).json({
                message: "NIK pengajuan tidak valid.",
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
            `SELECT nik
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

        // Ambil data terbaru setelah berhasil disimpan
        const [dataTerbaru] = await db.execute(
            `SELECT
                status_pengajuan,
                status_akun,
                golongan_mustahik,
                catatan_admin,
                tanggal_verifikasi
             FROM penerima
             WHERE nik = ?
             LIMIT 1`,
            [nik]
        );

        return res.status(200).json({
            message: "Status verifikasi berhasil disimpan.",
            ...dataTerbaru[0],
        });

    } catch (error) {
        console.error(
            "Gagal menyimpan verifikasi:",
            error
        );

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

// ===============================
// GET DATA ADMIN
// ===============================
app.get("/api/admin", async (req, res) => {
  try {
    const [admins] = await db.execute(`
      SELECT
        id_admin,
        nama_lengkap,
        alamat_lengkap,
        email,
        no_hp,
        created_at
      FROM admin
      ORDER BY created_at DESC
    `);

    return res.status(200).json({
      message: "Data admin berhasil diambil.",
      total: admins.length,
      admins,
    });
  } catch (error) {
    console.error("Gagal mengambil data admin:", error);

    return res.status(500).json({
      message: "Gagal mengambil data admin.",
    });
  }
});

// ==================================================
// KONSTANTA ASNAF UNTUK API KRITERIA
// ==================================================

// ==================================================
// API KRITERIA PAKAR
// ==================================================

const LABEL_ASNAF_KRITERIA = {
    fakir: "Fakir",
    miskin: "Miskin",
    amil: "Amil",
    muallaf: "Muallaf",
    riqab: "Riqab",
    gharim: "Gharim",
    fisabilillah: "Fi Sabilillah",
    "ibnu-sabil": "Ibnu Sabil",
};

app.get("/api/admin/kriteria", async (req, res) => {
    try {
        const asnaf = String(req.query.asnaf || "")
            .trim()
            .toLowerCase();

        let sql = `
            SELECT
                id_kriteria,
                nama_kriteria,
                bobot_kriteria
            FROM kriteria_pakar
        `;

        let values = [];

        // Jika asnaf dikirim, tampilkan kriteria sesuai asnaf.
        if (asnaf) {
            const labelAsnaf = LABEL_ASNAF_KRITERIA[asnaf];

            if (!labelAsnaf) {
                return res.status(400).json({
                    message: "Golongan asnaf tidak valid.",
                });
            }

            sql += `
                WHERE LOWER(nama_kriteria) LIKE LOWER(?)
            `;

            values.push(`${labelAsnaf} -%`);
        }

        sql += ` ORDER BY id_kriteria ASC`;

        const [rows] = await db.execute(sql, values);

        return res.status(200).json({
            total: rows.length,
            data: rows,
        });
    } catch (error) {
        console.error(
            "Gagal mengambil data kriteria:",
            error.message
        );

        return res.status(500).json({
            message: "Gagal mengambil data kriteria.",
        });
    }
});
// ================================================
// AMBIL SEMUA PERTANYAAN KUESIONER
// ================================================

app.get(
    "/api/admin/pertanyaan/semua",
    async (req, res) => {
        try {
            const [rows] = await db.execute(`
                SELECT
                    id_pertanyaan,
                    id_kriteria,
                    pertanyaan,
                    tipe_jawaban,
                    opsi_jawaban,
                    wajib_diisi,
                    tampilkan_upload_jika_ya,
                    upload_wajib,
                    label_upload,
                    urutan
                FROM pertanyaan_kuesioner
                ORDER BY
                    id_kriteria ASC,
                    urutan ASC,
                    id_pertanyaan ASC
            `);

            const data = rows.map((item) => {
                let opsiJawaban = item.opsi_jawaban;

                if (typeof opsiJawaban === "string") {
                    try {
                        opsiJawaban = JSON.parse(
                            opsiJawaban
                        );
                    } catch {
                        opsiJawaban = [];
                    }
                }

                return {
                    ...item,
                    opsi_jawaban: opsiJawaban,
                    wajib_diisi: Boolean(
                        item.wajib_diisi
                    ),
                    tampilkan_upload_jika_ya: Boolean(
                        item.tampilkan_upload_jika_ya
                    ),
                    upload_wajib: Boolean(
                        item.upload_wajib
                    ),
                };
            });

            return res.json({
                total: data.length,
                data,
            });
        } catch (error) {
            console.error(
                "Gagal mengambil semua pertanyaan:",
                error
            );

            return res.status(500).json({
                message:
                    "Gagal mengambil semua pertanyaan.",
            });
        }
    }
);
// ==================================================
// 18. AMBIL DAFTAR KRITERIA
// ==================================================

app.get(
    "/api/admin/kriteria",
    async (req, res) => {
        try {
            const [rows] = await db.execute(
                `SELECT
                    id_kriteria,
                    nama_kriteria,
                    bobot_kriteria
                 FROM kriteria_pakar
                 ORDER BY id_kriteria ASC`
            );

            return res.json({
                data: rows,
            });
        } catch (error) {
            console.error(
                "Gagal mengambil data kriteria:",
                error.message
            );

            return res.status(500).json({
                message:
                    "Gagal mengambil data kriteria.",
            });
        }
    }
);
// ==================================================
// 19. AMBIL PERTANYAAN BERDASARKAN ID KRITERIA
// ==================================================

app.get(
    "/api/admin/pertanyaan",
    async (req, res) => {
        try {
            const idKriteria = Number(
                req.query.id_kriteria
            );

            if (
                !Number.isInteger(idKriteria) ||
                idKriteria <= 0
            ) {
                return res.status(400).json({
                    message:
                        "ID kriteria tidak valid.",
                });
            }

            const [rows] = await db.execute(
                `SELECT
                    id_pertanyaan,
                    id_kriteria,
                    pertanyaan,
                    tipe_jawaban,
                    opsi_jawaban,
                    wajib_diisi,
                    tampilkan_upload_jika_ya,
                    upload_wajib,
                    label_upload,
                    urutan
                 FROM pertanyaan_kuesioner
                 WHERE id_kriteria = ?
                 ORDER BY urutan ASC, id_pertanyaan ASC`,
                [idKriteria]
            );

            const data = rows.map((item) => {
                let opsiJawaban = item.opsi_jawaban;

                if (typeof opsiJawaban === "string") {
                    try {
                        opsiJawaban = JSON.parse(
                            opsiJawaban
                        );
                    } catch {
                        opsiJawaban = [];
                    }
                }

                return {
                    ...item,
                    opsi_jawaban: opsiJawaban,
                    wajib_diisi: Boolean(
                        item.wajib_diisi
                    ),
                    tampilkan_upload_jika_ya: Boolean(
                        item.tampilkan_upload_jika_ya
                    ),
                    upload_wajib: Boolean(
                        item.upload_wajib
                    ),
                };
            });

            return res.json({
                data,
            });
        } catch (error) {
            console.error(
                "Gagal mengambil pertanyaan:",
                error.message
            );

            return res.status(500).json({
                message:
                    "Gagal mengambil pertanyaan.",
            });
        }
    }
);

// ==================================================
// 20. TAMBAH PERTANYAAN
// ==================================================

app.post(
    "/api/admin/pertanyaan",
    async (req, res) => {
        try {
            const {
                id_kriteria,
                pertanyaan,
                tipe_jawaban = "singkat",
                opsi_jawaban = null,
                wajib_diisi = true,
                tampilkan_upload_jika_ya = false,
                upload_wajib = false,
                label_upload = "Unggah bukti pendukung",
                urutan = 1,
            } = req.body;

            const idKriteria = Number(id_kriteria);

            const teksPertanyaan = String(
                pertanyaan || ""
            ).trim();

            const tipeDiizinkan = [
                "singkat",
                "paragraf",
                "pilihan",
                "checkbox",
                "dropdown",
                "tanggal",
                "waktu",
                "file",
                "skala",
            ];

            if (
                !Number.isInteger(idKriteria) ||
                idKriteria <= 0 ||
                !teksPertanyaan
            ) {
                return res.status(400).json({
                    message:
                        "Kriteria dan teks pertanyaan wajib diisi.",
                });
            }

            if (
                !tipeDiizinkan.includes(tipe_jawaban)
            ) {
                return res.status(400).json({
                    message:
                        "Tipe jawaban tidak valid.",
                });
            }

            if (
                ["pilihan", "checkbox", "dropdown"].includes(
                    tipe_jawaban
                ) &&
                (
                    !Array.isArray(opsi_jawaban) ||
                    opsi_jawaban.filter(
                        (opsi) =>
                            String(opsi).trim() !== ""
                    ).length < 2
                )
            ) {
                return res.status(400).json({
                    message:
                        "Tipe pilihan harus memiliki minimal dua opsi.",
                });
            }

            const [kriteria] = await db.execute(
                `SELECT id_kriteria
                 FROM kriteria_pakar
                 WHERE id_kriteria = ?`,
                [idKriteria]
            );

            if (kriteria.length === 0) {
                return res.status(404).json({
                    message:
                        "Kriteria tidak ditemukan.",
                });
            }

            const [hasil] = await db.execute(
                `INSERT INTO pertanyaan_kuesioner (
                    id_kriteria,
                    pertanyaan,
                    tipe_jawaban,
                    opsi_jawaban,
                    wajib_diisi,
                    tampilkan_upload_jika_ya,
                    upload_wajib,
                    label_upload,
                    urutan
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    idKriteria,
                    teksPertanyaan,
                    tipe_jawaban,
                    opsi_jawaban == null
                        ? null
                        : JSON.stringify(opsi_jawaban),
                    wajib_diisi ? 1 : 0,
                    tampilkan_upload_jika_ya ? 1 : 0,
                    upload_wajib ? 1 : 0,
                    String(
                        label_upload ||
                        "Unggah bukti pendukung"
                    ),
                    Math.max(
                        1,
                        Number(urutan) || 1
                    ),
                ]
            );

            return res.status(201).json({
                message:
                    "Pertanyaan berhasil ditambahkan.",
                id_pertanyaan: hasil.insertId,
            });
        } catch (error) {
            console.error(
                "Gagal menambahkan pertanyaan:",
                error.message
            );

            return res.status(500).json({
                message:
                    "Gagal menambahkan pertanyaan.",
            });
        }
    }
);

// ==================================================
// 21. UBAH PERTANYAAN
// ==================================================

app.put(
    "/api/admin/pertanyaan/:id",
    async (req, res) => {
        try {
            const idPertanyaan = Number(
                req.params.id
            );

            const {
                id_kriteria,
                pertanyaan,
                tipe_jawaban = "singkat",
                opsi_jawaban = null,
                wajib_diisi = true,
                tampilkan_upload_jika_ya = false,
                upload_wajib = false,
                label_upload = "Unggah bukti pendukung",
                urutan = 1,
            } = req.body;

            const idKriteria = Number(id_kriteria);

            const teksPertanyaan = String(
                pertanyaan || ""
            ).trim();

            const tipeDiizinkan = [
                "singkat",
                "paragraf",
                "pilihan",
                "checkbox",
                "dropdown",
                "tanggal",
                "waktu",
                "file",
                "skala",
            ];

            if (
                !Number.isInteger(idPertanyaan) ||
                idPertanyaan <= 0 ||
                !Number.isInteger(idKriteria) ||
                idKriteria <= 0 ||
                !teksPertanyaan
            ) {
                return res.status(400).json({
                    message:
                        "ID, kriteria, dan pertanyaan wajib valid.",
                });
            }

            if (
                !tipeDiizinkan.includes(tipe_jawaban)
            ) {
                return res.status(400).json({
                    message:
                        "Tipe jawaban tidak valid.",
                });
            }

            if (
                ["pilihan", "checkbox", "dropdown"].includes(
                    tipe_jawaban
                ) &&
                (
                    !Array.isArray(opsi_jawaban) ||
                    opsi_jawaban.filter(
                        (opsi) =>
                            String(opsi).trim() !== ""
                    ).length < 2
                )
            ) {
                return res.status(400).json({
                    message:
                        "Tipe pilihan harus memiliki minimal dua opsi.",
                });
            }

            const [kriteria] = await db.execute(
                `SELECT id_kriteria
                 FROM kriteria_pakar
                 WHERE id_kriteria = ?`,
                [idKriteria]
            );

            if (kriteria.length === 0) {
                return res.status(404).json({
                    message:
                        "Kriteria tidak ditemukan.",
                });
            }

            const [hasil] = await db.execute(
                `UPDATE pertanyaan_kuesioner
                 SET
                    id_kriteria = ?,
                    pertanyaan = ?,
                    tipe_jawaban = ?,
                    opsi_jawaban = ?,
                    wajib_diisi = ?,
                    tampilkan_upload_jika_ya = ?,
                    upload_wajib = ?,
                    label_upload = ?,
                    urutan = ?
                 WHERE id_pertanyaan = ?`,
                [
                    idKriteria,
                    teksPertanyaan,
                    tipe_jawaban,
                    opsi_jawaban == null
                        ? null
                        : JSON.stringify(opsi_jawaban),
                    wajib_diisi ? 1 : 0,
                    tampilkan_upload_jika_ya ? 1 : 0,
                    upload_wajib ? 1 : 0,
                    String(
                        label_upload ||
                        "Unggah bukti pendukung"
                    ),
                    Math.max(
                        1,
                        Number(urutan) || 1
                    ),
                    idPertanyaan,
                ]
            );

            if (hasil.affectedRows === 0) {
                const [cek] = await db.execute(
                    `SELECT id_pertanyaan
                     FROM pertanyaan_kuesioner
                     WHERE id_pertanyaan = ?`,
                    [idPertanyaan]
                );

                if (cek.length === 0) {
                    return res.status(404).json({
                        message:
                            "Pertanyaan tidak ditemukan.",
                    });
                }
            }

            return res.json({
                message:
                    "Pertanyaan berhasil diperbarui.",
            });
        } catch (error) {
            console.error(
                "Gagal memperbarui pertanyaan:",
                error.message
            );

            return res.status(500).json({
                message:
                    "Gagal memperbarui pertanyaan.",
            });
        }
    }
);


 // ==================================================
// 22. HAPUS PERTANYAAN
// ==================================================

app.delete(
    "/api/admin/pertanyaan/:id",
    async (req, res) => {
        const idPertanyaan = Number(req.params.id);

        if (
            !Number.isInteger(idPertanyaan) ||
            idPertanyaan <= 0
        ) {
            return res.status(400).json({
                message: "ID pertanyaan tidak valid.",
            });
        }

        let connection;

        try {
            connection = await db.getConnection();

            await connection.beginTransaction();

            // Pastikan pertanyaan tersedia.
            const [pertanyaan] = await connection.execute(
                `SELECT id_pertanyaan
                 FROM pertanyaan_kuesioner
                 WHERE id_pertanyaan = ?
                 FOR UPDATE`,
                [idPertanyaan]
            );

            if (pertanyaan.length === 0) {
                await connection.rollback();

                return res.status(404).json({
                    message: "Pertanyaan tidak ditemukan.",
                });
            }

            // Periksa apakah pertanyaan sudah memiliki jawaban.
            const [jawaban] = await connection.execute(
                `SELECT id_jawaban
                 FROM jawaban_kuesioner
                 WHERE id_pertanyaan = ?
                 LIMIT 1`,
                [idPertanyaan]
            );

            const [dokumen] = await connection.execute(
                `SELECT id_bukti
                 FROM bukti_pendukung
                 WHERE id_pertanyaan = ?
                 LIMIT 1`,
                [idPertanyaan]
            );

            if (jawaban.length > 0 || dokumen.length > 0) {
                await connection.rollback();

                return res.status(409).json({
                    message:
                        "Pertanyaan tidak dapat dihapus karena sudah memiliki jawaban atau bukti pendukung.",
                });
            }

            const [hasil] = await connection.execute(
                `DELETE FROM pertanyaan_kuesioner
                 WHERE id_pertanyaan = ?`,
                [idPertanyaan]
            );

            if (hasil.affectedRows === 0) {
                await connection.rollback();

                return res.status(404).json({
                    message: "Pertanyaan tidak ditemukan.",
                });
            }

            await connection.commit();

            return res.status(200).json({
                message: "Pertanyaan berhasil dihapus.",
            });
        } catch (error) {
            if (connection) {
                await connection.rollback().catch(() => {});
            }

            console.error(
                "Gagal menghapus pertanyaan:",
                error.message
            );

            return res.status(500).json({
                message: "Gagal menghapus pertanyaan.",
            });
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
);


// ==================================================
// 23. DAFTAR TRANSAKSI ADMIN
// ==================================================

app.get(
    "/api/admin/transaksi",
    async (req, res) => {
        try {
            const [rows] = await db.execute(
                `SELECT
                    td.id_transaksi,
                    td.id_pemberi,
                    p.nama_lengkap AS nama_pemberi,
                    td.id_event,
                    td.jenis_dana,
                    td.nominal,
                    td.metode_pembayaran,
                    td.status_pembayaran,
                    td.tanggal_bayar
                 FROM transaksi_donasi td
                 LEFT JOIN pemberi p
                    ON td.id_pemberi = p.id_pemberi
                 ORDER BY
                    td.tanggal_bayar DESC,
                    td.id_transaksi DESC`
            );

            const [summaryRows] = await db.execute(
                `SELECT
                    COUNT(*) AS total_transaksi,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN status_pembayaran = 'Success'
                                THEN nominal
                                ELSE 0
                            END
                        ),
                        0
                    ) AS total_nominal_berhasil,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN status_pembayaran = 'Pending'
                                THEN 1
                                ELSE 0
                            END
                        ),
                        0
                    ) AS total_menunggu,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN status_pembayaran = 'Success'
                                THEN 1
                                ELSE 0
                            END
                        ),
                        0
                    ) AS total_berhasil,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN status_pembayaran = 'Failed'
                                THEN 1
                                ELSE 0
                            END
                        ),
                        0
                    ) AS total_gagal,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN tanggal_bayar >=
                                    DATE_FORMAT(
                                        CURDATE(),
                                        '%Y-%m-01'
                                    )
                                AND tanggal_bayar <
                                    DATE_FORMAT(
                                        CURDATE() + INTERVAL 1 MONTH,
                                        '%Y-%m-01'
                                    )
                                THEN 1
                                ELSE 0
                            END
                        ),
                        0
                    ) AS transaksi_bulan_ini

                 FROM transaksi_donasi`
            );

            return res.status(200).json({
                message:
                    "Data transaksi berhasil diambil.",
                total: rows.length,
                transaksi: rows,
                statistik: summaryRows[0],
            });
        } catch (error) {
            console.error(
                "Gagal mengambil data transaksi:",
                error.message
            );

            return res.status(500).json({
                message:
                    "Gagal mengambil data transaksi.",
            });
        }
    }
);


/* ================================================
   DAFTAR PENERIMA YANG SUDAH DIVERIFIKASI
================================================ */

app.get("/api/penerima", async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT
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
                status_akun,
                status_pengajuan,
                golongan_mustahik,
                tanggal_verifikasi,
                created_at
            FROM penerima
            WHERE status_pengajuan = 'Diterima'
            ORDER BY tanggal_verifikasi DESC, created_at DESC
        `);

        return res.status(200).json({
            message: "Daftar penerima terverifikasi berhasil diambil.",
            total: rows.length,
            penerima: rows,
        });
    } catch (error) {
        console.error(
            "Gagal mengambil daftar penerima:",
            error.message
        );

        return res.status(500).json({
            message: "Gagal mengambil daftar penerima.",
        });
    }
});


// ================================================
// DAFTAR PEMBERI ZAKAT
// ================================================
app.get("/api/pemberi", async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT
                id_pemberi,
                nama_lengkap,
                email,
                no_hp,
                created_at
            FROM pemberi
            ORDER BY created_at DESC
        `);

        return res.status(200).json({
            message: "Data pemberi berhasil diambil.",
            total: rows.length,
            pemberi: rows,
        });
    } catch (error) {
        console.error(
            "Gagal mengambil data pemberi:",
            error.message
        );

        return res.status(500).json({
            message: "Gagal mengambil data pemberi.",
        });
    }
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


/* ================================================
   STATISTIK DASHBOARD ADMIN
================================================ */
app.get("/api/admin/dashboard", async (req, res) => {
    try {
        // 1. Menghitung pengajuan yang masih menunggu verifikasi
        const [pengajuanRows] = await db.execute(`
            SELECT COUNT(*) AS total
            FROM penerima
            WHERE status_pengajuan = 'Menunggu Verifikasi'
        `);

        // 2. Menghitung seluruh pemberi zakat
        const [pemberiRows] = await db.execute(`
            SELECT COUNT(*) AS total
            FROM pemberi
        `);

        // 3. Menghitung total transaksi yang pembayarannya berhasil
        const [zakatRows] = await db.execute(`
            SELECT COALESCE(SUM(nominal), 0) AS total
            FROM transaksi_donasi
            WHERE LOWER(status_pembayaran) IN (
                'berhasil',
                'lunas',
                'sukses'
            )
        `);

        // 4. Menghitung jumlah pengajuan setiap bulan
        const [grafikRows] = await db.execute(`
            SELECT
                DATE_FORMAT(created_at, '%Y-%m') AS periode,
                COUNT(*) AS jumlah
            FROM penerima
            WHERE created_at >= DATE_FORMAT(
                DATE_SUB(CURDATE(), INTERVAL 11 MONTH),
                '%Y-%m-01'
            )
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY periode ASC
        `);

        const namaBulan = [
            "Jan", "Feb", "Mar", "Apr",
            "Mei", "Jun", "Jul", "Agu",
            "Sep", "Okt", "Nov", "Des"
        ];

        const grafikPengajuan = grafikRows.map((row) => {
            const [tahun, bulan] = row.periode.split("-");

            return {
                bulan: `${namaBulan[Number(bulan) - 1]} ${tahun}`,
                jumlah: Number(row.jumlah),
            };
        });

        return res.status(200).json({
            pengajuanMenunggu: Number(pengajuanRows[0].total),
            totalPemberi: Number(pemberiRows[0].total),
            totalZakat: Number(zakatRows[0].total),
            grafikPengajuan,
        });
    } catch (error) {
        console.error("Gagal mengambil statistik dashboard:", error);

        return res.status(500).json({
            message: "Gagal mengambil statistik dashboard.",
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

// ==================================================
// JALANKAN SERVER
// ==================================================

app.listen(PORT, () => {
    console.log(
        `Backend ZAKATARA berjalan di http://localhost:${PORT}`
    );
});
