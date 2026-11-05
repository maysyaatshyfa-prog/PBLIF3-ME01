import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

const KODE_ASNAF = {
  fakir: "F",
  miskin: "M",
  amil: "A",
  muallaf: "MU",
  riqab: "R",
  gharim: "G",
  fisabilillah: "FS",
  "ibnu-sabil": "IS",
};

const TIPE_JAWABAN = [
  { value: "singkat", label: "Isian singkat" },
  { value: "paragraf", label: "Isian panjang (paragraf)" },
  { value: "pilihan", label: "Pilihan ganda" },
  { value: "checkbox", label: "Checkbox (bisa pilih beberapa)" },
  { value: "dropdown", label: "Dropdown" },
  { value: "tanggal", label: "Tanggal" },
  { value: "waktu", label: "Waktu" },
  { value: "file", label: "Unggah file" },
  { value: "skala", label: "Skala penilaian 1–5" },
];

const TIPE_PILIHAN = ["pilihan", "checkbox", "dropdown"];

const NAMA_KRITERIA = {
  fakir: ["Fakir - Penghasilan tidak mencukupi"],
  miskin: ["Miskin - Penghasilan belum mencukupi"],
  amil: ["Amil - Petugas pengelola zakat"],
  muallaf: ["Muallaf - Orang yang baru masuk Islam"],
  riqab: ["Riqab - Pembebasan dari perbudakan"],
  gharim: ["Gharim - Memiliki utang"],
  fisabilillah: ["Fisabilillah - Berjuang di jalan Allah"],
  "ibnu-sabil": ["Ibnu Sabil - Musafir yang kehabisan bekal"],
};

