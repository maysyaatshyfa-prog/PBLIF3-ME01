import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Pengajuan() {
  return (
    <div className="pengajuan-page">

      <Navbar />

      <main className="pengajuan-container">

        {/* PENGAJUAN BERHASIL */}
        <section className="pengajuan-success">

          <div className="success-icon">
            ✓
          </div>

          <h1>PENGAJUAN BERHASIL</h1>

          <p>
            Pengajuan Anda berhasil dikirim.
          </p>

          <p>
            Data sedang menunggu verifikasi admin
          </p>

        </section>


        {/* INFORMASI PENGAJUAN */}
        <section className="pengajuan-card">

          <h2>INFORMASI PENGAJUAN</h2>

          <div className="info-list">

            <div className="info-item">
              <span>Nama</span>
              <strong></strong>
            </div>

            <div className="info-item">
              <span>Nomor Pengajuan</span>
              <strong></strong>
            </div>

            <div className="info-item">
              <span>Tanggal Pengajuan</span>
              <strong></strong>
            </div>

            <div className="info-item">
              <span>Status</span>
              <strong></strong>
            </div>

          </div>

        </section>


        {/* PROSES VERIFIKASI */}
        <section className="pengajuan-card">

          <h2 className="verification-title">
            <span className="clock-icon">◷</span>
            PROSES VERIFIKASI
          </h2>

          <p>
            Admin akan memeriksa data, jawaban kuesioner,
            dan bukti pendukung yang Anda kirimkan.
          </p>

          <p>
            Perkiraan proses verifikasi maksimal 1 × 24 jam.
          </p>

        </section>


        {/* TOKEN */}
        <section className="pengajuan-card token-section">

          <h2>TOKEN</h2>

          <p>
            Berikut token sementara untuk mengecek status
            pengajuan Anda nanti.
          </p>

          <div className="token-box"></div>

        </section>

      </main>

      <Footer />

    </div>
  );
}

export default Pengajuan;