import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_URL = "http://localhost:5000/api";
const QUESTIONS_PER_PAGE = 5;

// ==================================================
// MEMBACA RESPONS SERVER
// ==================================================

async function readResponse(response, actionName) {
    const responseText = await response.text();

    console.log(`[${actionName}] Status:`, response.status);
    console.log(`[${actionName}] Respons:`, responseText);

    let result;

    try {
        result = responseText ? JSON.parse(responseText) : {};
    } catch {
        throw new Error(
            `Respons server saat ${actionName} bukan JSON.`
        );
    }

    if (!response.ok) {
        throw new Error(
            result.message || `Gagal ${actionName}.`
        );
    }

    return result;
}

// ==================================================
// NORMALISASI TIPE PERTANYAAN DATABASE
// ==================================================

function normalisasiTipe(tipe) {
    const tipeJawaban = String(tipe || "")
        .trim()
        .toLowerCase();

    const tipeMap = {
        pilihan: "radio",
        radio: "radio",

        dropdown: "dropdown",

        checkbox: "checkbox",

        singkat: "text",
        text: "text",

        paragraf: "textarea",

        angka: "number",
        number: "number",

        tanggal: "date",

        waktu: "time",

        skala: "number",

        file: "text",
    };

    return tipeMap[tipeJawaban] || tipeJawaban;
}

// ==================================================
// MEMERIKSA JAWABAN
// ==================================================

function jawabanSudahDiisi(value) {
    if (Array.isArray(value)) {
        return value.length > 0;
    }

    return (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
    );
}

// ==================================================
// KOMPONEN KUESIONER
// ==================================================

