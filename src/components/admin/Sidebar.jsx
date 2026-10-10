import { NavLink } from "react-router-dom";
import zakataraLogo from "../../assets/zakatara-logo.png";

const menu = [
  { nama: "Beranda", path: "/admin" },
  { nama: "Daftar Pengajuan", path: "/admin/pengajuan" },
  { nama: "Daftar Pengguna", path: "/admin/pengguna" },
  { nama: "Kelola Kriteria", path: "/admin/kriteria" },
  { nama: "Kelola Transaksi", path: "/admin/transaksi" },
  { nama: "Kelola Kegiatan", path: "/admin/kegiatan" },
  { nama: "Rekap Dana", path: "/admin/rekap-dana" },
  { nama: "Penyaluran Dana", path: "/admin/penyaluran-dana" },
];

export default function Sidebar() {
  return (
    <aside className="admin-sidebar">
      {/* Logo Zakatara */}
      <div className="sidebar-brand">
        <img
          src={zakataraLogo}
          alt="Zakatara - Tunaikan Zakat, Raih Berkah"
          className="sidebar-brand-logo"
        />
      </div>

      {/* Menu navigasi */}
      <nav className="sidebar-navigation">
        <p className="sidebar-menu-label">MENU</p>

        <div className="sidebar-menu-list">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `sidebar-link${isActive ? " active" : ""}`
              }
            >
              {item.nama}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Tombol keluar */}
      <div className="sidebar-bottom">
        <button type="button" className="sidebar-logout">
          Keluar
        </button>
      </div>
    </aside>
  );
}

