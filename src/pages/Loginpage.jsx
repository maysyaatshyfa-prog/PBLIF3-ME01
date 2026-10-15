
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import zakataraLogo from "../assets/zakatara-logo.png";

function LoginPage() {
    const navigate = useNavigate();

    // Data login admin
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // State popup cek status
    const [showTokenModal, setShowTokenModal] = useState(false);
    const [token, setToken] = useState("");
    const [checkingToken, setCheckingToken] = useState(false);
    const [tokenError, setTokenError] = useState("");
    const [tokenResult, setTokenResult] = useState(null);

    // Login admin
    const handleLogin = async (e) => {
        e.preventDefault();

        setLoginError("");
        setIsLoggingIn(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/login/admin",
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

            if (!response.ok) {
                throw new Error(
                    result.message || "Login gagal."
                );
            }

            // Simpan informasi admin untuk tampilan sesi ini
            sessionStorage.setItem(
                "admin",
                JSON.stringify(result.admin)
            );

            navigate("/admin");
        } catch (error) {
            setLoginError(
                error.message || "Terjadi kesalahan saat login."
            );
        } finally {
            setIsLoggingIn(false);
        }
    };

    // Membuka popup cek status
    const bukaPopupToken = () => {
        setToken("");
        setTokenError("");
        setTokenResult(null);
        setShowTokenModal(true);
    };

    // Mengecek status pengajuan menggunakan token
    const handleCekStatus = async (e) => {
        e.preventDefault();

        if (!token.trim()) {
            setTokenError("Masukkan token pengajuan Anda.");
            return;
        }

        setCheckingToken(true);
        setTokenError("");
        setTokenResult(null);

        try {
            const response = await fetch(
                `http://localhost:5000/api/cek-status/${encodeURIComponent(
                    token.trim()
                )}`
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Token tidak ditemukan."
                );
            }

            setTokenResult(result.pengajuan);
        } catch (error) {
            setTokenError(
                error.message || "Gagal mengecek status pengajuan."
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

                    {/* FORM LOGIN */}
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
                            <a href="/#">Lupa kata sandi?</a>
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
                            {isLoggingIn
                                ? "Memeriksa..."
                                : "Masuk"}
                        </button>
                    </form>

                    {/* TOMBOL CEK STATUS */}
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

            {/* POPUP CEK STATUS */}
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

                        {tokenResult && (
                            <div
                                className="token-result"
                                aria-live="polite"
                            >
                                <h3>Informasi Pengajuan</h3>

                                <p>
                                    Nama:{" "}
                                    <strong>
                                        {tokenResult.nama_lengkap}
                                    </strong>
                                </p>

                                <p>
                                    Nomor Pengajuan:{" "}
                                    <strong>
                                        {tokenResult.nomor_pengajuan}
                                    </strong>
                                </p>

                                <p>
                                    Status:{" "}
                                    <strong>
                                        {tokenResult.status_pengajuan}
                                    </strong>
                                </p>

                                {tokenResult.status_pengajuan === "Diterima" ? (
                                    <p className="token-login-hint">
                                        Silakan masuk ke akun Anda untuk
                                        melanjutkan.
                                    </p>
                                ) : tokenResult.status_pengajuan === "Ditolak" ? (
                                    <p className="token-login-hint">
                                        Silakan hubungi admin untuk informasi
                                        lebih lanjut.
                                    </p>
                                ) : (
                                    <p className="token-login-hint">
                                        Silakan tunggu verifikasi dari admin.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default LoginPage;
