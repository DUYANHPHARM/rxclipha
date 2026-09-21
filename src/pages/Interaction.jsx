import "./Interaction.css";
import { useEffect, useRef, useState } from "react";
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

const API_URL =
  "https://script.google.com/macros/s/AKfycbzX_ibLbT_-rz6f5z6i_MV5am4B_lEWwR6HwdpqVj3QYNljZC9SJ00Uvx2-y4pmLpnWDg/exec";

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getSeverityClass(severity) {
  switch (severity) {
    case "Chống chỉ định":
      return "contra";

    case "Nguy cơ cao":
      return "major";

    case "Cần thận trọng":
      return "moderate";

    case "Có thể cần cân nhắc":
      return "minor";

    default:
      return "minor";
  }
}

function getSeverityIcon(severity, size = 30) {
  switch (severity) {
    case "Chống chỉ định":
      return <CircleX size={size} />;

    case "Nguy cơ cao":
      return <AlertTriangle size={size} />;

    case "Cần thận trọng":
      return <Info size={size} />;

    case "Có thể cần cân nhắc":
      return <ShieldCheck size={size} />;

    default:
      return <ShieldCheck size={size} />;
  }
}

function loadInteractions() {
  return new Promise((resolve, reject) => {
    const callbackName =
      "rxcliphaInteractionsCallback";

    const script = document.createElement("script");

    const timeout = setTimeout(() => {
      cleanup();

      reject(
        new Error(
          "Không thể kết nối đến Google Sheets."
        )
      );
    }, 15000);

    function cleanup() {
      clearTimeout(timeout);

      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }

      delete window[callbackName];
    }

    window[callbackName] = (data) => {
      cleanup();

      if (!Array.isArray(data)) {
        reject(
          new Error(
            "Dữ liệu tương tác thuốc không hợp lệ."
          )
        );

        return;
      }

      resolve(data);
    };

    script.onerror = () => {
      cleanup();

      reject(
        new Error(
          "Không thể tải dữ liệu tương tác từ Google Sheets."
        )
      );
    };

    script.src = `${API_URL}?type=interactions`;

    document.body.appendChild(script);
  });
}

