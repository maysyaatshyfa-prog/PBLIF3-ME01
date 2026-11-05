
import { useState } from "react";
import {
    BookOpen,
    Heart,
    Users,
    CheckCircle2,
    HandHeart,
    Calculator,
    Wallet,
    Coins,
    RotateCcw,
} from "lucide-react";

import "../index.css";

const daftarAsnaf = [
    {
        nomor: "01",
        nama: "Fakir",
        deskripsi: "Orang yang hampir tidak memiliki harta maupun penghasilan untuk memenuhi kebutuhan pokoknya."
    },
    {
        nomor: "02",
        nama: "Miskin",
        deskripsi: "Orang yang memiliki penghasilan, tetapi belum cukup untuk memenuhi kebutuhan hidupnya."
    },
    {
        nomor: "03",
        nama: "Amil",
        deskripsi: "Orang yang bertugas mengelola, mengumpulkan, dan menyalurkan zakat."
    },
    {
        nomor: "04",
        nama: "Muallaf",
        deskripsi: "Orang yang baru masuk Islam atau yang perlu dikuatkan hatinya."
    },
    {
        nomor: "05",
        nama: "Riqab",
        deskripsi: "Orang yang membutuhkan bantuan untuk memerdekakan dirinya dari perbudakan."
    },
    {
        nomor: "06",
        nama: "Gharim",
        deskripsi: "Orang yang memiliki utang untuk kebutuhan yang dibenarkan dan tidak mampu melunasinya."
    },
    {
        nomor: "07",
        nama: "Fisabilillah",
        deskripsi: "Orang yang berjuang di jalan Allah untuk kepentingan dan kemaslahatan umat."
    },
    {
        nomor: "08",
        nama: "Ibnu Sabil",
        deskripsi: "Orang yang sedang dalam perjalanan dan kehabisan bekal."
    },
];

