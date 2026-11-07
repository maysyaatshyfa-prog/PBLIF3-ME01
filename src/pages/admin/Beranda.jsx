import { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  ClipboardList,
  UsersRound,
  Wallet,
  TrendingUp,
} from "lucide-react";

function Beranda() {
  const [statistik, setStatistik] = useState({
    pengajuanMenunggu: 0,
    totalPemberi: 0,
    totalZakat: 0,
    grafikPengajuan: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const ambilStatistik = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/admin/dashboard"
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Gagal mengambil statistik."
          );
        }

        setStatistik({
          pengajuanMenunggu: Number(result.pengajuanMenunggu || 0),
          totalPemberi: Number(result.totalPemberi || 0),
          totalZakat: Number(result.totalZakat || 0),
          grafikPengajuan: result.grafikPengajuan || [],
        });
      } catch (err) {
        console.error("Gagal mengambil statistik:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    ambilStatistik();
  }, []);

  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);

  return (
    <div className="admin-beranda">
      <header className="beranda-header">
        <div>
          <h1>Beranda</h1>
          <p>Ringkasan aktivitas sistem pakar mustahiq zakat.</p>
        </div>
      </header>

      {error && (
        <p className="statistik-deskripsi" role="alert">
          Gagal mengambil data: {error}
        </p>
      )}

      <section className="statistik-grid">
        <article className="statistik-card">
          <div className="statistik-info">
            <p className="statistik-label">Pengajuan Menunggu</p>

            <h2>
              {loading ? "..." : statistik.pengajuanMenunggu}
            </h2>

            <p className="statistik-deskripsi">
              Total pengajuan menunggu verifikasi
            </p>

            <a href="/admin/pengajuan" className="statistik-link">
              Lihat Pengajuan <span>→</span>
            </a>
          </div>

          <div className="statistik-icon icon-orange">
            <ClipboardList size={26} strokeWidth={1.8} />
          </div>
        </article>

        <article className="statistik-card">
          <div className="statistik-info">
            <p className="statistik-label">Total Pemberi Zakat</p>

            <h2>
              {loading ? "..." : statistik.totalPemberi}
            </h2>

            <p className="statistik-deskripsi">
              Jumlah pengguna pemberi zakat
            </p>

            <a href="/admin/pengguna" className="statistik-link">
              Lihat Pengguna <span>→</span>
            </a>
          </div>

          <div className="statistik-icon icon-ungu">
            <UsersRound size={26} strokeWidth={1.8} />
          </div>
        </article>
      </section>

      <section className="total-zakat-card">
        <div className="total-zakat-info">
          <p className="statistik-label">Total Zakat Terkumpul</p>

          <h2>
            {loading
              ? "Memuat..."
              : formatRupiah(statistik.totalZakat)}
          </h2>

          <p className="statistik-deskripsi">
            Total transaksi donasi yang berhasil
          </p>
        </div>

        <div className="statistik-icon icon-orange">
          <Wallet size={26} strokeWidth={1.8} />
        </div>
      </section>

      <section className="grafik-card">
        <div className="grafik-header">
          <div>
            <h2>Grafik Pengajuan</h2>
            <p>
              Perkembangan jumlah pengajuan mustahiq setiap bulan.
            </p>
          </div>

          <TrendingUp size={25} strokeWidth={1.8} />
        </div>

        <div className="grafik-container">
          {loading ? (
            <div className="grafik-empty">
              <strong>Memuat data grafik...</strong>
            </div>
          ) : statistik.grafikPengajuan.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={statistik.grafikPengajuan}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />

                <XAxis
                  dataKey="bulan"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
                  }}
                  formatter={(value) => [
                    `${value} pengajuan`,
                    "Jumlah Pengajuan",
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="jumlah"
                  name="Jumlah Pengajuan"
                  stroke="#F7941D"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#F7941D" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="grafik-empty">
              <TrendingUp size={36} strokeWidth={1.5} />
              <strong>Belum Ada Data Grafik</strong>
              <p>Grafik akan muncul setelah data tersedia.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Beranda;
