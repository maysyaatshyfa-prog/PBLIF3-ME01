import { useEffect, useState, useCallback } from "react";

import {
  UsersRound,
  Search,
  UserPlus,
  X,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

// ==================================================
// FORMAT TANGGAL
// ==================================================
const formatTanggal = (tanggal) => {
  if (!tanggal) return "-";

  const date = new Date(tanggal);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// ==================================================
// MENGAMBIL ARRAY DARI RESPONSE API
// ==================================================
const ambilArray = (result, keys) => {
  if (Array.isArray(result)) return result;

  for (const key of keys) {
    if (Array.isArray(result?.[key])) {
      return result[key];
    }
  }

  return [];
};

function DaftarPengguna() {
  const [dataPengguna, setDataPengguna] = useState([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("Semua");

  const [showModal, setShowModal] = useState(false);

  const [nama, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const [email, setEmail] = useState("");
  const [noHp, setNoHp] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");

  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ==================================================
  // MENGAMBIL SEMUA DATA PENGGUNA
  // ==================================================
  const ambilSemuaPengguna = useCallback(async () => {
    try {
      setIsLoading(true);

      const [
        responsePemberi,
        responsePenerima,
        responseAdmin,
      ] = await Promise.all([
        fetch(`${API_URL}/pemberi`),
        fetch(`${API_URL}/penerima`),
        fetch(`${API_URL}/admin`),
      ]);

      const [
        hasilPemberi,
        hasilPenerima,
        hasilAdmin,
      ] = await Promise.all([
        responsePemberi.json(),
        responsePenerima.json(),
        responseAdmin.json(),
      ]);

      if (!responsePemberi.ok) {
        throw new Error(
          hasilPemberi.message || "Gagal mengambil data Muzakki."
        );
      }

      if (!responsePenerima.ok) {
        throw new Error(
          hasilPenerima.message || "Gagal mengambil data Mustahik."
        );
      }

      if (!responseAdmin.ok) {
        throw new Error(
          hasilAdmin.message || "Gagal mengambil data Admin."
        );
      }

      // DATA MUZAKKI
      const daftarPemberi = ambilArray(hasilPemberi, [
        "pemberi",
        "data",
        "pemberis",
      ]);

      const dataMuzakki = daftarPemberi.map((item) => ({
        id: `muzakki-${item.id_pemberi || item.nik}`,
        nama: item.nama_lengkap || "-",
        noHp: item.no_hp || "",
        tanggal: formatTanggal(item.created_at),
        role: "Muzakki",
      }));

      // DATA MUSTAHIK
      const daftarPenerima = ambilArray(hasilPenerima, [
        "penerima",
        "data",
        "penerimas",
      ]);

      const dataMustahik = daftarPenerima.map((item) => ({
        id: `mustahik-${item.nik || item.id_penerima}`,
        nama: item.nama_lengkap || "-",
        noHp: item.no_hp || "",
        tanggal: formatTanggal(item.created_at),
        role: "Mustahik",
      }));

      // DATA ADMIN
      const daftarAdmin = ambilArray(hasilAdmin, [
        "admin",
        "admins",
        "data",
      ]);

      const dataAdmin = daftarAdmin.map((item) => ({
        id: `admin-${item.id_admin}`,
        nama: item.nama_lengkap || "-",
        noHp: item.no_hp || "",
        tanggal: formatTanggal(item.created_at),
        role: "Admin",
      }));

      // GABUNGKAN DATA
      const semuaPengguna = [
        ...dataMuzakki,
        ...dataMustahik,
        ...dataAdmin,
      ];

      setDataPengguna(semuaPengguna);

      console.log("Data Muzakki:", dataMuzakki);
      console.log("Data Mustahik:", dataMustahik);
      console.log("Data Admin:", dataAdmin);

    } catch (error) {
      console.error("Gagal mengambil data pengguna:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==================================================
  // LOAD DATA SAAT HALAMAN DIBUKA
  // ==================================================
  useEffect(() => {
    ambilSemuaPengguna();
  }, [ambilSemuaPengguna]);

  // ==================================================
  // FILTER DAN PENCARIAN
  // ==================================================
  const dataFilter = dataPengguna.filter((item) => {
    const kataKunci = search.toLowerCase();

    const cocokSearch =
      item.nama.toLowerCase().includes(kataKunci) ||
      item.noHp.includes(search);

    const cocokRole =
      filterRole === "Semua" ||
      item.role === filterRole;

    return cocokSearch && cocokRole;
  });

  // ==================================================
  // MEMBUKA MODAL TAMBAH ADMIN
  // ==================================================
  const bukaModal = () => {
    setNama("");
    setAlamat("");
    setEmail("");
    setNoHp("");
    setPassword("");
    setKonfirmasiPassword("");
    setFormError("");
    setShowModal(true);
  };

  // ==================================================
  // MENAMBAHKAN ADMIN
  // ==================================================
  const handleTambahAdmin = async (e) => {
    e.preventDefault();
    setFormError("");

    if (
      !nama.trim() ||
      !alamat.trim() ||
      !email.trim() ||
      !noHp.trim() ||
      !password ||
      !konfirmasiPassword
    ) {
      setFormError("Semua kolom wajib diisi.");
      return;
    }

    if (password.length < 8) {
      setFormError("Password harus minimal 8 karakter.");
      return;
    }

    if (password !== konfirmasiPassword) {
      setFormError("Konfirmasi password tidak cocok.");
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(`${API_URL}/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama_lengkap: nama.trim(),
          alamat_lengkap: alamat.trim(),
          email: email.trim(),
          no_hp: noHp.trim(),
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal menambahkan admin."
        );
      }

      await ambilSemuaPengguna();

      setShowModal(false);
      setFilterRole("Admin");

      alert(result.message || "Admin berhasil ditambahkan.");

    } catch (error) {
      setFormError(
        error.message || "Tidak dapat terhubung ke backend."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ==================================================
  // RESET FILTER
  // ==================================================
  const resetFilter = () => {
    setSearch("");
    setFilterRole("Semua");
  };

  // ==================================================
  // TAMPILAN
  // ==================================================
  return (
    <div className="admin-pengguna">

      {/* HEADER */}
      <header className="pengguna-header">
        <div>
          <h1>Daftar Pengguna</h1>
          <p>
            Kelola data pengguna yang terdaftar di sistem.
          </p>
        </div>
      </header>

      {/* STATISTIK */}
      <section className="pengguna-statistik">
        <div className="pengguna-statistik-icon">
          <UsersRound size={26} strokeWidth={1.8} />
        </div>

        <div>
          <p>Total Pengguna</p>
          <h2>{dataFilter.length}</h2>

          <span>
            {filterRole === "Semua"
              ? "Seluruh pengguna terdaftar"
              : `Pengguna dengan peran ${filterRole}`}
          </span>
        </div>
      </section>

      {/* FILTER PERAN */}
      <section className="pengguna-toolbar">
        <div className="pengguna-tabs">
          {["Semua", "Muzakki", "Mustahik", "Admin"].map(
            (role) => (
              <button
                key={role}
                type="button"
                onClick={() => setFilterRole(role)}
                className={`pengguna-tab ${
                  filterRole === role ? "active" : ""
                }`}
              >
                {role}

                {filterRole === role && (
                  <span className="tab-indicator" />
                )}
              </button>
            )
          )}
        </div>

        {/* PENCARIAN */}
        <div className="pengguna-search">
          <span
            className="pengguna-search-icon"
            aria-hidden="true"
          >
            <Search size={18} strokeWidth={1.8} />
          </span>

          <input
            type="text"
            placeholder="Cari nama atau nomor HP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Cari pengguna"
          />

          {search && (
            <button
              type="button"
              className="pengguna-clear"
              onClick={() => setSearch("")}
              aria-label="Hapus pencarian"
            >
              ×
            </button>
          )}
        </div>
      </section>

      {/* TABEL PENGGUNA */}
      <section className="pengguna-table-card">

        <div className="pengguna-table-heading">
          <div>
            <h2>
              {filterRole === "Semua"
                ? "Data Pengguna"
                : `Data ${filterRole}`}
            </h2>

            <p>
              Informasi pengguna yang terdaftar dalam sistem.
            </p>
          </div>

          <div className="pengguna-heading-actions">
            <span className="pengguna-count">
              {dataFilter.length} pengguna
            </span>

            {filterRole === "Admin" && (
              <button
                type="button"
                className="pengguna-tambah-admin"
                onClick={bukaModal}
              >
                <UserPlus size={18} strokeWidth={1.8} />
                Tambah Admin
              </button>
            )}
          </div>
        </div>

        <div className="pengguna-table-wrapper">
          <table className="pengguna-table">

            <thead>
              <tr>
                <th>No.</th>
                <th>Nama Pengguna</th>
                <th>No. HP</th>
                <th>Tanggal Pendaftaran</th>
                <th>Peran</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="pengguna-empty">
                    <strong>Memuat data pengguna...</strong>
                  </td>
                </tr>
              ) : (
                <>
                  {dataFilter.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>

                      <td>
                        <div className="pengguna-identitas">
                          <div className="pengguna-avatar">
                            {item.nama.charAt(0).toUpperCase()}
                          </div>

                          <span>{item.nama}</span>
                        </div>
                      </td>

                      <td>{item.noHp || "-"}</td>
                      <td>{item.tanggal}</td>

                      <td>
                        <span
                          className={`pengguna-role role-${item.role.toLowerCase()}`}
                        >
                          {item.role}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {dataFilter.length === 0 && (
                    <tr>
                      <td colSpan="5" className="pengguna-empty">
                        <span className="pengguna-empty-icon">
                          ⌕
                        </span>

                        <strong>
                          {search
                            ? "Data pengguna tidak ditemukan"
                            : filterRole === "Admin"
                              ? "Belum Ada Admin"
                              : "Belum Ada Pengguna"}
                        </strong>

                        <p>
                          {filterRole === "Admin"
                            ? "Tambahkan akun admin untuk pegawai baru."
                            : "Data pengguna akan ditampilkan di sini setelah tersedia."}
                        </p>

                        {(search || filterRole !== "Semua") && (
                          <button
                            type="button"
                            onClick={resetFilter}
                          >
                            Reset Filter
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>

          </table>
        </div>
      </section>

      {/* MODAL TAMBAH ADMIN */}
      {showModal && (
        <div
          className="admin-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !isSaving
            ) {
              setShowModal(false);
            }
          }}
        >
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
          >

            <div className="admin-modal-header">
              <div>
                <h2 id="admin-modal-title">
                  Tambah Admin
                </h2>

                <p>
                  Masukkan data pegawai yang akan diberi akses admin.
                </p>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowModal(false)}
                disabled={isSaving}
                aria-label="Tutup popup"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleTambahAdmin}>

              <div className="admin-form-group">
                <label htmlFor="admin-nama">
                  Nama Lengkap
                </label>

                <input
                  id="admin-nama"
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama pegawai"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="admin-alamat">
                  Alamat Lengkap
                </label>

                <textarea
                  id="admin-alamat"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Masukkan alamat pegawai"
                  rows="3"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="admin-email">
                  Email
                </label>

                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="admin-hp">
                  Nomor HP
                </label>

                <input
                  id="admin-hp"
                  type="tel"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="Masukkan nomor HP"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="admin-password">
                  Password Awal
                </label>

                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  minLength={8}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="admin-konfirmasi">
                  Konfirmasi Password
                </label>

                <input
                  id="admin-konfirmasi"
                  type="password"
                  value={konfirmasiPassword}
                  onChange={(e) =>
                    setKonfirmasiPassword(e.target.value)
                  }
                  placeholder="Ulangi password"
                  minLength={8}
                  autoComplete="new-password"
                  required
                />
              </div>

              {formError && (
                <p
                  className="admin-form-error"
                  role="alert"
                >
                  {formError}
                </p>
              )}

              <div className="admin-modal-actions">

                <button
                  type="button"
                  className="admin-btn-batal"
                  onClick={() => setShowModal(false)}
                  disabled={isSaving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="admin-btn-simpan"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Menyimpan..."
                    : "Simpan Admin"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default DaftarPengguna;
