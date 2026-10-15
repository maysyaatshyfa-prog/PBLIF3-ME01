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
                        <label htmlFor="nama_lengkap">
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            id="nama_lengkap"
                            name="nama_lengkap"
                            placeholder="Masukkan nama lengkap"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Masukkan email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="no_hp">Nomor HP</label>
                        <input
                            type="tel"
                            id="no_hp"
                            name="no_hp"
                            placeholder="Masukkan nomor HP"
                        />
                    </div>

                    {/* Input baru: Alamat Lengkap */}
                    <div className="form-group">
                        <label htmlFor="alamat_lengkap">
                            Alamat Lengkap
                        </label>
                        <input
                            type="text"
                            id="alamat_lengkap"
                            name="alamat_lengkap"
                            placeholder="Masukkan alamat lengkap"
                        />
                    </div>

                    {/* Input baru: NIK */}
                    <div className="form-group">
                        <label htmlFor="nik">NIK</label>
                        <input
                            type="text"
                            id="nik"
                            name="nik"
                            placeholder="Masukkan 16 digit NIK"
                            maxLength={16}
                            pattern="[0-9]{16}"
                            title="NIK harus terdiri dari 16 digit angka"
                            inputMode="numeric"
                        />
                    </div>

                    {/* Input baru: NPWP */}
                    <div className="form-group">
                        <label htmlFor="npwp">NPWP</label>
                        <input
                            type="text"
                            id="npwp"
                            name="npwp"
                            placeholder="Masukkan NPWP"
                            maxLength={16}
                            inputMode="numeric"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Masukkan password"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="konfirmasi_password">
                            Konfirmasi Password
                        </label>
                        <input
                            type="password"
                            id="konfirmasi_password"
                            name="konfirmasi_password"
                            placeholder="Ulangi password"
                        />
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