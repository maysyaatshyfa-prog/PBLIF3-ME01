
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Pengajuan() {
    const { token } = useParams();

    const [pengajuan, setPengajuan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    // Mengambil informasi pengajuan berdasarkan token di URL.
    useEffect(() => {
        let aktif = true;

        const ambilPengajuan = async () => {
            if (!token) {
                setErrorMessage("Token pengajuan tidak ditemukan.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setErrorMessage("");
                setPengajuan(null);

                const response = await fetch(
                    `http://localhost:5000/api/cek-status/${encodeURIComponent(token)}`
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message ||
                        "Gagal mengambil informasi pengajuan."
                    );
                }

                if (aktif) {
                    setPengajuan(result.pengajuan || null);
                }
            } catch (error) {
                if (aktif) {
                    setErrorMessage(
                        error.message ||
                        "Terjadi kesalahan saat mengambil status pengajuan."
                    );
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
    }, [token]);

    // Format tanggal pengajuan.
    const tanggalPengajuan = pengajuan?.tanggal_pengajuan
        ? new Date(
            pengajuan.tanggal_pengajuan.replace(" ", "T")
        ).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        })
        : pengajuan?.created_at
            ? new Date(pengajuan.created_at).toLocaleDateString(
                "id-ID",
                {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                }
            )
            : "-";

    // Tampilan berdasarkan status pengajuan.
    const informasiStatus = {
        "Menunggu Verifikasi": {
            judul: "PENGAJUAN MENUNGGU VERIFIKASI",
            pesan: "Pengajuan Anda berhasil dikirim.",
            keterangan: "Data Anda sedang menunggu pemeriksaan admin.",
            ikon: "◷",
        },

        "Diterima": {
            judul: "PENGAJUAN DITERIMA",
            pesan: "Selamat, pengajuan Anda telah diterima.",
            keterangan: "Admin telah menyetujui pengajuan Anda.",
            ikon: "✓",
        },

        "Ditolak": {
            judul: "PENGAJUAN DITOLAK",
            pesan: "Mohon maaf, pengajuan Anda belum dapat diterima.",
            keterangan: "Silakan baca catatan admin untuk informasi lebih lanjut.",
            ikon: "×",
        },
    };

    const status = pengajuan?.status_pengajuan;
    const tampilanStatus = informasiStatus[status];

    const statusClass =
        status === "Diterima"
            ? "diterima"
            : status === "Ditolak"
                ? "ditolak"
                : "menunggu";

    return (
        <div className="pengajuan-page">
            <Navbar />

            <main className="pengajuan-container">
                {/* STATUS PENGAJUAN */}
                <section className={`pengajuan-success status-${statusClass}`}>
                    <div className="success-icon">
                        <span className="success-check">
                            {loading
                                ? "…"
                                : tampilanStatus?.ikon || "!"}
                        </span>
                    </div>

                    <h1>
                        {loading
                            ? "MEMUAT STATUS PENGAJUAN"
                            : errorMessage
                                ? "STATUS PENGAJUAN TIDAK TERSEDIA"
                                : tampilanStatus?.judul ||
                                    "STATUS PENGAJUAN TIDAK TERSEDIA"}
                    </h1>

                    <p>
                        {loading
                            ? "Sedang mengambil informasi pengajuan Anda."
                            : errorMessage
                                ? errorMessage
                                : tampilanStatus?.pesan ||
                                    "Informasi status pengajuan belum tersedia."}
                    </p>

                    {!loading && !errorMessage && tampilanStatus && (
                        <p>{tampilanStatus.keterangan}</p>
                    )}
                </section>

                {/* INFORMASI PENGAJUAN */}
                {!loading && !errorMessage && pengajuan && (
                    <>
                        <section className="pengajuan-card">
                            <h2>INFORMASI PENGAJUAN</h2>

                            <div className="info-list">
                                <div className="info-item">
                                    <span>Nama</span>
                                    <strong>
                                        {pengajuan.nama_lengkap || "-"}
                                    </strong>
                                </div>

                                <div className="info-item">
                                    <span>Nomor Pengajuan</span>
                                    <strong>
                                        {pengajuan.nomor_pengajuan || "-"}
                                    </strong>
                                </div>

                                <div className="info-item">
                                    <span>Tanggal Pengajuan</span>
                                    <strong>{tanggalPengajuan}</strong>
                                </div>

                                <div className="info-item">
                                    <span>Status</span>
                                    <strong
                                        className={`status-value status-${statusClass}`}
                                    >
                                        {status || "-"}
                                    </strong>
                                </div>
                            </div>
                        </section>

                        {/* PROSES VERIFIKASI DAN CATATAN ADMIN */}
                        <section className="pengajuan-card">
                            <h2 className="verification-title">
                                <span className="clock-icon">◷</span>
                                PROSES VERIFIKASI
                            </h2>

                            {status === "Menunggu Verifikasi" ? (
                                <>
                                    <p>
                                        Admin akan memeriksa data, jawaban
                                        kuesioner, dan bukti pendukung yang
                                        Anda kirimkan.
                                    </p>

                                    <p>
                                        Perkiraan proses verifikasi maksimal
                                        1 × 24 jam.
                                    </p>
                                </>
                            ) : status === "Ditolak" ? (
                                <p>
                                    Pengajuan Anda belum dapat diterima.
                                    Silakan perhatikan catatan admin berikut.
                                </p>
                            ) : status === "Diterima" ? (
                                <p>
                                    Pengajuan Anda telah diperiksa dan
                                    dinyatakan diterima oleh admin.
                                </p>
                            ) : (
                                <p>
                                    Status proses verifikasi belum tersedia.
                                </p>
                            )}

                            {pengajuan.catatan_admin?.trim() ? (
                                <div className="catatan-admin">
                                    <h3>Catatan Admin</h3>
                                    <p>{pengajuan.catatan_admin}</p>
                                </div>
                            ) : status !== "Menunggu Verifikasi" ? (
                                <div className="catatan-admin">
                                    <h3>Catatan Admin</h3>
                                    <p>
                                        Belum ada catatan tambahan dari admin.
                                    </p>
                                </div>
                            ) : null}
                        </section>

                        {/* TOKEN PENGAJUAN */}
                        <section className="pengajuan-card token-section">
                            <h2>TOKEN PENGAJUAN</h2>

                            <p>
                                Simpan token berikut untuk mengecek status
                                pengajuan Anda kembali.
                            </p>

                            <div className="token-box">
                                {token}
                            </div>
                        </section>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default Pengajuan;
