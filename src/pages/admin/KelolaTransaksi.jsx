function KelolaTransaksi() {
return ( <div className="admin-transaksi">
  <div className="transaksi-header">
    <h1>Kelola Transaksi</h1>
    <p>
      Kelola dan pantau transaksi zakat yang tercatat dalam sistem. </p>
  </div>

  <div className="transaksi-ringkasan">
    <div className="transaksi-ringkasan-icon">
      <span>Rp</span>
    </div>
    <div>
      <h3>Data Transaksi Zakat</h3>
      <p>
        Informasi transaksi akan ditampilkan di bagian ini.
      </p>
    </div>
  </div>

  <div className="transaksi-table-card">
    <div className="transaksi-table-header">
      <div>
        <h2>Daftar Transaksi</h2>
        <p>Data transaksi zakat yang tercatat dalam sistem.</p>
      </div>
    </div>

    <div className="transaksi-empty">
      <div className="transaksi-empty-icon">↔</div>
      <h3>Belum Ada Data Transaksi</h3>
      <p>
        Data transaksi akan muncul di sini setelah tersedia.
      </p>
    </div>
  </div>
</div>

);
}

export default KelolaTransaksi;
