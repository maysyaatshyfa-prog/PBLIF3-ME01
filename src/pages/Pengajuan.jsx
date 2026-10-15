import {
    useEffect,
    useState
} from "react";
import {
    useLocation
} from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Pengajuan() {
    const location = useLocation();
    const nik = location.state?.nik;

    const [pengajuan, setPengajuan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    // Mengambil informasi pengajuan dari backend
    useEffect(() => {
        let aktif = true;

        const ambilPengajuan = async () => {
            if (!nik) {
                setErrorMessage(
                    "NIK pengajuan tidak ditemukan. Silakan mulai dari proses pendaftaran."
                );
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `http://localhost:5000/api/pengajuan/${encodeURIComponent(nik)}`
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message ||
                        "Gagal mengambil informasi pengajuan."
                    );
                }

                if (aktif) {
                    setPengajuan(result.pengajuan);
                }
            } catch (error) {
                if (aktif) {
                    setErrorMessage(error.message);
                }
            } finally {
                if (aktif) {
                    setLoading(false);
                }
            }
        };

        ambilPengajuan();

        return () => {
            aktif = false;
        };
    }, [nik]);

    // Format tanggal pengajuan
    const tanggalPengajuan = pengajuan?.tanggal_pengajuan ?
        new Date(
            pengajuan.tanggal_pengajuan.replace(" ", "T")
        ).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }) :
        "-";
    // Tulisan berdasarkan status pengajuan
    const informasiStatus = {
        "Menunggu Verifikasi": {
            judul: "PENGAJUAN MENUNGGU VERIFIKASI",
            pesan: "Pengajuan Anda berhasil dikirim.",
            keterangan: "Data Anda sedang menunggu pemeriksaan admin.",
            ikon: "◷"
        },

        "Diterima": {
            judul: "PENGAJUAN DITERIMA",
            pesan: "Selamat, pengajuan Anda telah diterima.",
            keterangan: "Admin telah menyetujui pengajuan Anda.",
            ikon: "✓"
        },

        "Ditolak": {
            judul: "PENGAJUAN DITOLAK",
            pesan: "Mohon maaf, pengajuan Anda belum dapat diterima.",
            keterangan: "Silakan hubungi admin untuk informasi lebih lanjut.",
            ikon: "×"
        }
    };

    const tampilanStatus =
        informasiStatus[pengajuan?.status_pengajuan];

    const statusClass =
        pengajuan?.status_pengajuan === "Diterima" ?
        "diterima" :
        pengajuan?.status_pengajuan === "Ditolak" ?
        "ditolak" :
        "menunggu";

return (
<div className="pengajuan-page">
    <Navbar />

    <main className="pengajuan-container">
        {/* PENGAJUAN BERHASIL */}
        <section className={`pengajuan-success status-${statusClass}`}>
            <div className="success-icon">
                <span className="success-check">
                    {loading ? "…" : tampilanStatus?.ikon || "!"}
                </span>
            </div>

            <h1>
                {loading
                ? "MEMUAT STATUS PENGAJUAN"
                : tampilanStatus?.judul || "STATUS PENGAJUAN TIDAK TERSEDIA"}
            </h1>

            <p>
                {loading
                ? "Sedang mengambil informasi pengajuan Anda."
                : tampilanStatus?.pesan || errorMessage || "Informasi pengajuan belum tersedia."}
            </p>

            <p>
                {!loading && tampilanStatus?.keterangan}
            </p>
        </section>

        {/* PESAN ERROR */}
        {errorMessage && (
        <div className="question-error" role="alert">
            {errorMessage}
        </div>
        )}

        {/* INFORMASI PENGAJUAN */}
        <section className="pengajuan-card">
            <h2>INFORMASI PENGAJUAN</h2>

            <div className="info-list">
                <div className="info-item">
                    <span>Nama</span>
                    <strong>
                        {loading
                        ? "Memuat..."
                        : pengajuan?.nama_lengkap || "-"}
                    </strong>
                </div>

                <div className="info-item">
                    <span>Nomor Pengajuan</span>
                    <strong>
                        {loading
                        ? "Memuat..."
                        : pengajuan?.nomor_pengajuan || "-"}
                    </strong>
                </div>
                <div className="info-item">
                    <span>Tanggal Pengajuan</span>
                    <strong>
                        {loading
                        ? "Memuat..."
                        : tanggalPengajuan}
                    </strong>
                </div>

                <div className="info-item">
                    <span>Status</span>

                    <strong className={`status-value status-${statusClass}`}>
                        {loading
                        ? "Memuat..."
                        : pengajuan?.status_pengajuan || "-"}
                    </strong>
                </div>
            </div>
        </section>

        {/* PROSES VERIFIKASI */}
        <section className="pengajuan-card">
            <h2 className="verification-title">
                <span className="clock-icon">◷</span>
                PROSES VERIFIKASI
            </h2>

            <p>
                Admin akan memeriksa data, jawaban kuesioner,
                dan bukti pendukung yang Anda kirimkan.
            </p>

            <p>
                Perkiraan proses verifikasi maksimal 1 × 24 jam.
            </p>
        </section>

        {/* TOKEN */}
        <section className="pengajuan-card token-section">
            <h2>TOKEN</h2>

            <p>
                Simpan token berikut untuk mengecek status
                pengajuan Anda nanti.
            </p>

            <div className="token-box">
                {loading
                ? "Memuat token..."
                : pengajuan?.token_verifikasi || "-"}
            </div>
        </section>
    </main>

    <Footer />
</div>
);
}

export default Pengajuan;
