import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    HandCoins,
    Wallet,
    UserRound,
    ArrowRight,
    Mail,
    ReceiptText,
} from "lucide-react";

import "../index.css";

const slides = [
    {
        gambar: "/images/slide1.png",
        judul: "Berbagi Kebaikan, Tebarkan Kepedulian",
        deskripsi: "Mari salurkan zakat dan bantu sesama melalui ZAKATARA.",
    },
    {
        gambar: "/images/slide2.png",
        judul: "Bersama Membantu Sesama",
        deskripsi: "Setiap kebaikan membawa manfaat bagi orang lain.",
    },
    {
        gambar: "/images/slide3.png",
        judul: "Zakat untuk Masa Depan Lebih Baik",
        deskripsi: "Wujudkan kepedulian melalui zakat, infak, dan sedekah.",
    },
];

function DashboardPemberi() {
    const [slideAktif, setSlideAktif] = useState(0);

    // Mengambil data akun yang sedang login
    const akun = JSON.parse(sessionStorage.getItem("akun") || "{}");

    const namaPemberi =
        akun.nama_lengkap ||
        akun.nama ||
        akun.username ||
        "Pemberi Zakat";

    const emailPemberi = akun.email || "-";

    // Slider otomatis
    useEffect(() => {
        const interval = setInterval(() => {
            setSlideAktif((sebelumnya) =>
                (sebelumnya + 1) % slides.length
            );
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const slideSebelumnya = () => {
        setSlideAktif((sebelumnya) =>
            (sebelumnya - 1 + slides.length) % slides.length
        );
    };

    const slideBerikutnya = () => {
        setSlideAktif((sebelumnya) =>
            (sebelumnya + 1) % slides.length
        );
    };

    return (
        <div className="dashboard-pemberi">

            {/* SAPAAN */}
            <section className="pemberi-welcome">
                <h1>Selamat Datang, {namaPemberi}!</h1>
                <p>
                    Terima kasih telah menjadi bagian dari kebaikan.
                    Mari terus berbagi dan membantu sesama.
                </p>
            </section>

            {/* FOTO SLIDER */}
            <section className="pemberi-slider">
                <img
                    key={slideAktif}
                    src={slides[slideAktif].gambar}
                    alt="Kegiatan ZAKATARA"
                    className="pemberi-slider-image"
                />

                <div className="pemberi-slider-overlay">
                    <h2>{slides[slideAktif].judul}</h2>
                    <p>{slides[slideAktif].deskripsi}</p>
                </div>

                <button
                    type="button"
                    className="pemberi-slider-arrow kiri"
                    onClick={slideSebelumnya}
                    aria-label="Slide sebelumnya"
                >
                    <ChevronLeft size={23} />
                </button>

                <button
                    type="button"
                    className="pemberi-slider-arrow kanan"
                    onClick={slideBerikutnya}
                    aria-label="Slide berikutnya"
                >
                    <ChevronRight size={23} />
                </button>

                <div className="pemberi-slider-indikator">
                    {slides.map((slide, index) => (
                        <button
                            key={index}
                            type="button"
                            className={
                                slideAktif === index
                                    ? "indikator aktif"
                                    : "indikator"
                            }
                            onClick={() => setSlideAktif(index)}
                            aria-label={`Pilih slide ${index + 1}`}
                        />
                    ))}
                </div>
            </section>

            {/* RINGKASAN DAN PROFIL */}
            <section className="pemberi-ringkasan-profil">

                {/* RINGKASAN DONASI */}
                <div className="pemberi-ringkasan">

                    <div className="pemberi-section-title">
                        <div>
                            <h2>Ringkasan Donasi</h2>
                            <p>Informasi aktivitas donasi Anda.</p>
                        </div>
                    </div>

                    <div className="pemberi-statistik">

                        {/* TOTAL DONASI */}
                        <div className="pemberi-stat-card">
                            <div className="pemberi-stat-icon">
                                <HandCoins size={23} />
                            </div>

                            <div>
                                <span>Total Donasi</span>
                                <h3>Rp0</h3>
                            </div>
                        </div>

                        {/* JUMLAH TRANSAKSI */}
                        <div className="pemberi-stat-card">
                            <div className="pemberi-stat-icon">
                                <Wallet size={23} />
                            </div>

                            <div>
                                <span>Jumlah Transaksi</span>
                                <h3>0</h3>
                            </div>
                        </div>

                    </div>

                    {/* AKTIVITAS DONASI TERAKHIR */}
                    <div className="pemberi-aktivitas">

                        <div className="pemberi-aktivitas-header">
                            <div>
                                <h3>Aktivitas Donasi Terakhir</h3>
                                <p>Riwayat aktivitas donasi Anda.</p>
                            </div>

                            <Link to="/riwayatdonasi">
                                Lihat Riwayat
                                <ArrowRight size={15} />
                            </Link>
                        </div>

                        <div className="pemberi-aktivitas-kosong">

                            <div className="pemberi-aktivitas-icon">
                                <ReceiptText size={25} />
                            </div>

                            <h4>Belum Ada Aktivitas Donasi</h4>

                            <p>
                                Aktivitas donasi yang Anda lakukan
                                akan ditampilkan di sini.
                            </p>

                            <Link to="/daftarevent">
                                Jelajahi Program
                                <ArrowRight size={15} />
                            </Link>

                        </div>
                    </div>

                </div>

                {/* PROFIL SAYA */}
                <div className="pemberi-profil">

                    <div className="pemberi-profil-heading">

                        <div className="pemberi-profil-icon">
                            <UserRound size={30} />
                        </div>

                        <div>
                            <h2>Profil Saya</h2>
                            <p>Informasi akun pemberi zakat Anda.</p>
                        </div>

                    </div>

                    <div className="pemberi-profil-detail">

                        <div className="pemberi-profil-item">
                            <span>Nama Lengkap</span>
                            <strong>{namaPemberi}</strong>
                        </div>

                        <div className="pemberi-profil-item">
                            <span>
                                <Mail size={15} />
                                Email
                            </span>
                            <strong>{emailPemberi}</strong>
                        </div>

                    </div>

                    <Link
                        to="/profilpemberi"
                        className="pemberi-profil-link"
                    >
                        Lihat Profil
                        <ArrowRight size={16} />
                    </Link>

                </div>

            </section>

            {/* KEGIATAN DAN PROGRAM */}
            <section className="pemberi-kegiatan">

                <div className="pemberi-section-title">

                    <div>
                        <h2>Kegiatan dan Program Kebaikan</h2>
                        <p>
                            Ikuti berbagai kegiatan sosial dan program
                            donasi yang sedang berlangsung.
                        </p>
                    </div>

                    <Link to="/daftarevent">
                        Lihat Semua
                        <ArrowRight size={16} />
                    </Link>

                </div>

                <div className="pemberi-kegiatan-grid">

                    <Link
                        to="/daftarevent"
                        className="pemberi-event-card"
                    >
                        <img
                            src="/images/kegiatan1.jpg"
                            alt="Kegiatan berbagi"
                        />

                        <div>
                            <h3>Program Berbagi</h3>
                            <p>
                                Lihat program berbagi untuk sesama.
                            </p>
                        </div>
                    </Link>

                    <Link
                        to="/daftarevent"
                        className="pemberi-event-card"
                    >
                        <img
                            src="/images/kegiatan2.jpg"
                            alt="Kegiatan sosial"
                        />

                        <div>
                            <h3>Kegiatan Sosial</h3>
                            <p>
                                Ikuti kegiatan sosial bersama ZAKATARA.
                            </p>
                        </div>
                    </Link>

                </div>

            </section>

            {/* FOOTER */}
            <footer className="pemberi-footer">
                <p>
                    © 2026 ZAKATARA. Berbagi Kebaikan, Raih Keberkahan.
                </p>
            </footer>

        </div>
    );
}

export default DashboardPemberi;
