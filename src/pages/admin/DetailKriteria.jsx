import "../../index.css";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

const namaAsnaf = {
  fakir: "Fakir",
  miskin: "Miskin",
  amil: "Amil",
  muallaf: "Muallaf",
  riqab: "Riqab",
  gharim: "Gharim",
  fisabilillah: "Fisabilillah",
  "ibnu-sabil": "Ibnu Sabil",
};

function DetailKriteria() {
  const { asnaf } = useParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [itemDetail, setItemDetail] = useState(null);
  const [dataKriteria, setDataKriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const nama = namaAsnaf[asnaf] || "Fakir";

  // =========================================
  // AMBIL KRITERIA DAN PERTANYAAN DARI DATABASE
  // =========================================

  const ambilDataKriteria = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Ambil kriteria berdasarkan asnaf
      const responseKriteria = await fetch(
        `${API_URL}/admin/kriteria?asnaf=${encodeURIComponent(asnaf)}`
      );

      const hasilKriteria = await responseKriteria.json();

      if (!responseKriteria.ok) {
        throw new Error(
          hasilKriteria.message || "Gagal mengambil data kriteria."
        );
      }

      const daftarKriteria = hasilKriteria.data || [];

      // Ambil pertanyaan untuk setiap kriteria
      const hasilGabungan = await Promise.all(
        daftarKriteria.map(async (kriteria) => {
          const responsePertanyaan = await fetch(
            `${API_URL}/admin/pertanyaan?id_kriteria=${kriteria.id_kriteria}`
          );

          const hasilPertanyaan = await responsePertanyaan.json();

          if (!responsePertanyaan.ok) {
            throw new Error(
              hasilPertanyaan.message ||
              "Gagal mengambil pertanyaan kriteria."
            );
          }

          const daftarPertanyaan = hasilPertanyaan.data || [];

          // Jika belum memiliki pertanyaan, kriteria tetap ditampilkan
          if (daftarPertanyaan.length === 0) {
            return [{
              id: null,
              id_kriteria: kriteria.id_kriteria,
              nama_kriteria: kriteria.nama_kriteria,
              bobot_kriteria: kriteria.bobot_kriteria,
              pertanyaan: "",
              tipe_jawaban: "",
              wajib_diisi: false,
              tampilkan_upload_jika_ya: false,
              upload_wajib: false,
              label_upload: "",
              urutan: 0,
            }];
          }

          return daftarPertanyaan.map((pertanyaan) => ({
            ...pertanyaan,
            id: pertanyaan.id_pertanyaan,
            nama_kriteria: kriteria.nama_kriteria,
            bobot_kriteria: kriteria.bobot_kriteria,
          }));
        })
      );

      setDataKriteria(hasilGabungan.flat());
    } catch (error) {
      console.error("Gagal mengambil kriteria:", error);
      setError(error.message || "Terjadi kesalahan saat mengambil data.");
    } finally {
      setLoading(false);
    }
  }, [asnaf]);

  useEffect(() => {
    ambilDataKriteria();
  }, [ambilDataKriteria]);

  // =========================================
  // STATUS PERTANYAAN
  // =========================================

  function getStatus(item) {
    return item.wajib_diisi ? "Aktif" : "Nonaktif";
  }

  // =========================================
  // PENCARIAN
  // =========================================

  const dataFilter = dataKriteria.filter((item) => {
    const pertanyaan = item.pertanyaan || "";
    const kode = `K${String(item.id_kriteria).padStart(2, "0")}`;

    const kataKunci = search.toLowerCase();

    return (
      pertanyaan.toLowerCase().includes(kataKunci) ||
      kode.toLowerCase().includes(kataKunci)
    );
  });

  const totalKriteria = new Set(
    dataKriteria.map((item) => item.id_kriteria)
  ).size;

  const totalPertanyaan = dataKriteria.filter(
    (item) => item.id !== null
  ).length;

  // =========================================
  // NAVIGASI TAMBAH DAN EDIT
  // =========================================

  function bukaTambah() {
    navigate(`/admin/kriteria/${asnaf}/tambah`);
  }

  function bukaEdit(item) {
    if (!item.id) return;

    navigate(`/admin/kriteria/${asnaf}/${item.id}/edit`);
  }

  // =========================================
  // HAPUS PERTANYAAN MELALUI API
  // =========================================

  async function hapusKriteria(id) {
    if (!id) return;

    const yakin = window.confirm(
      "Apakah kamu yakin ingin menghapus pertanyaan ini?"
    );

    if (!yakin) return;

    try {
      const response = await fetch(
        `${API_URL}/admin/pertanyaan/${id}`,
        {
          method: "DELETE",
        }
      );

      const hasil = await response.json();

      if (!response.ok) {
        throw new Error(
          hasil.message || "Gagal menghapus pertanyaan."
        );
      }

      setItemDetail(null);

      alert(hasil.message || "Pertanyaan berhasil dihapus.");

      await ambilDataKriteria();
    } catch (error) {
      console.error("Gagal menghapus pertanyaan:", error);

      alert(error.message || "Terjadi kesalahan saat menghapus.");
    }
  }

  // =========================================
  // TAMPILAN
  // =========================================

  return (
    <div className="detail-kriteria-page">

      {/* Tombol kembali */}
      <div className="kriteria-breadcrumb">
        <Link to="/admin/kriteria">
          ← Kembali ke Kelola Kriteria
        </Link>
      </div>

      {/* Judul halaman */}
      <div className="kriteria-header">
        <h1>{nama}</h1>

        <p>
          Kelola kriteria dan aturan penilaian yang digunakan
          untuk membantu mengidentifikasi calon mustahik
          golongan {nama.toLowerCase()}.
        </p>
      </div>

      {/* Statistik */}
      <div className="kriteria-summary">
        <p>Total Kriteria</p>
        <strong>{totalKriteria}</strong>

        <p>Total Pertanyaan</p>
        <strong>{totalPertanyaan}</strong>
      </div>

      {/* Toolbar */}
      <div className="kriteria-toolbar">
        <div className="kriteria-search">
          <input
            type="text"
            placeholder="Cari pertanyaan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="kriteria-button"
          onClick={bukaTambah}
        >
          + Tambah Pertanyaan
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="kriteria-empty">
          Memuat data kriteria...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="kriteria-empty">
          {error}
          <br />

          <button
            type="button"
            className="kriteria-button"
            onClick={ambilDataKriteria}
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Tabel */}
      {!loading && !error && (
        <div className="kriteria-table-wrapper">
          <table className="kriteria-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode</th>
                <th>Pertanyaan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {dataFilter.map((item, index) => (
                <tr
                  key={`${item.id_kriteria}-${item.id || "kosong"}`}
                >
                  <td>{index + 1}</td>

                  <td>
                    K{String(item.id_kriteria).padStart(2, "0")}
                  </td>

                  <td>
                    {item.pertanyaan || "Belum ada pertanyaan"}
                  </td>

                  <td>
                    <span
                      className={`transaksi-status ${
                        item.id && item.wajib_diisi
                          ? "status-berhasil"
                          : ""
                      }`}
                    >
                      {item.id ? getStatus(item) : "Belum tersedia"}
                    </span>
                  </td>

                  <td>
                    <div className="kriteria-actions">

                      {item.id && (
                        <>
                          <button
                            type="button"
                            className="kriteria-action detail"
                            onClick={() => setItemDetail(item)}
                          >
                            Detail
                          </button>

                          <button
                            type="button"
                            className="kriteria-action edit"
                            onClick={() => bukaEdit(item)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="kriteria-action delete"
                            onClick={() => hapusKriteria(item.id)}
                          >
                            Hapus
                          </button>
                        </>
                      )}

                    </div>
                  </td>
                </tr>
              ))}

              {dataFilter.length === 0 && (
                <tr>
                  <td colSpan={5} className="kriteria-empty">
                    Pertanyaan tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal detail */}
      {itemDetail &&
        createPortal(
          <div
            className="kriteria-modal-overlay"
            onClick={() => setItemDetail(null)}
          >
            <section
              className="kriteria-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="judul-detail-kriteria"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="kriteria-modal-header">
                <h2 id="judul-detail-kriteria">
                  Detail Kriteria
                </h2>

                <button
                  type="button"
                  className="kriteria-modal-close"
                  onClick={() => setItemDetail(null)}
                  aria-label="Tutup detail"
                >
                  ×
                </button>
              </div>

              <div className="kriteria-modal-field">
                <span>Golongan Asnaf</span>
                <strong>{nama}</strong>
              </div>

              <div className="kriteria-modal-field">
                <span>Kode Kriteria</span>
                <strong>
                  K{String(itemDetail.id_kriteria).padStart(2, "0")}
                </strong>
              </div>

              <div className="kriteria-modal-field">
                <span>Pertanyaan</span>
                <p>{itemDetail.pertanyaan || "-"}</p>
              </div>

              <div className="kriteria-modal-field">
                <span>Jenis Jawaban</span>
                <strong>
                  {itemDetail.tipe_jawaban || "Belum ditentukan"}
                </strong>
              </div>

              <div className="kriteria-modal-field">
                <span>Wajib Diisi</span>
                <strong>
                  {itemDetail.wajib_diisi ? "Ya" : "Tidak"}
                </strong>
              </div>

              <div className="kriteria-modal-field">
                <span>Bukti Pendukung</span>
                <strong>
                  {itemDetail.tampilkan_upload_jika_ya
                    ? itemDetail.upload_wajib
                      ? "Wajib"
                      : "Opsional"
                    : "Tidak tersedia"}
                </strong>
              </div>

              {itemDetail.label_upload && (
                <div className="kriteria-modal-field">
                  <span>Label Upload</span>
                  <strong>{itemDetail.label_upload}</strong>
                </div>
              )}

              <div className="kriteria-modal-footer">
                <button
                  type="button"
                  className="kriteria-button"
                  onClick={() => setItemDetail(null)}
                >
                  Tutup
                </button>
              </div>
            </section>
          </div>,
          document.body
        )}
    </div>
  );
}

export default DetailKriteria;
