function RekapDana() {
return ( <div className="admin-rekap">
  <div className="rekap-header">
    <h1>Rekap Dana</h1>
    <p>
      Lihat ringkasan dan rekapitulasi dana zakat yang tercatat dalam sistem. </p>
  </div>

  <div className="rekap-summary-card">
    <div className="rekap-summary-icon">Rp</div>
    <div>
      <h3>Ringkasan Dana Zakat</h3>
      <p>
        Informasi penerimaan dan penyaluran dana akan ditampilkan di sini.
      </p>
    </div>
  </div>

  <div className="rekap-content-card">
    <div className="rekap-content-header">
      <div>
        <h2>Rekapitulasi Dana</h2>
        <p>Ringkasan data keuangan zakat.</p>
      </div>
    </div>

    <div className="rekap-empty">
      <div className="rekap-empty-icon">▤</div>
      <h3>Belum Ada Data Rekap</h3>
      <p>
        Rekap dana akan tersedia setelah data transaksi dan penyaluran tercatat.
      </p>
    </div>
  </div>
</div>

);
}

export default RekapDana;