function Kuisioner() {
    const navigate = useNavigate();
    const location = useLocation();

    const nikPenerima = location.state?.nik;

    // ==================================================
    // STATE
    // ==================================================

    const [questions, setQuestions] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);

    const [answers, setAnswers] = useState({});

    const [evidence, setEvidence] = useState({});

    const [errorMessage, setErrorMessage] = useState("");

    const [isLoadingQuestions, setIsLoadingQuestions] =
        useState(true);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // ==================================================
    // AMBIL PERTANYAAN DARI DATABASE
    // ==================================================

    useEffect(() => {
        let isMounted = true;

        const fetchQuestions = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/admin/pertanyaan/semua`
                );

                const result = await readResponse(
                    response,
                    "mengambil pertanyaan"
                );

                const dataPertanyaan = Array.isArray(result.data)
                    ? result.data
                    : [];

                const pertanyaanDatabase = dataPertanyaan.map(
                    (item) => {
                        let opsiJawaban = item.opsi_jawaban;

                        // Antisipasi jika opsi masih berbentuk JSON string.
                        if (typeof opsiJawaban === "string") {
                            try {
                                opsiJawaban = JSON.parse(
                                    opsiJawaban
                                );
                            } catch {
                                opsiJawaban = [];
                            }
                        }

                        if (!Array.isArray(opsiJawaban)) {
                            opsiJawaban = [];
                        }

                        return {
                            id: Number(item.id_pertanyaan),

                            id_kriteria: Number(
                                item.id_kriteria
                            ),

                            question: item.pertanyaan,

                            type: normalisasiTipe(
                                item.tipe_jawaban
                            ),

                            options: opsiJawaban,

                            required: Boolean(
                                item.wajib_diisi
                            ),

                            showEvidence: Boolean(
                                item.tampilkan_upload_jika_ya
                            ),

                            uploadWajib: Boolean(
                                item.upload_wajib
                            ),

                            labelUpload:
                                item.label_upload ||
                                "Bukti Pendukung",
                        };
                    }
                );

                if (isMounted) {
                    setQuestions(pertanyaanDatabase);
                }
            } catch (error) {
                console.error(
                    "Gagal mengambil pertanyaan database:",
                    error
                );

                if (isMounted) {
                    setErrorMessage(
                        error.message ||
                        "Gagal mengambil pertanyaan dari database."
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoadingQuestions(false);
                }
            }
        };

        fetchQuestions();

        return () => {
            isMounted = false;
        };
    }, []);

    // ==================================================
    // PAGINATION
    // ==================================================

    const totalPages = Math.ceil(
        questions.length / QUESTIONS_PER_PAGE
    );

    const startIndex =
        (currentPage - 1) * QUESTIONS_PER_PAGE;

    const currentQuestions = questions.slice(
        startIndex,
        startIndex + QUESTIONS_PER_PAGE
    );

    // ==================================================
    // MENYIMPAN JAWABAN
    // ==================================================

    const handleAnswer = (questionId, value) => {
        setAnswers((previousAnswers) => ({
            ...previousAnswers,
            [questionId]: value,
        }));

        // Jika jawaban bukan Ya, hapus bukti pendukung.
        if (value !== "Ya") {
            setEvidence((previousEvidence) => {
                const updatedEvidence = {
                    ...previousEvidence,
                };

                delete updatedEvidence[questionId];

                return updatedEvidence;
            });
        }

        setErrorMessage("");
    };

    // ==================================================
    // MENYIMPAN JAWABAN CHECKBOX
    // ==================================================

    const handleCheckboxAnswer = (
        questionId,
        option,
        checked
    ) => {
        const previousValue = answers[questionId] || [];

        let updatedValue;

        if (checked) {
            updatedValue = [
                ...previousValue,
                option,
            ];
        } else {
            updatedValue = previousValue.filter(
                (item) => item !== option
            );
        }

        handleAnswer(questionId, updatedValue);
    };

    // ==================================================
    // MENYIMPAN BUKTI PENDUKUNG
    // ==================================================

    const handleEvidence = (questionId, file) => {
        if (!file) return;

        setEvidence((previousEvidence) => ({
            ...previousEvidence,
            [questionId]: file,
        }));

        setErrorMessage("");
    };

    // ==================================================
    // VALIDASI PERTANYAAN
    // ==================================================

    const validateQuestions = (questionList) => {
        const unansweredQuestions = questionList.filter(
            (question) => {
                // Pertanyaan opsional boleh tidak dijawab.
                if (!question.required) {
                    return false;
                }

                return !jawabanSudahDiisi(
                    answers[question.id]
                );
            }
        );

        const missingEvidence = questionList.filter(
            (question) =>
                question.uploadWajib &&
                answers[question.id] === "Ya" &&
                !evidence[question.id]
        );

        if (unansweredQuestions.length > 0) {
            setErrorMessage(
                "Masih ada pertanyaan wajib yang belum dijawab. " +
                "Silakan lengkapi terlebih dahulu."
            );

            return false;
        }

        if (missingEvidence.length > 0) {
            setErrorMessage(
                "Ada bukti pendukung wajib yang belum diunggah."
            );

            return false;
        }

        setErrorMessage("");

        return true;
    };

    // ==================================================
    // HALAMAN BERIKUTNYA
    // ==================================================

    const handleNext = () => {
        if (!validateQuestions(currentQuestions)) {
            return;
        }

        if (currentPage < totalPages) {
            setCurrentPage(
                (previousPage) => previousPage + 1
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    // ==================================================
    // HALAMAN SEBELUMNYA
    // ==================================================

    const handlePrevious = () => {
        setErrorMessage("");

        if (currentPage > 1) {
            setCurrentPage(
                (previousPage) => previousPage - 1
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    // ==================================================
    // SUBMIT KUESIONER
    // ==================================================

    const handleSubmit = async () => {
        if (isSubmitting) return;

        if (!nikPenerima) {
            setErrorMessage(
                "NIK calon penerima tidak ditemukan. " +
                "Silakan ulangi proses pendaftaran."
            );

            return;
        }

        // Pastikan seluruh pertanyaan wajib sudah dijawab.
        if (!validateQuestions(questions)) {
            return;
        }

        // Hanya kirim pertanyaan yang sudah dijawab.
        // Pertanyaan opsional yang kosong tidak dikirim.
        const jawabanKuesioner = questions
            .filter((question) =>
                jawabanSudahDiisi(
                    answers[question.id]
                )
            )
            .map((question) => ({
                id_pertanyaan: Number(
                    question.id
                ),

                nilai_jawaban:
                    answers[question.id],
            }));

        if (jawabanKuesioner.length === 0) {
            setErrorMessage(
                "Belum ada jawaban yang dapat disimpan."
            );

            return;
        }

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            // ==================================================
            // 1. SIMPAN JAWABAN KUESIONER
            // ==================================================

            const response = await fetch(
                `${API_URL}/jawaban-kuesioner`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        nik_penerima: nikPenerima,

                        jawaban: jawabanKuesioner,
                    }),
                }
            );

            const jawabanData = await readResponse(
                response,
                "menyimpan jawaban kuesioner"
            );

            // ==================================================
            // 2. AMBIL TOKEN PENGAJUAN
            // ==================================================

            const tokenPengajuan =
                jawabanData.pengajuan?.token_verifikasi;

            if (!tokenPengajuan) {
                throw new Error(
                    "Jawaban berhasil disimpan, tetapi token " +
                    "pengajuan tidak ditemukan dari server."
                );
            }

            // ==================================================
            // 3. UNGGAH BUKTI PENDUKUNG
            // ==================================================

            for (const question of questions) {
                const file = evidence[question.id];

                // Upload hanya jika jawaban Ya dan ada file.
                if (
                    !file ||
                    answers[question.id] !== "Ya"
                ) {
                    continue;
                }

                const formData = new FormData();

                formData.append("file", file);

                formData.append(
                    "nik_penerima",
                    nikPenerima
                );

                // Backend upload membutuhkan ID KRITERIA.
                formData.append(
                    "id_kriteria",
                    String(question.id_kriteria)
                );

                const uploadResponse = await fetch(
                    `${API_URL}/bukti-pendukung`,
                    {
                        method: "POST",

                        body: formData,
                    }
                );

                await readResponse(
                    uploadResponse,
                    `mengunggah bukti pertanyaan ${question.id}`
                );
            }

            // ==================================================
            // 4. ARAHKAN KE HALAMAN STATUS
            // ==================================================

            navigate(
                `/pengajuan/${encodeURIComponent(
                    tokenPengajuan
                )}`
            );
        } catch (error) {
            console.error(
                "Gagal menyimpan kuesioner:",
                error
            );

            setErrorMessage(
                error.message ||
                "Terjadi kesalahan saat menyimpan kuesioner."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // ==================================================
    // LOADING PERTANYAAN
    // ==================================================

    if (isLoadingQuestions) {
        return (
            <>
                <Navbar />

                <main className="kuesioner-page">
                    <section className="kuesioner-header">
                        <h1>Kuesioner Kelayakan Mustahiq</h1>

                        <p>
                            Memuat pertanyaan dari database...
                        </p>
                    </section>
                </main>

                <Footer />
            </>
        );
    }

    // ==================================================
    // TAMPILAN UTAMA
    // ==================================================

    return (
        <>
            <Navbar />

            <main className="kuesioner-page">
                <section className="kuesioner-header">
                    <h1>Kuesioner Kelayakan Mustahiq</h1>

                    <p>
                        Jawablah setiap pertanyaan sesuai
                        dengan kondisi Anda yang sebenarnya.
                    </p>

                    <div className="progress-info">
                        <span>
                            Halaman {currentPage} dari {totalPages}
                        </span>

                        <span>
                            {questions.length} Pertanyaan
                        </span>
                    </div>

                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${
                                    totalPages > 0
                                        ? (currentPage / totalPages) * 100
                                        : 0
                                }%`,
                            }}
                        />
                    </div>
                </section>

                {/* ==================================================
                    POPUP ERROR
                ================================================== */}

                {errorMessage && (
                    <div className="popup-overlay">
                        <div
                            className="popup-alert"
                            role="alertdialog"
                            aria-modal="true"
                            aria-labelledby="popup-title"
                        >
                            <div className="popup-alert-icon">
                                !
                            </div>

                            <h3 id="popup-title">
                                Perhatian!
                            </h3>

                            <p>{errorMessage}</p>

                            <button
                                type="button"
                                onClick={() =>
                                    setErrorMessage("")
                                }
                            >
                                Mengerti
                            </button>
                        </div>
                    </div>
                )}

                {/* ==================================================
                    DAFTAR PERTANYAAN
                ================================================== */}

                {questions.length === 0 ? (
                    <section className="question-container">
                        <p>
                            Belum ada pertanyaan kuesioner
                            yang tersedia di database.
                        </p>
                    </section>
                ) : (
                    <section className="question-container">
                        {currentQuestions.map(
                            (question, index) => (
                                <div
                                    className="question-card"
                                    key={question.id}
                                >
                                    <div className="question-number">
                                        Pertanyaan{" "}
                                        {startIndex + index + 1}
                                    </div>

                                    <h3>
                                        {question.question}

                                        {question.required && (
                                            <span
                                                style={{
                                                    color: "red",
                                                }}
                                            >
                                                {" "}*
                                            </span>
                                        )}
                                    </h3>

                                    {/* =================================
                                        RADIO / PILIHAN
                                    ================================= */}

                                    {question.type === "radio" && (
                                        <div className="answer-options">
                                            {question.options.map(
                                                (option) => (
                                                    <label
                                                        key={option}
                                                        className="answer-option"
                                                    >
                                                        <input
                                                            type="radio"

                                                            name={`question-${question.id}`}

                                                            value={option}

                                                            checked={
                                                                answers[
                                                                    question.id
                                                                ] === option
                                                            }

                                                            onChange={() =>
                                                                handleAnswer(
                                                                    question.id,
                                                                    option
                                                                )
                                                            }
                                                        />

                                                        <span>
                                                            {option}
                                                        </span>
                                                    </label>
                                                )
                                            )}
                                        </div>
                                    )}

                                    {/* =================================
                                        DROPDOWN
                                    ================================= */}

                                    {question.type === "dropdown" && (
                                        <select
                                            className="answer-input"

                                            value={
                                                answers[
                                                    question.id
                                                ] || ""
                                            }

                                            onChange={(event) =>
                                                handleAnswer(
                                                    question.id,
                                                    event.target.value
                                                )
                                            }
                                        >
                                            <option value="">
                                                Pilih jawaban
                                            </option>

                                            {question.options.map(
                                                (option) => (
                                                    <option
                                                        key={option}
                                                        value={option}
                                                    >
                                                        {option}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    )}

                                    {/* =================================
                                        CHECKBOX
                                    ================================= */}

                                    {question.type === "checkbox" && (
                                        <div className="answer-options">
                                            {question.options.map(
                                                (option) => (
                                                    <label
                                                        key={option}
                                                        className="answer-option"
                                                    >
                                                        <input
                                                            type="checkbox"

                                                            checked={
                                                                (
                                                                    answers[
                                                                        question.id
                                                                    ] || []
                                                                ).includes(
                                                                    option
                                                                )
                                                            }

                                                            onChange={(
                                                                event
                                                            ) =>
                                                                handleCheckboxAnswer(
                                                                    question.id,
                                                                    option,
                                                                    event.target.checked
                                                                )
                                                            }
                                                        />

                                                        <span>
                                                            {option}
                                                        </span>
                                                    </label>
                                                )
                                            )}
                                        </div>
                                    )}

                                    {/* =================================
                                        TEXT
                                    ================================= */}

                                    {question.type === "text" && (
                                        <input
                                            type="text"

                                            className="answer-input"

                                            value={
                                                answers[
                                                    question.id
                                                ] || ""
                                            }

                                            onChange={(event) =>
                                                handleAnswer(
                                                    question.id,
                                                    event.target.value
                                                )
                                            }

                                            placeholder="Masukkan jawaban Anda"
                                        />
                                    )}

                                    {/* =================================
                                        TEXTAREA
                                    ================================= */}

                                    {question.type === "textarea" && (
                                        <textarea
                                            className="answer-input"

                                            rows={4}

                                            value={
                                                answers[
                                                    question.id
                                                ] || ""
                                            }

                                            onChange={(event) =>
                                                handleAnswer(
                                                    question.id,
                                                    event.target.value
                                                )
                                            }

                                            placeholder="Masukkan jawaban Anda"
                                        />
                                    )}

                                    {/* =================================
                                        NUMBER
                                    ================================= */}

                                    {question.type === "number" && (
                                        <input
                                            type="number"

                                            className="answer-input"

                                            value={
                                                answers[
                                                    question.id
                                                ] || ""
                                            }

                                            onChange={(event) =>
                                                handleAnswer(
                                                    question.id,
                                                    event.target.value
                                                )
                                            }

                                            placeholder="Masukkan angka"
                                        />
                                    )}

                                    {/* =================================
                                        DATE
                                    ================================= */}

                                    {question.type === "date" && (
                                        <input
                                            type="date"

                                            className="answer-input"

                                            value={
                                                answers[
                                                    question.id
                                                ] || ""
                                            }

                                            onChange={(event) =>
                                                handleAnswer(
                                                    question.id,
                                                    event.target.value
                                                )
                                            }
                                        />
                                    )}

                                    {/* =================================
                                        TIME
                                    ================================= */}

                                    {question.type === "time" && (
                                        <input
                                            type="time"

                                            className="answer-input"

                                            value={
                                                answers[
                                                    question.id
                                                ] || ""
                                            }

                                            onChange={(event) =>
                                                handleAnswer(
                                                    question.id,
                                                    event.target.value
                                                )
                                            }
                                        />
                                    )}

                                    {/* =================================
                                        BUKTI PENDUKUNG
                                    ================================= */}

                                    {(question.showEvidence ||
                                        question.uploadWajib) &&
                                        answers[question.id] === "Ya" && (
                                            <div className="evidence-upload">
                                                <label>
                                                    {question.labelUpload}
                                                </label>

                                                <p>
                                                    Pertanyaan ini membutuhkan
                                                    bukti pendukung.
                                                    Silakan unggah dokumen
                                                    yang sesuai.
                                                </p>

                                                {question.uploadWajib && (
                                                    <small>
                                                        Bukti wajib diunggah.
                                                    </small>
                                                )}

                                                <input
                                                    type="file"

                                                    accept=".jpg,.jpeg,.png,.pdf"

                                                    onChange={(event) =>
                                                        handleEvidence(
                                                            question.id,
                                                            event.target.files[0]
                                                        )
                                                    }
                                                />

                                                {evidence[
                                                    question.id
                                                ] && (
                                                    <small>
                                                        File dipilih:{" "}
                                                        {
                                                            evidence[
                                                                question.id
                                                            ].name
                                                        }
                                                    </small>
                                                )}
                                            </div>
                                        )}
                                </div>
                            )
                        )}
                    </section>
                )}

                {/* ==================================================
                    NAVIGASI
                ================================================== */}

                <div className="question-navigation">
                    <button
                        type="button"
                        onClick={handlePrevious}
                        disabled={
                            currentPage === 1 ||
                            isSubmitting ||
                            questions.length === 0
                        }
                    >
                        Sebelumnya
                    </button>

                    {currentPage < totalPages ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={
                                isSubmitting ||
                                questions.length === 0
                            }
                        >
                            Berikutnya
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={
                                isSubmitting ||
                                questions.length === 0
                            }
                        >
                            {isSubmitting
                                ? "Menyimpan..."
                                : "Selesai"}
                        </button>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}

export default Kuisioner;
