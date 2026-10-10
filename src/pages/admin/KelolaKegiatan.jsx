function KelolaKegiatan() {
return ( <div className="admin-kegiatan">
  <div className="kegiatan-header">
    <h1>Kelola Kegiatan</h1>
    <p>
      Kelola kegiatan dan pantau pelaksanaan penyaluran zakat. </p>
  </div>

  <div className="kegiatan-info-card">
    <div className="kegiatan-icon">K</div>
    <div>
      <h3>Manajemen Kegiatan</h3>
      <p>
        Kelola informasi kegiatan yang berkaitan dengan penyaluran zakat.
      </p>
    </div>
  </div>

  <div className="kegiatan-content-card">
    <div className="kegiatan-content-header">
      <div>
        <h2>Daftar Kegiatan</h2>
        <p>Informasi kegiatan penyaluran zakat.</p>
      </div>
    </div>

    <div className="kegiatan-empty">
      <div className="kegiatan-empty-icon">K</div>
      <h3>Belum Ada Data Kegiatan</h3>
      <p>
        Data kegiatan akan muncul di sini setelah tersedia.
      </p>
    </div>
  </div>
</div>

);
}

export default KelolaKegiatan;