function buatId() {
  return `kriteria-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function buatKodeKriteria(asnaf) {
  const awalan = KODE_ASNAF[asnaf] || "K";
  return `${awalan}-01`;
}

function buatKodePertanyaan(asnaf, index) {
  const awalan = KODE_ASNAF[asnaf] || "K";
  return `${awalan}-${String(index + 1).padStart(2, "0")}`;
}

function buatPertanyaan() {
  return {
    id: buatId(),
    pertanyaan: "",
    tipeJawaban: "singkat",
    opsi: ["Pilihan 1", "Pilihan 2"],
    wajibDiisi: true,
    requireEvidence: false,
    active: true,
  };
}

function bacaData(asnaf) {
  try {
    const data = JSON.parse(
      localStorage.getItem(`kriteria-${asnaf}`) || "[]"
    );

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function FormKriteria() {
  const { asnaf, id } = useParams();
  const navigate = useNavigate();

  const namaAsnaf = NAMA_ASNAF[asnaf] || "Fakir";
  const kodeKriteria = buatKodeKriteria(asnaf);
  const modeEdit = Boolean(id);

  const [namaKriteria, setNamaKriteria] = useState(
    NAMA_KRITERIA[asnaf]?.[0] || `${namaAsnaf} - Kriteria Zakat`
  );

  const [deskripsi, setDeskripsi] = useState(
    "Deskripsi belum tersedia"
  );

  const [pertanyaan, setPertanyaan] = useState(() => {
    const data = bacaData(asnaf);

    if (modeEdit && data.length > 0) {
      return data.map((item) => ({
        ...buatPertanyaan(),
        ...item,
        id: item.id,
        opsi: Array.isArray(item.opsi)
          ? item.opsi
          : ["Pilihan 1", "Pilihan 2"],
        tipeJawaban: item.tipeJawaban || "singkat",
        wajibDiisi: item.wajibDiisi ?? true,
        requireEvidence: item.requireEvidence ?? false,
        active: item.active ?? true,
      }));
    }

    return [buatPertanyaan()];
  });

  const [pesanError, setPesanError] = useState("");

  function ubahPertanyaan(idPertanyaan, perubahan) {
    setPertanyaan((dataLama) =>
      dataLama.map((item) =>
        item.id === idPertanyaan
          ? { ...item, ...perubahan }
          : item
      )
    );

    setPesanError("");
  }

  function tambahPertanyaan() {
    setPertanyaan((dataLama) => [
      ...dataLama,
      buatPertanyaan(),
    ]);
  }

  function hapusPertanyaan(idPertanyaan) {
    if (pertanyaan.length === 1) {
      setPesanError("Minimal harus ada satu pertanyaan.");
      return;
    }

    setPertanyaan((dataLama) =>
      dataLama.filter((item) => item.id !== idPertanyaan)
    );
  }

  function simpanKuesioner(event) {
    event.preventDefault();
    setPesanError("");

    const pertanyaanKosong = pertanyaan.findIndex(
      (item) => !item.pertanyaan.trim()
    );

    if (pertanyaanKosong !== -1) {
      setPesanError(
        `Isi pertanyaan nomor ${pertanyaanKosong + 1} terlebih dahulu.`
      );
      return;
    }

    const hasilPertanyaan = pertanyaan.map((item, index) => ({
      ...item,
      kode: buatKodePertanyaan(asnaf, index),
      pertanyaan: item.pertanyaan.trim(),
      opsi: TIPE_PILIHAN.includes(item.tipeJawaban)
        ? item.opsi.map((opsi) => opsi.trim()).filter(Boolean)
        : [],
      asnaf,
      namaAsnaf,
    }));

    const pilihanTidakLengkap = hasilPertanyaan.some(
      (item) =>
        TIPE_PILIHAN.includes(item.tipeJawaban) &&
        item.opsi.length < 2
    );

    if (pilihanTidakLengkap) {
      setPesanError(
        "Pertanyaan pilihan harus memiliki minimal dua opsi."
      );
      return;
    }

    try {
      const dataLama = bacaData(asnaf);

      const dataBaru = modeEdit
        ? hasilPertanyaan
        : [...dataLama, ...hasilPertanyaan];

      localStorage.setItem(
        `kriteria-${asnaf}`,
        JSON.stringify(dataBaru)
      );

      localStorage.setItem(
        `kriteria-info-${asnaf}`,
        JSON.stringify({
          kodeKriteria,
          namaKriteria,
          deskripsi,
          asnaf: namaAsnaf,
        })
      );

      navigate(`/admin/kriteria/${asnaf}`);
    } catch {
      setPesanError("Data gagal disimpan.");
    }
  }

  return (
    <section className="form-kriteria-page">

      {/* BREADCRUMB */}
      <nav className="kriteria-breadcrumb">
        <button
          type="button"
          onClick={() => navigate("/admin/kriteria")}
        >
          Kelola Kriteria
        </button>

        <span>/</span>

        <button
          type="button"
          onClick={() => navigate(`/admin/kriteria/${asnaf}`)}
        >
          {namaAsnaf}
        </button>

        <span>/</span>

        <span>{modeEdit ? "Edit Kriteria" : "Tambah Kriteria"}</span>
      </nav>

      {/* JUDUL */}
      <header className="form-kriteria-heading">
        <h1>
          {modeEdit ? "Edit Kriteria" : "Tambah Kriteria"}{" "}
          {kodeKriteria}
        </h1>

        <p>
          Atur informasi kriteria dan pertanyaan kuesioner
          untuk golongan {namaAsnaf}.
        </p>
      </header>

      <form onSubmit={simpanKuesioner}>

        {/* INFORMASI KRITERIA */}
        <section className="form-kriteria-panel">
          <h2>Informasi Kriteria</h2>

          <div className="form-kriteria-info-grid">

            <div className="builder-field">
              <label htmlFor="kode-kriteria">
                Kode Kriteria
              </label>

              <input
                id="kode-kriteria"
                value={kodeKriteria}
                readOnly
              />
            </div>

            <div className="builder-field">
              <label htmlFor="nama-kriteria">
                Nama Kriteria
              </label>

              <select
                id="nama-kriteria"
                value={namaKriteria}
                onChange={(event) =>
                  setNamaKriteria(event.target.value)
                }
              >
                {(NAMA_KRITERIA[asnaf] || [
                  `${namaAsnaf} - Kriteria Zakat`,
                ]).map((nama) => (
                  <option key={nama} value={nama}>
                    {nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="builder-field">
              <label htmlFor="deskripsi-kriteria">
                Deskripsi
              </label>

              <input
                id="deskripsi-kriteria"
                value={deskripsi}
                onChange={(event) =>
                  setDeskripsi(event.target.value)
                }
              />
            </div>

            <div className="builder-field">
              <label htmlFor="asnaf-kriteria">
                Asnaf
              </label>

              <input
                id="asnaf-kriteria"
                value={namaAsnaf}
                readOnly
              />
            </div>

          </div>
        </section>

        {/* PERTANYAAN KUESIONER */}
        <section className="form-kriteria-panel">
          <h2>Pertanyaan Kuesioner</h2>

          {pertanyaan.map((item, index) => (
            <article
              className="form-question-item"
              key={item.id}
            >

              <div className="form-question-heading">
                <strong>Pertanyaan {index + 1}</strong>

                {pertanyaan.length > 1 && (
                  <button
                    type="button"
                    className="builder-delete-button"
                    onClick={() => hapusPertanyaan(item.id)}
                  >
                    Hapus
                  </button>
                )}
              </div>

              <div className="builder-field">
                <label htmlFor={`pertanyaan-${item.id}`}>
                  Pertanyaan
                </label>

                <textarea
                  id={`pertanyaan-${item.id}`}
                  value={item.pertanyaan}
                  onChange={(event) =>
                    ubahPertanyaan(item.id, {
                      pertanyaan: event.target.value,
                    })
                  }
                  placeholder="Masukkan pertanyaan kuesioner"
                  rows={3}
                  required
                />
              </div>

              <div className="builder-field">
                <label htmlFor={`tipe-${item.id}`}>
                  Jenis Jawaban
                </label>

                <select
                  id={`tipe-${item.id}`}
                  value={item.tipeJawaban}
                  onChange={(event) =>
                    ubahPertanyaan(item.id, {
                      tipeJawaban: event.target.value,
                    })
                  }
                >
                  {TIPE_JAWABAN.map((tipe) => (
                    <option
                      key={tipe.value}
                      value={tipe.value}
                    >
                      {tipe.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* OPSI JAWABAN */}
              {TIPE_PILIHAN.includes(item.tipeJawaban) && (
                <div className="builder-field">
                  <label>Opsi Jawaban</label>

                  {item.opsi.map((opsi, opsiIndex) => (
                    <div
                      className="form-option-row"
                      key={`${item.id}-${opsiIndex}`}
                    >
                      <input
                        value={opsi}
                        onChange={(event) => {
                          const opsiBaru = [...item.opsi];
                          opsiBaru[opsiIndex] = event.target.value;

                          ubahPertanyaan(item.id, {
                            opsi: opsiBaru,
                          });
                        }}
                        placeholder={`Pilihan ${opsiIndex + 1}`}
                      />

                      {item.opsi.length > 2 && (
                        <button
                          type="button"
                          className="form-remove-option"
                          onClick={() =>
                            ubahPertanyaan(item.id, {
                              opsi: item.opsi.filter(
                                (_, i) => i !== opsiIndex
                              ),
                            })
                          }
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    className="form-add-option"
                    onClick={() =>
                      ubahPertanyaan(item.id, {
                        opsi: [
                          ...item.opsi,
                          `Pilihan ${item.opsi.length + 1}`,
                        ],
                      })
                    }
                  >
                    + Tambah opsi
                  </button>
                </div>
              )}

              {/* PENGATURAN */}
              <div className="form-question-settings">

                <label>
                  <input
                    type="checkbox"
                    checked={item.wajibDiisi}
                    onChange={(event) =>
                      ubahPertanyaan(item.id, {
                        wajibDiisi: event.target.checked,
                      })
                    }
                  />

                  Wajib diisi
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={item.requireEvidence}
                    onChange={(event) =>
                      ubahPertanyaan(item.id, {
                        requireEvidence: event.target.checked,
                      })
                    }
                  />

                  Wajib unggah bukti pendukung
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={item.active}
                    onChange={(event) =>
                      ubahPertanyaan(item.id, {
                        active: event.target.checked,
                      })
                    }
                  />

                  Aktif
                </label>

              </div>

            </article>
          ))}

          <button
            type="button"
            className="form-add-question"
            onClick={tambahPertanyaan}
          >
            + Tambah pertanyaan
          </button>

        </section>

        {/* PESAN ERROR */}
        {pesanError && (
          <p className="builder-error" role="alert">
            {pesanError}
          </p>
        )}

        {/* TOMBOL */}
        <div className="form-kriteria-actions">
          <button
            type="button"
            className="form-cancel-button"
            onClick={() => navigate(`/admin/kriteria/${asnaf}`)}
          >
            Batal
          </button>

          <button
            type="submit"
            className="form-save-button"
          >
            Simpan Kriteria
          </button>
        </div>

      </form>
    </section>
  );
}

export default FormKriteria;