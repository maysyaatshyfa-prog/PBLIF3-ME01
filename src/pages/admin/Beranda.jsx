import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const dataPengajuan = [
  { bulan: "Jan", jumlah: 8 },
  { bulan: "Feb", jumlah: 12 },
  { bulan: "Mar", jumlah: 10 },
  { bulan: "Apr", jumlah: 16 },
  { bulan: "Mei", jumlah: 14 },
  { bulan: "Jun", jumlah: 20 },
];

function Beranda() {
  return (
    <div className="admin-beranda">
      {/* Header */}
      <header className="beranda-header">
        <div>
          <h1>Beranda</h1>
          <p>Ringkasan aktivitas sistem pakar mustahiq zakat.</p>
        </div>
      </header>

      {/* Kartu Statistik */}
      <section className="statistik-grid">
        <article className="statistik-card">
          <div className="statistik-info">
            <p className="statistik-label">Pengajuan Menunggu</p>
            <h2>12</h2>
            <p className="statistik-deskripsi">
              Pengajuan yang menunggu verifikasi
            </p>
            <a href="/admin/pengajuan" className="statistik-link">
              Lihat Pengajuan <span>→</span>
            </a>
          </div>

          <div className="statistik-icon icon-orange">📋</div>
        </article>

        <article className="statistik-card">
          <div className="statistik-info">
            <p className="statistik-label">Total Pemberi Zakat</p>
            <h2>86</h2>
            <p className="statistik-deskripsi">
              Pemberi zakat yang terdaftar
            </p>
            <a href="/admin/pengguna" className="statistik-link">
              Lihat Pengguna <span>→</span>
            </a>
          </div>

          <div className="statistik-icon icon-ungu">👥</div>
        </article>
      </section>

      {/* Total Zakat */}
      <section className="total-zakat-card">
        <div className="total-zakat-info">
          <p className="statistik-label">Total Zakat Terkumpul</p>
          <h2>Rp25.500.000</h2>
          <p className="statistik-deskripsi">
            Total dana zakat yang telah terkumpul
          </p>
        </div>

        <div className="statistik-icon icon-orange">💰</div>
      </section>

      {/* Grafik Pengajuan */}
      <section className="grafik-card">
        <div className="grafik-header">
          <div>
            <h2>Grafik Pengajuan</h2>
            <p>
              Perkembangan jumlah pengajuan mustahiq setiap bulan.
            </p>
          </div>
        </div>

        <div className="grafik-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dataPengajuan}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
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
                stroke="#f97316"
                strokeWidth={3}
                dot={{ r: 4, fill: "#f97316" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

export default Beranda;

