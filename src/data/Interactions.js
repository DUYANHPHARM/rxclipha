const interactions = [

  {
    drugA: "aspirin",
    drugB: "warfarin",

    severity: "Contraindicated",

    mechanism:
      "Tăng nguy cơ chảy máu do hiệp đồng chống đông.",

    recommendation:
      "Tránh phối hợp nếu có thể. Nếu bắt buộc cần theo dõi INR và dấu hiệu xuất huyết.",

    evidence: "Lexicomp"
  },

  {
    drugA: "clopidogrel",
    drugB: "omeprazole",

    severity: "Major",

    mechanism:
      "Omeprazole ức chế CYP2C19 làm giảm hoạt hóa clopidogrel.",

    recommendation:
      "Ưu tiên pantoprazole thay thế.",

    evidence: "CPIC"
  },

  {
    drugA: "spironolactone",
    drugB: "perindopril",

    severity: "Moderate",

    mechanism:
      "Tăng nguy cơ tăng kali máu.",

    recommendation:
      "Theo dõi Kali và creatinin định kỳ.",

    evidence: "KDIGO"
  }

];

export default interactions;