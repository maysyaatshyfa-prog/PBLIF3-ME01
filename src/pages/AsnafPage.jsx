import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import asnafImage from "../assets/8asnaf.png";

function AsnafPage() {
const asnaf = [
{
number: "01",
title: "Fakir",
description:
"Orang yang hampir tidak memiliki harta maupun penghasilan sehingga tidak mampu memenuhi kebutuhan pokoknya."
},
{
number: "02",
title: "Miskin",
description:
"Orang yang memiliki penghasilan atau harta, tetapi belum mencukupi kebutuhan pokok sehari-hari."
},
{
number: "03",
title: "Amil",
description:
"Orang yang diberi tugas untuk mengelola, mengumpulkan, mencatat, dan menyalurkan zakat."
},
{
number: "04",
title: "Muallaf",
description:
"Orang yang sedang didekatkan atau diteguhkan hatinya kepada Islam dan dapat termasuk penerima zakat sesuai ketentuan."
},
{
number: "05",
title: "Riqab",
description:
"Pihak yang berada dalam kondisi perbudakan dan membutuhkan bantuan untuk memperoleh kebebasan."
},
{
number: "06",
title: "Gharim",
description:
"Orang yang memiliki utang untuk kebutuhan yang dibenarkan dan tidak mampu melunasinya."
},
{
number: "07",
title: "Fisabilillah",
description:
"Pihak yang berjuang atau melakukan kegiatan di jalan Allah sesuai dengan ketentuan syariat."
},
{
number: "08",
title: "Ibnu Sabil",
description:
"Musafir yang mengalami kesulitan dalam perjalanan dan membutuhkan bantuan untuk melanjutkan perjalanannya."
}
];

return (
<>
    <Navbar />

    <main className="information-detail">
        <div className="detail-wrapper">

            {/* Gambar */}
            <div className="detail-image-wrapper">
                <img src={asnafImage} alt="Ilustrasi 8 Asnaf" className="detail-image" />
            </div>

            {/* Isi */}
            <div className="detail-content">
                <span className="detail-number">02</span>

                <h1>8 Asnaf</h1>

                <p className="detail-description">
                    Dalam Islam, terdapat delapan golongan yang berhak
                    menerima zakat. Golongan tersebut disebut sebagai
                    asnaf dan telah dijelaskan dalam ketentuan syariat.
                </p>

                <div className="detail-sections">
                    {asnaf.map((item) => (
                    <div className="detail-section" key={item.number}>
                        <h3>
                            {item.number}. {item.title}
                        </h3>

                        <p>{item.description}</p>
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

export default AsnafPage;