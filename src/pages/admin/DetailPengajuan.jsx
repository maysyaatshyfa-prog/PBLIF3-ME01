import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

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

function DetailPengajuan() {
  const { id } = useParams();

  // State data pengajuan
  const [pengajuan, setPengajuan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State pemeriksaan
  const [hasil, setHasil] = useState("");
  const [golongan, setGolongan] = useState("Fakir");
  const [catatan, setCatatan] = useState("");
  const [token, setToken] = useState("");

  // Mengambil data pengajuan berdasarkan NIK
  useEffect(() => {
    async function ambilDetail() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/admin/pengajuan"
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Gagal mengambil data pengajuan."
          );
        }

        const daftar = Array.isArray(result.pengajuan)
          ? result.pengajuan
          : [];

        const data = daftar.find(
          (item) => String(item.nik) === String(id)
        );

        if (!data) {
          throw new Error(
            "Data pengajuan tidak ditemukan. Periksa kembali NIK pengajuan."
          );
        }

        setPengajuan(data);

        setGolongan(
          data.golongan_mustahik || "Fakir"
        );

        setHasil(
          ["Diterima", "Ditolak"].includes(
            data.status_pengajuan
          )
            ? data.status_pengajuan
            : ""
        );

        setCatatan(data.catatan_admin || "");
      } catch (err) {
        console.error(
          "Gagal mengambil detail pengajuan:",
          err
        );

        setError(
          err.message || "Terjadi kesalahan."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      ambilDetail();
    } else {
      setError("NIK pengajuan tidak ditemukan.");
      setLoading(false);
    }
  }, [id]);

  // Format tanggal
  function formatTanggal(tanggal) {
    if (!tanggal) return "-";

    const date = new Date(tanggal);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  // Format status
  function formatStatus(nilai) {
    if (!nilai) return "Belum ditentukan";

    return String(nilai)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (huruf) =>
        huruf.toUpperCase()
      );
  }

  // Mengambil jawaban kuesioner
  const jawabanKuesioner =
    pengajuan?.jawaban_kuesioner ||
    pengajuan?.jawaban ||
    pengajuan?.kuesioner ||
    [];

  // Mengambil dokumen pendukung
  const dokumenPendukung =
    pengajuan?.dokumen_pendukung ||
    pengajuan?.dokumen ||
    [];

  // Mengambil hasil sistem pakar
  const hasilSistem =
    pengajuan?.hasil_sistem ||
    pengajuan?.golongan_rekomendasi ||
    pengajuan?.hasil_seleksi ||
    "-";

  // Simpan hasil pemeriksaan
  function simpanVerifikasi() {
    if (!hasil) {
      alert(
        "Silakan pilih hasil verifikasi terlebih dahulu."
      );
      return;
    }

    if (hasil === "Diterima") {
      const tokenBaru =
        "MST-" +
        Math.random()
          .toString(36)
          .substring(2, 7)
          .toUpperCase();

      setToken(tokenBaru);
    } else {
      setToken("");
    }

    alert(
      "Hasil verifikasi berhasil diproses. Penyimpanan ke database belum dihubungkan."
    );
  }

  // Salin token
  async function salinToken() {
    try {
      await navigator.clipboard.writeText(token);
      alert("Token berhasil disalin.");
    } catch {
      alert(
        "Token tidak dapat disalin otomatis. Silakan salin secara manual."
      );
    }
  }

  // Tampilan loading
  if (loading) {
    return (
      <div className="detail-pengajuan">
        <p>Memuat detail pengajuan...</p>
      </div>
    );
  }

  // Tampilan error
  if (error || !pengajuan) {
    return (
      <div className="detail-pengajuan">
        <div className="detail-breadcrumb">
          <Link to="/admin/pengajuan">
            Daftar Pengajuan
          </Link>

          <span>/</span>
          <span>Detail Pemeriksaan</span>
        </div>

        <div className="pengajuan-empty">
          <h3>Data pengajuan tidak ditemukan</h3>
          <p>{error || "Data tidak tersedia."}</p>

          <Link to="/admin/pengajuan">
            Kembali ke Daftar Pengajuan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-pengajuan">

      {/* BREADCRUMB */}
      <div className="detail-breadcrumb">
        <Link to="/admin/pengajuan">
          Daftar Pengajuan
        </Link>

        <span>/</span>
        <span>Detail Pemeriksaan</span>
      </div>

      {/* HEADER */}
      <header className="detail-page-header">
        <h1>Pemeriksaan Pengajuan</h1>

        <p>
          Periksa jawaban dan dokumen calon mustahik
          sebelum menentukan hasil verifikasi.
        </p>
      </header>

      {/* INFORMASI CALON MUSTAHIK */}
      <section className="detail-section">
        <div className="detail-section-heading">
          <span className="detail-step">i</span>

          <div>
            <h2>Informasi Calon Mustahik</h2>
            <p>
              Informasi dasar calon penerima zakat.
            </p>
          </div>
        </div>

        <div className="detail-info-grid">
          <div className="detail-info-item">
            <span>Nomor Pengajuan</span>

            <strong>
              {pengajuan.nomor_pengajuan || "-"}
            </strong>
          </div>

          <div className="detail-info-item">
            <span>Nama Calon Mustahik</span>

            <strong>
              {pengajuan.nama_lengkap || "-"}
            </strong>
          </div>

          <div className="detail-info-item">
            <span>NIK</span>

            <strong>
              {pengajuan.nik || "-"}
            </strong>
          </div>

          <div className="detail-info-item">
            <span>Tanggal Pengajuan</span>

            <strong>
              {formatTanggal(pengajuan.created_at)}
            </strong>
          </div>

          <div className="detail-info-item">
            <span>Status Pengajuan</span>

            <strong className="detail-status">
              {formatStatus(
                pengajuan.status_pengajuan
              )}
            </strong>
          </div>
        </div>
      </section>

      {/* JAWABAN KUESIONER */}
      <section className="detail-section">
        <div className="detail-section-heading">
          <span className="detail-step">1</span>

          <div>
            <h2>Pemeriksaan Jawaban Kuesioner</h2>

            <p>
              Periksa jawaban yang telah diberikan
              oleh calon mustahik.
            </p>
          </div>
        </div>

        <div className="detail-question-list">
          {Array.isArray(jawabanKuesioner) &&
          jawabanKuesioner.length > 0 ? (
            jawabanKuesioner.map((item, index) => (
              <div
                className="detail-question"
                key={item.id || index}
              >
                <p>
                  {item.pertanyaan ||
                    item.pertanyaan_kuesioner ||
                    item.question ||
                    `Pertanyaan ${index + 1}`}
                </p>

                <strong className="detail-answer">
                  {item.jawaban ||
                    item.answer ||
                    "-"}
                </strong>
              </div>
            ))
          ) : (
            <p>
              Data jawaban kuesioner belum tersedia
              dari API.
            </p>
          )}
        </div>
      </section>

      {/* DOKUMEN PENDUKUNG */}
      <section className="detail-section">
        <div className="detail-section-heading">
          <span className="detail-step">2</span>

          <div>
            <h2>Dokumen Calon Mustahik</h2>

            <p>
              Periksa dokumen pendukung yang telah diunggah.
            </p>
          </div>
        </div>

        <div className="detail-document-list">
          {Array.isArray(dokumenPendukung) &&
          dokumenPendukung.length > 0 ? (
            dokumenPendukung.map((item, index) => {
              const namaDokumen =
                typeof item === "string"
                  ? item
                  : item.nama_file ||
                    item.filename ||
                    item.nama ||
                    "Dokumen pendukung";

              const urlDokumen =
                typeof item === "string"
                  ? item
                  : item.url ||
                    item.file_url ||
                    item.path;

              return (
                <div
                  className="detail-document"
                  key={item.id || index}
                >
                  <div className="detail-document-icon">
                    PDF
                  </div>

                  <div className="detail-document-info">
                    <strong>{namaDokumen}</strong>

                    <span>
                      Dokumen pendukung calon mustahik
                    </span>
                  </div>

                  {urlDokumen ? (
                    <a
                      href={
                        urlDokumen.startsWith("http")
                          ? urlDokumen
                          : `http://localhost:5000/${urlDokumen.replace(/^\/+/, "")}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="detail-button-secondary"
                    >
                      Lihat Dokumen
                    </a>
                  ) : (
                    <span>File belum tersedia</span>
                  )}
                </div>
              );
            })
          ) : (
            <p>
              Data dokumen pendukung belum tersedia
              dari API.
            </p>
          )}
        </div>
      </section>

      {/* PENENTUAN GOLONGAN */}
      <section className="detail-section">
        <div className="detail-section-heading">
          <span className="detail-step">3</span>

          <div>
            <h2>Penentuan Golongan Mustahik</h2>

            <p>
              Periksa hasil sistem pakar dan tentukan
              golongan yang sesuai.
            </p>
          </div>
        </div>

        <div className="detail-system-result">
          <span>Hasil Sistem Pakar</span>

          <strong>{hasilSistem}</strong>

          <p>
            Hasil ini merupakan rekomendasi sistem
            berdasarkan jawaban kuesioner.
          </p>
        </div>

        <div className="detail-form-field">
          <label htmlFor="golongan">
            Golongan Mustahik
          </label>

          <select
            id="golongan"
            value={golongan}
            onChange={(e) =>
              setGolongan(e.target.value)
            }
          >
            {daftarGolongan.map((nama) => (
              <option key={nama} value={nama}>
                {nama}
              </option>
            ))}
          </select>

          <small>
            Admin dapat menyesuaikan golongan
            berdasarkan hasil pemeriksaan.
          </small>
        </div>
      </section>

      {/* HASIL VERIFIKASI ADMIN */}
      <section className="detail-section">
        <div className="detail-section-heading">
          <span className="detail-step">4</span>

          <div>
            <h2>Hasil Verifikasi Admin</h2>

            <p>
              Tentukan keputusan akhir berdasarkan
              hasil pemeriksaan.
            </p>
          </div>
        </div>

        <div className="detail-form-field">
          <label>Keputusan Verifikasi</label>

          <div className="detail-radio-group">
            <label
              className={`detail-radio-option ${
                hasil === "Diterima"
                  ? "selected accepted"
                  : ""
              }`}
            >
              <input
                type="radio"
                name="hasil"
                value="Diterima"
                checked={hasil === "Diterima"}
                onChange={(e) =>
                  setHasil(e.target.value)
                }
              />

              <span>
                <strong>Diterima</strong>

                <small>
                  Pengajuan memenuhi hasil pemeriksaan.
                </small>
              </span>
            </label>

            <label
              className={`detail-radio-option ${
                hasil === "Ditolak"
                  ? "selected rejected"
                  : ""
              }`}
            >
              <input
                type="radio"
                name="hasil"
                value="Ditolak"
                checked={hasil === "Ditolak"}
                onChange={(e) =>
                  setHasil(e.target.value)
                }
              />

              <span>
                <strong>Ditolak</strong>

                <small>
                  Pengajuan belum memenuhi persyaratan.
                </small>
              </span>
            </label>
          </div>
        </div>

        <div className="detail-form-field">
          <label htmlFor="catatan">
            Catatan Admin
          </label>

          <textarea
            id="catatan"
            value={catatan}
            onChange={(e) =>
              setCatatan(e.target.value)
            }
            rows={4}
            placeholder="Tuliskan alasan atau catatan hasil pemeriksaan..."
          />
        </div>
      </section>

      {/* TOKEN HASIL PEMERIKSAAN */}
      {token && (
        <section className="detail-token-card">
          <div>
            <span className="detail-token-label">
              Verifikasi berhasil
            </span>

            <h2>Token Hasil Pemeriksaan</h2>

            <p>
              Token ini dapat digunakan untuk melihat
              hasil pemeriksaan.
            </p>
          </div>

          <div className="detail-token-actions">
            <code>{token}</code>

            <button
              type="button"
              onClick={salinToken}
            >
              Salin Token
            </button>
          </div>
        </section>
      )}

      {/* TOMBOL AKSI */}
      <div className="detail-footer-actions">
        <Link
          to="/admin/pengajuan"
          className="detail-button-secondary"
        >
          Kembali
        </Link>

        <button
          type="button"
          className="detail-button-primary"
          onClick={simpanVerifikasi}
        >
          Simpan Hasil Verifikasi
        </button>
      </div>
    </div>
  );
}

export default DetailPengajuan;
