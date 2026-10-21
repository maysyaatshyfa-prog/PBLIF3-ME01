
require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");

async function main() {
  const rl = readline.createInterface({
    input: stdin,
    output: stdout,
  });

  let db;

  try {
    const email = (
      await rl.question("Masukkan email akun penerima: ")
    ).trim();

    const password = await rl.question(
      "Buat password baru (minimal 8 karakter): "
    );

    if (!email || password.length < 8) {
      throw new Error(
        "Email wajib diisi dan password minimal 8 karakter."
      );
    }

    // Pastikan konfigurasi database tersedia
    const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

    if (!DB_HOST || !DB_USER || !DB_NAME) {
      throw new Error(
        "Konfigurasi database tidak lengkap. Periksa file .env."
      );
    }

    // Hubungkan ke database
    db = await mysql.createConnection({
      host: DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: DB_USER,
      password: DB_PASSWORD || "",
      database: DB_NAME,
    });

    // Cari akun penerima berdasarkan email
    const [rows] = await db.execute(
      `SELECT email, status_pengajuan
       FROM penerima
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    if (rows.length === 0) {
      throw new Error(
        "Akun penerima tidak ditemukan. Periksa email yang dimasukkan."
      );
    }

    if (
      String(rows[0].status_pengajuan).trim().toLowerCase() !==
      "diterima"
    ) {
      throw new Error(
        "Akun belum berstatus Diterima sehingga password tidak diubah."
      );
    }

    // Enkripsi password menjadi hash
    const passwordHash = await bcrypt.hash(password, 10);

    // Simpan hash ke database
    const [result] = await db.execute(
      `UPDATE penerima
       SET password_hash = ?
       WHERE email = ?`,
      [passwordHash, email]
    );

    if (result.affectedRows === 0) {
      throw new Error("Password belum berhasil diperbarui.");
    }

    console.log("\nBERHASIL!");
    console.log("Password penerima berhasil disimpan dalam bentuk hash.");
    console.log("Silakan gunakan email dan password baru untuk pengujian login.");
  } catch (error) {
    console.error("\nGAGAL:", error.message);
  } finally {
    rl.close();

    if (db) {
      await db.end().catch(() => {});
    }
  }
}

main();
