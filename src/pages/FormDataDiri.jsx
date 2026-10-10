import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function FormDataDiri() {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        const form = e.target;

        if (!form.checkValidity()) {
            alert("Lengkapi data diri terlebih dahulu!");
            return;
        }

        alert("Data berhasil dilengkapi. Silakan lanjutkan.");

        navigate("/kuisioner");
    };
  return (
    <div className="form-page">

      <Navbar />

      <div className="form-content">
        <div className="form-card">

          <h1>Form Data Diri</h1>

          <p className="form-description">
            Lengkapi data diri anda untuk melanjutkan proses pendaftaran calon penerima zakat
          </p>

            <form onSubmit={handleSubmit} noValidate>
                {/* IDENTITAS */}
                <div className="form-section">
                    <h2>Identitas</h2>

                    <div className="form-grid">

                        <div className="form-group">
                            <label htmlFor="nama">Nama Lengkap</label>
                            <input type="text" id="nama" placeholder="Masukkan nama lengkap Anda" required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="nik">NIK</label>
                            <input type="text" id="nik" placeholder="Masukkan NIK Anda" required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="tempatlahir">Tempat Lahir</label>
                            <input type="text" id="tempatlahir" placeholder="Masukkan tempat lahir Anda" required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="tanggallahir">Tanggal Lahir</label>
                            <input type="date" id="tanggallahir" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="jeniskelamin">Jenis Kelamin</label>
                            <select id="jeniskelamin">
                                <option value="">Pilih Jenis Kelamin</option>
                                <option value="laki-laki">Laki-laki</option>
                                <option value="perempuan">Perempuan</option>
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
                            <input type="email" id="email" placeholder="Masukkan email Anda" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="telepon">Telepon</label>
                            <input type="tel" id="telepon" placeholder="Masukkan nomor telepon Anda" required />
                        </div>

                    </div>
                </div>

                {/* ALAMAT */}
                <div className="form-section">
                    <h2>Alamat</h2>

                    <div className="form-grid">

                        <div className="form-group">
                            <label htmlFor="kecamatan">Kecamatan</label>
                            <input type="text" id="kecamatan" placeholder="Masukkan kecamatan Anda" required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="kelurahan">Kelurahan</label>
                            <input type="text" id="kelurahan" placeholder="Masukkan kelurahan Anda" required />
                        </div>

                    </div>

                    <div className="form-group">
                        <label htmlFor="alamatlengkap">Alamat Lengkap</label>
                        <input type="text" id="alamatlengkap" placeholder="Masukkan alamat lengkap Anda" required />
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

                            <select id="statuspernikahan">
                                <option value="">Pilih status</option>
                                <option value="Belum Menikah">Belum Menikah</option>
                                <option value="Menikah">Menikah</option>
                                <option value="Cerai">Cerai</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="jumlahtanggungan">
                                Jumlah Tanggungan
                            </label>

                            <input type="number" id="jumlahtanggungan" placeholder="Masukkan jumlah tanggungan" required
                                min="0" />
                        </div>

                    </div>
                </div>

                {/* PEKERJAAN */}
                <div className="form-section">
                    <h2>Data Pekerjaan</h2>

                    <div className="form-grid">

                        <div className="form-group">
                            <label htmlFor="pekerjaan">Pekerjaan</label>
                            <input type="text" id="pekerjaan" placeholder="Masukkan pekerjaan Anda" required />
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