
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    UserRound,
    ShieldCheck,
    Wallet,
    CalendarDays,
    CheckCircle2,
    HandCoins,
    FileText,
    ArrowRight,
} from "lucide-react";

import SidebarPenerima from "../components/SidebarPenerima";

const API_URL = "http://localhost:5000/api";

function bacaAkun() {
    const akunTersimpan = sessionStorage.getItem("akun");
    const role = sessionStorage.getItem("role");

    if (!akunTersimpan || role !== "penerima") {
        return null;
    }

    try {
        const akun = JSON.parse(akunTersimpan);

        return akun && typeof akun === "object" ? akun : null;
    } catch (error) {
        console.error("Gagal membaca data akun:", error);
        sessionStorage.removeItem("akun");
        sessionStorage.removeItem("role");
        return null;
    }
}

function formatRupiah(nominal) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(nominal) || 0);
}

function formatTanggal(tanggal) {
    if (!tanggal) return "Belum ada";

    const hasil = new Date(
        String(tanggal).replace(" ", "T")
    );

    if (Number.isNaN(hasil.getTime())) {
        return "Belum ada";
    }

    return hasil.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function DashboardPenerima() {
    const navigate = useNavigate();

    // Membaca akun ketika komponen pertama kali dibuat.
    const [penerima] = useState(bacaAkun);

    const [dashboard, setDashboard] = useState(null);
    const [memuat, setMemuat] = useState(true);
    const [pesanError, setPesanError] = useState("");

    useEffect(() => {
        if (!penerima) {
            navigate("/login", { replace: true });
        }
    }, [navigate, penerima]);

    useEffect(() => {
        if (!penerima) return;

        const nik = String(penerima.id || penerima.nik || "").trim();

        if (!/^\d{16}$/.test(nik)) {
            setPesanError(
                "NIK akun tidak ditemukan. Silakan login kembali."
            );
            setMemuat(false);
            return;
        }

        const controller = new AbortController();

        async function ambilDashboard() {
            try {
                setMemuat(true);
                setPesanError("");

                const response = await fetch(
                    `${API_URL}/penerima/dashboard/${encodeURIComponent(nik)}`,
                    { signal: controller.signal }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "Gagal mengambil data dashboard."
                    );
                }

                setDashboard(result);
            } catch (error) {
                if (error.name === "AbortError") return;

                console.error("Gagal mengambil dashboard:", error);
                setPesanError(
                    error.message ||
                    "Backend tidak dapat dihubungi. Pastikan server berjalan."
                );
            } finally {
                if (!controller.signal.aborted) {
                    setMemuat(false);
                }
            }
        }

        ambilDashboard();

        return () => controller.abort();
    }, [penerima]);

    if (!penerima) {
        return (
            <div className="dashboard-loading">
                Mengarahkan ke halaman login...
            </div>
        );
    }

    const dataPenerima = dashboard?.penerima || penerima;

    const nama =
        dataPenerima.nama_lengkap ||
        dataPenerima.nama ||
        dataPenerima.name ||
        "Penerima Zakat";

    const email = dataPenerima.email || "";

    const statistik = dashboard?.statistik;
    const bantuanTerakhir = dashboard?.bantuan_terakhir;
    const riwayatBantuan = dashboard?.riwayat_bantuan || [];

    const statusPengajuan =
        dataPenerima.status_pengajuan || "Belum tersedia";

    const statusDiterima = statusPengajuan === "Diterima";

    return (
    <div className="layout-penerima">
      <SidebarPenerima />

      <main className="konten-penerima">
        <div className="dashboard-isi">
          <div className="judul-dashboard">
            <h1>Dashboard Penerima</h1>
            <p>
              Informasi dan ringkasan bantuan zakat Anda.
            </p>
          </div>

          {/* KARTU SAMBUTAN */}
          <section className="kartu-sambutan">
            <div className="avatar-sambutan">
              <UserRound size={34} />
            </div>

            <div className="sambutan-teks">
              <h2>Selamat datang, {nama}</h2>

              <span className="status-verifikasi">
                <ShieldCheck size={12} />
                {statusDiterima
                ? "Penerima Zakat"
                : statusPengajuan}
              </span>

              <p>
                Semoga bantuan yang Anda terima dapat
                bermanfaat untuk kehidupan yang lebih baik.
              </p>
              {email && <p>{email}</p>}
            </div>

            <div className="hiasan-sambutan" aria-hidden="true">
              <span>☪</span>
              <span>✦</span>
              <span>♥</span>
            </div>
          </section>

          {/* PESAN LOADING / ERROR */}
          {memuat && (
          <p className="pesan-dashboard">
            Memuat data dari database...
          </p>
          )}

          {!memuat && pesanError && (
          <div className="pesan-dashboard pesan-dashboard-error">
            {pesanError}
          </div>
          )}

          {/* RINGKASAN BANTUAN */}
          <section className="ringkasan-bantuan">
            <article className="kartu-ringkasan">
              <div className="ikon-ringkasan ikon-oranye">
                <HandCoins size={19} />
              </div>

              <div>
                <span>Total Bantuan Diterima</span>
                <h3>
                  {formatRupiah(
                  statistik?.total_bantuan
                  )}
                </h3>
                <p>
                  {statistik?.jumlah_bantuan
                  ? `${statistik.jumlah_bantuan} kali penyaluran`
                  : "Belum ada data bantuan"}
                </p>
              </div>
            </article>

            <article className="kartu-ringkasan">
              <div className="ikon-ringkasan ikon-kuning">
                <CalendarDays size={19} />
              </div>

              <div>
                <span>Bantuan Terakhir</span>
                <h3>
                  {bantuanTerakhir
                  ? formatTanggal(
                  bantuanTerakhir.tanggal_penyaluran
                  )
                  : "Belum ada"}
                </h3>
                <p>
                  {bantuanTerakhir
                  ? formatRupiah(
                  bantuanTerakhir.nominal_bantuan
                  )
                  : "Informasi bantuan terbaru"}
                </p>
              </div>
            </article>

            <article className="kartu-ringkasan">
              <div className="ikon-ringkasan ikon-hijau">
                <CheckCircle2 size={19} />
              </div>

              <div>
                <span>Status Pengajuan</span>

                <h3>
                  <span className={ statusDiterima ? "status-menunggu status-diterima" : "status-menunggu" }>
                    {statusPengajuan}
                  </span>
                </h3>

                <p>Status pengajuan Anda</p>
              </div>
            </article>
          </section>

          {/* BAGIAN BAWAH */}
          <section className="bagian-bawah-dashboard">
            <article className="panel-bantuan-terakhir">
              <div className="panel-judul">
                <h3>Bantuan Terakhir</h3>
              </div>

              {bantuanTerakhir ? (
              <div className="bantuan-kosong">
                <div className="ikon-bantuan-kosong">
                  <Wallet size={27} />
                </div>

                <div className="detail-bantuan">
                  <strong>
                    {bantuanTerakhir.keterangan_bantuan ||
                    "Penyaluran bantuan zakat"}
                  </strong>

                  <p>
                    {formatRupiah(
                    bantuanTerakhir.nominal_bantuan
                    )}
                  </p>

                  <p>
                    Tanggal:{" "}
                    {formatTanggal(
                    bantuanTerakhir.tanggal_penyaluran
                    )}
                  </p>
                </div>
              </div>
              ) : (
              <div className="bantuan-kosong">
                <div className="ikon-bantuan-kosong">
                  <Wallet size={27} />
                </div>

                <div className="detail-bantuan">
                  <strong>
                    {memuat
                    ? "Memuat riwayat bantuan..."
                    : "Belum ada riwayat bantuan"}
                  </strong>

                  <p>
                    Riwayat bantuan akan tampil di sini
                    setelah tersedia.
                  </p>
                </div>
              </div>
              )}

              <button type="button" className="tombol-detail" onClick={()=> navigate("/pengajuan")}
                >
                Lihat Riwayat
              </button>
            </article>

            <article className="panel-riwayat">
              <div className="ikon-riwayat">
                <FileText size={30} />
              </div>

              <div className="riwayat-teks">
                <h3>
                  Ingin melihat riwayat bantuan
                  selengkapnya?
                </h3>

                <p>
                  Cek status pengajuan dan informasi
                  bantuan Anda melalui halaman riwayat.
                </p>

                <button type="button" className="tombol-riwayat" onClick={()=> navigate("/pengajuan")}
                  >
                  Lihat Riwayat Bantuan
                  <ArrowRight size={16} />
                </button>
              </div>
            </article>
          </section>

          {/* RIWAYAT BANTUAN */}
          {riwayatBantuan.length > 0 && (
          <section className="panel-bantuan-terakhir riwayat-lengkap">
            <div className="panel-judul">
              <h3>Riwayat Penyaluran Bantuan</h3>
            </div>

            <div className="tabel-riwayat-wrapper">
              <table className="tabel-riwayat">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Keterangan</th>
                    <th>Nominal</th>
                  </tr>
                </thead>

                <tbody>
                  {riwayatBantuan.map((item) => (
                  <tr key={item.id_distribusi}>
                    <td>
                      {formatTanggal(
                      item.tanggal_penyaluran
                      )}
                    </td>
                    <td>
                      {item.keterangan_bantuan ||
                      "Penyaluran bantuan zakat"}
                    </td>
                    <td>
                      {formatRupiah(
                      item.nominal_bantuan
                      )}
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          )}

          <footer className="footer-penerima">
            ZAKATARA · Portal Penerima Zakat
          </footer>
        </div>
      </main>
    </div>
    );
    }

export default DashboardPenerima;
