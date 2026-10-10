import zakataraLogo from "../assets/zakatara-logo.png";

function Navbar() {
  return (
    <nav className="navbar">
      <a href="#beranda" className="logo">
        <img src={zakataraLogo} alt="Zakatara" />
      </a>

      <div className="nav-menu">
        <a href="/#beranda">Beranda</a>
        <a href="/#tentang">Tentang</a>
        <a href="/#cara-kerja">Cara Kerja</a>
        <a href="/#informasi">Informasi</a>
      </div>

      <div className="nav-auth">
        <a href="/login" className="btn-masuk">Masuk</a>
        <a href="/register/options" className="btn-Registrasi">Registrasi</a>
      </div>
    </nav>
  );
}

export default Navbar;