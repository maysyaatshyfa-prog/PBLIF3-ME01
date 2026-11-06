import "../../index.css";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useParams } from "react-router-dom";


const dataKriteriaAwal = [
  {
    id: 1,
    kode: "K01",
    pertanyaan: "Apakah calon mustahik memiliki penghasilan tetap?",
    status: "Aktif",
  },
  {
    id: 2,
    kode: "K02",
    pertanyaan:
      "Apakah penghasilan calon mustahik mencukupi kebutuhan sehari-hari?",
    status: "Aktif",
  },
  {
    id: 3,
    kode: "K03",
    pertanyaan: "Apakah calon mustahik memiliki tempat tinggal yang layak?",
    status: "Aktif",
  },
  {
    id: 4,
    kode: "K04",
    pertanyaan: "Apakah calon mustahik mampu memenuhi kebutuhan pokok?",
    status: "Aktif",
  },
  {
    id: 5,
    kode: "K05",
    pertanyaan: "Apakah calon mustahik membutuhkan bantuan zakat?",
    status: "Aktif",
  },
];

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

  const [dataKriteria, setDataKriteria] = useState(() => {
    try {
      const dataTersimpan = localStorage.getItem(
        `kriteria-${asnaf}`
      );

      if (dataTersimpan) {
        const data = JSON.parse(dataTersimpan);

        return Array.isArray(data) ? data : dataKriteriaAwal;
      }

      // Simpan data awal agar halaman builder
      // membaca daftar pertanyaan yang sama.
      localStorage.setItem(
        `kriteria-${asnaf}`,
        JSON.stringify(dataKriteriaAwal)
      );

      return dataKriteriaAwal;
    } catch {
      return dataKriteriaAwal;
    }
  });

  const nama = namaAsnaf[asnaf] || "Fakir";

  function getStatus(item) {
    if (item.active === false) {
      return "Nonaktif";
    }

    return item.status || "Aktif";
  }

  const dataFilter = dataKriteria.filter((item) => {
    const kode = item.kode || "";
    const pertanyaan = item.pertanyaan || "";

    return (
      kode.toLowerCase().includes(search.toLowerCase()) ||
      pertanyaan.toLowerCase().includes(search.toLowerCase())
    );
  });

  function simpanData(dataBaru) {
    setDataKriteria(dataBaru);

    localStorage.setItem(
      `kriteria-${asnaf}`,
      JSON.stringify(dataBaru)
    );
  }

  function bukaTambah() {
    navigate(`/admin/kriteria/${asnaf}/tambah`);
  }

  function bukaEdit(item) {
    navigate(
      `/admin/kriteria/${asnaf}/${item.id}/edit`
    );
  }

  function hapusKriteria(id) {
    const yakin = window.confirm(
      "Apakah kamu yakin ingin menghapus pertanyaan ini?"
    );

    if (!yakin) return;

    const dataBaru = dataKriteria.filter(
      (item) => String(item.id) !== String(id)
    );

    simpanData(dataBaru);

    if (
      itemDetail &&
      String(itemDetail.id) === String(id)
    ) {
      setItemDetail(null);
    }
  }

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

      {/* Statistik kriteria */}
      <div className="kriteria-summary">
        <p>Kriteria</p>
        <strong>{dataKriteria.length}</strong>
      </div>

      {/* Pencarian dan tombol tambah */}
      <div className="kriteria-toolbar">
        <div className="kriteria-search">
          <input
            type="text"
            placeholder="Cari kode kriteria atau pertanyaan..."
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

      {/* Tabel kriteria */}
      <div className="kriteria-table-wrapper">
        <table className="kriteria-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Kode Kriteria</th>
              <th>Pertanyaan</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {dataFilter.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>

                <td>{item.kode || "-"}</td>

                <td>{item.pertanyaan || "-"}</td>

                <td>
                  <span
                    className={`transaksi-status ${
                      getStatus(item) === "Aktif"
                        ? "status-berhasil"
                        : ""
                    }`}
                  >
                    {getStatus(item)}
                  </span>
                </td>

                <td>
                  <div className="kriteria-actions">
                    {/* Detail satu pertanyaan */}
                    <button
                      type="button"
                      className="kriteria-action detail"
                      onClick={() => setItemDetail(item)}
                    >
                      Detail
                    </button>

                    {/* Edit seluruh kuesioner asnaf */}
                    <button
                      type="button"
                      className="kriteria-action edit"
                      onClick={() => bukaEdit(item)}
                    >
                      Edit
                    </button>

                    {/* Hapus satu pertanyaan */}
                    <button
                      type="button"
                      className="kriteria-action delete"
                      onClick={() => hapusKriteria(item.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {dataFilter.length === 0 && (
              <tr>
                <td colSpan={5} className="kriteria-empty">
                  Kriteria tidak ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detail satu pertanyaan */}
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
                <strong>{itemDetail.kode || "-"}</strong>
              </div>

              <div className="kriteria-modal-field">
                <span>Pertanyaan</span>
                <p>{itemDetail.pertanyaan || "-"}</p>
              </div>

              <div className="kriteria-modal-field">
                <span>Jenis Jawaban</span>
                <strong>
                  {itemDetail.tipeJawaban || "Belum ditentukan"}
                </strong>
              </div>

              <div className="kriteria-modal-field">
                <span>Wajib Diisi</span>
                <strong>
                  {itemDetail.wajibDiisi === false
                    ? "Tidak"
                    : "Ya"}
                </strong>
              </div>

              <div className="kriteria-modal-field">
                <span>Bukti Pendukung</span>
                <strong>
                  {itemDetail.requireEvidence
                    ? "Wajib"
                    : "Tidak wajib"}
                </strong>
              </div>

              <div className="kriteria-modal-field">
                <span>Status</span>
                <strong>{getStatus(itemDetail)}</strong>
              </div>

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
