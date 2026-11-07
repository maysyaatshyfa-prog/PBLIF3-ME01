
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

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside className={`admin-sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <img
            src={zakataraLogo}
            alt="Zakatara - Tunaikan Zakat, Raih Berkah"
            className="sidebar-brand-logo"
          />

          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Tutup menu"
          >
            ×
          </button>
        </div>

        <nav className="sidebar-navigation">
          <p className="sidebar-menu-label">MENU</p>

          <div className="sidebar-menu-list">
            {menu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-link${isActive ? " active" : ""}`
                }
              >
                {item.nama}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-bottom">
          <button type="button" className="sidebar-logout">
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
