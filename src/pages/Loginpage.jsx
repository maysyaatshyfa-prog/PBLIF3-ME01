
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import zakataraLogo from "../assets/zakatara-logo.png";

function LoginPage() {
    const navigate = useNavigate();

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const [showTokenModal, setShowTokenModal] = useState(false);
    const [token, setToken] = useState("");
    const [checkingToken, setCheckingToken] = useState(false);
    const [tokenError, setTokenError] = useState("");

    // LOGIN ADMIN, PENERIMA, DAN PEMBERI ZAKAT
    
const handleLogin = async (e) => {
    e.preventDefault();

    setLoginError("");
    setIsLoggingIn(true);

    try {
        const response = await fetch(
            "http://localhost:5000/api/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    login: login.trim(),
                    password,
                }),
            }
        );

        const result = await response.json();

        console.log("Status HTTP:", response.status);
        console.log("Respons login:", result);

        if (!response.ok) {
            throw new Error(result.message || "Login gagal.");
        }

        if (!result.role || !result.akun) {
            throw new Error(
                "Data akun atau role tidak ditemukan dari backend."
            );
        }

        const role = String(result.role).trim().toLowerCase();

        let tujuan;

        if (role === "admin") {
            tujuan = "/admin";
        } else if (role === "penerima") {
            tujuan = "/dashboardpenerima";
        } else if (role === "pemberi") {
            tujuan = "/dashboardpemberi";
        } else {
            throw new Error(`Role "${role}" tidak dikenali.`);
        }

        sessionStorage.setItem(
            "akun",
            JSON.stringify(result.akun)
        );
        sessionStorage.setItem("role", role);

        console.log("Login berhasil. Menuju:", tujuan);

        navigate(tujuan, { replace: true });
    } catch (error) {
        console.error("Kesalahan login:", error);

        setLoginError(
            error instanceof TypeError
                ? "Backend tidak dapat dihubungi. Pastikan server berjalan di port 5000."
                : error.message || "Terjadi kesalahan saat login."
        );
    } finally {
        setIsLoggingIn(false);
    }
};

    // MEMBUKA POPUP CEK STATUS
    const bukaPopupToken = () => {
        setToken("");
        setTokenError("");
        setShowTokenModal(true);
    };

    // CEK STATUS PENGAJUAN
    const handleCekStatus = async (e) => {
        e.preventDefault();

        const tokenInput = token.trim().toUpperCase();

        if (!tokenInput) {
            setTokenError("Masukkan token pengajuan Anda.");
            return;
        }

        setCheckingToken(true);
        setTokenError("");

        try {
            const response = await fetch(
                `http://localhost:5000/api/cek-status/${encodeURIComponent(tokenInput)}`
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Token tidak ditemukan."
                );
            }

            setShowTokenModal(false);
            navigate(`/pengajuan/${encodeURIComponent(tokenInput)}`);
        } catch (error) {
            console.error("Kesalahan cek status:", error);

            setTokenError(
                error instanceof TypeError
                    ? "Backend tidak dapat dihubungi."
                    : error.message || "Gagal mengecek status pengajuan."
            );
        } finally {
            setCheckingToken(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-content">
                <div className="login-container">
                    <div className="login-logo">
                        <img src={zakataraLogo} alt="ZAKATARA" />
                    </div>

                    <h1>Masuk ke Akun</h1>

                    <p className="login-description">
                        Masuk ke akun Anda untuk melanjutkan
                    </p>

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label htmlFor="login">
                                Email atau No. HP
                            </label>

                            <input
                                type="text"
                                id="login"
                                value={login}
                                onChange={(e) =>
                                    setLogin(e.target.value)
                                }
                                placeholder="Masukkan email atau no. HP"
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                Kata Sandi
                            </label>

                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="Masukkan kata sandi"
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <div className="forgot-password">
                            <Link to="/lupa-password">
                                Lupa kata sandi?
                            </Link>
                        </div>

                        {loginError && (
                            <p className="login-error" role="alert">
                                {loginError}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="btn-login"
                            disabled={isLoggingIn}
                        >
                            {isLoggingIn ? "Memeriksa..." : "Masuk"}
                        </button>
                    </form>

                    <div className="register-box">
                        <p>
                            Sudah pernah pengajuan calon penerima?
                        </p>

                        <button
                            type="button"
                            className="status-trigger"
                            onClick={bukaPopupToken}
                        >
                            Cek Status Pengajuan →
                        </button>
                    </div>
                </div>
            </div>

            {showTokenModal && (
                <div
                    className="token-modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowTokenModal(false);
                        }
                    }}
                >
                    <div
                        className="token-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="token-modal-title"
                    >
                        <button
                            type="button"
                            className="token-modal-close"
                            aria-label="Tutup popup"
                            onClick={() => setShowTokenModal(false)}
                        >
                            ×
                        </button>

                        <h2 id="token-modal-title">
                            Cek Status Pengajuan
                        </h2>

                        <p>
                            Masukkan token Anda untuk melihat status
                            pengajuan calon penerima zakat.
                        </p>

                        <form onSubmit={handleCekStatus}>
                            <label htmlFor="token-pengajuan">
                                Token Anda
                            </label>

                            <input
                                type="text"
                                id="token-pengajuan"
                                value={token}
                                onChange={(e) =>
                                    setToken(e.target.value)
                                }
                                placeholder="Masukkan token Anda"
                                autoComplete="off"
                                required
                            />

                            <button
                                type="submit"
                                className="token-submit"
                                disabled={checkingToken}
                            >
                                {checkingToken
                                    ? "Memeriksa..."
                                    : "Cek Status"}
                            </button>
                        </form>

                        {tokenError && (
                            <p className="token-error" role="alert">
                                {tokenError}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default LoginPage;
