const dataAsnaf = [
{
id: 1,
nama: "Fakir",
deskripsi:
"Orang yang hampir tidak memiliki harta dan penghasilan untuk memenuhi kebutuhan hidup.",
},
{
id: 2,
nama: "Miskin",
deskripsi:
"Orang yang memiliki penghasilan tetapi belum cukup untuk memenuhi kebutuhan hidup.",
},
{
id: 3,
nama: "Amil",
deskripsi:
"Orang yang bertugas mengelola dan mengurus zakat.",
},
{
id: 4,
nama: "Muallaf",
deskripsi:
"Orang yang baru masuk Islam atau yang perlu dikuatkan hatinya dalam Islam.",
},
{
id: 5,
nama: "Riqab",
deskripsi:
"Orang yang berada dalam kondisi perbudakan atau upaya pembebasan diri.",
},
{
id: 6,
nama: "Gharim",
deskripsi:
"Orang yang memiliki utang untuk kebutuhan yang dibenarkan.",
},
{
id: 7,
nama: "Fisabilillah",
deskripsi:
"Orang atau kegiatan yang berjuang di jalan Allah.",
},
{
id: 8,
nama: "Ibnu Sabil",
deskripsi:
"Orang yang sedang dalam perjalanan dan mengalami kesulitan bekal.",
},
];

function KelolaKriteria() {
const handleKelola = (nama) => {
alert(`Kelola kriteria ${nama}`);
};

return ( <div className="admin-kriteria">
  <div className="kriteria-header">
    <h1>Kelola Kriteria</h1>
    <p>
      Kelola kriteria penilaian berdasarkan 8 golongan mustahik zakat. </p>
  </div>

  <div className="kriteria-section-header">
    <h2>Daftar Golongan Asnaf</h2>
    <span>8 Golongan</span>
  </div>

  <div className="kriteria-grid">
    {dataAsnaf.map((item) => (
    <div className="kriteria-card" key={item.id}>
      <div className="kriteria-nomor">{item.id}</div>

      <h3>{item.nama}</h3>

      <p>{item.deskripsi}</p>

      <button type="button" className="kriteria-button" onClick={()=> handleKelola(item.nama)}
        >
        Kelola
      </button>
    </div>
    ))}
  </div>
</div>

);
}

export default KelolaKriteria;
