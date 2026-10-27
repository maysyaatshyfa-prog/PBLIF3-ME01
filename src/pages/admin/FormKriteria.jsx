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

function buatId() {
  return `kriteria-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function buatKodePertanyaan(asnaf, index) {
  const awalan = KODE_ASNAF[asnaf] || "K";
  return `${awalan}-${String(index + 1).padStart(2, "0")}`;
}

function buatPertanyaan() {
  return {
    id: buatId(),
    kode: "",
    pertanyaan: "",
    tipeJawaban: "singkat",
    opsi: ["Pilihan 1", "Pilihan 2"],
    wajibDiisi: true,
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
  const modeEdit = Boolean(id);
  const namaAsnaf = NAMA_ASNAF[asnaf] || "Fakir";

  const [pertanyaan, setPertanyaan] = useState(() => {
    const data = bacaData(asnaf);

    if (modeEdit) {
      const item = data.find(
        (kriteria) => String(kriteria.id) === String(id)
      );

      if (item) {
        return [
          {
            ...buatPertanyaan(),
            ...item,
            tipeJawaban: item.tipeJawaban || "singkat",
            opsi: Array.isArray(item.opsi)
              ? item.opsi
              : ["Pilihan 1", "Pilihan 2"],
            wajibDiisi: item.wajibDiisi ?? true,
          },
        ];
      }
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

    setPesanError("");
  }

  function duplikatPertanyaan(item) {
    setPertanyaan((dataLama) => {
      const index = dataLama.findIndex(
        (itemLama) => itemLama.id === item.id
      );

      const salinan = {
        ...item,
        id: buatId(),
        kode: "",
        opsi: [...(item.opsi || [])],
      };

      const hasil = [...dataLama];
      hasil.splice(index + 1, 0, salinan);

      return hasil;
    });

    setPesanError("");
  }

  function hapusPertanyaan(idPertanyaan) {
    if (pertanyaan.length === 1) {
      setPesanError("Minimal harus ada satu pertanyaan.");
      return;
    }

    setPertanyaan((dataLama) =>
      dataLama.filter((item) => item.id !== idPertanyaan)
    );

    setPesanError("");
  }

  function pindahkanPertanyaan(index, arah) {
    const tujuan = index + arah;

    if (tujuan < 0 || tujuan >= pertanyaan.length) {
      return;
    }

    setPertanyaan((dataLama) => {
      const hasil = [...dataLama];

      [hasil[index], hasil[tujuan]] = [
        hasil[tujuan],
        hasil[index],
      ];

      return hasil;
    });

    setPesanError("");
  }

  function simpanKuesioner(event) {
    event.preventDefault();
    setPesanError("");

    const dataLama = bacaData(asnaf);

    const pertanyaanTidakLengkap = pertanyaan.findIndex(
      (item) => !item.pertanyaan.trim()
    );

    if (pertanyaanTidakLengkap !== -1) {
      setPesanError(
        `Isi teks pertanyaan pada pertanyaan ${
          pertanyaanTidakLengkap + 1
        }.`
      );
      return;
    }

    const hasilPertanyaan = pertanyaan.map((item, index) => ({
      ...item,
      kode: buatKodePertanyaan(asnaf, index),
      pertanyaan: item.pertanyaan.trim(),
      tipeJawaban: item.tipeJawaban,
      opsi: TIPE_PILIHAN.includes(item.tipeJawaban)
        ? item.opsi.map((opsi) => opsi.trim()).filter(Boolean)
        : [],
      wajibDiisi: item.wajibDiisi,
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
        "Pertanyaan pilihan harus memiliki minimal dua opsi jawaban."
      );
      return;
    }

    let dataBaru;

    if (modeEdit) {
      const pertanyaanUtama = hasilPertanyaan[0];

      dataBaru = dataLama.map((item) =>
        String(item.id) === String(id)
          ? { ...item, ...pertanyaanUtama, id: item.id }
          : item
      );

      const pertanyaanTambahan = hasilPertanyaan.slice(1);
      dataBaru = [...dataBaru, ...pertanyaanTambahan];
    } else {
      dataBaru = [...dataLama, ...hasilPertanyaan];
    }

    // Rapikan kode semua pertanyaan sesuai urutan penyimpanan.
    dataBaru = dataBaru.map((item, index) => ({
      ...item,
      kode: buatKodePertanyaan(asnaf, index),
      asnaf,
      namaAsnaf,
    }));

    try {
      localStorage.setItem(
        `kriteria-${asnaf}`,
        JSON.stringify(dataBaru)
      );

      navigate(`/admin/kriteria/${asnaf}`);
    } catch {
      setPesanError(
        "Data gagal disimpan. Periksa kapasitas penyimpanan browser."
      );
    }
  }

  return (
    <section className="form-kriteria-page">
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

        <span>
          {modeEdit ? "Edit Kuesioner" : "Tambah Kuesioner"}
        </span>
      </nav>

      <header className="form-kriteria-heading">
        <p className="form-kriteria-eyebrow">
          PEMBUAT KUESIONER
        </p>

        <h1>
          {modeEdit ? "Edit Pertanyaan" : "Buat Kuesioner"}
        </h1>

        <p>
          Buat pertanyaan dan tentukan jenis jawaban untuk calon
          mustahik golongan {namaAsnaf}.
        </p>
      </header>

      <form onSubmit={simpanKuesioner}>
        <div className="form-kriteria-info">
          <label htmlFor="nama-golongan">
            Golongan Asnaf
          </label>

          <input
            id="nama-golongan"
            value={namaAsnaf}
            readOnly
          />

          <p>
            Kode pertanyaan dibuat otomatis berdasarkan golongan
            asnaf dan urutan pertanyaan.
          </p>
        </div>

        {pertanyaan.map((item, index) => (
          <article
            className="builder-question-card"
            key={item.id}
          >
            <div className="builder-question-top">
              <span className="builder-question-number">
                Pertanyaan {index + 1}
              </span>

              <div className="builder-question-move">
                <button
                  type="button"
                  onClick={() => pindahkanPertanyaan(index, -1)}
                  disabled={index === 0}
                  aria-label="Pindahkan pertanyaan ke atas"
                  title="Pindahkan ke atas"
                >
                  ↑
                </button>

                <button
                  type="button"
                  onClick={() => pindahkanPertanyaan(index, 1)}
                  disabled={index === pertanyaan.length - 1}
                  aria-label="Pindahkan pertanyaan ke bawah"
                  title="Pindahkan ke bawah"
                >
                  ↓
                </button>
              </div>
            </div>

            <div className="builder-field">
              <label htmlFor={`kode-${item.id}`}>
                Kode Pertanyaan
              </label>

              <input
                id={`kode-${item.id}`}
                type="text"
                value={buatKodePertanyaan(asnaf, index)}
                readOnly
              />
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
                placeholder="Tuliskan pertanyaan di sini"
                rows={3}
                required
              />
            </div>

            <div className="builder-field">
              <label htmlFor={`tipe-${item.id}`}>
                Jenis jawaban
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

            {TIPE_PILIHAN.includes(item.tipeJawaban) && (
              <div className="builder-field">
                <label>Opsi jawaban</label>

                <p className="builder-help">
                  Masukkan satu pilihan per baris.
                </p>

                <textarea
                  value={item.opsi.join("\n")}
                  onChange={(event) =>
                    ubahPertanyaan(item.id, {
                      opsi: event.target.value.split("\n"),
                    })
                  }
                  placeholder={"Pilihan 1\nPilihan 2"}
                  rows={4}
                />
              </div>
            )}

            <div className="builder-answer-preview">
              <span className="builder-preview-label">
                Pratinjau jawaban
              </span>

              {item.tipeJawaban === "singkat" && (
                <input
                  type="text"
                  placeholder="Jawaban singkat"
                  disabled
                />
              )}

              {item.tipeJawaban === "paragraf" && (
                <textarea
                  placeholder="Jawaban panjang"
                  rows={3}
                  disabled
                />
              )}

              {item.tipeJawaban === "pilihan" && (
                <div className="builder-preview-options">
                  {(item.opsi.filter(Boolean).length
                    ? item.opsi.filter(Boolean)
                    : ["Pilihan 1", "Pilihan 2"]
                  ).map((opsi, opsiIndex) => (
                    <label key={`${item.id}-${opsiIndex}`}>
                      <input type="radio" disabled />
                      <span>{opsi}</span>
                    </label>
                  ))}
                </div>
              )}

              {item.tipeJawaban === "checkbox" && (
                <div className="builder-preview-options">
                  {(item.opsi.filter(Boolean).length
                    ? item.opsi.filter(Boolean)
                    : ["Pilihan 1", "Pilihan 2"]
                  ).map((opsi, opsiIndex) => (
                    <label key={`${item.id}-${opsiIndex}`}>
                      <input type="checkbox" disabled />
                      <span>{opsi}</span>
                    </label>
                  ))}
                </div>
              )}

              {item.tipeJawaban === "dropdown" && (
                <select disabled defaultValue="">
                  <option value="">Pilih jawaban</option>

                  {item.opsi.filter(Boolean).map((opsi, opsiIndex) => (
                    <option
                      key={`${item.id}-${opsiIndex}`}
                      value={opsi}
                    >
                      {opsi}
                    </option>
                  ))}
                </select>
              )}

              {item.tipeJawaban === "tanggal" && (
                <input type="date" disabled />
              )}

              {item.tipeJawaban === "waktu" && (
                <input type="time" disabled />
              )}

              {item.tipeJawaban === "file" && (
                <div className="builder-file-preview">
                  <span aria-hidden="true">↥</span>

                  <div>
                    <strong>Unggah file</strong>
                    <p>
                      Calon mustahik dapat memilih dokumen.
                    </p>
                  </div>
                </div>
              )}

              {item.tipeJawaban === "skala" && (
                <div className="builder-scale-preview">
                  {[1, 2, 3, 4, 5].map((nilai) => (
                    <span key={nilai}>{nilai}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="builder-question-footer">
              <label className="builder-required">
                <input
                  type="checkbox"
                  checked={item.wajibDiisi}
                  onChange={(event) =>
                    ubahPertanyaan(item.id, {
                      wajibDiisi: event.target.checked,
                    })
                  }
                />

                <span>Wajib diisi</span>
              </label>

              <div className="builder-question-actions">
                <button
                  type="button"
                  onClick={() => duplikatPertanyaan(item)}
                >
                  Duplikat
                </button>

                <button
                  type="button"
                  className="builder-delete-button"
                  onClick={() => hapusPertanyaan(item.id)}
                >
                  Hapus
                </button>
              </div>
            </div>
          </article>
        ))}

        {pesanError && (
          <p className="builder-error" role="alert">
            {pesanError}
          </p>
        )}

        <button
          type="button"
          className="builder-add-question"
          onClick={tambahPertanyaan}
        >
          <span aria-hidden="true">+</span>
          Tambah pertanyaan
        </button>

        <div className="builder-submit-actions">
          <button
            type="button"
            className="builder-cancel-button"
            onClick={() => navigate(`/admin/kriteria/${asnaf}`)}
          >
            Batal
          </button>

          <button
            type="submit"
            className="builder-save-button"
          >
            Simpan Kuesioner
          </button>
        </div>
      </form>
    </section>
  );
}

export default FormKriteria;
