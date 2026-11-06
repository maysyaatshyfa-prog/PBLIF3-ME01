
import { useMemo, useState } from "react";
import {
    Search,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Heart,
    Wallet,
    CheckCircle2,
} from "lucide-react";

import "../index.css";

function formatRupiah(nominal) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(nominal || 0);
}

function RiwayatDonasi() {
    const [kataKunci, setKataKunci] = useState("");
    const [jenis, setJenis] = useState("Semua jenis");
    const [tanggal, setTanggal] = useState("");
    const [halaman, setHalaman] = useState(1);

    // Data akan dihubungkan ke backend setelah fitur transaksi dibuat.
    const riwayat = [];

    const jenisDonasi = [
        "Semua jenis",
        "Zakat",
        "Infak",
        "Sedekah",
        "Wakaf",
    ];

    const dataFilter = useMemo(() => {
        return riwayat.filter((item) => {
            const cocokKata = item.jenis
                .toLowerCase()
                .includes(kataKunci.toLowerCase());

            const cocokJenis =
                jenis === "Semua jenis" || item.jenis === jenis;

            const cocokTanggal =
                !tanggal || item.tanggal === tanggal;

            return cocokKata && cocokJenis && cocokTanggal;
        });
    }, [riwayat, kataKunci, jenis, tanggal]);

    const perHalaman = 5;

    const totalHalaman = Math.max(
        1,
        Math.ceil(dataFilter.length / perHalaman)
    );

    const dataTampil = dataFilter.slice(
        (halaman - 1) * perHalaman,
        halaman * perHalaman
    );

    const totalDonasi = riwayat.reduce(
        (total, item) => total + item.nominal,
        0
    );

    const donasiBerhasil = riwayat.filter(
        (item) => item.status === "Berhasil"
    ).length;

    return (
        <div className="riwayat-donasi-page">

            {/* HEADER */}
            <header className="riwayat-donasi-header">
                <div>
                    <h1>Riwayat Donasi</h1>
                    <p>
                        Pantau seluruh donasi yang telah Anda berikan
                        melalui ZAKATARA.
                    </p>
                </div>
            </header>

            {/* RINGKASAN */}
            <section className="donasi-summary">

                <div className="donasi-summary-card">
                    <div className="donasi-summary-icon orange">
                        <Wallet size={23} />
                    </div>
                    <div>
                        <p>Total Donasi</p>
                        <h3>{formatRupiah(totalDonasi)}</h3>
                    </div>
                </div>

                <div className="donasi-summary-card">
                    <div className="donasi-summary-icon green">
                        <Heart size={23} />
                    </div>
                    <div>
                        <p>Jumlah Transaksi</p>
                        <h3>{riwayat.length} Donasi</h3>
                    </div>
                </div>

                <div className="donasi-summary-card">
                    <div className="donasi-summary-icon blue">
                        <CheckCircle2 size={23} />
                    </div>
                    <div>
                        <p>Donasi Berhasil</p>
                        <h3>{donasiBerhasil} Transaksi</h3>
                    </div>
                </div>

            </section>

            {/* TABEL RIWAYAT */}
            <section className="riwayat-donasi-card">

                <div className="riwayat-donasi-title">
                    <h2>Daftar Riwayat Donasi</h2>
                    <p>
                        Informasi transaksi donasi yang telah Anda lakukan.
                    </p>
                </div>

                {/* FILTER */}
                <div className="riwayat-donasi-filter">

                    <label className="donasi-filter-tanggal">
                        <CalendarDays size={17} />
                        <input
                            type="date"
                            value={tanggal}
                            onChange={(e) => {
                                setTanggal(e.target.value);
                                setHalaman(1);
                            }}
                            aria-label="Filter tanggal"
                        />
                    </label>

                    <select
                        value={jenis}
                        onChange={(e) => {
                            setJenis(e.target.value);
                            setHalaman(1);
                        }}
                        aria-label="Filter jenis donasi"
                    >
                        {jenisDonasi.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>

                    <label className="donasi-filter-cari">
                        <Search size={17} />
                        <input
                            type="search"
                            placeholder="Cari jenis donasi..."
                            value={kataKunci}
                            onChange={(e) => {
                                setKataKunci(e.target.value);
                                setHalaman(1);
                            }}
                        />
                    </label>

                </div>

                {/* TABEL */}
                <div className="riwayat-donasi-table-wrapper">
                    <table className="riwayat-donasi-table">
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Tanggal</th>
                                <th>Jenis Donasi</th>
                                <th>Metode Pembayaran</th>
                                <th>Nominal</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {dataTampil.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="donasi-data-kosong"
                                    >
                                        <div>
                                            <div className="donasi-empty-icon">
                                                <Heart size={30} />
                                            </div>
                                            <h3>Belum Ada Riwayat Donasi</h3>
                                            <p>
                                                Riwayat donasi Anda akan
                                                ditampilkan di sini setelah
                                                melakukan donasi.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                dataTampil.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>
                                            {(halaman - 1) * perHalaman +
                                                index + 1}
                                        </td>
                                        <td>{item.tanggal}</td>
                                        <td>{item.jenis}</td>
                                        <td>{item.metode}</td>
                                        <td>{formatRupiah(item.nominal)}</td>
                                        <td>
                                            <span className="donasi-status">
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER PAGINATION */}
                <div className="riwayat-donasi-footer">
                    <span>
                        Menampilkan {dataFilter.length
                            ? (halaman - 1) * perHalaman + 1
                            : 0}
                        {" - "}
                        {Math.min(
                            halaman * perHalaman,
                            dataFilter.length
                        )}
                        {" dari "}
                        {dataFilter.length} data
                    </span>

                    <div className="donasi-pagination">
                        <button
                            type="button"
                            disabled={halaman <= 1}
                            onClick={() => setHalaman((h) => h - 1)}
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <span>{halaman}</span>

                        <button
                            type="button"
                            disabled={halaman >= totalHalaman}
                            onClick={() => setHalaman((h) => h + 1)}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

            </section>
        </div>
    );
}

export default RiwayatDonasi;