function InformasiZakat() {
    const [jenisHitung, setJenisHitung] = useState("penghasilan");

    const [penghasilan, setPenghasilan] = useState("");
    const [harta, setHarta] = useState("");
    const [hargaEmas, setHargaEmas] = useState("");
    const [jumlahJiwa, setJumlahJiwa] = useState("1");
    const [nominalFitrah, setNominalFitrah] = useState("50000");

    const [hasilZakat, setHasilZakat] = useState(null);

    const NISAB_PENGHASILAN = 7640144;
    const NISAB_EMAS = 85;

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(angka || 0);
    };

    const hitungZakat = () => {
        let nominal = 0;
        let wajib = false;
        let keterangan = "";

        if (jenisHitung === "penghasilan") {
            const nilai = Number(penghasilan) || 0;

            if (!penghasilan || nilai <= 0) {
                alert("Masukkan penghasilan bulanan terlebih dahulu.");
                return;
            }

            wajib = nilai >= NISAB_PENGHASILAN;
            nominal = wajib ? nilai * 0.025 : 0;

            keterangan = wajib
                ? "Penghasilan mencapai nisab bulanan yang digunakan dalam kalkulator ini."
                : "Penghasilan belum mencapai nisab bulanan yang digunakan dalam kalkulator ini.";
        }

        if (jenisHitung === "mal") {
            const nilai = Number(harta) || 0;
            const emas = Number(hargaEmas) || 0;

            if (!harta || nilai <= 0 || !hargaEmas || emas <= 0) {
                alert("Masukkan total harta dan harga emas terlebih dahulu.");
                return;
            }

            const nisab = NISAB_EMAS * emas;

            wajib = nilai >= nisab;
            nominal = wajib ? nilai * 0.025 : 0;

            keterangan = wajib
                ? "Harta mencapai nisab 85 gram emas. Pastikan juga telah memenuhi haul apabila disyaratkan."
                : `Harta belum mencapai nisab sebesar ${formatRupiah(nisab)}.`;
        }

        if (jenisHitung === "fitrah") {
            const jiwa = Number(jumlahJiwa) || 0;
            const perOrang = Number(nominalFitrah) || 0;

            if (jiwa <= 0 || perOrang <= 0) {
                alert("Masukkan jumlah jiwa dan nominal zakat dengan benar.");
                return;
            }

            wajib = true;
            nominal = jiwa * perOrang;

            keterangan =
                "Estimasi berdasarkan nominal zakat fitrah per orang yang kamu masukkan.";
        }

        setHasilZakat({
            nominal,
            wajib,
            keterangan,
        });
    };

    const resetKalkulator = () => {
        setPenghasilan("");
        setHarta("");
        setHargaEmas("");
        setJumlahJiwa("1");
        setNominalFitrah("50000");
        setHasilZakat(null);
    };

    return (
        <div className="informasi-zakat-page">

            {/* HEADER */}
            <section className="informasi-zakat-header">
                <span className="informasi-zakat-label">
                    <BookOpen size={16} />
                    PUSAT INFORMASI
                </span>

                <h1>Informasi Zakat</h1>

                <p>
                    Kenali zakat lebih dekat dan pahami bagaimana zakat
                    dapat membantu sesama melalui penyaluran yang tepat.
                </p>
            </section>

            {/* BANNER GAMBAR */}
            <section className="zakat-hero-image">
                <img
                    src="/images/Zakatara-banner.png"
                    alt="Ilustrasi kegiatan berbagi dan penyaluran zakat"
                />

                <div className="zakat-hero-overlay">
                    <span>MARI BERBAGI KEBAIKAN</span>
                    <h2>
                        Zakat Lebih Terarah,
                        <br />
                        Manfaat Lebih Luas
                    </h2>
                    <p>
                        Salurkan zakat untuk membantu mereka yang membutuhkan.
                    </p>
                </div>
            </section>

            {/* PENGERTIAN ZAKAT */}
            <section className="informasi-zakat-intro">
                <div className="informasi-zakat-intro-icon">
                    <HandHeart size={35} />
                </div>

                <div>
                    <h2>Apa Itu Zakat?</h2>
                    <p>
                        Zakat adalah bagian tertentu dari harta yang wajib
                        dikeluarkan oleh seorang muslim yang telah memenuhi
                        syarat tertentu untuk diberikan kepada golongan
                        yang berhak menerimanya.
                    </p>
                </div>
            </section>

            {/* JENIS ZAKAT */}
            <section className="informasi-zakat-section">
                <div className="informasi-zakat-section-title">
                    <span className="informasi-zakat-icon">
                        <Heart size={21} />
                    </span>
                    <div>
                        <h2>Jenis-Jenis Zakat</h2>
                        <p>Kenali dua jenis zakat yang perlu diketahui.</p>
                    </div>
                </div>

                <div className="jenis-zakat-grid">
                    <div className="jenis-zakat-card">
                        <h3>Zakat Fitrah</h3>
                        <p>
                            Zakat yang wajib dikeluarkan oleh setiap muslim
                            pada bulan Ramadan hingga sebelum pelaksanaan
                            salat Idulfitri.
                        </p>
                    </div>

                    <div className="jenis-zakat-card">
                        <h3>Zakat Mal</h3>
                        <p>
                            Zakat atas harta yang dimiliki apabila telah
                            memenuhi syarat tertentu, seperti nisab dan
                            haul sesuai jenis hartanya.
                        </p>
                    </div>
                </div>
            </section>

            {/* SYARAT WAJIB */}
            <section className="informasi-zakat-section">
                <div className="informasi-zakat-section-title">
                    <span className="informasi-zakat-icon">
                        <CheckCircle2 size={21} />
                    </span>
                    <div>
                        <h2>Syarat Wajib Zakat</h2>
                        <p>Beberapa ketentuan umum dalam kewajiban zakat.</p>
                    </div>
                </div>

                <div className="syarat-zakat-list">
                    <div>
                        <CheckCircle2 size={18} />
                        <span>Beragama Islam.</span>
                    </div>
                    <div>
                        <CheckCircle2 size={18} />
                        <span>Memiliki harta secara penuh sesuai ketentuan.</span>
                    </div>
                    <div>
                        <CheckCircle2 size={18} />
                        <span>Harta mencapai nisab untuk zakat mal.</span>
                    </div>
                    <div>
                        <CheckCircle2 size={18} />
                        <span>Memenuhi haul apabila disyaratkan.</span>
                    </div>
                </div>
            </section>

            {/* KALKULATOR ZAKAT */}
            <section className="kalkulator-zakat-section">
                <div className="informasi-zakat-section-title">
                    <span className="informasi-zakat-icon">
                        <Calculator size={21} />
                    </span>
                    <div>
                        <h2>Kalkulator Zakat</h2>
                        <p>
                            Hitung perkiraan zakat yang perlu kamu tunaikan.
                        </p>
                    </div>
                </div>

                <div className="kalkulator-zakat-card">

                    {/* PILIH JENIS */}
                    <div className="kalkulator-zakat-tabs">
                        <button
                            type="button"
                            className={jenisHitung === "penghasilan" ? "aktif" : ""}
                            onClick={() => {
                                setJenisHitung("penghasilan");
                                setHasilZakat(null);
                            }}
                        >
                            <Wallet size={17} />
                            Penghasilan
                        </button>

                        <button
                            type="button"
                            className={jenisHitung === "mal" ? "aktif" : ""}
                            onClick={() => {
                                setJenisHitung("mal");
                                setHasilZakat(null);
                            }}
                        >
                            <Coins size={17} />
                            Zakat Mal
                        </button>

                        <button
                            type="button"
                            className={jenisHitung === "fitrah" ? "aktif" : ""}
                            onClick={() => {
                                setJenisHitung("fitrah");
                                setHasilZakat(null);
                            }}
                        >
                            <Users size={17} />
                            Zakat Fitrah
                        </button>
                    </div>

                    <div className="kalkulator-zakat-form">

                        {/* PENGHASILAN */}
                        {jenisHitung === "penghasilan" && (
                            <>
                                <h3>Zakat Penghasilan</h3>
                                <p>Masukkan penghasilan bulanan kamu.</p>

                                <label>Penghasilan per Bulan</label>
                                <div className="input-rupiah">
                                    <span>Rp</span>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Contoh: 10000000"
                                        value={penghasilan}
                                        onChange={(e) => setPenghasilan(e.target.value)}
                                    />
                                </div>

                                <div className="kalkulator-info">
                                    Nisab bulanan acuan 2026:
                                    <strong> Rp7.640.144</strong>
                                    <br />
                                    Kadar zakat: <strong>2,5%</strong>
                                </div>
                            </>
                        )}

                        {/* ZAKAT MAL */}
                        {jenisHitung === "mal" && (
                            <>
                                <h3>Zakat Mal</h3>
                                <p>
                                    Hitung estimasi zakat dari harta yang dimiliki.
                                </p>

                                <label>Total Harta yang Wajib Dizakati</label>
                                <div className="input-rupiah">
                                    <span>Rp</span>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Masukkan total harta"
                                        value={harta}
                                        onChange={(e) => setHarta(e.target.value)}
                                    />
                                </div>

                                <label>Harga Emas per Gram</label>
                                <div className="input-rupiah">
                                    <span>Rp</span>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Masukkan harga emas"
                                        value={hargaEmas}
                                        onChange={(e) => setHargaEmas(e.target.value)}
                                    />
                                </div>

                                <div className="kalkulator-info">
                                    Nisab: <strong>85 gram emas</strong>
                                    <br />
                                    Kadar zakat: <strong>2,5%</strong>
                                    <br />
                                    Perhatikan ketentuan haul apabila disyaratkan.
                                </div>
                            </>
                        )}

                        {/* ZAKAT FITRAH */}
                        {jenisHitung === "fitrah" && (
                            <>
                                <h3>Zakat Fitrah</h3>
                                <p>
                                    Hitung zakat fitrah berdasarkan jumlah jiwa.
                                </p>

                                <label>Jumlah Orang / Jiwa</label>
                                <input
                                    className="input-zakat-biasa"
                                    type="number"
                                    min="1"
                                    value={jumlahJiwa}
                                    onChange={(e) => setJumlahJiwa(e.target.value)}
                                />

                                <label>Nominal Zakat per Orang</label>
                                <div className="input-rupiah">
                                    <span>Rp</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={nominalFitrah}
                                        onChange={(e) => setNominalFitrah(e.target.value)}
                                    />
                                </div>

                                <div className="kalkulator-info">
                                    Nominal contoh: Rp50.000 per jiwa.
                                    <br />
                                    Sesuaikan dengan ketetapan daerah atau lembaga zakat.
                                </div>
                            </>
                        )}

                        {/* TOMBOL */}
                        <div className="kalkulator-actions">
                            <button
                                type="button"
                                className="btn-hitung-zakat"
                                onClick={hitungZakat}
                            >
                                <Calculator size={17} />
                                Hitung Zakat
                            </button>

                            <button
                                type="button"
                                className="btn-reset-zakat"
                                onClick={resetKalkulator}
                            >
                                <RotateCcw size={16} />
                                Reset
                            </button>
                        </div>

                        {/* HASIL */}
                        {hasilZakat && (
                            <div className="hasil-kalkulator-zakat">
                                <span>Estimasi Zakat yang Harus Dibayarkan</span>

                                <h2>{formatRupiah(hasilZakat.nominal)}</h2>

                                <strong className={hasilZakat.wajib ? "hasil-wajib" : "hasil-belum"}>
                                    {hasilZakat.wajib
                                        ? "Memenuhi ketentuan perhitungan"
                                        : "Belum memenuhi ketentuan perhitungan"}
                                </strong>

                                <p>{hasilZakat.keterangan}</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 8 ASNAF */}
            <section className="informasi-zakat-section">
                <div className="informasi-zakat-section-title">
                    <span className="informasi-zakat-icon">
                        <Users size={21} />
                    </span>
                    <div>
                        <h2>8 Golongan Penerima Zakat</h2>
                        <p>
                            Zakat disalurkan kepada delapan golongan
                            yang berhak menerimanya.
                        </p>
                    </div>
                </div>

                <div className="asnaf-zakat-grid">
                    {daftarAsnaf.map((item) => (
                        <div className="asnaf-zakat-card" key={item.nomor}>
                            <span className="asnaf-zakat-nomor">
                                {item.nomor}
                            </span>

                            <h3>{item.nama}</h3>

                            <p>{item.deskripsi}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* PENUTUP */}
            <section className="informasi-zakat-penutup">
                <HandHeart size={28} />
                <div>
                    <h3>Zakat Membawa Manfaat untuk Sesama</h3>
                    <p>
                        Melalui ZAKATARA, diharapkan penyaluran zakat
                        dapat menjadi lebih terarah dan tepat sasaran.
                    </p>
                </div>
            </section>

            <p className="informasi-zakat-catatan">
                Catatan: Hasil kalkulator merupakan estimasi. Ketentuan
                nisab, haul, dan nominal zakat fitrah dapat berbeda
                berdasarkan jenis harta dan ketetapan lembaga zakat.
            </p>

        </div>
    );
}

export default InformasiZakat;
