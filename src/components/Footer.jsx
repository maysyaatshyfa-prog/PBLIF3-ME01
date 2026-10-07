import { Link } from "react-router-dom";

function Footer() {
return (
<footer className="footer">

    <div className="footer-container">

        {/* Identitas */}
        <div className="footer-brand">
            <h2>Sistem Pakar</h2>
            <h3>Mustahiq Zakat</h3>

            <p>
                Membantu proses penentuan calon mustahiq
                berdasarkan kriteria yang telah ditentukan.
            </p>
        </div>

        {/* Navigasi */}
        <div className="footer-column">
            <h4>Navigasi</h4>

            <a href="#beranda">Beranda</a>
            <a href="#tentang">Tentang</a>
            <a href="#cara-kerja">Cara Kerja</a>
            <a href="#informasi">Informasi</a>
        </div>

        {/* Informasi */}
        <div className="footer-column">
            <h4>Informasi</h4>

            <Link to="/mustahiq">Tentang Mustahiq</Link>
            <Link to="/asnaf">Golongan Asnaf</Link>
            <Link to="/kriteria">Kriteria Penilaian</Link>
        </div>

        {/* Tentang */}
        <div className="footer-column footer-about">
            <h4>Tentang Sistem</h4>

            <p>
                Sistem berbasis website yang membantu proses
                penilaian calon penerima zakat berdasarkan
                data dan kriteria yang digunakan dalam sistem.
            </p>
        </div>

    </div>

    {/* Copyright */}
    <div className="footer-bottom">
        <p>
            © 2026 Sistem Pakar Penentuan Mustahiq
        </p>

        <p>
            Politeknik Negeri Batam
        </p>
    </div>

</footer>
);
}

export default Footer;