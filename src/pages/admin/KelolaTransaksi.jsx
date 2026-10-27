import { useMemo, useState } from "react";
import { Search, ReceiptText, CalendarDays, Eye } from "lucide-react";
import "../../index.css";

function KelolaTransaksi() {
  const [transaksi] = useState([]);
  const [pencarian, setPencarian] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [transaksiDipilih, setTransaksiDipilih] = useState(null);

  const bulanIni = new Date();
  const bulan = bulanIni.getMonth();
  const tahun = bulanIni.getFullYear();

  const jumlahBulanIni = transaksi.filter((item) => {
    const tanggal = new Date(item.tanggal);

    return (
      tanggal.getMonth() === bulan &&
      tanggal.getFullYear() === tahun
    );
  }).length;

  const daftarTransaksi = useMemo(() => {
    return transaksi.filter((item) => {
      const kataKunci = pencarian.toLowerCase();

      const cocokPencarian =
        item.id.toLowerCase().includes(kataKunci) ||
        item.nama.toLowerCase().includes(kataKunci);

      const cocokStatus =
        filterStatus === "Semua Status" ||
        item.status === filterStatus;

      return cocokPencarian && cocokStatus;
    });
  }, [transaksi, pencarian, filterStatus]);

  return (
    <div className="admin-transaksi">
      <div className="transaksi-header">
        <h1>Kelola Transaksi</h1>
        <p>
          Pantau dan kelola seluruh transaksi zakat, infak,
          sedekah, dan donasi kegiatan.
        </p>
      </div>

      <div className="transaksi-statistik">
        <div className="transaksi-stat-card">
          <div className="transaksi-stat-icon">
            <ReceiptText size={24} />
          </div>

          <div>
            <p>Total Transaksi</p>
            <h2>{transaksi.length}</h2>
            <span>Seluruh transaksi tercatat</span>
          </div>
        </div>

        <div className="transaksi-stat-card">
          <div className="transaksi-stat-icon">
            <CalendarDays size={24} />
          </div>

          <div>
            <p>Transaksi Bulan Ini</p>
            <h2>{jumlahBulanIni}</h2>
            <span>Transaksi pada bulan berjalan</span>
          </div>
        </div>
      </div>

      <div className="transaksi-table-card">
        <div className="transaksi-table-header">
          <div>
            <h2>Daftar Transaksi</h2>
            <p>
              Pantau seluruh transaksi yang tercatat dalam sistem.
            </p>
          </div>
        </div>

        <div className="transaksi-toolbar">
          <div className="transaksi-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Cari ID atau nama transaksi..."
              value={pencarian}
              onChange={(event) => setPencarian(event.target.value)}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
          >
            <option>Semua Status</option>
            <option>Menunggu</option>
            <option>Berhasil</option>
            <option>Dibatalkan</option>
          </select>
        </div>

        {daftarTransaksi.length > 0 ? (
          <div className="transaksi-table-wrapper">
            <table className="transaksi-table">
              <thead>
                <tr>
                  <th>ID Transaksi</th>
                  <th>Nama</th>
                  <th>Jenis Transaksi</th>
                  <th>Tanggal</th>
                  <th>Nominal</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {daftarTransaksi.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.nama}</td>
                    <td>{item.jenis}</td>
                    <td>{item.tanggal}</td>
                    <td>
                      {Number(item.nominal).toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td>
                      <span
                        className={`transaksi-status status-${item.status
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="transaksi-detail-button"
                        onClick={() => setTransaksiDipilih(item)}
                      >
                        <Eye size={16} />
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="transaksi-empty">
            <div className="transaksi-empty-icon">
              <ReceiptText size={28} />
            </div>

            <h3>
              {pencarian || filterStatus !== "Semua Status"
                ? "Transaksi Tidak Ditemukan"
                : "Belum Ada Data Transaksi"}
            </h3>

            <p>
              {pencarian || filterStatus !== "Semua Status"
                ? "Coba ubah kata pencarian atau filter status."
                : "Data transaksi akan muncul di sini setelah tersedia."}
            </p>
          </div>
        )}
      </div>

      {transaksiDipilih && (
        <div
          className="transaksi-modal-overlay"
          onClick={() => setTransaksiDipilih(null)}
        >
          <div
            className="transaksi-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="transaksi-modal-header">
              <h2>Detail Transaksi</h2>

              <button
                className="transaksi-modal-close"
                onClick={() => setTransaksiDipilih(null)}
                aria-label="Tutup detail transaksi"
              >
                ×
              </button>
            </div>

            <div className="transaksi-modal-body">
              <div>
                <span>ID Transaksi</span>
                <strong>{transaksiDipilih.id}</strong>
              </div>

              <div>
                <span>Nama</span>
                <strong>{transaksiDipilih.nama}</strong>
              </div>

              <div>
                <span>Jenis Transaksi</span>
                <strong>{transaksiDipilih.jenis}</strong>
              </div>

              <div>
                <span>Tanggal</span>
                <strong>{transaksiDipilih.tanggal}</strong>
              </div>

              <div>
                <span>Nominal</span>
                <strong>
                  {Number(transaksiDipilih.nominal).toLocaleString(
                    "id-ID",
                    {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }
                  )}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{transaksiDipilih.status}</strong>
              </div>
            </div>

            <button
              className="transaksi-modal-button"
              onClick={() => setTransaksiDipilih(null)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default KelolaTransaksi;