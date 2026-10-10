import Navbar from "../components/Navbar";

function RegisterMuzakkiPage() {
return (
<div className="register-muzakki-page">

    <Navbar />

    <div className="register-muzakki-header">
        <h1>Registrasi Akun Muzakki</h1>

        <p>
            Daftarkan akun Anda untuk mulai berbagi kebaikan.
        </p>
    </div>

    <div className="register-container">

        {/* Information */}
        <div className="register-information">
            <h2>
                Nikmati Kemudahan dalam
                <br />
                Berbagi Kebaikan
            </h2>

            <p>
                Tunaikan zakat, infak, dan sedekah dengan lebih
                mudah melalui layanan yang praktis dan
                terdokumentasi.
            </p>

            <div className="register-benefits">
                <p>✓ Praktis dan mudah</p>
                <p>✓ Pembayaran aman</p>
                <p>✓ Bukti transaksi tersimpan</p>
                <p>✓ Penyaluran terdokumentasi</p>
            </div>
        </div>

        {/* Form */}
        <div className="register-form-card">

            <h2>Buat Akun Muzakki</h2>

            <div className="form-group">
                <label>Nama Lengkap</label>

                <input type="text" placeholder="Masukkan nama lengkap" />
            </div>

            <div className="form-group">
                <label>Email</label>

                <input type="email" placeholder="Masukkan email" />
            </div>

            <div className="form-group">
                <label>Nomor HP</label>

                <input type="tel" placeholder="Masukkan nomor HP" />
            </div>

            <div className="form-group">
                <label>Password</label>

                <input type="password" placeholder="Masukkan password" />
            </div>

            <div className="form-group">
                <label>Konfirmasi Password</label>

                <input type="password" placeholder="Ulangi password" />
            </div>

            <button type="button" className="register-submit">
                Daftar Akun
            </button>

            <div className="register-login-text">
                Sudah memiliki akun?
                <a href="/login"> Masuk di sini</a>
            </div>

        </div>

    </div>

</div>
);
}

export default RegisterMuzakkiPage;