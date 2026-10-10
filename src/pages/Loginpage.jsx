import zakataraLogo from "../assets/zakatara-logo.png";

function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-content">
        <div className="login-container">

          <div className="login-logo">
            <img src={zakataraLogo} alt="Zakatara" />
          </div>

          <h1>Masuk ke Akun</h1>

          <p className="login-description">
            Masuk ke akun Anda untuk melanjutkan
          </p>

          <form>
            <div className="form-group">
              <label htmlFor="login">
                Email atau No. HP
              </label>

              <input
                type="text"
                id="login"
                placeholder="Masukkan email atau no. HP"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Kata Sandi
              </label>

              <input
                type="password"
                id="password"
                placeholder="Masukkan kata sandi"
              />
            </div>

            <div className="forgot-password">
              <a href="/#">Lupa kata sandi?</a>
            </div>

            <button
              type="submit"
              className="btn-login"
            >
              Masuk
            </button>
          </form>

          <div className="register-box">
            <p>
              Sudah pernah pengajuan calon penerima?
              <a href="/#">
                 Cek Status Pengajuan →
              </a>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

export default LoginPage;