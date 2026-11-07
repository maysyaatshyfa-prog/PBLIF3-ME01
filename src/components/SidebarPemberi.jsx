import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  History,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import logo from "../assets/zakatara-logo.png";

const SidebarPemberi = () => {
  const navigate = useNavigate();
  const [menuTerbuka, setMenuTerbuka] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem("akun");
    sessionStorage.removeItem("role");

    navigate("/login", { replace: true });
  };

  const tutupMenu = () => {
    setMenuTerbuka(false);
  };

  return (
    <>
      {/* TOMBOL HAMBURGER MOBILE */}
      <button
        type="button"
        className="sidebar-pemberi-hamburger"
        onClick={() => setMenuTerbuka(!menuTerbuka)}
        aria-label={menuTerbuka ? "Tutup menu" : "Buka menu"}
      >
        {menuTerbuka ? <X size={25} /> : <Menu size={25} />}
      </button>

      {/* OVERLAY MOBILE */}
      {menuTerbuka && (
        <div
          className="sidebar-pemberi-overlay"
          onClick={tutupMenu}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`sidebar-pemberi ${
          menuTerbuka ? "mobile-open" : ""
        }`}
      >
        {/* LOGO */}
        <div className="sidebar-pemberi-logo">
          <img
            src={logo}
            alt="Logo ZAKATARA"
            className="sidebar-penerima-logo-img"
          />
        </div>

        {/* MENU SIDEBAR */}
        <nav className="sidebar-pemberi-nav">
          <NavLink
            to="/dashboardpemberi"
            onClick={tutupMenu}
            className={({ isActive }) =>
              `sidebar-penerima-link ${isActive ? "active" : ""}`
            }
          >
            <LayoutDashboard size={20} />
            <span>Beranda</span>
          </NavLink>

          <NavLink
            to="/informasizakat"
            onClick={tutupMenu}
            className={({ isActive }) =>
              `sidebar-penerima-link ${isActive ? "active" : ""}`
            }
          >
            <FileText size={20} />
            <span>Informasi Zakat</span>
          </NavLink>

          <NavLink
            to="/daftarevent"
            onClick={tutupMenu}
            className={({ isActive }) =>
              `sidebar-penerima-link ${isActive ? "active" : ""}`
            }
          >
            <CalendarDays size={20} />
            <span>Daftar Event</span>
          </NavLink>

          <NavLink
            to="/riwayatdonasi"
            onClick={tutupMenu}
            className={({ isActive }) =>
              `sidebar-penerima-link ${isActive ? "active" : ""}`
            }
          >
            <History size={20} />
            <span>Riwayat Donasi</span>
          </NavLink>
        </nav>

        {/* KELUAR */}
        <div className="sidebar-pemberi-bottom">
          <button
            type="button"
            className="sidebar-pemberi-logout"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default SidebarPemberi;
