import { useState } from "react";
import { Link } from "react-router-dom";

const dataPengajuan = [
{
id: 1,
nomor: "PGJ-001",
nama: "Ahmad Fauzi",
tanggal: "05 Oktober 2026",
tanggalUrut: "2026-10-05",
status: "Menunggu",
},
{
id: 2,
nomor: "PGJ-002",
nama: "Siti Aminah",
tanggal: "04 Oktober 2026",
tanggalUrut: "2026-10-04",
status: "Menunggu",
},
{
id: 3,
nomor: "PGJ-003",
nama: "Budi Santoso",
tanggal: "03 Oktober 2026",
tanggalUrut: "2026-10-03",
status: "Diterima",
},
{
id: 4,
nomor: "PGJ-004",
nama: "Nur Aisyah",
tanggal: "02 Oktober 2026",
tanggalUrut: "2026-10-02",
status: "Ditolak",
},
];

function DaftarPengajuan() {
const [search, setSearch] = useState("");
const [status, setStatus] = useState("Semua Status");
const [urutkan, setUrutkan] = useState("Terbaru");

const dataFilter = dataPengajuan
.filter((item) => {
const kataKunci = search.toLowerCase();


const cocokSearch =
item.nama.toLowerCase().includes(kataKunci) ||
item.nomor.toLowerCase().includes(kataKunci);

const cocokStatus =
status === "Semua Status" || item.status === status;

return cocokSearch && cocokStatus;
})
.sort((a, b) => {
return urutkan === "Terbaru"
? b.tanggalUrut.localeCompare(a.tanggalUrut)
: a.tanggalUrut.localeCompare(b.tanggalUrut);
});


return ( <div className="admin-pengajuan">
  <header className="pengajuan-header">
    <div>
      <h1>Daftar Pengajuan</h1>
      <p>Kelola dan periksa pengajuan calon mustahik.</p>
    </div>
  </header>

  ```
  <section className="pengajuan-toolbar">
    <div className="pengajuan-search">
      <span aria-hidden="true">⌕</span>
      <input type="text" placeholder="Cari nama atau nomor pengajuan..." value={search} onChange={(e)=>
      setSearch(e.target.value)}
      aria-label="Cari pengajuan"
      />
    </div>

    <select value={status} onChange={(e)=> setStatus(e.target.value)}
      aria-label="Filter status"
      className="pengajuan-select"
      >
      <option>Semua Status</option>
      <option>Menunggu</option>
      <option>Diterima</option>
      <option>Ditolak</option>
    </select>

    <select value={urutkan} onChange={(e)=> setUrutkan(e.target.value)}
      aria-label="Urutkan tanggal"
      className="pengajuan-select"
      >
      <option>Terbaru</option>
      <option>Terlama</option>
    </select>
  </section>

  <div className="pengajuan-summary">
    Menampilkan <strong>{dataFilter.length}</strong> dari{" "}
    <strong>{dataPengajuan.length}</strong> pengajuan
  </div>

  <section className="pengajuan-card-list">
    {dataFilter.map((item) => (
    <article className="pengajuan-item-card" key={item.id}>
      <div className="pengajuan-card-top">
        <span className="pengajuan-card-label">
          NOMOR PENGAJUAN
        </span>
        <strong className="pengajuan-card-number">
          {item.nomor}
        </strong>

        <span className={`pengajuan-card-status status-${item.status.toLowerCase()}`}>
          {item.status}
        </span>
      </div>

      <div className="pengajuan-card-info">
        <div>
          <span>Nama</span>
          <strong>{item.nama}</strong>
        </div>

        <div>
          <span>Tanggal</span>
          <strong>{item.tanggal}</strong>
        </div>
      </div>

      <Link to={`/admin/pengajuan/${item.id}`} className="pengajuan-card-button">
      Lihat Rincian
      </Link>
    </article>
    ))}

    {dataFilter.length === 0 && (
    <div className="pengajuan-empty">
      <span>⌕</span>
      <strong>Data tidak ditemukan</strong>
      <p>Ubah kata kunci pencarian atau filter status.</p>
    </div>
    )}
  </section>
</div>

);
}

export default DaftarPengajuan;
