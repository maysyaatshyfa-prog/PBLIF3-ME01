import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function DaftarPengajuan() {
  const navigate = useNavigate();

  const [dataPengajuan, setDataPengajuan] = useState([]);
  const [pencarian, setPencarian] = useState("");
  const [status, setStatus] = useState("semua");
  const [urutan, setUrutan] = useState("terbaru");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function ambilData() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/admin/pengajuan"
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Gagal mengambil daftar pengajuan."
          );
        }

        setDataPengajuan(
          Array.isArray(result.pengajuan) ? result.pengajuan : []
        );
      } catch (err) {
        console.error("Gagal mengambil daftar pengajuan:", err);
        setError(err.message || "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    }

    ambilData();
  }, []);

  const pilihanStatus = useMemo(
    () => [
      ...new Set(
        dataPengajuan
          .map((item) => item.status_pengajuan)
          .filter(Boolean)
      ),
    ],
    [dataPengajuan]
  );

  const daftarTampil = useMemo(() => {
    const kata = pencarian.trim().toLowerCase();

    const hasil = dataPengajuan.filter((item) => {
      const cocokCari = [
        item.nomor_pengajuan,
        item.nama_lengkap,
        item.nik,
      ].some((nilai) =>
        String(nilai || "").toLowerCase().includes(kata)
      );

      const cocokStatus =
        status === "semua" || item.status_pengajuan === status;

      return cocokCari && cocokStatus;
    });

    hasil.sort((a, b) => {
      if (urutan === "nama") {
        return String(a.nama_lengkap || "").localeCompare(
          String(b.nama_lengkap || ""),
          "id"
        );
      }

      const tanggalA = new Date(a.created_at || 0).getTime();
      const tanggalB = new Date(b.created_at || 0).getTime();

      return urutan === "terlama"
        ? tanggalA - tanggalB
        : tanggalB - tanggalA;
    });

    return hasil;
  }, [dataPengajuan, pencarian, status, urutan]);

  function formatTanggal(tanggal) {
    if (!tanggal) return "-";

    const date = new Date(tanggal);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatStatus(nilai) {
    if (!nilai) return "Belum ditentukan";

    return String(nilai)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (huruf) => huruf.toUpperCase());
  }

  return (
    <main className="daftar-pengajuan-page">
      <header className="daftar-pengajuan-header">
        <h1>Daftar Calon Mustahik</h1>
        <p>Kelola dan periksa pengajuan calon mustahik.</p>
      </header>

      <div className="pengajuan-toolbar">
        <input
          type="search"
          placeholder="Cari nomor pengajuan atau nama..."
          value={pencarian}
          onChange={(event) => setPencarian(event.target.value)}
          aria-label="Cari calon mustahik"
        />

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter status"
        >
          <option value="semua">Semua Status</option>
          {pilihanStatus.map((nilai) => (
            <option key={nilai} value={nilai}>
              {formatStatus(nilai)}
            </option>
          ))}
        </select>

        <select
          value={urutan}
          onChange={(event) => setUrutan(event.target.value)}
          aria-label="Urutkan pengajuan"
        >
          <option value="terbaru">Terbaru</option>
          <option value="terlama">Terlama</option>
          <option value="nama">Nama A–Z</option>
        </select>
      </div>

      {!loading && !error && (
        <p className="pengajuan-total">
          Menampilkan {daftarTampil.length} pengajuan
        </p>
      )}

      {loading && <p>Memuat daftar calon mustahik...</p>}

      {!loading && error && (
        <p className="pengajuan-error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && daftarTampil.length === 0 && (
        <div className="pengajuan-empty">
          <h3>Tidak ada pengajuan ditemukan</h3>
          <p>
            {dataPengajuan.length === 0
              ? "Belum ada data pengajuan."
              : "Coba ubah pencarian atau filter status."}
          </p>
        </div>
      )}

      {!loading && !error && daftarTampil.length > 0 && (
        <div className="pengajuan-card-grid">
          {daftarTampil.map((item, index) => (
            <article
              className="pengajuan-card"
              key={item.nik || item.nomor_pengajuan || index}
            >
              <span className="pengajuan-label">Nomor Pengajuan</span>
              <strong className="pengajuan-nomor">
                {item.nomor_pengajuan || "-"}
              </strong>

              <h2>{item.nama_lengkap || "Nama belum tersedia"}</h2>

              <p className="pengajuan-tanggal">
                Tanggal: {formatTanggal(item.created_at)}
              </p>

              <span className="pengajuan-status">
                {formatStatus(item.status_pengajuan)}
              </span>

              <button
                type="button"
                className="pengajuan-detail-button"
                onClick={() => {
                  const id = item.nik || item.nomor_pengajuan;
                  if (!id) return;

                  navigate(
                    `/admin/daftar-pengajuan/${encodeURIComponent(id)}`
                  );
                }}
              >
                Lihat Rincian →
              </button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default DaftarPengajuan;
