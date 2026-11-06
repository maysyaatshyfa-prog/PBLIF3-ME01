import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  History,
  LogOut,
} from "lucide-react";

import logo from "../assets/zakatara-logo.png";

const SidebarPemberi = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("akun");
    sessionStorage.removeItem("role");

    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar-pemberi">

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
          className={({ isActive }) =>
            `sidebar-penerima-link ${isActive ? "active" : ""}`
          }
        >
          <LayoutDashboard size={20} />
          <span>Beranda</span>
        </NavLink>

        <NavLink
          to="/informasizakat"
          className={({ isActive }) =>
            `sidebar-penerima-link ${isActive ? "active" : ""}`
          }
        >
          <FileText size={20} />
          <span>Informasi Zakat</span>
        </NavLink>

        <NavLink
          to="/daftarevent"
          className={({ isActive }) =>
            `sidebar-penerima-link ${isActive ? "active" : ""}`
          }
        >
          <CalendarDays size={20} />
          <span>Daftar Event</span>
        </NavLink>

        <NavLink
          to="/riwayatdonasi"
          className={({ isActive }) =>
            `sidebar-penerima-link ${isActive ? "active" : ""}`
          }
        >
          <History size={20} />
          <span>Riwayat Donasi</span>
        </NavLink>

      </nav>

      {/* KELUAR DI BAGIAN BAWAH */}
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
  );
};

export default SidebarPemberi;