export default function Interaction() {
  const [drug, setDrug] = useState("");
  const [drugs, setDrugs] = useState([]);
  const [analyzed, setAnalyzed] = useState(false);

  // Chỉ còn 2 chế độ:
  // ingredient = Nhập hoạt chất
  // lookup = Tra cứu
  const [mode, setMode] = useState("ingredient");

  const [lookupDrug, setLookupDrug] =
    useState("");

  const [lookupResult, setLookupResult] =
    useState(null);

  const [interactionData, setInteractionData] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  const hasLoaded = useRef(false);

  // =========================================================
  // TẢI DỮ LIỆU GOOGLE SHEET
  // =========================================================

  useEffect(() => {
    if (hasLoaded.current) return;

    hasLoaded.current = true;

    async function fetchInteractions() {
      try {
        setLoading(true);
        setLoadError("");

        const data =
          await loadInteractions();

        const activeData = data.filter(
          (item) => {
            const status = String(
              item.TrangThai || ""
            ).trim();

            return (
              status === "Đang sử dụng"
            );
          }
        );

        setInteractionData(
          activeData
        );
      } catch (error) {
        console.error(
          "Lỗi tải dữ liệu tương tác:",
          error
        );

        setLoadError(
          error.message ||
            "Không thể tải dữ liệu tương tác."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchInteractions();
  }, []);

  // =========================================================
  // DANH SÁCH HOẠT CHẤT
  // =========================================================

  const drugSuggestions =
    Array.from(
      new Set(
        interactionData.flatMap(
          (item) => [
            String(
              item.Thuoc1 || ""
            ).trim(),

            String(
              item.Thuoc2 || ""
            ).trim(),
          ]
        )
      )
    )
      .filter(Boolean)
      .sort((a, b) =>
        a.localeCompare(b, "vi")
      );

  // =========================================================
  // THÊM HOẠT CHẤT
  // =========================================================

  const addDrug = () => {
    const value = drug.trim();

    if (!value) return;

    if (
      drugs.some(
        (d) =>
          normalizeText(d) ===
          normalizeText(value)
      )
    ) {
      return;
    }

    if (drugs.length >= 10) return;

    setDrugs([
      ...drugs,
      value,
    ]);

    setDrug("");

    setAnalyzed(false);
  };

  // =========================================================
  // XÓA HOẠT CHẤT
  // =========================================================

  const removeDrug = (index) => {
    setDrugs(
      drugs.filter(
        (_, i) => i !== index
      )
    );

    setAnalyzed(false);
  };

  // =========================================================
  // XÓA TOÀN BỘ
  // =========================================================

  const clearAll = () => {
    setDrugs([]);
    setDrug("");
    setAnalyzed(false);
  };

  // =========================================================
  // TÌM TƯƠNG TÁC 2 CHIỀU
  // =========================================================

  const findInteraction = (
    drugA,
    drugB
  ) => {
    const a =
      normalizeText(drugA);

    const b =
      normalizeText(drugB);

    return interactionData.find(
      (item) => {
        const drug1 =
          normalizeText(
            item.Thuoc1
          );

        const drug2 =
          normalizeText(
            item.Thuoc2
          );

        return (
          (drug1 === a &&
            drug2 === b) ||
          (drug1 === b &&
            drug2 === a)
        );
      }
    );
  };

  // =========================================================
  // PHÂN TÍCH
  // =========================================================

  const handleAnalyze = () => {
    if (drugs.length < 2)
      return;

    setAnalyzed(true);
  };

  // =========================================================
  // TRA CỨU 1 HOẠT CHẤT
  // =========================================================

  const handleLookup = () => {
    const value =
      lookupDrug.trim();

    if (!value) return;

    const key =
      normalizeText(value);

    const results =
      interactionData.filter(
        (item) => {
          const drug1 =
            normalizeText(
              item.Thuoc1
            );

          const drug2 =
            normalizeText(
              item.Thuoc2
            );

          return (
            drug1 === key ||
            drug2 === key
          );
        }
      );

    setLookupResult({
      drug: value,
      total: results.length,
      interactions: results,
    });
  };

  // =========================================================
  // TẠO DANH SÁCH CẶP THUỐC
  // =========================================================

  const analyzedInteractions =
    [];

  if (
    analyzed &&
    drugs.length >= 2
  ) {
    for (
      let i = 0;
      i < drugs.length;
      i++
    ) {
      for (
        let j = i + 1;
        j < drugs.length;
        j++
      ) {
        const result =
          findInteraction(
            drugs[i],
            drugs[j]
          );

        if (result) {
          analyzedInteractions.push(
            {
              drugA: drugs[i],
              drugB: drugs[j],
              data: result,
            }
          );
        }
      }
    }
  }

  return (
    <div className="interaction-page">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="page-header">

        <div>

          <h1>
            TRA CỨU TƯƠNG TÁC THUỐC
          </h1>

          <p>
            Theo Quyết định
            5948/QĐ-BYT và các
            tương tác có ý nghĩa
            lâm sàng
          </p>

        </div>

      </div>

      {/* ================================================= */}
      {/* BODY */}
      {/* ================================================= */}

      <div className="interaction-grid">

        {/* ================================================= */}
        {/* LEFT */}
        {/* ================================================= */}

        <div className="left-card">

          <div className="card-header">

            <h2>
              Kiểm tra tương tác
            </h2>

            <p>
              Nhập tên hoạt chất để
              phân tích
            </p>

          </div>

          {/* ================================================= */}
          {/* TAB - CHỈ CÒN 2 TAB */}
          {/* ================================================= */}

          <div className="tabs">

            <button
              className={
                mode === "ingredient"
                  ? "tab active"
                  : "tab"
              }
              onClick={() =>
                setMode(
                  "ingredient"
                )
              }
            >
              Nhập hoạt chất
            </button>

            <button
              className={
                mode === "lookup"
                  ? "tab active"
                  : "tab"
              }
              onClick={() =>
                setMode("lookup")
              }
            >
              Tra cứu
            </button>

          </div>

          <div className="divider"></div>

          {/* ================================================= */}
          {/* TRA CỨU */}
          {/* ================================================= */}

          {mode === "lookup" && (
            <>

              <div className="section-title">

                <Search size={18} />

                <span>
                  TRA CỨU HOẠT CHẤT
                </span>

              </div>

              <div className="search-box">

                <Search size={20} />

                <input
                  list="interaction-drug-list"
                  value={lookupDrug}
                  placeholder="Ví dụ: Clarithromycin"
                  onChange={(e) =>
                    setLookupDrug(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key ===
                      "Enter"
                    ) {
                      handleLookup();
                    }
                  }}
                />

                <button
                  className="add-button"
                  onClick={
                    handleLookup
                  }
                  disabled={loading}
                >
                  Tra cứu
                </button>

              </div>

              <datalist id="interaction-drug-list">

                {drugSuggestions.map(
                  (
                    item,
                    index
                  ) => (
                    <option
                      value={item}
                      key={index}
                    />
                  )
                )}

              </datalist>

              <div className="hint-box">

                <Info size={17} />

                <span>
                  Nhập tên hoạt chất
                  để xem toàn bộ các
                  tương tác quan trọng
                  của thuốc này.
                </span>

              </div>

              {loading && (
                <div className="hint-box">

                  <Info size={17} />

                  <span>
                    Đang tải dữ liệu
                    tương tác...
                  </span>

                </div>
              )}

              {loadError && (
                <div className="hint-box">

                  <AlertTriangle
                    size={17}
                  />

                  <span>
                    {loadError}
                  </span>

                </div>
              )}

            </>
          )}

          {/* ================================================= */}
          {/* NHẬP HOẠT CHẤT */}
          {/* ================================================= */}

          {mode === "ingredient" && (
            <>

              <div className="section-title">

                <Pill size={18} />

                <span>
                  THÊM HOẠT CHẤT
                </span>

              </div>

              <div className="search-box">

                <Search size={20} />

                <input
                  list="interaction-drug-list-ingredient"
                  value={drug}
                  placeholder="Ví dụ: Clarithromycin"
                  onChange={(e) =>
                    setDrug(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key ===
                      "Enter"
                    ) {
                      addDrug();
                    }
                  }}
                />

                <button
                  className="add-button"
                  onClick={addDrug}
                  disabled={loading}
                >

                  <Plus size={18} />

                  Thêm

                </button>

              </div>

              <datalist id="interaction-drug-list-ingredient">

                {drugSuggestions.map(
                  (
                    item,
                    index
                  ) => (
                    <option
                      value={item}
                      key={index}
                    />
                  )
                )}

              </datalist>

              <div className="drug-header">

                <span>
                  Hoạt chất (
                  {drugs.length}
                  )
                </span>

                <button
                  className="clear-link"
                  onClick={
                    clearAll
                  }
                >
                  Xóa tất cả
                </button>

              </div>

              <div className="chip-wrapper">

                {drugs.length ===
                0 ? (

                  <div className="empty-chip">
                    Chưa có hoạt chất
                    nào
                  </div>

                ) : (

                  drugs.map(
                    (
                      item,
                      index
                    ) => (

                      <div
                        className="drug-chip"
                        key={index}
                      >

                        {item}

                        <X
                          size={15}
                          onClick={() =>
                            removeDrug(
                              index
                            )
                          }
                        />

                      </div>

                    )
                  )

                )}

              </div>

              <div className="hint-box">

                <Info size={17} />

                <span>
                  Khuyến nghị nhập
                  theo tên hoạt chất
                  thay vì tên biệt dược
                  để tăng độ chính xác.
                </span>

              </div>

              <div className="button-group">

                <button
                  className="analyze-button"
                  onClick={
                    handleAnalyze
                  }
                  disabled={
                    loading ||
                    drugs.length <
                      2
                  }
                >

                  <AlertTriangle
                    size={18}
                  />

                  Phân tích tương tác

                </button>

                <button
                  className="reset-button"
                  onClick={
                    clearAll
                  }
                >

                  <Trash2 size={18} />

                  Xóa dữ liệu

                </button>

              </div>

              <div className="note-card">

                <Sparkles size={18} />

                <div>

                  <strong>
                    Lưu ý
                  </strong>

                  <p>
                    Kết quả chỉ hỗ
                    trợ quyết định lâm
                    sàng, không thay thế
                    đánh giá của bác sĩ
                    hoặc dược sĩ.
                  </p>

                </div>

              </div>

            </>
          )}

        </div>

        {/* ================================================= */}
        {/* RIGHT */}
        {/* ================================================= */}

        <div className="right-card">

          <div className="result-header">

            <div>

              <h2>
                Mức độ phản ứng
              </h2>

              <p>
                Kết quả phân tích
                tương tác thuốc
              </p>

            </div>

            <div className="ai-badge">

              <Sparkles size={15} />

              AI Support

            </div>

          </div>

          {/* ================================================= */}
          {/* SEVERITY BAR */}
          {/* ================================================= */}

          <div className="severity-bar">

            <div className="severity red">

              <CircleX size={24} />

              <label>
                Chống chỉ định
              </label>

            </div>

            <div className="severity orange">

              <AlertTriangle size={24} />

              <label>
                Nguy cơ cao
              </label>

            </div>

            <div className="severity yellow">

              <Info size={24} />

              <label>
                Cần thận trọng
              </label>

            </div>

            <div className="severity green">

              <ShieldCheck size={24} />

              <label>
                Có thể cân nhắc
              </label>

            </div>

          </div>

          {/* ================================================= */}
          {/* KẾT QUẢ */}
          {/* ================================================= */}

          {loading ? (

            <div className="empty-result">

              <ShieldCheck
                size={70}
              />

              <h3>
                Đang tải dữ liệu
              </h3>

              <p>
                Đang kết nối với cơ sở
                dữ liệu tương tác
                thuốc.
              </p>

            </div>

          ) : loadError ? (

            <div className="empty-result">

              <CircleX size={70} />

              <h3>
                Không thể tải dữ liệu
              </h3>

              <p>
                Vui lòng kiểm tra kết
                nối Google Sheets.
              </p>

            </div>

          ) : mode === "lookup" ? (

            lookupResult === null ? (

              <div className="empty-result">

                <ShieldCheck
                  size={70}
                />

                <h3>
                  Chưa có dữ liệu
                </h3>

                <p>
                  Nhập tên hoạt chất
                  rồi bấm Tra cứu.
                </p>

              </div>

            ) : lookupResult.total ===
              0 ? (

              <div className="empty-result">

                <ShieldCheck
                  size={70}
                />

                <h3>
                  Không ghi nhận
                  tương tác
                </h3>

                <p>
                  Không tìm thấy
                  tương tác đang sử
                  dụng trong cơ sở dữ
                  liệu đối với{" "}
                  <b>
                    {lookupResult.drug}
                  </b>.
                </p>

              </div>

            ) : (

              <div className="result-item">

                <h3>
                  {lookupResult.drug}
                </h3>

                <p>
                  Có{" "}
                  <b>
                    {lookupResult.total}
                  </b>{" "}
                  tương tác quan
                  trọng.
                </p>

                <br />

                {lookupResult.interactions.map(
                  (
                    item,
                    index
                  ) => {

                    const severityClass =
                      getSeverityClass(
                        item.MucDo
                      );

                    const otherDrug =
                      normalizeText(
                        item.Thuoc1
                      ) ===
                      normalizeText(
                        lookupResult.drug
                      )
                        ? item.Thuoc2
                        : item.Thuoc1;

                    return (
                      <div
                        key={index}
                        className={`interaction-row ${severityClass}`}
                      >

                        <div className="interaction-left">

                          {getSeverityIcon(
                            item.MucDo,
                            30
                          )}

                          <span>
                            {otherDrug}
                          </span>

                        </div>

                        <div className="interaction-level">

                          {item.MucDo}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            )

          ) : !analyzed ? (

            <div className="empty-result">

              <ShieldCheck
                size={70}
              />

              <h3>
                Chưa có dữ liệu
                phân tích
              </h3>

              <p>
                Hãy nhập tối thiểu{" "}
                <b>
                  2 hoạt chất
                </b>
              </p>

            </div>

          ) : analyzedInteractions.length ===
            0 ? (

            <div className="empty-result">

              <ShieldCheck
                size={70}
              />

              <h3>
                Không ghi nhận
                tương tác
              </h3>

              <p>
                Không tìm thấy tương
                tác giữa các hoạt chất
                đã nhập trong cơ sở dữ
                liệu hiện tại.
              </p>

            </div>

          ) : (

            <>

              {analyzedInteractions.map(
                (
                  item,
                  index
                ) => {

                  const data =
                    item.data;

                  const severityClass =
                    getSeverityClass(
                      data.MucDo
                    );

                  return (
                    <div
                      key={index}
                      className="interaction-result-group"
                    >

                      {/* ============================= */}
                      {/* KHUNG TƯƠNG TÁC */}
                      {/* ============================= */}

                      <div
                        className={`result-item ${severityClass}`}
                      >

                        <h3>
                          {item.drugA} ↔{" "}
                          {item.drugB}
                        </h3>

                        <span
                          className={`level ${severityClass}`}
                        >

                          {getSeverityIcon(
                            data.MucDo,
                            16
                          )}

                          {data.MucDo}

                        </span>

                        <div className="interaction-section">

                          <h5>
                            ✳️ Cơ chế
                          </h5>

                          <p>
                            {data.CoChe ||
                              "Chưa có thông tin."}
                          </p>

                          <h5>
                            ⚠️ Hậu quả
                          </h5>

                          <p>
                            {data.HauQua ||
                              "Chưa có thông tin."}
                          </p>

                        </div>

                      </div>

                      {/* ============================= */}
                      {/* KHUYẾN NGHỊ */}
                      {/* ============================= */}

                      <div className="recommend-box">

                        <h4>

                          <Sparkles
                            size={22}
                          />

                          Khuyến nghị lâm
                          sàng

                        </h4>

                        <p>
                          {data.KhuyenNghi ||
                            "Chưa có khuyến nghị."}
                        </p>

                        {data.TaiLieu && (
                          <p className="reference-text">

                            <strong>
                              Tài liệu tham
                              khảo:
                            </strong>{" "}

                            {data.TaiLieu}

                            {data.NamCapNhat && (
                              <>
                                {" "}
                                (
                                {
                                  data.NamCapNhat
                                }
                                )
                              </>
                            )}

                          </p>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </>

          )}

        </div>

      </div>

    </div>
  );
}