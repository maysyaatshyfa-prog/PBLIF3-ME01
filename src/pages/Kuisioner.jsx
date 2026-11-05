import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const QUESTIONS_PER_PAGE = 5;

const DAFTAR_ASNAF = [
  "fakir",
  "miskin",
  "amil",
  "muallaf",
  "riqab",
  "gharim",
  "fisabilillah",
  "ibnu-sabil",
];

function bacaPertanyaanAdmin() {
  const semuaPertanyaan = [];

  DAFTAR_ASNAF.forEach((asnaf) => {
    try {
      const data = JSON.parse(
        localStorage.getItem(`kriteria-${asnaf}`) || "[]"
      );

      if (Array.isArray(data)) {
        data.forEach((item) => {
          semuaPertanyaan.push({
            ...item,
            id: String(item.id),
            asnaf,
            wajibDiisi: item.wajibDiisi ?? true,
            opsi: Array.isArray(item.opsi) ? item.opsi : [],
          });
        });
      }
    } catch (error) {
      console.error(`Gagal membaca kriteria ${asnaf}:`, error);
    }
  });

  return semuaPertanyaan;
}

function Kuisioner() {
  const navigate = useNavigate();
  const location = useLocation();
  const nikPenerima = location.state?.nik;

 const [questions] = useState(() => bacaPertanyaanAdmin());
const [currentPage, setCurrentPage] = useState(1);
const [answers, setAnswers] = useState({});
const [evidence, setEvidence] = useState({});
const [errorMessage, setErrorMessage] = useState("");

  const totalPages = Math.ceil(
    questions.length / QUESTIONS_PER_PAGE
  );

  const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;

  const currentQuestions = questions.slice(
    startIndex,
    startIndex + QUESTIONS_PER_PAGE
  );

  function jawabanKosong(jawaban) {
    if (Array.isArray(jawaban)) {
      return jawaban.length === 0;
    }

    return (
      jawaban === undefined ||
      jawaban === null ||
      String(jawaban).trim() === ""
    );
  }

  function handleAnswer(questionId, value) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));

    setErrorMessage("");
  }

  function handleEvidence(questionId, file) {
    if (!file) return;

    setEvidence((prev) => ({
      ...prev,
      [questionId]: file,
    }));

    setErrorMessage("");
  }

  function validateQuestions(daftarPertanyaan) {
    const unanswered = daftarPertanyaan.find(
      (question) =>
        question.wajibDiisi &&
        jawabanKosong(answers[question.id])
    );

    if (unanswered) {
      setErrorMessage(
        `Pertanyaan "${unanswered.pertanyaan}" wajib dijawab.`
      );
      return false;
    }

    const missingFile = daftarPertanyaan.find(
      (question) =>
        question.tipeJawaban === "file" &&
        question.wajibDiisi &&
        !evidence[question.id]
    );

    if (missingFile) {
      setErrorMessage(
        `Silakan unggah dokumen untuk pertanyaan "${missingFile.pertanyaan}".`
      );
      return false;
    }

    return true;
  }

  function validateCurrentPage() {
    if (!validateQuestions(currentQuestions)) {
      return false;
    }

    setErrorMessage("");
    return true;
  }

  function handleNext() {
    if (!validateCurrentPage()) return;

    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  function handlePrevious() {
    setErrorMessage("");

    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  async function handleSubmit() {
    if (!nikPenerima) {
      setErrorMessage(
        "NIK calon penerima tidak ditemukan. Silakan ulangi proses pendaftaran."
      );
      return;
    }

    if (questions.length === 0) {
      setErrorMessage(
        "Belum ada pertanyaan kuesioner yang dibuat oleh admin."
      );
      return;
    }

    if (!validateQuestions(questions)) return;

    const jawabanKuesioner = questions.map((question) => ({
      id_kriteria: question.id,
      kode_kriteria: question.kode,
      asnaf: question.asnaf,
      pertanyaan: question.pertanyaan,
      nilai_jawaban: answers[question.id] ?? null,
    }));

    const formData = new FormData();

    formData.append("nik_penerima", nikPenerima);
    formData.append("jawaban", JSON.stringify(jawabanKuesioner));

    Object.entries(evidence).forEach(([questionId, file]) => {
      formData.append(`bukti_${questionId}`, file);
    });

    setErrorMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/jawaban-kuesioner",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(
          result.message || "Gagal menyimpan jawaban kuesioner."
        );
        return;
      }

      alert(result.message || "Jawaban kuesioner berhasil disimpan.");

      navigate("/pengajuan", {
        state: {
          nik: nikPenerima,
        },
      });
    } catch (error) {
      console.error("Gagal menyimpan jawaban kuesioner:", error);

      setErrorMessage(
        "Tidak dapat terhubung ke backend. Pastikan server berjalan."
      );
    }
  }

  function renderJawaban(question) {
    const id = question.id;
    const nilai = answers[id] ?? "";

    switch (question.tipeJawaban) {
      case "singkat":
        return (
          <input
            type="text"
            className="answer-input"
            value={nilai}
            onChange={(e) => handleAnswer(id, e.target.value)}
            placeholder="Masukkan jawaban Anda"
          />
        );

      case "paragraf":
        return (
          <textarea
            className="answer-input"
            rows={4}
            value={nilai}
            onChange={(e) => handleAnswer(id, e.target.value)}
            placeholder="Tuliskan jawaban Anda"
          />
        );

      case "pilihan":
        return (
          <div className="answer-options">
            {question.opsi.map((opsi) => (
              <label key={opsi} className="answer-option">
                <input
                  type="radio"
                  name={`question-${id}`}
                  value={opsi}
                  checked={nilai === opsi}
                  onChange={() => handleAnswer(id, opsi)}
                />
                <span>{opsi}</span>
              </label>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <div className="answer-options">
            {question.opsi.map((opsi) => {
              const pilihan = Array.isArray(nilai) ? nilai : [];

              return (
                <label key={opsi} className="answer-option">
                  <input
                    type="checkbox"
                    checked={pilihan.includes(opsi)}
                    onChange={(e) => {
                      const hasil = e.target.checked
                        ? [...pilihan, opsi]
                        : pilihan.filter((item) => item !== opsi);

                      handleAnswer(id, hasil);
                    }}
                  />
                  <span>{opsi}</span>
                </label>
              );
            })}
          </div>
        );

      case "dropdown":
        return (
          <select
            className="answer-input"
            value={nilai}
            onChange={(e) => handleAnswer(id, e.target.value)}
          >
            <option value="">Pilih jawaban</option>
            {question.opsi.map((opsi) => (
              <option key={opsi} value={opsi}>
                {opsi}
              </option>
            ))}
          </select>
        );

      case "tanggal":
        return (
          <input
            type="date"
            className="answer-input"
            value={nilai}
            onChange={(e) => handleAnswer(id, e.target.value)}
          />
        );

      case "waktu":
        return (
          <input
            type="time"
            className="answer-input"
            value={nilai}
            onChange={(e) => handleAnswer(id, e.target.value)}
          />
        );

      case "file":
        return (
          <div className="evidence-upload">
            <label>Unggah dokumen</label>
            <p>Format yang didukung: JPG, PNG, atau PDF.</p>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) =>
                handleEvidence(id, e.target.files?.[0])
              }
            />
            {evidence[id] && (
              <small>File dipilih: {evidence[id].name}</small>
            )}
          </div>
        );

      case "skala":
        return (
          <div className="answer-options">
            {[1, 2, 3, 4, 5].map((angka) => (
              <label key={angka} className="answer-option">
                <input
                  type="radio"
                  name={`question-${id}`}
                  value={angka}
                  checked={String(nilai) === String(angka)}
                  onChange={() => handleAnswer(id, angka)}
                />
                <span>{angka}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <p>Jenis jawaban untuk pertanyaan ini belum didukung.</p>
        );
    }
  }

  return (
    <>
      <Navbar />

      <main className="kuesioner-page">
        <section className="kuesioner-header">
          <h1>Kuesioner Kelayakan Mustahiq</h1>
          <p>
            Jawablah setiap pertanyaan sesuai dengan kondisi Anda
            yang sebenarnya.
          </p>

          {questions.length > 0 && (
            <>
              <div className="progress-info">
                <span>
                  Halaman {currentPage} dari {totalPages}
                </span>
                <span>{questions.length} Pertanyaan</span>
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
            </>
          )}
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

        {questions.length === 0 ? (
          <section className="question-container">
            <div className="question-card">
              <h3>Belum ada pertanyaan kuesioner</h3>
              <p>
                Admin perlu membuat dan menyimpan pertanyaan terlebih
                dahulu sebelum kuesioner dapat diisi.
              </p>
            </div>
          </section>
        ) : (
          <>
            <section className="question-container">
              {currentQuestions.map((question, index) => (
                <div className="question-card" key={question.id}>
                <div className="question-number">
                    Pertanyaan {startIndex + index + 1}
                </div>

                <h3>{question.pertanyaan}</h3>

                {renderJawaban(question)}
                </div>
              ))}
            </section>

            <div className="question-navigation">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentPage === 1}
              >
                Sebelumnya
              </button>

              {currentPage < totalPages ? (
                <button type="button" onClick={handleNext}>
                  Berikutnya
                </button>
              ) : (
                <button type="button" onClick={handleSubmit}>
                  Selesai
                </button>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}

export default Kuisioner;
