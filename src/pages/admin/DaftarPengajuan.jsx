import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function DetailPengajuan() {
  const { id } = useParams();

  const [pengajuan, setPengajuan] = useState(null);
  const [jawaban, setJawaban] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const ambilDetail = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(
          `http://localhost:5000/api/admin/pengajuan/${encodeURIComponent(id)}`
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Gagal mengambil detail pengajuan."
          );
        }

        setPengajuan(result.pengajuan);
        setJawaban(result.jawaban || []);
      } catch (error) {
        console.error("Gagal mengambil detail:", error);
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    ambilDetail();
  }, [id]);

  if (loading) {
    return <p>Memuat detail pengajuan...</p>;
  }

  if (errorMessage) {
    return <p role="alert">{errorMessage}</p>;
  }

  if (!pengajuan) {
    return <p>Pengajuan tidak ditemukan.</p>;
  }

  return (
    <div className="admin-detail-pengajuan">
      <h1>Detail Pengajuan</h1>

      <p>Nomor Pengajuan: {pengajuan.nomor_pengajuan || "-"}</p>
      <p>NIK: {pengajuan.nik}</p>
      <p>Nama: {pengajuan.nama_lengkap}</p>
      <p>No. HP: {pengajuan.no_hp}</p>
      <p>Status: {pengajuan.status_pengajuan}</p>

      <h2>Jawaban Kuesioner</h2>

      {jawaban.length > 0 ? (
        jawaban.map((item) => (
          <div key={item.id_kriteria}>
            <p>
              {item.nama_kriteria || `Kriteria ${item.id_kriteria}`}
              : {item.nilai_jawaban}
            </p>
          </div>
        ))
      ) : (
        <p>Belum ada jawaban kuesioner.</p>
      )}
    </div>
  );
}

export default DetailPengajuan;