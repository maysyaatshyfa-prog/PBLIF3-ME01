
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getQuestions } from "../data/questions";

const API_URL = "http://localhost:5000/api";
const QUESTIONS_PER_PAGE = 5;

// Membaca respons server.
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
        throw new Error(result.message || `Gagal ${actionName}.`);
    }

    return result;
}

function Kuisioner() {
    const navigate = useNavigate();
    const location = useLocation();

    const nikPenerima = location.state?.nik;

    const [questions, setQuestions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [answers, setAnswers] = useState({});
    const [evidence, setEvidence] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mengambil pertanyaan aktif.
    useEffect(() => {
        const data = getQuestions();
        setQuestions(data.filter((question) => question.active));
    }, []);

    const totalPages = Math.ceil(
        questions.length / QUESTIONS_PER_PAGE
    );

    const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;

    const currentQuestions = questions.slice(
        startIndex,
        startIndex + QUESTIONS_PER_PAGE
    );

    // Menyimpan jawaban.
    const handleAnswer = (questionId, value) => {
        setAnswers((previousAnswers) => ({
            ...previousAnswers,
            [questionId]: value,
        }));

        if (value === "Tidak") {
            setEvidence((previousEvidence) => {
                const updatedEvidence = { ...previousEvidence };
                delete updatedEvidence[questionId];
                return updatedEvidence;
            });
        }

        setErrorMessage("");
    };

    // Menyimpan bukti pendukung.
    const handleEvidence = (questionId, file) => {
        if (!file) return;

        setEvidence((previousEvidence) => ({
            ...previousEvidence,
            [questionId]: file,
        }));

        setErrorMessage("");
    };

    // Memvalidasi halaman saat ini.
    const validateCurrentPage = () => {
        const unansweredQuestions = currentQuestions.filter(
            (question) => {
                const answer = answers[question.id];

                return (
                    answer === undefined ||
                    answer === null ||
                    String(answer).trim() === ""
                );
            }
        );

        const missingEvidence = currentQuestions.filter(
            (question) =>
                question.requireEvidence &&
                answers[question.id] === "Ya" &&
                !evidence[question.id]
        );

        if (unansweredQuestions.length > 0) {
            setErrorMessage(
                "Masih ada pertanyaan yang belum dijawab. " +
                "Silakan lengkapi terlebih dahulu."
            );
            return false;
        }

        if (missingEvidence.length > 0) {
            setErrorMessage(
                "Ada bukti pendukung yang belum diunggah."
            );
            return false;
        }

        setErrorMessage("");
        return true;
    };

    // Halaman berikutnya.
    const handleNext = () => {
        if (!validateCurrentPage()) return;

        if (currentPage < totalPages) {
            setCurrentPage((previousPage) => previousPage + 1);

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    // Halaman sebelumnya.
    const handlePrevious = () => {
        setErrorMessage("");

        if (currentPage > 1) {
            setCurrentPage((previousPage) => previousPage - 1);

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    // Mengirim jawaban dan bukti pendukung.
    
const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!nikPenerima) {
        setErrorMessage(
            "NIK calon penerima tidak ditemukan. " +
            "Silakan ulangi proses pendaftaran."
        );
        return;
    }

    const unansweredQuestions = questions.filter((question) => {
        const answer = answers[question.id];

        return (
            answer === undefined ||
            answer === null ||
            String(answer).trim() === ""
        );
    });

    const missingEvidence = questions.filter(
        (question) =>
            question.requireEvidence &&
            answers[question.id] === "Ya" &&
            !evidence[question.id]
    );

    if (unansweredQuestions.length > 0) {
        setErrorMessage(
            "Masih ada pertanyaan yang belum dijawab. " +
            "Silakan lengkapi terlebih dahulu."
        );
        return;
    }

    if (missingEvidence.length > 0) {
        setErrorMessage(
            "Masih ada bukti pendukung yang belum diunggah."
        );
        return;
    }

    const jawabanKuesioner = questions.map((question) => ({
        id_kriteria: Number(question.id),
        nilai_jawaban: answers[question.id],
    }));

    setErrorMessage("");
    setIsSubmitting(true);

    try {
        // 1. Simpan jawaban kuesioner.
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

        // 2. Ambil token dari respons backend.
        const tokenPengajuan =
            jawabanData.pengajuan?.token_verifikasi;

        if (!tokenPengajuan) {
            throw new Error(
                "Jawaban berhasil disimpan, tetapi token " +
                "pengajuan tidak ditemukan dari server."
            );
        }

        // 3. Unggah bukti pendukung.
        for (const question of questions) {
            const file = evidence[question.id];

            if (!file || answers[question.id] !== "Ya") {
                continue;
            }

            const formData = new FormData();

            formData.append("file", file);
            formData.append("nik_penerima", nikPenerima);
            formData.append(
                "id_kriteria",
                String(question.id)
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

        // 4. Arahkan ke halaman status menggunakan token.
        navigate(
            `/pengajuan/${encodeURIComponent(tokenPengajuan)}`
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

    return (
        <>
            <Navbar />

            <main className="kuesioner-page">
                <section className="kuesioner-header">
                    <h1>Kuesioner Kelayakan Mustahiq</h1>

                    <p>
                        Jawablah setiap pertanyaan sesuai dengan
                        kondisi Anda yang sebenarnya.
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

                {errorMessage && (
                    <div className="popup-overlay">
                        <div
                            className="popup-alert"
                            role="alertdialog"
                            aria-modal="true"
                            aria-labelledby="popup-title"
                        >
                            <div className="popup-alert-icon">!</div>

                            <h3 id="popup-title">Perhatian!</h3>

                            <p>{errorMessage}</p>

                            <button
                                type="button"
                                onClick={() => setErrorMessage("")}
                            >
                                Mengerti
                            </button>
                        </div>
                    </div>
                )}

                <section className="question-container">
                    {currentQuestions.map((question, index) => (
                        <div
                            className="question-card"
                            key={question.id}
                        >
                            <div className="question-number">
                                Pertanyaan {startIndex + index + 1}
                            </div>

                            <h3>{question.question}</h3>

                            {question.type === "radio" && (
                                <div className="answer-options">
                                    {question.options.map((option) => (
                                        <label
                                            key={option}
                                            className="answer-option"
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${question.id}`}
                                                value={option}
                                                checked={
                                                    answers[question.id] === option
                                                }
                                                onChange={(event) =>
                                                    handleAnswer(
                                                        question.id,
                                                        event.target.value
                                                    )
                                                }
                                            />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {question.type === "text" && (
                                <input
                                    type="text"
                                    className="answer-input"
                                    value={answers[question.id] || ""}
                                    onChange={(event) =>
                                        handleAnswer(
                                            question.id,
                                            event.target.value
                                        )
                                    }
                                    placeholder="Masukkan jawaban Anda"
                                />
                            )}

                            {question.type === "number" && (
                                <input
                                    type="number"
                                    className="answer-input"
                                    value={answers[question.id] || ""}
                                    onChange={(event) =>
                                        handleAnswer(
                                            question.id,
                                            event.target.value
                                        )
                                    }
                                    placeholder="Masukkan nominal"
                                />
                            )}

                            {question.requireEvidence &&
                                answers[question.id] === "Ya" && (
                                    <div className="evidence-upload">
                                        <label>Bukti Pendukung</label>

                                        <p>
                                            Pertanyaan ini membutuhkan
                                            bukti pendukung. Silakan
                                            unggah dokumen yang sesuai.
                                        </p>

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

                                        {evidence[question.id] && (
                                            <small>
                                                File dipilih:{" "}
                                                {evidence[question.id].name}
                                            </small>
                                        )}
                                    </div>
                                )}
                        </div>
                    ))}
                </section>

                <div className="question-navigation">
                    <button
                        type="button"
                        onClick={handlePrevious}
                        disabled={currentPage === 1 || isSubmitting}
                    >
                        Sebelumnya
                    </button>

                    {currentPage < totalPages ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={isSubmitting}
                        >
                            Berikutnya
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Menyimpan..." : "Selesai"}
                        </button>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}

export default Kuisioner;
