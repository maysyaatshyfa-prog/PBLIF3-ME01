import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    FileText,
    UserRound,
    LogOut,
    Menu,
    X,
} from "lucide-react";

import logoZakatara from "../assets/zakatara-logo.png";

function SidebarPenerima() {
    const navigate = useNavigate();
    const [menuTerbuka, setMenuTerbuka] = useState(false);

    const menu = [
        {
            nama: "Dashboard",
            path: "/dashboardpenerima",
            icon: LayoutDashboard,
        },
        {
            nama: "Riwayat Bantuan",
            path: "/riwayatbantuan",
            icon: FileText,
        },
        {
            nama: "Profil Saya",
            path: "/profilpenerima",
            icon: UserRound,
        },
    ];

    const handleLogout = () => {
        sessionStorage.removeItem("akun");
        sessionStorage.removeItem("role");

        navigate("/login", { replace: true });
    };

    return (
        <>
            {/* Tombol Hamburger */}
            <button
                type="button"
                className="sidebar-penerima-hamburger"
                onClick={() => setMenuTerbuka(!menuTerbuka)}
                aria-label="Buka menu"
            >
                {menuTerbuka ? <X size={25} /> : <Menu size={25} />}
            </button>

            {/* Overlay */}
            {menuTerbuka && (
                <div
                    className="sidebar-penerima-overlay"
                    onClick={() => setMenuTerbuka(false)}
                />
            )}

            <aside
                className={`sidebar-penerima ${
                    menuTerbuka ? "mobile-open" : ""
                }`}
            >
                {/* Logo ZAKATARA */}
                <div className="sidebar-penerima-logo">
                    <img
                        src={logoZakatara}
                        alt="Logo ZAKATARA"
                        className="sidebar-penerima-logo-img"
                    />

                    <div className="sidebar-penerima-logo-text">
                        <span>Portal Penerima Zakat</span>
                    </div>
                </div>

                {/* Menu utama */}
                <div className="sidebar-penerima-label">
                    MENU UTAMA
                </div>

                <nav className="sidebar-penerima-nav">
                    {menu.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/dashboardpenerima"}
                                onClick={() => setMenuTerbuka(false)}
                                className={({ isActive }) =>
                                    `sidebar-penerima-link ${
                                        isActive ? "active" : ""
                                    }`
                                }
                            >
                                <Icon size={20} />
                                <span>{item.nama}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Tombol keluar */}
                <div className="sidebar-penerima-bottom">
                    <button
                        type="button"
                        className="sidebar-penerima-logout"
                        onClick={handleLogout}
                    >
                        <LogOut size={20} />
                        <span>Keluar</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

export default SidebarPenerima;
