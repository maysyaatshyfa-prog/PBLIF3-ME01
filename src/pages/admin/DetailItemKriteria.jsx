import { Link, useNavigate, useParams } from "react-router-dom";

const NAMA_ASNAF = {
  fakir: "Fakir",
  miskin: "Miskin",
  amil: "Amil",
  muallaf: "Muallaf",
  riqab: "Riqab",
  gharim: "Gharim",
  fisabilillah: "Fisabilillah",
  "ibnu-sabil": "Ibnu Sabil",
};

function DetailItemKriteria() {
  const { asnaf, id } = useParams();
  const navigate = useNavigate();

  const namaAsnaf = NAMA_ASNAF[asnaf] || "Fakir";

  return (
    <section className="detail-item-page">
      <nav className="detail-item-breadcrumb">
        <Link to="/admin/kriteria">Kelola Kriteria</Link>
        <span>/</span>
        <Link to={`/admin/kriteria/${asnaf}`}>
          {namaAsnaf}
        </Link>
        <span>/</span>
        <span>Detail Kriteria</span>
      </nav>

      <header className="detail-item-header">
        <h1>Detail Kriteria</h1>
        <p>
          Informasi kriteria penilaian untuk golongan {namaAsnaf}.
        </p>
      </header>

      <div className="detail-item-card">
        <div className="detail-item-field">
          <span>Golongan Asnaf</span>
          <strong>{namaAsnaf}</strong>
        </div>

        <div className="detail-item-field">
          <span>ID Kriteria</span>
          <strong>{id}</strong>
        </div>

        <div className="detail-item-empty">
          <p>Data kriteria belum tersedia.</p>
          <span>
            Kode kriteria, pertanyaan, dan aturan penilaian akan
            ditampilkan setelah data tersedia.
          </span>
        </div>

        <div className="detail-item-actions">
          <button
            type="button"
            className="detail-item-back"
            onClick={() => navigate(-1)}
          >
            Kembali
          </button>

          <Link
            to={`/admin/kriteria/${asnaf}`}
            className="detail-item-return"
          >
            Daftar Kriteria
          </Link>
        </div>
      </div>
    </section>
  );
}

export default DetailItemKriteria;
