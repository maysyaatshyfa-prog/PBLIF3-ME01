/* global process, require */

require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Middleware
app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

// Periksa konfigurasi database
const requiredEnv = [
    "DB_HOST",
    "DB_PORT",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME"
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
    connectionLimit: 10
});

// Tes backend
app.get("/api", (req, res) => {
    res.json({
        message: "Backend ZAKATARA berhasil berjalan!"
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
            connected: rows[0].connected
        });
    } catch (error) {
        console.error(
            "Koneksi database gagal:",
            error.message
        );

        res.status(500).json({
            message: "Koneksi database gagal."
        });
    }
});

// Jalankan server
app.listen(PORT, () => {
    console.log(
        `Backend ZAKATARA berjalan di http://localhost:${PORT}`
    );
});