import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getQuestions } from "../data/questions";
import { useNavigate } from "react-router-dom";

const QUESTIONS_PER_PAGE = 5;

function Kuisioner() {
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [answers, setAnswers] = useState({});
    const [evidence, setEvidence] = useState({});
    const [errorMessage, setErrorMessage] = useState("");

    // Mengambil pertanyaan
    useEffect(() => {
        const data = getQuestions();

        const activeQuestions = data.filter(
            (question) => question.active
        );

        setQuestions(activeQuestions);
    }, []);

    const totalPages = Math.ceil(
        questions.length / QUESTIONS_PER_PAGE
    );

    const startIndex =
        (currentPage - 1) * QUESTIONS_PER_PAGE;

    const currentQuestions = questions.slice(
        startIndex,
        startIndex + QUESTIONS_PER_PAGE
    );

    // Menyimpan jawaban
    const handleAnswer = (questionId, value) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: value,
        }));

        // Jika jawaban diubah menjadi "Tidak",
        // hapus bukti yang sebelumnya dipilih
        if (value === "Tidak") {
            setEvidence((prev) => {
                const updated = { ...prev };
                delete updated[questionId];
                return updated;
            });
        }

        setErrorMessage("");
    };

    // Menyimpan bukti pendukung
    const handleEvidence = (questionId, file) => {
        if (!file) return;

        setEvidence((prev) => ({
            ...prev,
            [questionId]: file,
        }));

        setErrorMessage("");
    };

    // Cek apakah pertanyaan di halaman sekarang sudah lengkap
    const validateCurrentPage = () => {
        const unansweredQuestions = currentQuestions.filter(
            (question) => !answers[question.id]
        );

        const missingEvidence = currentQuestions.filter(
            (question) =>
                question.requireEvidence &&
                answers[question.id] === "Ya" &&
                !evidence[question.id]
        );

        if (unansweredQuestions.length > 0) {
            setErrorMessage(
                "Masih ada pertanyaan yang belum dijawab. Silakan lengkapi terlebih dahulu."
            );

            return false;
        }

        if (missingEvidence.length > 0) {
            setErrorMessage(
                "Ada bukti pendukung yang belum diupload. Silakan lengkapi terlebih dahulu."
            );

            return false;
        }

        setErrorMessage("");
        return true;
    };

    // Tombol Berikutnya
    const handleNext = () => {
        if (!validateCurrentPage()) {
            return;
        }

        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    // Tombol Sebelumnya
    const handlePrevious = () => {
        setErrorMessage("");

        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    // Tombol Selesai
    const handleSubmit = () => {
        const unansweredQuestions = questions.filter(
            (question) => !answers[question.id]
        );

        const missingEvidence = questions.filter(
            (question) =>
                question.requireEvidence &&
                answers[question.id] === "Ya" &&
                !evidence[question.id]
        );

        // Jika masih ada pertanyaan yang belum dijawab
        if (unansweredQuestions.length > 0) {
            setErrorMessage(
                "Masih ada pertanyaan yang belum dijawab. Silakan lengkapi terlebih dahulu."
            );

            return;
        }

        // Jika masih ada bukti yang belum diupload
        if (missingEvidence.length > 0) {
            setErrorMessage(
                "Masih ada bukti pendukung yang belum diupload. Silakan lengkapi terlebih dahulu."
            );

            return;
        }

        setErrorMessage("");

        console.log("Jawaban pengguna:", answers);
        console.log("Bukti pendukung:", evidence);

        // Setelah semua selesai, pindah ke halaman Pengajuan
        navigate("/pengajuan");
    };

    return (
        <>
            <Navbar />

            <main className="kuesioner-page">

                {/* HEADER */}
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

                {/* PESAN ERROR */}
                {errorMessage && (
                    <div className="question-error">
                        {errorMessage}
                    </div>
                )}

                {/* PERTANYAAN */}
                <section className="question-container">

                    {currentQuestions.map((question, index) => (
                        <div
                            className="question-card"
                            key={question.id}
                        >
                            <div className="question-number">
                                Pertanyaan {startIndex + index + 1}
                            </div>

                            <h3>
                                {question.question}
                            </h3>

                            {/* RADIO */}
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
                                                onChange={(e) =>
                                                    handleAnswer(
                                                        question.id,
                                                        e.target.value
                                                    )
                                                }
                                            />

                                            <span>
                                                {option}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* TEXT */}
                            {question.type === "text" && (
                                <input
                                    type="text"
                                    className="answer-input"
                                    value={
                                        answers[question.id] || ""
                                    }
                                    onChange={(e) =>
                                        handleAnswer(
                                            question.id,
                                            e.target.value
                                        )
                                    }
                                    placeholder="Masukkan jawaban Anda"
                                />
                            )}

                            {/* NUMBER */}
                            {question.type === "number" && (
                                <input
                                    type="number"
                                    className="answer-input"
                                    value={
                                        answers[question.id] || ""
                                    }
                                    onChange={(e) =>
                                        handleAnswer(
                                            question.id,
                                            e.target.value
                                        )
                                    }
                                    placeholder="Masukkan nominal"
                                />
                            )}

                            {/* BUKTI PENDUKUNG */}
                            {question.requireEvidence &&
                                answers[question.id] === "Ya" && (
                                    <div className="evidence-upload">

                                        <label>
                                            Bukti Pendukung
                                        </label>

                                        <p>
                                            Pertanyaan ini membutuhkan
                                            bukti pendukung. Silakan
                                            upload dokumen yang sesuai.
                                        </p>

                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={(e) =>
                                                handleEvidence(
                                                    question.id,
                                                    e.target.files[0]
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

                {/* NAVIGASI */}
                <div className="question-navigation">

                    <button
                        type="button"
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                    >
                        Sebelumnya
                    </button>

                    {currentPage < totalPages ? (
                        <button
                            type="button"
                            onClick={handleNext}
                        >
                            Berikutnya
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                        >
                            Selesai
                        </button>
                    )}

                </div>

            </main>

            <Footer />
        </>
    );
}

export default Kuisioner;