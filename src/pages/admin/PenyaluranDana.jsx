function PenyaluranDana() {
return ( <div className="admin-penyaluran">
  <div className="penyaluran-header">
    <h1>Penyaluran Dana</h1>
    <p>
      Kelola dan pantau penyaluran dana zakat kepada penerima. </p>
  </div>


  <div className="penyaluran-info-card">
    <div className="penyaluran-icon">Rp</div>
    <div>
      <h3>Manajemen Penyaluran Dana</h3>
      <p>
        Pantau informasi dana yang disalurkan kepada mustahik.
      </p>
    </div>
  </div>

  <div className="penyaluran-content-card">
    <div className="penyaluran-content-header">
      <div>
        <h2>Riwayat Penyaluran Dana</h2>
        <p>Daftar penyaluran dana zakat yang tercatat.</p>
      </div>
    </div>

    <div className="penyaluran-empty">
      <div className="penyaluran-empty-icon">Rp</div>
      <h3>Belum Ada Data Penyaluran</h3>
      <p>
        Data penyaluran dana akan muncul di sini setelah tersedia.
      </p>
    </div>
  </div>
</div>


);
}

export default PenyaluranDana;
