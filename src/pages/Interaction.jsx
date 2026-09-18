import "./Interaction.css";
import { useState } from "react";
import {
  Search,
  Plus,
  X,
  AlertTriangle,
  ShieldCheck,
  Info,
  Pill,
  Sparkles,
  Trash2,
  CircleX,
} from "lucide-react";

export default function Interaction() {
  const [drug, setDrug] = useState("");
  const [drugs, setDrugs] = useState([]);
  const [analyzed, setAnalyzed] = useState(false);

const [mode, setMode] = useState("ingredient");

const [lookupDrug, setLookupDrug] = useState("");

const [lookupResult, setLookupResult] = useState(null);


  const addDrug = () => {
    if (!drug.trim()) return;

    if (
      drugs.some(
        (d) => d.toLowerCase() === drug.toLowerCase()
      )
    )
      return;

    if (drugs.length >= 10) return;

    setDrugs([...drugs, drug.trim()]);
    setDrug("");
    setAnalyzed(false);
  };

  const removeDrug = (index) => {
  setDrugs(drugs.filter((_, i) => i !== index));
  setAnalyzed(false);
};

  const clearAll = () => {
  setDrugs([]);
  setDrug("");
  setAnalyzed(false);
};

  const handleAnalyze = () => {
  if (drugs.length < 2) return;

  setAnalyzed(true);
};

const fakeLookup = {
  clarithromycin: {
    drug: "Clarithromycin",
    total: 5,
    interactions: [
      {
        drug: "Ivabradin",
        severity: "Chống chỉ định",
        guideline: true,
      },
      {
        drug: "Colchicin",
        severity: "Chống chỉ định",
        guideline: true,
      },
      {
        drug: "Digoxin",
        severity: "Nguy cơ cao",
        guideline: false,
      },
      {
        drug: "Warfarin",
        severity: "Cần thận trọng",
        guideline: false,
      },
      {
        drug: "Simvastatin",
        severity: "Chống chỉ định",
        guideline: true,
      },
    ],
  },
};

const handleLookup = () => {
  const key = lookupDrug.trim().toLowerCase();

  if (!key) return;

  if (fakeLookup[key]) {
    setLookupResult(fakeLookup[key]);
  } else {
    setLookupResult({
      drug: lookupDrug,
      total: 0,
      interactions: [],
    });
  }
};

  return (
    <div className="interaction-page">
      {/* HEADER */}

      <div className="page-header">
        <div>
          <h1>TRA CỨU TƯƠNG TÁC THUỐC</h1>

          <p>
            Theo Quyết định 5948/QĐ-BYT và các tương tác có ý nghĩa lâm sàng
          </p>
        </div>
      </div>

      {/* BODY */}

      <div className="interaction-grid">

        {/* LEFT */}

        <div className="left-card">

          <div className="card-header">

            <h2>Kiểm tra tương tác</h2>

            <p>
              Nhập tên hoạt chất để phân tích
            </p>

          </div>

          {/* TAB */}

          <div className="tabs">

  <button
    className={mode==="prescription" ? "tab active" : "tab"}
    onClick={()=>setMode("prescription")}
  >
    Nhập đơn thuốc
  </button>

  <button
    className={mode==="ingredient" ? "tab active" : "tab"}
    onClick={()=>setMode("ingredient")}
  >
    Nhập hoạt chất
  </button>

  <button
    className={mode==="lookup" ? "tab active" : "tab"}
    onClick={()=>setMode("lookup")}
  >
    Tra cứu
  </button>

</div>

          <div className="divider"></div>

{mode === "lookup" && (

<>

<div className="section-title">

  <Search size={18} />

  <span>TRA CỨU HOẠT CHẤT</span>

</div>

<div className="search-box">

  <Search size={20} />

  <input
    value={lookupDrug}
    placeholder="Ví dụ: Clarithromycin"
    onChange={(e) => setLookupDrug(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") handleLookup();
    }}
  />

  <button
    className="add-button"
    onClick={handleLookup}
  >
    Tra cứu
  </button>

</div>

<div className="hint-box">

  <Info size={17} />

  <span>
    Nhập tên hoạt chất để xem toàn bộ các tương tác
    quan trọng của thuốc này.
  </span>

</div>

</>

)}

{mode === "ingredient" && (

<>


          <div className="section-title">

            <Pill size={18} />

            <span>THÊM HOẠT CHẤT</span>

          </div>

          <div className="search-box">

            <Search size={20} />

            <input
              value={drug}
              placeholder="Ví dụ: Clarithromycin"
              onChange={(e) =>
                setDrug(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") addDrug();
              }}
            />

            <button
              className="add-button"
              onClick={addDrug}
            >
              <Plus size={18} />
              Thêm
            </button>

          </div>

          <div className="drug-header">

            <span>
              Hoạt chất ({drugs.length})
            </span>

            <button
              className="clear-link"
              onClick={clearAll}
            >
              Xóa tất cả
            </button>

          </div>

          <div className="chip-wrapper">

            {drugs.length === 0 ? (
              <div className="empty-chip">

                Chưa có hoạt chất nào

              </div>
            ) : (
              drugs.map((item, index) => (
                <div
                  className="drug-chip"
                  key={index}
                >
                  {item}

                  <X
                    size={15}
                    onClick={() =>
                      removeDrug(index)
                    }
                  />
                </div>
              ))
            )}

          </div>

          <div className="hint-box">

            <Info size={17} />

            <span>
              Khuyến nghị nhập theo tên hoạt chất
              thay vì tên biệt dược để tăng độ
              chính xác.
            </span>

          </div>

          <div className="button-group">

<button
  className="analyze-button"
  onClick={handleAnalyze}
>
              <AlertTriangle size={18} />

              Phân tích tương tác

            </button>

            <button
              className="reset-button"
              onClick={clearAll}
            >

              <Trash2 size={18} />

              Xóa dữ liệu

            </button>

          </div>

          <div className="note-card">

            <Sparkles size={18} />

            <div>
              <strong>Lưu ý</strong>

              <p>
                Kết quả chỉ hỗ trợ quyết định lâm
                sàng, không thay thế đánh giá của
                bác sĩ hoặc dược sĩ.
              </p>

            </div>

          </div>

          </>

)}

        </div>
                {/* RIGHT */}

        <div className="right-card">

          <div className="result-header">

  <div>

    <h2>Mức độ phản ứng</h2>

    <p>Kết quả phân tích tương tác thuốc</p>

  </div>

  <div className="ai-badge">

    <Sparkles size={15} />

    AI Support

  </div>

</div>

<div className="severity-bar">

  <div className="severity red">
    <CircleX size={24} />
    <label>Chống chỉ định</label>
  </div>

  <div className="severity orange">
    <AlertTriangle size={24} />
    <label>Nguy cơ cao</label>
  </div>

  <div className="severity yellow">
    <Info size={24} />
    <label>Cần thận trọng</label>
  </div>

  <div className="severity green">
    <ShieldCheck size={24} />
    <label>Có thể cân nhắc</label>
  </div>


</div>

{mode === "lookup" ? (
  lookupResult === null ? (
    <div className="empty-result">
      <ShieldCheck size={70} />
      <h3>Chưa có dữ liệu</h3>
      <p>Nhập tên hoạt chất rồi bấm Tra cứu.</p>
    </div>
  ) : (
    <>
      <div className="result-item">
        <h3>{lookupResult.drug}</h3>

        <p>
          Có <b>{lookupResult.total}</b> tương tác quan trọng.
        </p>

        <br />

        {lookupResult.interactions.map((item, index) => {

    let severityClass = "";

    switch (item.severity) {
        case "Chống chỉ định":
            severityClass = "contra";
            break;

        case "Nguy cơ cao":
            severityClass = "major";
            break;

        case "Cần thận trọng":
            severityClass = "moderate";
            break;

        default:
            severityClass = "minor";
    }

    return (

        <div
            key={index}
            className={`interaction-row ${severityClass}`}
        >

            <div className="interaction-left">

                {severityClass === "contra" && <CircleX size={30} />}

                {severityClass === "major" && <AlertTriangle size={30} />}

                {severityClass === "moderate" && <Info size={30} />}

                {severityClass === "minor" && <ShieldCheck size={30} />}

                <span>{item.drug}</span>

            </div>

            <div className="interaction-level">

                {item.severity}

            </div>

        </div>

    );

})}
      </div>
    </>
  )
) : !analyzed ? (
  <div className="empty-result">
    <ShieldCheck size={70} />

    <h3>Chưa có dữ liệu phân tích</h3>

    <p>
      Hãy nhập tối thiểu <b>2 hoạt chất</b>
    </p>
  </div>
) : (
  <>
    <div className="result-item danger">
      <h3>Clarithromycin ↔ Ivabradin</h3>

      <span className="level danger">Chống chỉ định</span>

      <div className="interaction-section">
        <h5>✳️ Cơ chế</h5>

        <p>
          Clarithromycin ức chế CYP3A4 mạnh làm giảm chuyển hoá Ivabradin, dẫn đến tăng nồng độ Ivabradin trong máu và tăng nguy cơ chậm nhịp tim.
        </p>

        <h5>⚠️ Hậu quả</h5>

        <p>
          Clarithromycin ức chế CYP3A4 mạnh làm tăng nồng độ Ivabradin.
        </p>


      </div>
    </div>

    <div className="recommend-box">
      <h4>
        <Sparkles size={18} />
        Khuyến nghị lâm sàng
      </h4>

      <ul>
        <li>Chống chỉ định phối hợp 2 thuốc</li>
        <li>Nếu bắt buộc sử dụng kháng sinh, ưu tiên lựa chọn Azithromycin thay thế</li>
      </ul>
    </div>
  </>
)}
            </div>
      </div>
    </div>
  );
}