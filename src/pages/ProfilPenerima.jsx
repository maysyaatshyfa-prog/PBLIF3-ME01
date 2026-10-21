
import { useEffect, useState } from "react";
import {
    Eye,
    EyeOff,
    Pencil,
    UserRound,
    MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SidebarPenerima from "../components/SidebarPenerima";

const API_URL = "http://localhost:5000/api";

const profilAwal = {
    nik: "",
    nomor_pengajuan: "",
    nama_lengkap: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    usia: "",
    jenis_kelamin: "",
    email: "",
    no_hp: "",
    provinsi: "",
    kota: "",
    kecamatan: "",
    kelurahan: "",
    alamat_lengkap: "",
    status_pernikahan: "",
    jumlah_tanggungan: 0,
    pekerjaan: "",
    created_at: "",
    status_akun: "",
    status_pengajuan: "",
    golongan_mustahik: "",
};

function ProfilPenerima() {
    const navigate = useNavigate();

    const [akun] = useState(() => {
        try {
            return JSON.parse(
                sessionStorage.getItem("akun") || "null"
            );
        } catch {
            return null;
        }
    });

    const [tab, setTab] = useState("data");
    const [lihatNIK, setLihatNIK] = useState(false);
    const [modeEdit, setModeEdit] = useState(false);
    const [memuat, setMemuat] = useState(() => {
        const data = JSON.parse(sessionStorage.getItem("akun") || "null");
        const akunLogin = data?.akun || data;
        const nikLogin = String(akunLogin?.id || akunLogin?.nik || "").trim();

        return /^\d{16}$/.test(nikLogin);
    });
    const [menyimpan, setMenyimpan] = useState(false);
    const [pesan, setPesan] = useState("");
    const [jenisPesan, setJenisPesan] = useState("info");

    const [profil, setProfil] = useState(profilAwal);
    const [profilAsli, setProfilAsli] = useState(profilAwal);

    const dataAkun = akun?.akun || akun;

    const nik = String(
        dataAkun?.id || dataAkun?.nik || ""
    ).trim();

    useEffect(() => {
        if (!akun || !/^[0-9]{16}$/.test(nik)) {
            navigate("/login", { replace: true });
        }
    }, [akun, nik, navigate]);

    useEffect(() => {
        if (!nik || !/^\d{16}$/.test(nik)) {
    return;
}

        const controller = new AbortController();

        async function ambilProfil() {
            try {
                setMemuat(true);
                setPesan("");

                const response = await fetch(
                    `${API_URL}/penerima/dashboard/${encodeURIComponent(nik)}`,
                    { signal: controller.signal }
                );

                const hasil = await response.json();

                if (!response.ok) {
                    throw new Error(
                        hasil.message || "Gagal mengambil profil."
                    );
                }

                if (!hasil.penerima) {
                    throw new Error(
                        "Data profil penerima tidak ditemukan."
                    );
                }

                
                const data = {
                   ...profilAwal,
                   ...hasil.penerima,

                   tanggal_lahir: hasil.penerima.tanggal_lahir ?
                   String(hasil.penerima.tanggal_lahir).slice(0, 10) :
                "",
            };

setProfil(data);
setProfilAsli(data);

            } catch (error) {
                if (error.name !== "AbortError") {
                    setPesan(
                        error.message ||
                        "Tidak dapat terhubung ke server."
                    );
                    setJenisPesan("error");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setMemuat(false);
                }
            }
        }

        ambilProfil();

        return () => controller.abort();
    }, [nik]);

    const ubahField = (event) => {
        const { name, value } = event.target;

        setProfil((sebelumnya) => ({
            ...sebelumnya,
            [name]:
                name === "jumlah_tanggungan"
                    ? value === "" ? "" : Number(value)
                    : value,
        }));
    };

    const mulaiEdit = () => {
        setProfilAsli({ ...profil });
        setPesan("");
        setModeEdit(true);
    };

    const batalEdit = () => {
        setProfil({ ...profilAsli });
        setModeEdit(false);
        setPesan("");
    };

    
const simpanProfil = async () => {
    setMenyimpan(true);
    setPesan("");

    try {
        const response = await fetch(
            `${API_URL}/penerima/profil/${encodeURIComponent(nik)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nama_lengkap: profil.nama_lengkap,
                    tempat_lahir: profil.tempat_lahir,
                    tanggal_lahir: String(profil.tanggal_lahir || "").slice(0, 10),
                    jenis_kelamin: profil.jenis_kelamin,
                    email: profil.email,
                    no_hp: profil.no_hp,
                    provinsi: profil.provinsi,
                    kota: profil.kota,
                    kecamatan: profil.kecamatan,
                    kelurahan: profil.kelurahan,
                    alamat_lengkap: profil.alamat_lengkap,
                    status_pernikahan: profil.status_pernikahan,
                    jumlah_tanggungan: profil.jumlah_tanggungan,
                    pekerjaan: profil.pekerjaan,
                }),
            }
        );

        const hasil = await response.json();

        if (!response.ok) {
            throw new Error(
                hasil.message || "Gagal menyimpan profil."
            );
        }

        setProfil((sebelumnya) => ({
            ...sebelumnya,
            ...hasil.penerima,
        }));

        setProfilAsli((sebelumnya) => ({
            ...sebelumnya,
            ...hasil.penerima,
        }));

        setModeEdit(false);
        setPesan(hasil.message || "Profil berhasil diperbarui.");
        setJenisPesan("info");
    } catch (error) {
        setPesan(
            error.message || "Tidak dapat terhubung ke server."
        );
        setJenisPesan("error");
    } finally {
        setMenyimpan(false);
    }
};


    const nilai = (value) => {
        if (value === null || value === undefined || value === "") {
            return "-";
        }

        return value;
    };

    const tanggal = (value) => {
        if (!value) return "-";

        const teks = String(value).slice(0, 10);
        const bagian = teks.split("-");

        if (bagian.length !== 3 || bagian[0].length !== 4) {
            return value;
        }

        const [tahun, bulan, hari] = bagian;

        const date = new Date(
            Number(tahun),
            Number(bulan) - 1,
            Number(hari)
        );

        if (Number.isNaN(date.getTime())) return value;

        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const dataWilayah = [
        { label: "Provinsi", field: "provinsi" },
        { label: "Kota/Kabupaten", field: "kota" },
        { label: "Kecamatan", field: "kecamatan" },
        { label: "Kelurahan", field: "kelurahan" },
    ];

    const renderField = (label, field, options = {}) => {
        const {
            tipe = "text",
            edit = true,
        } = options;

        return (
            <div className="profil-field" key={field}>
                <label>{label}</label>

                {modeEdit && edit ? (
                    <input
                        type={tipe}
                        name={field}
                        value={profil[field] ?? ""}
                        onChange={ubahField}
                        min={
                            field === "jumlah_tanggungan"
                                ? 0
                                : undefined
                        }
                    />
                ) : (
                    <span>
                        {field === "tanggal_lahir"
                            ? tanggal(profil[field])
                            : nilai(profil[field])}
                    </span>
                )}
            </div>
        );
    };

    return (
        <div className="profil-penerima-layout">
            <SidebarPenerima />

            <main className="profil-penerima-main">
                <header className="profil-penerima-header">
                    <div>
                        <h1>Profil Penerima</h1>
                        <p>Kelola informasi data diri Anda.</p>
                    </div>

                    <div className="profil-penerima-akun">
                        <div className="profil-penerima-avatar kecil">
                            <UserRound size={22} />
                        </div>

                        <div>
                            <strong>
                                {profil.nama_lengkap ||
                                    dataAkun?.nama_lengkap ||
                                    "Penerima"}
                            </strong>
                            <span>Penerima</span>
                        </div>
                    </div>
                </header>

                {pesan && (
                    <div
                        className={`profil-penerima-pesan ${
                            jenisPesan === "error" ? "error" : ""
                        }`}
                        role="status"
                    >
                        {pesan}
                    </div>
                )}

                {memuat ? (
                    <div className="profil-penerima-card">
                        Memuat profil penerima...
                    </div>
                ) : (
                    <section className="profil-penerima-grid">
                        <article className="profil-penerima-identitas">
                            <div className="profil-penerima-avatar besar">
                                <UserRound size={54} />
                            </div>

                            <h2>{nilai(profil.nama_lengkap)}</h2>

                            <span className="profil-penerima-status">
                                <span className="status-dot" />
                                {profil.status_pengajuan === "Diterima"
                                    ? "Penerima Terverifikasi"
                                    : nilai(profil.status_pengajuan)}
                            </span>

                            <div className="profil-penerima-info-singkat">
                                <div className="profil-nik-label">
                                    NIK
                                </div>

                                <div className="profil-nik-value">
                                    <span>
                                        {lihatNIK
                                            ? nilai(profil.nik)
                                            : profil.nik
                                                ? `${"*".repeat(
                                                    Math.max(
                                                        0,
                                                        String(profil.nik).length - 4
                                                    )
                                                )}${String(profil.nik).slice(-4)}`
                                                : "-"}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setLihatNIK((v) => !v)
                                        }
                                        aria-label={
                                            lihatNIK
                                                ? "Samarkan NIK"
                                                : "Lihat NIK"
                                        }
                                    >
                                        {lihatNIK
                                            ? <EyeOff size={16} />
                                            : <Eye size={16} />}
                                    </button>
                                </div>

                                <div className="profil-detail-mini">
                                    <span>Nomor Pengajuan</span>
                                    <strong>
                                        {nilai(profil.nomor_pengajuan)}
                                    </strong>
                                </div>

                                <div className="profil-detail-mini">
                                    <span>Tanggal Bergabung</span>
                                    <strong>
                                        {tanggal(profil.created_at)}
                                    </strong>
                                </div>

                                <div className="profil-detail-mini">
                                    <span>Golongan Mustahik</span>
                                    <strong>
                                        {nilai(profil.golongan_mustahik)}
                                    </strong>
                                </div>
                            </div>
                        </article>

                        <article className="profil-penerima-detail">
                            <div className="profil-penerima-tabs">
                                <button
                                    type="button"
                                    className={tab === "data" ? "aktif" : ""}
                                    onClick={() => setTab("data")}
                                >
                                    Data Diri
                                </button>

                                <button
                                    type="button"
                                    className={tab === "alamat" ? "aktif" : ""}
                                    onClick={() => setTab("alamat")}
                                >
                                    Alamat
                                </button>
                            </div>

                            <div className="profil-penerima-fields">
                                {tab === "data" ? (
                                    <>
                                        {renderField(
                                            "NIK",
                                            "nik",
                                            { edit: false }
                                        )}

                                        {renderField(
                                            "Nama Lengkap",
                                            "nama_lengkap"
                                        )}

                                        {renderField(
                                            "Tempat Lahir",
                                            "tempat_lahir"
                                        )}

                                        {renderField(
                                            "Tanggal Lahir",
                                            "tanggal_lahir",
                                            { tipe: "date" }
                                        )}

                                        <div className="profil-field">
                                            <label>Jenis Kelamin</label>

                                            {modeEdit ? (
                                                <select
                                                    name="jenis_kelamin"
                                                    value={profil.jenis_kelamin || ""}
                                                    onChange={ubahField}
                                                >
                                                    <option value="">
                                                        Pilih jenis kelamin
                                                    </option>
                                                    <option value="Laki-laki">
                                                        Laki-laki
                                                    </option>
                                                    <option value="Perempuan">
                                                        Perempuan
                                                    </option>
                                                </select>
                                            ) : (
                                                <span>
                                                    {nilai(profil.jenis_kelamin)}
                                                </span>
                                            )}
                                        </div>

                                        {renderField("No. HP", "no_hp")}

                                        {renderField(
                                            "Email",
                                            "email",
                                            { tipe: "email" }
                                        )}

                                        {renderField("Pekerjaan", "pekerjaan")}

                                        {renderField(
                                            "Status Pernikahan",
                                            "status_pernikahan"
                                        )}

                                        {renderField(
                                            "Jumlah Tanggungan",
                                            "jumlah_tanggungan",
                                            { tipe: "number" }
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {dataWilayah.map(({ label, field }) =>
                                            renderField(label, field)
                                        )}

                                        <div className="profil-field">
                                            <label>
                                                <MapPin size={15} />
                                                Alamat Lengkap
                                            </label>

                                            {modeEdit ? (
                                                <textarea
                                                    name="alamat_lengkap"
                                                    value={profil.alamat_lengkap || ""}
                                                    onChange={ubahField}
                                                    rows={3}
                                                />
                                            ) : (
                                                <span>
                                                    {nilai(profil.alamat_lengkap)}
                                                </span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="profil-penerima-actions">
                                {modeEdit ? (
                                    <>
                                        <button
                                            type="button"
                                            className="btn-profil-batal"
                                            onClick={batalEdit}
                                            disabled={menyimpan}
                                        >
                                            Batal
                                        </button>
                                        <button type="button" className="btn-profil-ubah" onClick={simpanProfil} disabled={menyimpan}>
                                           {menyimpan ? "Menyimpan..." : "Simpan"}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn-profil-ubah"
                                        onClick={mulaiEdit}
                                    >
                                        <Pencil size={15} />
                                        Ubah Data
                                    </button>
                                )}
                            </div>
                        </article>
                    </section>
                )}
            </main>
        </div>
    );
}

export default ProfilPenerima;
