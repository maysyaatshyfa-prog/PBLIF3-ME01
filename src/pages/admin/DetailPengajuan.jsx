import { useState } from "react";
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

const [hasil, setHasil] = useState("");
const [golongan, setGolongan] = useState("Fakir");
const [catatan, setCatatan] = useState("");
const [token, setToken] = useState("");

const simpanVerifikasi = () => {
if (!hasil) {
alert("Silakan pilih hasil verifikasi terlebih dahulu.");
return;
}


if (hasil === "Diterima") {
const tokenBaru =
"MST-" +
Math.random().toString(36).substring(2, 7).toUpperCase();

setToken(tokenBaru);
} else {
setToken("");
}

alert("Hasil verifikasi berhasil disimpan.");


};

const salinToken = async () => {
try {
await navigator.clipboard.writeText(token);
alert("Token berhasil disalin.");
} catch {
alert("Token tidak dapat disalin otomatis. Silakan salin secara manual.");
}
};

return ( <div className="detail-pengajuan">
  <div className="detail-breadcrumb">
    <Link to="/admin/pengajuan">Daftar Pengajuan</Link> <span>/</span> <span>Detail Pemeriksaan</span> </div>

  <header className="detail-page-header">
    <h1>Pemeriksaan Pengajuan</h1>
    <p>
      Periksa jawaban dan dokumen calon mustahik sebelum menentukan
      hasil verifikasi.
    </p>
  </header>

  <section className="detail-section">
    <div className="detail-section-heading">
      <span className="detail-step">i</span>
      <div>
        <h2>Informasi Calon Mustahik</h2>
        <p>Informasi dasar calon penerima zakat.</p>
      </div>
    </div>

    <div className="detail-info-grid">
      <div className="detail-info-item">
        <span>Nomor Pengajuan</span>
        <strong>PGJ-{String(id || "001").padStart(3, "0")}</strong>
      </div>

      <div className="detail-info-item">
        <span>Nama Calon Mustahik</span>
        <strong>Ahmad Fauzi</strong>
      </div>

      <div className="detail-info-item">
        <span>Tanggal Pengajuan</span>
        <strong>05 Oktober 2026</strong>
      </div>

      <div className="detail-info-item">
        <span>Status Pengajuan</span>
        <strong className="detail-status">
          Menunggu Verifikasi
        </strong>
      </div>
    </div>
  </section>

  <section className="detail-section">
    <div className="detail-section-heading">
      <span className="detail-step">1</span>
      <div>
        <h2>Pemeriksaan Jawaban Kuesioner</h2>
        <p>
          Periksa jawaban yang telah diberikan oleh calon mustahik.
        </p>
      </div>
    </div>

    <div className="detail-question-list">
      <div className="detail-question">
        <p>
          Apakah penghasilan Anda mencukupi kebutuhan sehari-hari?
        </p>
        <strong className="detail-answer answer-no">Tidak</strong>
      </div>

      <div className="detail-question">
        <p>Apakah Anda memiliki tanggungan keluarga?</p>
        <strong className="detail-answer answer-yes">Ya</strong>
      </div>

      <div className="detail-question">
        <p>Apakah Anda memiliki tempat tinggal tetap?</p>
        <strong className="detail-answer answer-no">Tidak</strong>
      </div>
    </div>
  </section>

  <section className="detail-section">
    <div className="detail-section-heading">
      <span className="detail-step">2</span>
      <div>
        <h2>Dokumen Calon Mustahik</h2>
        <p>Periksa dokumen pendukung yang telah diunggah.</p>
      </div>
    </div>

    <div className="detail-document">
      <div className="detail-document-icon">PDF</div>

      <div className="detail-document-info">
        <strong>Kartu Keluarga.pdf</strong>
        <span>Dokumen pendukung calon mustahik</span>
      </div>

      <button type="button" className="detail-button-secondary" onClick={()=>
        alert(
        "Fitur melihat dokumen perlu dihubungkan dengan file yang diunggah."
        )
        }
        >
        Lihat Dokumen
      </button>
    </div>
  </section>

  <section className="detail-section">
    <div className="detail-section-heading">
      <span className="detail-step">3</span>
      <div>
        <h2>Penentuan Golongan Mustahik</h2>
        <p>
          Periksa hasil sistem pakar dan tentukan golongan yang sesuai.
        </p>
      </div>
    </div>

    <div className="detail-system-result">
      <span>Hasil Sistem Pakar</span>
      <strong>Fakir</strong>
      <p>
        Hasil ini merupakan rekomendasi sistem berdasarkan jawaban
        kuesioner.
      </p>
    </div>

    <div className="detail-form-field">
      <label htmlFor="golongan">Golongan Mustahik</label>

      <select id="golongan" value={golongan} onChange={(e)=> setGolongan(e.target.value)}
        >
        {daftarGolongan.map((nama) => (
        <option key={nama} value={nama}>
          {nama}
        </option>
        ))}
      </select>

      <small>
        Admin dapat menyesuaikan golongan berdasarkan hasil pemeriksaan.
      </small>
    </div>
  </section>

  <section className="detail-section">
    <div className="detail-section-heading">
      <span className="detail-step">4</span>
      <div>
        <h2>Hasil Verifikasi Admin</h2>
        <p>Tentukan keputusan akhir berdasarkan hasil pemeriksaan.</p>
      </div>
    </div>

    <div className="detail-form-field">
      <label>Keputusan Verifikasi</label>

      <div className="detail-radio-group">
        <label className={`detail-radio-option ${ hasil==="Diterima" ? "selected accepted" : "" }`}>
          <input type="radio" name="hasil" value="Diterima" checked={hasil==="Diterima" } onChange={(e)=>
          setHasil(e.target.value)}
          />

          <span>
            <strong>Diterima</strong>
            <small>Pengajuan memenuhi hasil pemeriksaan.</small>
          </span>
        </label>

        <label className={`detail-radio-option ${ hasil==="Ditolak" ? "selected rejected" : "" }`}>
          <input type="radio" name="hasil" value="Ditolak" checked={hasil==="Ditolak" } onChange={(e)=>
          setHasil(e.target.value)}
          />

          <span>
            <strong>Ditolak</strong>
            <small>Pengajuan belum memenuhi persyaratan.</small>
          </span>
        </label>
      </div>
    </div>

    <div className="detail-form-field">
      <label htmlFor="catatan">Catatan Admin</label>

      <textarea id="catatan" value={catatan} onChange={(e)=> setCatatan(e.target.value)}
        rows={4}
        placeholder="Tuliskan alasan atau catatan hasil pemeriksaan..."
      />
    </div>
  </section>

  {token && (
    <section className="detail-token-card">
      <div>
        <span className="detail-token-label">
          Verifikasi berhasil
        </span>
        <h2>Token Hasil Pemeriksaan</h2>
        <p>
          Token ini dapat digunakan untuk melihat hasil pemeriksaan.
        </p>
      </div>

      <div className="detail-token-actions">
        <code>{token}</code>

        <button type="button" onClick={salinToken}>
          Salin Token
        </button>
      </div>
    </section>
  )}

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
