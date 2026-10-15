import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getQuestions } from "../data/questions";

const QUESTIONS_PER_PAGE = 5;

function Kuisioner() {
    const navigate = useNavigate();
    const location = useLocation();
    const nikPenerima = location.state?.nik;

    const [questions, setQuestions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [answers, setAnswers] = useState({});
    const [evidence, setEvidence] = useState({});
    const [errorMessage, setErrorMessage] = useState("");

    // Mengambil pertanyaan aktif
    useEffect(() => {
        const data = getQuestions();

        const activeQuestions = data.filter(
            (question) => question.active
        );

        setQuestions(activeQuestions);
    }, []);

    // Menghitung jumlah halaman dan pertanyaan yang ditampilkan
    const totalPages = Math.ceil(
        questions.length / QUESTIONS_PER_PAGE
    );

    const startIndex =
        (currentPage - 1) * QUESTIONS_PER_PAGE;

    const currentQuestions = questions.slice(
        startIndex,
        startIndex + QUESTIONS_PER_PAGE
    );

    // Menyimpan jawaban pengguna
    const handleAnswer = (questionId, value) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: value,
        }));

        // Hapus bukti jika jawaban diubah menjadi "Tidak"
        if (value === "Tidak") {
            setEvidence((prev) => {
                const updated = {
                    ...prev
                };
                delete updated[questionId];
                return updated;
            });
        }

        setErrorMessage("");
    };

    // Menyimpan bukti pendukung yang dipilih
    const handleEvidence = (questionId, file) => {
        if (!file) return;

        setEvidence((prev) => ({
            ...prev,
            [questionId]: file,
        }));

        setErrorMessage("");
    };

    // Memvalidasi pertanyaan pada halaman saat ini
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
    const handleSubmit = async () => {
        // memastikan nik tersedia
        if (!nikPenerima) {
            setErrorMessage(
                "NIK calon penerima tidak ditemukan. Silahkan ulangi proses pendaftaran."
            );
            return;
        }

        // memeriksa jawaban yang belum lengkap
        const unanswerQuestions = questions.filter(
            (question) => !answers[question.id]
        );

         // Memeriksa bukti pendukung yang belum diupload
        const missingEvidence = questions.filter(
            (question) =>
                question.requireEvidence &&
                answers[question.id] === "Ya" &&
                !evidence[question.id]
        );

        if (unanswerQuestions.length > 0) {

            setErrorMessage(
                "Masih ada pertanyaan yang belum dijawab. Silahkan lengkapi terlebih dahulu."
            );
            return;
        }

        if (missingEvidence.length > 0) {
            setErrorMessage(
                "Masih ada bukti pedukung yang belum di upload. Silahkan lengkapi terlebih dahulu."
            );
            return;
        }

        // mengubah jawaban yang ada di react menjadi format yang diterima di backend
        const jawabanKuesioner = questions.map((question) => ({
            id_kriteria: Number(question.id),
            nilai_jawaban: answers[question.id]
        }));

        setErrorMessage("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/jawaban-kuesioner", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        nik_penerima: nikPenerima,
                        jawaban: jawabanKuesioner
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                setErrorMessage(
                    result.message || "Gagal menyimpan jawaban Kuesioner."
                );
                return;
            }

            alert(
                result.message || "Jawaban Kuesioner berhasil disimpan."
            );


            // lanjut kehalaman pengajuan setelah jawaban berhasil disimpan
            navigate("/pengajuan", {
                state: {
                    nik: nikPenerima
                }
            });

        } catch (error) {
            console.error(
                "Gagal menyimpan jawaban kuesioner:",
                error
            );

            setErrorMessage(
                "Tidak dapat terhubung ke backend. pastikan server berjalan."
            );
        }
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
                    <div className="progress-fill" style={{
                                width: `${
                                    totalPages > 0
                                        ? (currentPage / totalPages) * 100
                                        : 0
                                }%`,
                            }} />
                </div>
            </section>

            {/* POPUP PESAN ERROR */}
            {errorMessage && (
            <div className="popup-overlay">
                <div className="popup-alert" role="alertdialog" aria-modal="true" aria-labelledby="popup-title">
                    <div className="popup-alert-icon">!</div>

                    <h3 id="popup-title">Perhatian!</h3>

                    <p>{errorMessage}</p>

                    <button type="button" onClick={()=> setErrorMessage("")}
                        >
                        Mengerti
                    </button>
                </div>
            </div>
            )}

            {/* DAFTAR PERTANYAAN */}
            <section className="question-container">
                {currentQuestions.map((question, index) => (
                <div className="question-card" key={question.id}>
                    <div className="question-number">
                        Pertanyaan {startIndex + index + 1}
                    </div>

                    <h3>{question.question}</h3>

                    {/* PILIHAN RADIO */}
                    {question.type === "radio" && (
                    <div className="answer-options">
                        {question.options.map((option) => (
                        <label key={option} className="answer-option">
                            <input type="radio" name={`question-${question.id}`} value={option} checked={
                                answers[question.id]===option } onChange={(e)=>
                            handleAnswer(
                            question.id,
                            e.target.value
                            )
                            }
                            />

                            <span>{option}</span>
                        </label>
                        ))}
                    </div>
                    )}

                    {/* JAWABAN TEKS */}
                    {question.type === "text" && (
                    <input type="text" className="answer-input" value={answers[question.id] || "" } onChange={(e)=>
                    handleAnswer(
                    question.id,
                    e.target.value
                    )
                    }
                    placeholder="Masukkan jawaban Anda"
                    />
                    )}

                    {/* JAWABAN ANGKA */}
                    {question.type === "number" && (
                    <input type="number" className="answer-input" value={answers[question.id] || "" } onChange={(e)=>
                    handleAnswer(
                    question.id,
                    e.target.value
                    )
                    }
                    placeholder="Masukkan nominal"
                    />
                    )}

                    {/* UPLOAD BUKTI PENDUKUNG */}
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

                        <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e)=>
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

            {/* TOMBOL NAVIGASI */}
            <div className="question-navigation">
                <button type="button" onClick={handlePrevious} disabled={currentPage===1}>
                    Sebelumnya
                </button>

                {currentPage < totalPages ? ( <button type="button" onClick={handleNext}>
                    Berikutnya
                    </button>
                    ) : (
                    <button type="button" onClick={handleSubmit}>
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