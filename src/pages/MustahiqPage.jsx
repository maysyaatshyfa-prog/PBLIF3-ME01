import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import mustahiqImage from "../assets/mustahiq.png";

function MustahiqPage() {
    return (
        <>
            <Navbar />

            <main className="information-detail">
                <div className="detail-wrapper">

                    {/* Gambar */}
                    <div className="detail-image-wrapper">
                        <img
                            src={mustahiqImage}
                            alt="Ilustrasi Mustahiq"
                            className="detail-image"
                        />
                    </div>

                    {/* Isi */}
                    <div className="detail-content">
                        <span className="detail-number">01</span>

                        <h1>Apa itu Mustahiq?</h1>

                        <p className="detail-description">
                            Mustahiq adalah orang atau golongan yang berhak
                            menerima zakat sesuai dengan ketentuan syariat
                            Islam. Zakat diberikan kepada pihak yang memenuhi
                            kriteria dan termasuk dalam golongan penerima zakat.
                        </p>

                        <div className="detail-sections">

                            <div className="detail-section">
                                <h3>Pengertian Mustahiq</h3>
                                <p>
                                    Mustahiq berasal dari kata yang memiliki
                                    makna orang yang berhak menerima sesuatu.
                                    Dalam konteks zakat, mustahiq adalah pihak
                                    yang berhak menerima zakat berdasarkan
                                    ketentuan yang telah ditetapkan.
                                </p>
                            </div>

                            <div className="detail-section">
                                <h3>Siapa yang Berhak Menerima Zakat?</h3>
                                <p>
                                    Penerima zakat terdiri dari delapan golongan
                                    atau asnaf yang telah ditentukan dalam
                                    syariat Islam. Setiap golongan memiliki
                                    kondisi dan kriteria yang berbeda.
                                </p>
                            </div>

                            <div className="detail-section">
                                <h3>Tujuan Penentuan Mustahiq</h3>
                                <p>
                                    Penentuan mustahiq bertujuan membantu proses
                                    penyaluran zakat agar diberikan kepada
                                    orang yang sesuai dengan kriteria penerima
                                    zakat.
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </main>
             {
    /* FOOTER */
    }

    <Footer />
</>);
}

export default MustahiqPage;