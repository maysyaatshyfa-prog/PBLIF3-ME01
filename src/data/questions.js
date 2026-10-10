export const defaultQuestions = [
  // FAKIR
  {
    id: 1,
    asnaf: "Fakir",
    question: "Apakah penghasilan Anda tidak mencukupi kebutuhan pokok sehari-hari?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: true,
  },
  {
    id: 2,
    asnaf: "Fakir",
    question: "Apakah Anda tidak memiliki penghasilan tetap?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: true,
  },
  {
    id: 3,
    asnaf: "Fakir",
    question: "Apakah kebutuhan makanan sehari-hari Anda sulit terpenuhi?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },
  {
    id: 4,
    asnaf: "Fakir",
    question: "Apakah Anda mengalami kesulitan dalam memenuhi kebutuhan tempat tinggal?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },
  {
    id: 5,
    asnaf: "Fakir",
    question: "Apakah Anda tidak memiliki sumber daya yang cukup untuk memenuhi kebutuhan dasar?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },

  // MISKIN
  {
    id: 6,
    asnaf: "Miskin",
    question: "Apakah penghasilan Anda hanya mampu memenuhi sebagian kebutuhan pokok?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },
  {
    id: 7,
    asnaf: "Miskin",
    question: "Apakah Anda memiliki penghasilan tetapi masih kesulitan memenuhi kebutuhan sehari-hari?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },
  {
    id: 8,
    asnaf: "Miskin",
    question: "Apakah Anda memiliki tanggungan keluarga yang cukup banyak?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },
  {
    id: 9,
    asnaf: "Miskin",
    question: "Apakah penghasilan keluarga Anda berada di bawah kebutuhan hidup yang layak?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },
  {
    id: 10,
    asnaf: "Miskin",
    question: "Apakah Anda kesulitan memenuhi biaya pendidikan anggota keluarga?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },
  {
    id: 11,
    asnaf: "Miskin",
    question: "Apakah Anda kesulitan memenuhi kebutuhan kesehatan keluarga?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },

  // GHARIMIN
  {
    id: 12,
    asnaf: "Gharimin",
    question: "Apakah Anda memiliki utang untuk memenuhi kebutuhan dasar?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: true,
  },
  {
    id: 13,
    asnaf: "Gharimin",
    question: "Apakah utang tersebut harus segera dibayarkan?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: true,
  },
  {
    id: 14,
    asnaf: "Gharimin",
    question: "Apakah Anda tidak memiliki kemampuan untuk melunasi utang tersebut?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },
  {
    id: 15,
    asnaf: "Gharimin",
    question: "Apakah utang tersebut bukan digunakan untuk kegiatan yang dilarang?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },
  {
    id: 16,
    asnaf: "Gharimin",
    question: "Apakah pelunasan utang tersebut akan mengganggu kebutuhan pokok Anda?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },

  // IBNU SABIL
  {
    id: 17,
    asnaf: "Ibnu Sabil",
    question: "Apakah Anda sedang dalam perjalanan dan mengalami kekurangan biaya?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: true,
  },
  {
    id: 18,
    asnaf: "Ibnu Sabil",
    question: "Apakah Anda tidak memiliki akses terhadap sumber dana yang dapat digunakan?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },
  {
    id: 19,
    asnaf: "Ibnu Sabil",
    question: "Apakah bantuan diperlukan agar Anda dapat melanjutkan perjalanan?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },
  {
    id: 20,
    asnaf: "Ibnu Sabil",
    question: "Apakah kondisi tersebut terjadi bukan karena perjalanan untuk melakukan maksiat?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },

  // MUALAF
  {
    id: 21,
    asnaf: "Mualaf",
    question: "Apakah Anda merupakan seseorang yang baru memeluk agama Islam?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: true,
  },
  {
    id: 22,
    asnaf: "Mualaf",
    question: "Apakah Anda membutuhkan bantuan untuk memenuhi kebutuhan setelah memeluk Islam?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },
  {
    id: 23,
    asnaf: "Mualaf",
    question: "Apakah Anda mengalami kesulitan dalam beradaptasi dengan kehidupan setelah menjadi Muslim?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },
  {
    id: 24,
    asnaf: "Mualaf",
    question: "Apakah Anda membutuhkan dukungan untuk memperkuat keislaman?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },

  // AMIL
  {
    id: 25,
    asnaf: "Amil",
    question: "Apakah Anda terlibat dalam kegiatan pengelolaan zakat?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },
  {
    id: 26,
    asnaf: "Amil",
    question: "Apakah Anda menjalankan tugas pengumpulan atau pendistribusian zakat?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },
  {
    id: 27,
    asnaf: "Amil",
    question: "Apakah Anda ditugaskan secara resmi sebagai pengelola zakat?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: true,
  },

  // FI SABILILLAH
  {
    id: 28,
    asnaf: "Fi Sabilillah",
    question: "Apakah Anda terlibat dalam kegiatan yang bertujuan untuk kepentingan Islam?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },
  {
    id: 29,
    asnaf: "Fi Sabilillah",
    question: "Apakah kegiatan tersebut memberikan manfaat bagi masyarakat?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },
  {
    id: 30,
    asnaf: "Fi Sabilillah",
    question: "Apakah kegiatan tersebut membutuhkan dukungan dana?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },
  {
    id: 31,
    asnaf: "Fi Sabilillah",
    question: "Apakah kegiatan tersebut sesuai dengan prinsip syariat Islam?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },

  // RIQAB
  {
    id: 32,
    asnaf: "Riqab",
    question: "Apakah Anda berada dalam kondisi yang membatasi kebebasan atau hak dasar Anda?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },
  {
    id: 33,
    asnaf: "Riqab",
    question: "Apakah Anda membutuhkan bantuan untuk memperoleh kebebasan dari kondisi tersebut?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },
  {
    id: 34,
    asnaf: "Riqab",
    question: "Apakah Anda tidak memiliki kemampuan finansial untuk menyelesaikan kondisi tersebut?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },
  {
    id: 35,
    asnaf: "Riqab",
    question: "Apakah bantuan zakat dapat membantu Anda memperoleh kebebasan atau hak dasar?",
    type: "radio",
    options: ["Ya", "Tidak"],
    active: true,
    requireEvidence: false,
  },
];

export const getQuestions = () => {
  const savedQuestions = localStorage.getItem("questions");

  if (savedQuestions) {
    const questions = JSON.parse(savedQuestions);

    const updatedQuestions = questions.map((question) => {
      const defaultQuestion = defaultQuestions.find(
        (item) => item.id === question.id
      );

      return {
        ...question,
        requireEvidence: defaultQuestion?.requireEvidence ?? false,
      };
    });

    localStorage.setItem(
      "questions",
      JSON.stringify(updatedQuestions)
    );

    return updatedQuestions;
  }

  localStorage.setItem(
    "questions",
    JSON.stringify(defaultQuestions)
  );

  return defaultQuestions;
};

export const saveQuestions = (questions) => {
  localStorage.setItem(
    "questions",
    JSON.stringify(questions)
  );
};