import { Link, useNavigate, useLocation } from "react-router-dom";
import zakataraLogo from "../assets/zakatara-logo.png";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleScroll = (id) => {
    if (location.pathname !== "/") {
      navigate("/");

      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    } else {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <nav className="navbar">
      <Link
        to="/"
        className="logo"
        onClick={(e) => {
          if (location.pathname === "/") {
            e.preventDefault();
            handleScroll("beranda");
          }
        }}
      >
        <img src={zakataraLogo} alt="Zakatara" />
      </Link>

      <div className="nav-menu">
        <a href="#beranda" onClick={(e) => {
          e.preventDefault();
          handleScroll("beranda");
        }}>
          Beranda
        </a>

        <a href="#tentang" onClick={(e) => {
          e.preventDefault();
          handleScroll("tentang");
        }}>
          Tentang
        </a>

        <a href="#cara-kerja" onClick={(e) => {
          e.preventDefault();
          handleScroll("cara-kerja");
        }}>
          Cara Kerja
        </a>

        <a href="#informasi" onClick={(e) => {
          e.preventDefault();
          handleScroll("informasi");
        }}>
          Informasi
        </a>
      </div>

      <div className="nav-auth">
        <Link to="/login" className="btn-masuk">
          Masuk
        </Link>

        <Link to="/register/options" className="btn-Registrasi">
          Registrasi
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
