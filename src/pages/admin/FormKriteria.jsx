import { useState } from "react";
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

function FormKriteria() {
  const { asnaf, id } = useParams();
  const navigate = useNavigate();
  const namaAsnaf = NAMA_ASNAF[asnaf] || "Fakir";
  const storageKey = `kriteria-${asnaf}`;
  const sedangEdit = Boolean(id);

  const [kode, setKode] = useState("");
  const [pertanyaan, setPertanyaan] = useState("");

  function simpanKriteria(event) {
    event.preventDefault();

    if (!kode.trim() || !pertanyaan.trim()) {
      alert("Kode dan pertanyaan wajib diisi.");
      return;
    }

    let data;

    try {
      data = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (!Array.isArray(data)) data = [];
    } catch {
      data = [];
    }

    if (sedangEdit) {
      data = data.map((item) =>
        String(item.id) === id
          ? { ...item, kode: kode.trim(), pertanyaan: pertanyaan.trim() }
          : item
      );
    } else {
      data.push({
        id: Date.now(),
        kode: kode.trim(),
        pertanyaan: pertanyaan.trim(),
      });
    }

    localStorage.setItem(storageKey, JSON.stringify(data));
    navigate(`/admin/kriteria/${asnaf}`);
  }

  return (
    <section className="form-kriteria-page">
      <nav className="kriteria-breadcrumb">
        <Link to="/admin/kriteria">Kelola Kriteria</Link>
        <span> / </span>
        <Link to={`/admin/kriteria/${asnaf}`}>{namaAsnaf}</Link>
      </nav>

      <header className="kriteria-header">
        <h1>{sedangEdit ? "Edit Kriteria" : "Tambah Kriteria"}</h1>
        <p>Kelola kriteria untuk golongan {namaAsnaf}.</p>
      </header>

      <form className="kriteria-form" onSubmit={simpanKriteria}>
        <label htmlFor="kode">Kode Kriteria</label>
        <input
          id="kode"
          value={kode}
          onChange={(event) => setKode(event.target.value)}
          placeholder="Contoh: KF-01"
          required
        />

        <label htmlFor="pertanyaan">Pertanyaan Kriteria</label>
        <textarea
          id="pertanyaan"
          value={pertanyaan}
          onChange={(event) => setPertanyaan(event.target.value)}
          placeholder="Masukkan pertanyaan kriteria"
          required
        />

        <div className="kriteria-form-actions">
          <button type="submit" className="kriteria-action edit">
            Simpan
          </button>
          <button
            type="button"
            className="kriteria-action delete"
            onClick={() => navigate(`/admin/kriteria/${asnaf}`)}
          >
            Batal
          </button>
        </div>
      </form>
    </section>
  );
}

export default FormKriteria;
