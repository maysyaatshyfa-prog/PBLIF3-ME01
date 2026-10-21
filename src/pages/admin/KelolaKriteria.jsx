import {
  HandCoins,
  House,
  ClipboardCheck,
  HeartHandshake,
  KeyRound,
  ReceiptText,
  BookOpen,
  MapPin,
} from "lucide-react";

import { Link } from "react-router-dom";

const dataAsnaf = [
  {
    id: 1,
    nama: "Fakir",
    icon: HandCoins,
    deskripsi:
      "Orang yang hampir tidak memiliki harta dan penghasilan untuk memenuhi kebutuhan hidup.",
  },
  {
    id: 2,
    nama: "Miskin",
    icon: House,
    deskripsi:
      "Orang yang memiliki penghasilan tetapi belum cukup untuk memenuhi kebutuhan hidup.",
  },
  {
    id: 3,
    nama: "Amil",
    icon: ClipboardCheck,
    deskripsi:
      "Orang yang bertugas mengelola dan mengurus zakat.",
  },
  {
    id: 4,
    nama: "Muallaf",
    icon: HeartHandshake,
    deskripsi:
      "Orang yang baru masuk Islam atau yang perlu dikuatkan hatinya dalam Islam.",
  },
  {
    id: 5,
    nama: "Riqab",
    icon: KeyRound,
    deskripsi:
      "Orang yang berada dalam kondisi perbudakan atau upaya pembebasan diri.",
  },
  {
    id: 6,
    nama: "Gharim",
    icon: ReceiptText,
    deskripsi:
      "Orang yang memiliki utang untuk kebutuhan yang dibenarkan.",
  },
  {
    id: 7,
    nama: "Fisabilillah",
    icon: BookOpen,
    deskripsi:
      "Orang atau kegiatan yang berjuang di jalan Allah.",
  },
  {
    id: 8,
    nama: "Ibnu Sabil",
    icon: MapPin,
    deskripsi:
      "Orang yang sedang dalam perjalanan dan mengalami kesulitan bekal.",
  },
];

function KelolaKriteria() {
  return (
    <div className="admin-kriteria">
      <div className="kriteria-header">
        <h1>Kelola Kriteria</h1>
        <p>
          Kelola kriteria penilaian berdasarkan 8 golongan mustahik zakat.
        </p>
      </div>

      <div className="kriteria-section-header">
        <h2>Daftar Golongan Asnaf</h2>
        <span>8 Golongan</span>
      </div>

      <div className="kriteria-grid">
        {dataAsnaf.map((item) => {
          const Icon = item.icon;
          const slug = item.nama.toLowerCase().replaceAll(" ", "-");

          return (
            <div className="kriteria-card" key={item.id}>
              <div className="kriteria-icon">
                <Icon size={26} strokeWidth={1.8} />
              </div>

              <h3>{item.nama}</h3>

              <p>{item.deskripsi}</p>

              <Link
                to={`/admin/kriteria/${slug}`}
                className="kriteria-button"
              >
                Kelola
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default KelolaKriteria;