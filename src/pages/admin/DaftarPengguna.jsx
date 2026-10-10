import { useState } from "react";

const dataPengguna = [
  {
    id: 1,
    nama: "Ahmad Fauzi",
    noHp: "081234567890",
    tanggal: "05 Oktober 2026",
    role: "Mustahik",
  },
  {
    id: 2,
    nama: "Siti Aminah",
    noHp: "082345678901",
    tanggal: "04 Oktober 2026",
    role: "Mustahik",
  },
  {
    id: 3,
    nama: "Budi Santoso",
    noHp: "083456789012",
    tanggal: "03 Oktober 2026",
    role: "Muzakki",
  },
  {
    id: 4,
    nama: "Dewi Lestari",
    noHp: "084567890123",
    tanggal: "02 Oktober 2026",
    role: "Muzakki",
  },
];

function DaftarPengguna() {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("Semua");

  const dataFilter = dataPengguna.filter((item) => {
    const kataKunci = search.toLowerCase();

    const cocokSearch =
      item.nama.toLowerCase().includes(kataKunci) ||
      item.noHp.includes(search);

    const cocokRole =
      filterRole === "Semua" || item.role === filterRole;

    return cocokSearch && cocokRole;
  });

  return (
    <div className="admin-pengguna">
      {/* Header */}
      <header className="pengguna-header">
        <div>
          <h1>Daftar Pengguna</h1>
          <p>Kelola data pengguna yang terdaftar di sistem.</p>
        </div>
      </header>

      {/* Statistik */}
      <section className="pengguna-statistik">
        <div className="pengguna-statistik-icon">👥</div>
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

      {/* Filter Role */}
      <section className="pengguna-toolbar">
        <div className="pengguna-tabs">
          {["Semua", "Muzakki", "Mustahik"].map((role) => (
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
                <span className="tab-indicator"></span>
              )}
            </button>
          ))}
        </div>

        {/* Pencarian */}
        <div className="pengguna-search">
          <span aria-hidden="true">⌕</span>
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

      {/* Tabel */}
      <section className="pengguna-table-card">
        <div className="pengguna-table-heading">
          <div>
            <h2>Data Pengguna</h2>
            <p>Informasi pengguna yang terdaftar dalam sistem.</p>
          </div>
          <span className="pengguna-count">
            {dataFilter.length} pengguna
          </span>
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
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
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

                  <td>{item.noHp}</td>
                  <td>{item.tanggal}</td>

                  <td>
                    <span
                      className={`pengguna-role role-${item.role.toLowerCase()}`}
                    >
                      {item.role}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="pengguna-detail-button"
                      onClick={() =>
                        alert(`Detail pengguna: ${item.nama}`)
                      }
                    >
                      Detail <span>→</span>
                    </button>
                  </td>
                </tr>
              ))}

              {dataFilter.length === 0 && (
                <tr>
                  <td colSpan="6" className="pengguna-empty">
                    <span className="pengguna-empty-icon">⌕</span>
                    <strong>Data pengguna tidak ditemukan</strong>
                    <p>
                      Coba gunakan kata kunci atau filter yang berbeda.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setFilterRole("Semua");
                      }}
                    >
                      Reset Filter
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default DaftarPengguna;
