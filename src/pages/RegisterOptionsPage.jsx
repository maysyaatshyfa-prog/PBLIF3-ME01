import zakataraLogo from "../assets/zakatara-logo.png";
import { Link } from "react-router-dom";

function RegisterOptionsPage() {
  return (
    <div className="register-page">
      <div className="register-container">

        <div className="register-logo">
          <img src={zakataraLogo} alt="Zakatara" />
        </div>

        <h1>Daftar Akun</h1>

        <p className="register-description">
          Pilih jenis akun sesuai kebutuhan Anda.
        </p>

        <div className="register-options">

          {/* Calon Penerima */}
          <Link
            to="/register/mustahiq"
            className="register-card"
          >
            <h3>Calon Penerima (Mustahiq)</h3>

            <p>
              Daftarkan diri Anda untuk mengikuti proses
              penentuan kelayakan sebagai penerima zakat.
            </p>

            <span className="register-card-button">
              Daftar sebagai Calon Penerima →
            </span>
          </Link>

          {/* Muzakki */}
          <Link
            to="/register/muzakki"
            className="register-card"
          >
            <h2>Pemberi Zakat (Muzakki)</h2>

            <p>
              Buat akun untuk menunaikan zakat, infak,
              sedekah, dan berdonasi melalui website.
            </p>

            <span className="register-card-button">
              Daftar sebagai Muzakki →
            </span>
          </Link>

        </div>

      </div>
    </div>
  );
}

export default RegisterOptionsPage;