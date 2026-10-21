
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

function DetailKriteria() {
  const { asnaf } = useParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [itemDetail, setItemDetail] = useState(null);

  const [dataKriteria, setDataKriteria] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(`kriteria-${asnaf}`) || "[]"
      );
    } catch {
      return [];
    }
  });

  const namaAsnaf = NAMA_ASNAF[asnaf] || "Fakir";

  const dataTerfilter = dataKriteria.filter((item) => {
    const kataKunci = search.toLowerCase();

    return (
      String(item.kode || "").toLowerCase().includes(kataKunci) ||
      String(item.pertanyaan || "").toLowerCase().includes(kataKunci)
    );
  });

  function hapusKriteria(id) {
    const yakin = window.confirm(
      "Apakah kamu yakin ingin menghapus kriteria ini?"
    );

    if (!yakin) return;

    const dataBaru = dataKriteria.filter((item) => item.id !== id);

    setDataKriteria(dataBaru);
    localStorage.setItem(
      `kriteria-${asnaf}`,
      JSON.stringify(dataBaru)
    );

    if (itemDetail?.id === id) {
      setItemDetail(null);
    }
  }

  return (
    <section className="detail-kriteria-page">
      <nav className="kriteria-breadcrumb">
        <Link to="/admin/kriteria">Kelola Kriteria</Link>
        <span>/</span>
        <span>{namaAsnaf}</span>
      </nav>

      <header className="kriteria-header">
        <h1>{namaAsnaf}</h1>
        <p>
          Kelola kriteria dan aturan penilaian untuk golongan{" "}
          {namaAsnaf.toLowerCase()}.
        </p>
      </header>

      <div className="kriteria-summary">
        <p>Jumlah Kriteria</p>
        <strong>{dataKriteria.length}</strong>
      </div>

      <div className="kriteria-toolbar">
        <div className="kriteria-search">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari kode kriteria atau pertanyaan..."
            aria-label="Cari kriteria"
          />
        </div>

        <button
          type="button"
          className="kriteria-button kriteria-button-tambah"
          onClick={() =>
            navigate(`/admin/kriteria/${asnaf}/tambah`)
          }
        >
          + Tambah Kriteria
        </button>
      </div>

      <div className="kriteria-table-wrapper">
        <table className="kriteria-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Kode Kriteria</th>
              <th>Pertanyaan</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {dataTerfilter.length > 0 ? (
              dataTerfilter.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.kode}</td>
                  <td>{item.pertanyaan}</td>
                  <td>
                    <div className="kriteria-actions">
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
                        onClick={() =>
                          navigate(
                            `/admin/kriteria/${asnaf}/${item.id}/edit`
                          )
                        }
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
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="kriteria-empty">
                  {search
                    ? "Kriteria tidak ditemukan."
                    : "Belum ada data kriteria. Klik + Tambah Kriteria untuk menambahkan."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {itemDetail && (
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
              <h2 id="judul-detail-kriteria">Detail Kriteria</h2>

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
              <strong>{namaAsnaf}</strong>
            </div>

            <div className="kriteria-modal-field">
              <span>Kode Kriteria</span>
              <strong>{itemDetail.kode}</strong>
            </div>

            <div className="kriteria-modal-field">
              <span>Pertanyaan</span>
              <p>{itemDetail.pertanyaan}</p>
            </div>

            <button
              type="button"
              className="kriteria-button"
              onClick={() => setItemDetail(null)}
            >
              Tutup
            </button>
          </section>
        </div>
      )}

      <style>{`
        .detail-kriteria-page .kriteria-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .detail-kriteria-page .kriteria-button-tambah {
          width: auto;
          min-width: 0;
          padding: 9px 14px;
          font-size: 13px;
          line-height: 1.4;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .detail-kriteria-page .kriteria-table th:last-child,
        .detail-kriteria-page .kriteria-table td:last-child {
          min-width: 175px;
          text-align: center;
        }

        .detail-kriteria-page .kriteria-actions {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
        }

        .detail-kriteria-page .kriteria-action {
          width: auto;
          min-width: 0;
          padding: 6px 10px;
          font-size: 12px;
          line-height: 1.4;
          border-radius: 6px;
          cursor: pointer;
        }

        @media (max-width: 600px) {
          .detail-kriteria-page .kriteria-toolbar {
            align-items: stretch;
          }

          .detail-kriteria-page .kriteria-button-tambah {
            align-self: flex-start;
          }

          .detail-kriteria-page .kriteria-table-wrapper {
            overflow-x: auto;
          }
        }
      `}</style>
    </section>
  );
}

export default DetailKriteria;
