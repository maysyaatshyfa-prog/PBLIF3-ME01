
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop";
import AdminLayout from "./components/admin/AdminLayout";

// Halaman utama
import LandingPage from "./pages/LandingPage";
import MustahiqPage from "./pages/MustahiqPage";
import AsnafPage from "./pages/AsnafPage";
import KriteriaPage from "./pages/KriteriaPage";

// Halaman autentikasi dan registrasi
import LoginPage from "./pages/Loginpage";
import RegisterOptionsPage from "./pages/RegisterOptionsPage";
import RegisterMuzakkiPage from "./pages/RegisterMuzakkiPage";
import FormDataDiri from "./pages/FormDataDiri";
import Kuisioner from "./pages/Kuisioner";
import Pengajuan from "./pages/Pengajuan";

// Halaman admin
import Beranda from "./pages/admin/Beranda";
import DaftarPengajuan from "./pages/admin/DaftarPengajuan";
import DetailPengajuan from "./pages/admin/DetailPengajuan";
import DaftarPengguna from "./pages/admin/DaftarPengguna";
import KelolaKriteria from "./pages/admin/KelolaKriteria";
import DetailKriteria from "./pages/admin/DetailKriteria";
import KelolaTransaksi from "./pages/admin/KelolaTransaksi";
import KelolaKegiatan from "./pages/admin/KelolaKegiatan";
import RekapDana from "./pages/admin/RekapDana";
import PenyaluranDana from "./pages/admin/PenyaluranDana";
import DetailItemKriteria from "./pages/admin/DetailItemKriteria";
import FormKriteria from "./pages/admin/FormKriteria";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        {/* Halaman utama */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/mustahiq" element={<MustahiqPage />} />
        <Route path="/asnaf" element={<AsnafPage />} />
        <Route path="/kriteria" element={<KriteriaPage />} />

        {/* Login dan registrasi */}
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/register/options"
          element={<RegisterOptionsPage />}
        />

        <Route
          path="/register/muzakki"
          element={<RegisterMuzakkiPage />}
        />

        <Route
          path="/register/mustahiq"
          element={<FormDataDiri />}
        />

        <Route path="/kuisioner" element={<Kuisioner />} />
        <Route path="/pengajuan" element={<Pengajuan />} />

        {/* Dashboard admin */}
        <Route
          path="/admin/dashboard"
          element={<Navigate to="/admin" replace />}
        />

        <Route
          path="/admin"
          element={
            <AdminLayout>
              <Beranda />
            </AdminLayout>
          }
        />

        {/* Daftar pengajuan */}
        <Route
          path="/admin/daftar-pengajuan"
          element={
            <AdminLayout>
              <DaftarPengajuan />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/daftar-pengajuan/:id"
          element={
            <AdminLayout>
              <DetailPengajuan />
            </AdminLayout>
          }
        />

        {/* Daftar pengguna */}
        <Route
          path="/admin/pengguna"
          element={
            <AdminLayout>
              <DaftarPengguna />
            </AdminLayout>
          }
        />

        {/* Kelola kriteria */}
        <Route
          path="/admin/kriteria"
          element={
            <AdminLayout>
              <KelolaKriteria />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/kriteria/:asnaf"
          element={
            <AdminLayout>
              <DetailKriteria />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/kriteria/:asnaf/:id"
          element={
            <AdminLayout>
              <DetailItemKriteria />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/kriteria/:asnaf/tambah"
          element={
            <AdminLayout>
              <FormKriteria />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/kriteria/:asnaf/:id/edit"
          element={
            <AdminLayout>
              <FormKriteria />
            </AdminLayout>
          }
        />

        {/* Kelola transaksi */}
        <Route
          path="/admin/transaksi"
          element={
            <AdminLayout>
              <KelolaTransaksi />
            </AdminLayout>
          }
        />

        {/* Kelola kegiatan */}
        <Route
          path="/admin/kegiatan"
          element={
            <AdminLayout>
              <KelolaKegiatan />
            </AdminLayout>
          }
        />

        {/* Rekap dana */}
        <Route
          path="/admin/rekap-dana"
          element={
            <AdminLayout>
              <RekapDana />
            </AdminLayout>
          }
        />

        {/* Penyaluran dana */}
        <Route
          path="/admin/penyaluran-dana"
          element={
            <AdminLayout>
              <PenyaluranDana />
            </AdminLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
