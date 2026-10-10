import { useState } from "react";
import { useParams, Link } from "react-router-dom";

const dataKriteria = [
  {
    id: 1,
    kode: "K01",
    pertanyaan: "Apakah calon mustahik memiliki penghasilan tetap?",
    status: "Aktif",
  },
  {
    id: 2,
    kode: "K02",
    pertanyaan: "Apakah penghasilan calon mustahik mencukupi kebutuhan sehari-hari?",
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

function DetailKriteria() {
  const { asnaf } = useParams();
  const [search, setSearch] = useState("");

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

  const nama = namaAsnaf[asnaf] || "Fakir";

  const dataFilter = dataKriteria.filter((item) => {
    return (
      item.kode.toLowerCase().includes(search.toLowerCase()) ||
      item.pertanyaan.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div>
      <div className="mb-5">
        <Link
          to="/admin/kriteria"
          className="text-sm text-gray-500 hover:text-orange-500"
        >
          ← Kembali ke Kelola Kriteria
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {nama}
        </h1>

        <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">
          Kelola kriteria dan aturan penilaian yang digunakan untuk
          membantu mengidentifikasi calon mustahik golongan{" "}
          {nama.toLowerCase()}.
        </p>
      </div>

      <div className="mb-6 w-full max-w-xs rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <p className="text-sm text-gray-500">
          Kriteria
        </p>

        <p className="mt-1 text-2xl font-bold text-gray-900">
          {dataKriteria.length}
        </p>
      </div>

      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <input
          type="text"
          placeholder="Cari kode kriteria atau pertanyaan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        />
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                  No
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                  Kode Kriteria
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                  Pertanyaan
                </th>

                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500">
                  Status
                </th>

                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {dataFilter.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">
                    {index + 1}
                  </td>

                  <td className="px-6 py-4 font-medium text-gray-900">
                    {item.kode}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {item.pertanyaan}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      {item.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          alert(`Detail ${item.kode}`)
                        }
                        className="rounded-lg px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100"
                      >
                        Detail
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          alert(`Edit ${item.kode}`)
                        }
                        className="rounded-lg px-3 py-2 text-xs font-medium text-orange-500 hover:bg-orange-50"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {dataFilter.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Kriteria tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DetailKriteria;