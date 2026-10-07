import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
Link
}

from "react-router-dom";

import iconPakar from "../assets/pakar-logo.png";
import iconKriteria from "../assets/kriteria-logo.png";
import iconSeleksi from "../assets/seleksi-logo.png";

// Data untuk Features Section
const features=[ {
title: "Berbasis Sistem Pakar",
description: "Menggunakan aturan dan kriteria untuk menentukann kelayakan mustahik.",
icon: iconPakar
}

,
{
title: "Berbasis Kriteria",
description: "Penilaian dilakukan berdasarkan informasi yang diberikan oleh calon mustahik.",
icon: iconKriteria
}

,
{
title: "Seleksi Lebih Terarah",
description: "Membantu proses identifikasi calon penerima zakat agar lebih sistematis.",
icon: iconSeleksi
}

];

// Data untuk work Section
const steps=[ {
title: "Isi Kuisioner",
description: "Mengisi formulir kuesioner dengan data calon penerima zakat yang valid."
}

,
{
title: "Analisis Sistem",
description: "Sistem menganalisis data berdasarkan aturan & kriteria kelayakan zakat."
}

,
{
title: "Hasil Kelayakan",
description: "Sistem mengeluarkan rekomendasi tingkat kelayakan status mustahiq."
}

,
{
title: "Verifikasi & Akses",
description: "Verifikasi akhir oleh pihak pengelola zakat untuk penyaluran bantuan."
}

,
];

const informationCards=[ {
number: "01",
title: "Apa itu Mustahiq?",
description: "Pengertian lengkap tentang Mustahiq dan siapa saja orang yang berhak menerima zakat berdasarkan ketentuan syariat.",
link: "/mustahiq",
}

,
{
number: "02",
title: "8 Asnaf",
description: "Penjelasan 8 Golongan (Asnaf) penerima zakat mulai dari Fakir, Miskin, Amil, hingga Ibnu Sabil.",
link: "/asnaf",
}

,
{
number: "03",
title: "Kriteria Mustahiq",
description: "Indikator dan kriteria penilaian yang digunakan oleh sistem untuk mengukur tingkat kelayakan calon penerima.",
link: "/kriteria",
}

,
];


function LandingPage() {

return (<>
    <Navbar />
    <main> {
        /*hero section*/
        }

        <section className="hero" id="beranda">
            <div className="hero-overlay">
                <p className="hero-label">SISTEM PAKAR PENENTUAN MUSTAHIQ</p>
                <h1>Pastikan Zakat Sampai Kepada yang Berhak</h1>
                <p className="hero-description"> Sistem membantu mengidentifikasi calon penerima zakat berdasarkan
                    kriteria yang telah ditentukan. </p> <a href="/" className="hero-button"> Cek Kelayakan </a>
            </div>
        </section> {
        /*features section*/
        }

        <section className="features" id="tentang">
            <div className="features-text">
                <p className="fea-label">Tentang Sistem</p>
                <h2>Apa itu Sistem Pakar Penentuan Mustahiq ?</h2>
                <p> Sistem ini merupakan aplikasi berbasis website yang membantu proses penentuan kelayakan calon
                    mustahik berdasarkan kriteria penerima zakat yang telah ditetapkan. Sistem menggunakan pendekatan
                    sistem pakar berbasis aturan untuk membantu proses seleksi secara lebih terarah. </p>
            </div>
            <div className="features-cards"> {
                features.map((feature)=> (<article className="features-card" key={ feature.title }>
                    <div className="features-card-icon"> <img src={ feature.icon } alt="" /> </div>
                    <h3> {
                        feature.title
                        }

                    </h3>
                    <p> {
                        feature.description
                        }

                    </p>
                </article>))
                }

            </div>
        </section>
        <section className="steps" id="cara-kerja">
            <div className="steps-header">
                <p className="steps-label">CARA KERJA</p>
                <h2>Bagaimana Sistem Menentukan Mustahik ?</h2>
                <p>Proses penentuan dilakukan melalui beberapa tahapan berdasarkan data, kriteria, dan aturan sistem
                    pakar.</p>
            </div>
            <div className="steps-line"> {
                steps.map((step, index)=> (<div className="step-item" key={ step.title }>
                    <div className="step-top"> <span className="step-number"> 0 {
                            index + 1
                            }

                        </span> <span className="step-dot"></span> </div>
                    <div className="steps-content">
                        <h3> {
                            step.title
                            }

                        </h3>
                        <p> {
                            step.description
                            }

                        </p>
                    </div>
                </div>))
                }

            </div>
        </section>
        <section className="information" id="informasi">
            <div className="information-header">
                <p className="information-label">INFORMASI</p>
                <h2>Kenali Lebih Lanjut tentang Zakat dan Penerima Zakat yang Berhak</h2>
                <p>Informasi penting seputar zakat, mustahiq, dan proses penentuan kelayakan yang perlu Anda ketahui.
                </p>
            </div>
            <div className="information-cards"> {
                informationCards.map((card)=> (
                <Link to={ card.link } className="information-card" key={ card.number }> <span
                    className="information-number"> {
                    card.number
                    }

                </span>
                <h3> {
                    card.title
                    }

                </h3>
                <p> {
                    card.description
                    }

                </p> <span className="information-link"> Pelajari Selengkapnya → </span> </Link>))
                }

            </div>
        </section>
    </main> {
    /* FOOTER */
    }

    <Footer />
</>);
}

export default LandingPage;
