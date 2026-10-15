
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function FormDataDiri() {
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = e.currentTarget;

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (data.password !== data.konfirmasi_password) {
        alert("Password dan konfirmasi password tidak cocok.");
        return;
    }
        try {
            const response = await fetch(
                "http://localhost:5000/api/penerima",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                }
            );

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || "Gagal menyimpan data.");
                return;
            }

            console.log("NIK yang akan dikirim:", data.nik);

            alert(result.message || "Data berhasil disimpan.");
            navigate("/kuisioner", {
                state: {
                    nik: data.nik
                }
            });
        } catch (error) {
            console.error("Gagal mengirim data:", error);

            alert(
                "Backend tidak dapat dihubungi. Pastikan server berjalan."
            );
        }
    };

    return (
    <div className="form-page">
        <Navbar />

        <div className="form-content">
            <div className="form-card">
                <h1>Form Data Diri</h1>

                <p className="form-description">
                    Lengkapi data diri Anda untuk melanjutkan proses
                    pendaftaran calon penerima zakat.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                    {/* IDENTITAS */}
                    <div className="form-section">
                        <h2>Identitas</h2>

                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="nama">
                                    Nama Lengkap
                                </label>
                                <input type="text" id="nama" name="nama_lengkap"
                                    placeholder="Masukkan nama lengkap Anda" required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="nik">NIK</label>
                                <input type="text" id="nik" name="nik" placeholder="Masukkan NIK Anda" required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="tempatlahir">
                                    Tempat Lahir
                                </label>
                                <input type="text" id="tempatlahir" name="tempat_lahir"
                                    placeholder="Masukkan tempat lahir Anda" required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="tanggallahir">
                                    Tanggal Lahir
                                </label>
                                <input type="date" id="tanggallahir" name="tanggal_lahir" required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="jeniskelamin">
                                    Jenis Kelamin
                                </label>
                                <select id="jeniskelamin" name="jenis_kelamin" required>
                                    <option value="">
                                        Pilih Jenis Kelamin
                                    </option>
                                    <option value="Laki-laki">
                                        Laki-laki
                                    </option>
                                    <option value="Perempuan">
                                        Perempuan
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* KONTAK */}
                    <div className="form-section">
                        <h2>Kontak</h2>

                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" name="email" placeholder="Masukkan email Anda" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="telepon">
                                    Nomor HP
                                </label>
                                <input type="tel" id="telepon" name="no_hp" placeholder="Masukkan nomor HP Anda"
                                    required />
                            </div>
                            {/* KEAMANAN AKUN */}
                            <div className="form-section">
                                <h2>Keamanan Akun</h2>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="password">
                                            Password
                                        </label>

                                        <input type="password" id="password" name="password"
                                            placeholder="Buat password Anda" minLength={8} autoComplete="new-password"
                                            required />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="konfirmasi_password">
                                            Konfirmasi Password
                                        </label>

                                        <input type="password" id="konfirmasi_password" name="konfirmasi_password"
                                            placeholder="Masukkan ulang password" minLength={8}
                                            autoComplete="new-password" required />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ALAMAT */}
                    <div className="form-section">
                        <h2>Alamat</h2>

                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="kecamatan">
                                    Kecamatan
                                </label>
                                <input type="text" id="kecamatan" name="kecamatan" placeholder="Masukkan kecamatan Anda"
                                    required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="kelurahan">
                                    Kelurahan
                                </label>
                                <input type="text" id="kelurahan" name="kelurahan" placeholder="Masukkan kelurahan Anda"
                                    required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="alamatlengkap">
                                Alamat Lengkap
                            </label>
                            <input type="text" id="alamatlengkap" name="alamat_lengkap"
                                placeholder="Masukkan alamat lengkap Anda" required />
                        </div>
                    </div>

                    {/* DATA KELUARGA */}
                    <div className="form-section">
                        <h2>Data Keluarga</h2>

                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="statuspernikahan">
                                    Status Pernikahan
                                </label>
                                <select id="statuspernikahan" name="status_pernikahan">
                                    <option value="">
                                        Pilih status
                                    </option>
                                    <option value="Belum Menikah">
                                        Belum Menikah
                                    </option>
                                    <option value="Menikah">
                                        Menikah
                                    </option>
                                    <option value="Cerai">
                                        Cerai
                                    </option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="jumlahtanggungan">
                                    Jumlah Tanggungan
                                </label>
                                <input type="number" id="jumlahtanggungan" name="jumlah_tanggungan"
                                    placeholder="Masukkan jumlah tanggungan" min="0" required />
                            </div>
                        </div>
                    </div>

                    {/* DATA PEKERJAAN */}
                    <div className="form-section">
                        <h2>Data Pekerjaan</h2>

                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="pekerjaan">
                                    Pekerjaan
                                </label>
                                <input type="text" id="pekerjaan" name="pekerjaan" placeholder="Masukkan pekerjaan Anda"
                                    required />
                            </div>
                        </div>
                    </div>

                    {/* TOMBOL */}
                    <div className="form-button">
                        <button type="submit">
                            Lanjutkan →
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <Footer />
    </div>
    );
    }

    export default FormDataDiri;
