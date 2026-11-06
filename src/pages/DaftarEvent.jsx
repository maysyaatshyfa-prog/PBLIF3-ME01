
import { useState } from "react";
import { Link } from "react-router-dom";
import {
    Search,
    CalendarDays,
    MapPin,
    ArrowRight,
} from "lucide-react";

import "../index.css";

function DaftarEvent() {
    const [kataKunci, setKataKunci] = useState("");
    const [kategori, setKategori] = useState("Semua Kategori");

    return (
        <div className="daftar-event-page">

            {/* HEADER */}
            <section className="daftar-event-header">
                <h1>Daftar Event</h1>
                <p>
                    Temukan berbagai kegiatan sosial dan program
                    kebaikan bersama ZAKATARA.
                </p>
            </section>

            {/* PENCARIAN DAN FILTER */}
            <section className="daftar-event-filter">

                <div className="event-search">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Cari nama event..."
                        value={kataKunci}
                        onChange={(e) => setKataKunci(e.target.value)}
                    />
                </div>

                <select
                    className="event-category-select"
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                >
                    <option>Semua Kategori</option>
                    <option>Sosial</option>
                    <option>Pendidikan</option>
                    <option>Kemanusiaan</option>
                    <option>Keagamaan</option>
                </select>

            </section>

            {/* DAFTAR EVENT */}
            <section className="daftar-event-list">

                {[1, 2, 3].map((item) => (
                    <div className="daftar-event-card" key={item}>

                        {/* AREA GAMBAR */}
                        <div className="daftar-event-image-placeholder">
                            <span>Gambar Event</span>
                        </div>

                        {/* INFORMASI EVENT */}
                        <div className="daftar-event-content">

                            <span className="event-category-badge">
                                Kategori
                            </span>

                            <h3>Nama Event</h3>

                            <div className="event-information">
                                <span>
                                    <CalendarDays size={16} />
                                    Tanggal Kegiatan
                                </span>

                                <span>
                                    <MapPin size={16} />
                                    Lokasi Kegiatan
                                </span>
                            </div>

                            <p>
                                Deskripsi singkat kegiatan akan
                                ditampilkan pada bagian ini.
                            </p>

                            <Link
                                to={`/detailevent/${item}`}
                                className="event-detail-link"
                            >
                                Lihat Detail
                                <ArrowRight size={16} />
                            </Link>

                        </div>
                    </div>
                ))}

            </section>

            {/* PAGINATION */}
            <div className="event-pagination">
                <button type="button">‹</button>
                <button type="button" className="aktif">1</button>
                <button type="button">2</button>
                <button type="button">3</button>
                <button type="button">›</button>
            </div>

        </div>
    );
}

export default DaftarEvent;
