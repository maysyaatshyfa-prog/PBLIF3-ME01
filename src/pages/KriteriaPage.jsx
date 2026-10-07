import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import kriteriaImage from "../assets/kriteria.png";

function KriteriaPage() {
    const kriteria = [
        {
            number: "01",
            title: "Kondisi Ekonomi",
            description:
                "Menilai kondisi ekonomi calon penerima berdasarkan kemampuan dalam memenuhi kebutuhan hidup sehari-hari."
        },
        {
            number: "02",
            title: "Pendapatan",
            description:
                "Menilai jumlah pendapatan yang dimiliki calon penerima untuk mengetahui kemampuan dalam memenuhi kebutuhan pokok."
        },
        {
            number: "03",
            title: "Kebutuhan Pokok",
            description:
                "Menilai apakah kebutuhan dasar seperti makanan, tempat tinggal, pendidikan, dan kebutuhan lainnya dapat terpenuhi."
        },
        {
            number: "04",
            title: "Kondisi Tempat Tinggal",
            description:
                "Menilai kondisi tempat tinggal sebagai salah satu informasi yang dapat digunakan dalam proses penentuan kelayakan."
        },
        {
            number: "05",
            title: "Jumlah Tanggungan",
            description:
                "Menilai jumlah anggota keluarga atau tanggungan yang menjadi tanggung jawab calon penerima."
        }
    ];

    return (
        <>
            <Navbar />

            <main className="information-detail">

                <div className="detail-wrapper">

                    <div className="detail-image-wrapper">
                        <img
                            src={kriteriaImage}
                            alt="Ilustrasi Kriteria Mustahiq"
                            className="detail-image"
                        />
                    </div>

                    <div className="detail-content">

                        <span className="detail-number">
                            03
                        </span>

                        <h1>
                            Kriteria Mustahiq
                        </h1>

                        <p className="detail-description">
                            Kriteria mustahiq merupakan indikator yang digunakan
                            untuk membantu sistem dalam menilai kondisi calon
                            penerima zakat. Informasi yang diberikan akan
                            dianalisis berdasarkan aturan dan kriteria yang
                            telah ditentukan dalam sistem.
                        </p>

                        <div className="detail-sections">

                            {kriteria.map((item) => (
                                <div
                                    className="detail-section"
                                    key={item.number}
                                >
                                    <h3>
                                        {item.number}. {item.title}
                                    </h3>

                                    <p>
                                        {item.description}
                                    </p>
                                </div>
                            ))}

                        </div>

                    </div>

                </div>

            </main>
             {
    /* FOOTER */
    }

    <Footer />
        </>
    );
}

export default KriteriaPage;