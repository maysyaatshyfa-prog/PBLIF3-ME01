
import { useEffect, useMemo, useState } from "react";
import {
    Search,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import SidebarPenerima from "../components/SidebarPenerima";

const API_URL = "http://localhost:5000/api";

function formatRupiah(nominal) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(nominal) || 0);
}

function formatTanggal(tanggal) {
    if (!tanggal) return "-";

    const date = new Date(tanggal);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatTanggalFilter(tanggal) {
    if (!tanggal) return "";

    const date = new Date(tanggal);

    if (Number.isNaN(date.getTime())) return "";

    const tahun = date.getFullYear();
    const bulan = String(date.getMonth() + 1).padStart(2, "0");
    const hari = String(date.getDate()).padStart(2, "0");

    return `${tahun}-${bulan}-${hari}`;
}

function RiwayatBantuan() {
    const [akun] = useState(() => {
        try {
            return JSON.parse(sessionStorage.getItem("akun") || "null");
        } catch {
            return null;
        }
    });

    const [riwayat, setRiwayat] = useState([]);
    const [kataKunci, setKataKunci] = useState("");
    const [jenis, setJenis] = useState("Semua jenis");
    const [tanggal, setTanggal] = useState("");
    const [halaman, setHalaman] = useState(1);
    const [memuat, setMemuat] = useState(true);
    const [pesanError, setPesanError] = useState("");

    const dataAkun = akun?.akun || akun;
    const nik = String(dataAkun?.id || dataAkun?.nik || "").trim();

    const akunValid = /^\d{16}$/.test(nik);

    useEffect(() => {
        const controller = new AbortController();

        async function ambilRiwayat() {
            if (!akunValid) {
                setPesanError(
                    "Data akun tidak valid. Silakan login kembali."
                );
                setMemuat(false);
                return;
            }

            try {
                const response = await fetch(
                    `${API_URL}/penerima/dashboard/${encodeURIComponent(nik)}`,
                    { signal: controller.signal }
                );

                const hasil = await response.json();

                if (!response.ok) {
                    throw new Error(
                        hasil.message || "Gagal mengambil riwayat bantuan."
                    );
                }

                setRiwayat(
                    Array.isArray(hasil.riwayat_bantuan)
                        ? hasil.riwayat_bantuan
                        : []
                );

                setPesanError("");
            } catch (error) {
                if (error.name !== "AbortError") {
                    setPesanError(
                        error.message || "Tidak dapat terhubung ke server."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setMemuat(false);
                }
            }
        }

        ambilRiwayat();

        return () => controller.abort();
    }, [nik, akunValid]);

    const jenisBantuan = useMemo(() => {
        const daftarJenis = riwayat.map(
            (item) =>
                item.jenis_bantuan ||
                item.keterangan_bantuan ||
                "Bantuan"
        );

        return ["Semua jenis", ...new Set(daftarJenis)];
    }, [riwayat]);

    const dataFilter = useMemo(() => {
        return riwayat.filter((item) => {
            const namaJenis =
                item.jenis_bantuan ||
                item.keterangan_bantuan ||
                "Bantuan";

            const sumber =
                item.sumber_event ||
                item.keterangan_bantuan ||
                "";

            const cocokKata = `${namaJenis} ${sumber}`
                .toLowerCase()
                .includes(kataKunci.toLowerCase());

            const cocokJenis =
                jenis === "Semua jenis" || namaJenis === jenis;

            const cocokTanggal =
                !tanggal ||
                formatTanggalFilter(item.tanggal_penyaluran) === tanggal;

            return cocokKata && cocokJenis && cocokTanggal;
        });
    }, [riwayat, kataKunci, jenis, tanggal]);

    const perHalaman = 5;

    const totalHalaman = Math.max(
        1,
        Math.ceil(dataFilter.length / perHalaman)
    );

    // Halaman kembali ke 1 secara otomatis ketika filter berubah
    const halamanAktif =
        kataKunci || jenis !== "Semua jenis" || tanggal
            ? 1
            : Math.min(halaman, totalHalaman);

    const dataTampil = dataFilter.slice(
        (halamanAktif - 1) * perHalaman,
        halamanAktif * perHalaman
    );

    return (
        <div className="riwayat-layout">
            <SidebarPenerima />

            <main className="riwayat-main">
                <header className="riwayat-header">
                    <div>
                        <h1>Riwayat Zakat atau Bantuan</h1>
                        <p>
                            Berikut adalah daftar bantuan yang telah Anda terima.
                        </p>
                    </div>
                </header>

                <section className="riwayat-card">
                    <div className="riwayat-filter">
                        <label className="filter-tanggal">
                            <CalendarDays size={17} />

                            <input
                                type="date"
                                value={tanggal}
                                onChange={(e) => setTanggal(e.target.value)}
                                aria-label="Filter tanggal penyaluran"
                            />
                        </label>

                        <select
                            value={jenis}
                            onChange={(e) => setJenis(e.target.value)}
                            aria-label="Filter jenis bantuan"
                        >
                            {jenisBantuan.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>

                        <label className="filter-cari">
                            <Search size={17} />

                            <input
                                type="search"
                                placeholder="Cari jenis bantuan..."
                                value={kataKunci}
                                onChange={(e) => setKataKunci(e.target.value)}
                            />
                        </label>
                    </div>

                    {pesanError && (
                        <div className="riwayat-pesan error">
                            {pesanError}
                        </div>
                    )}

                    <div className="riwayat-tabel-wrapper">
                        <table className="riwayat-tabel">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Tanggal</th>
                                    <th>Jenis Bantuan</th>
                                    <th>Sumber / Event</th>
                                    <th>Nominal</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {memuat ? (
                                    <tr>
                                        <td colSpan={6} className="riwayat-kosong">
                                            Memuat riwayat bantuan...
                                        </td>
                                    </tr>
                                ) : pesanError ? (
                                    <tr>
                                        <td colSpan={6} className="riwayat-kosong">
                                            Riwayat bantuan gagal dimuat.
                                        </td>
                                    </tr>
                                ) : dataTampil.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="riwayat-kosong">
                                            Belum ada riwayat bantuan yang sesuai.
                                        </td>
                                    </tr>
                                ) : (
                                    dataTampil.map((item, index) => (
                                        <tr
                                            key={
                                                item.id_distribusi ??
                                                `${item.tanggal_penyaluran}-${index}`
                                            }
                                        >
                                            <td>
                                                {(halamanAktif - 1) *
                                                    perHalaman +
                                                    index +
                                                    1}
                                            </td>

                                            <td>
                                                {formatTanggal(
                                                    item.tanggal_penyaluran
                                                )}
                                            </td>

                                            <td>
                                                {item.jenis_bantuan || "Bantuan"}
                                            </td>

                                            <td>
                                                {item.sumber_event ||
                                                    item.keterangan_bantuan ||
                                                    "-"}
                                            </td>

                                            <td>
                                                {formatRupiah(
                                                    item.nominal_bantuan
                                                )}
                                            </td>

                                            <td>
                                                <span className="status-bantuan">
                                                    Tersalurkan
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="riwayat-footer">
                        <span>
                            Menampilkan{" "}
                            {dataFilter.length > 0
                                ? (halamanAktif - 1) * perHalaman + 1
                                : 0}
                            {" - "}
                            {Math.min(
                                halamanAktif * perHalaman,
                                dataFilter.length
                            )}
                            {" dari "}
                            {dataFilter.length} data
                        </span>

                        <div className="riwayat-pagination">
                            <button
                                type="button"
                                disabled={halamanAktif <= 1}
                                onClick={() =>
                                    setHalaman((h) => Math.max(1, h - 1))
                                }
                                aria-label="Halaman sebelumnya"
                            >
                                <ChevronLeft size={17} />
                            </button>

                            <span>
                                {halamanAktif} / {totalHalaman}
                            </span>

                            <button
                                type="button"
                                disabled={halamanAktif >= totalHalaman}
                                onClick={() =>
                                    setHalaman((h) =>
                                        Math.min(totalHalaman, h + 1)
                                    )
                                }
                                aria-label="Halaman berikutnya"
                            >
                                <ChevronRight size={17} />
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default RiwayatBantuan;
