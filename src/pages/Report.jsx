import { useEffect, useRef, useState } from "react";
import "./Report.css";

import {
  FileText,
  ChevronDown,
  CalendarDays,
  Download,
  Eye,
} from "lucide-react";

// ===============================
// GOOGLE APPS SCRIPT API
// ===============================

const API_URL =
  "https://script.google.com/macros/s/AKfycbzX_ibLbT_-rz6f5z6i_MV5am4B_lEWwR6HwdpqVj3QYNljZC9SJ00Uvx2-y4pmLpnWDg/exec";


// ===============================
// CHUYỂN LINK GOOGLE DRIVE
// ===============================

function convertDriveUrl(url) {
  if (!url) return "";

  const value = String(url).trim();

  // Nếu đã là link preview thì giữ nguyên
  if (value.includes("/preview")) {
    return value;
  }

  // Link dạng:
  // https://drive.google.com/file/d/FILE_ID/view
  const match = value.match(/\/file\/d\/([^/]+)/);

  if (match) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }

  // Nếu không phải link Google Drive
  return value;
}


// ===============================
// LẤY DỮ LIỆU TỪ GOOGLE SHEETS
// ===============================

function loadReports() {
  return new Promise((resolve, reject) => {

    const callbackName =
      "rxcliphaReportsCallback";

    const script =
      document.createElement("script");

    const timeout =
      setTimeout(() => {

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

      resolve(data);

    };


    script.onerror = () => {

      cleanup();

      reject(
        new Error(
          "Không thể tải dữ liệu báo cáo từ Google Sheets."
        )
      );

    };


    // Không truyền ?callback=
    script.src = API_URL;

    document.body.appendChild(script);

  });
}


// ===============================
// DANH SÁCH THÁNG
// ===============================

const months = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];


// ===============================
// COMPONENT
// ===============================

export default function Report() {

  const hasLoaded = useRef(false);

  const [reports, setReports] = useState([]);

  const [selectedYear, setSelectedYear] =
    useState("");

  const [selectedMonth, setSelectedMonth] =
    useState("");


  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");



  // ===============================
  // TẢI DỮ LIỆU
  // ===============================

  useEffect(() => {

  if (hasLoaded.current) {
    return;
  }

  hasLoaded.current = true;


  async function fetchReports() {

      try {

        setLoading(true);
        setError("");

        const data = await loadReports();

        if (!Array.isArray(data)) {
          throw new Error(
            "Dữ liệu Google Sheets không hợp lệ."
          );
        }

        setReports(data);


        // ===============================
        // LẤY DANH SÁCH NĂM
        // ===============================

        const years = [
          ...new Set(
            data
              .map((item) =>
                String(item.Nam || "").trim()
              )
              .filter(Boolean)
          ),
        ].sort();


        if (years.length > 0) {

          setSelectedYear(years[0]);

          // Tìm tháng đầu tiên có báo cáo
          const firstReport =
            data.find(
              (item) =>
                String(item.Nam).trim() === years[0] &&
                item.FilePDF
            );


          if (firstReport) {

            setSelectedMonth(
              String(firstReport.Thang)
                .padStart(2, "0")
            );

          } else {

            setSelectedMonth("01");

          }

        }

      } catch (err) {

        console.error(err);

        setError(
          err.message ||
          "Không thể tải dữ liệu báo cáo."
        );

      } finally {

        setLoading(false);

      }

    }


    fetchReports();

  }, []);



  // ===============================
  // DANH SÁCH NĂM
  // ===============================

  const years = [
    ...new Set(
      reports
        .map((item) =>
          String(item.Nam || "").trim()
        )
        .filter(Boolean)
    ),
  ].sort();



  // ===============================
  // BÁO CÁO HIỆN TẠI
  // ===============================

  const currentReport =
    reports.find((item) => {

      const year =
        String(item.Nam || "").trim();

      const month =
        String(item.Thang || "")
          .trim()
          .padStart(2, "0");

      return (
        year === selectedYear &&
        month === selectedMonth &&
        item.FilePDF
      );

    });



  // ===============================
  // XỬ LÝ KHI ĐỔI NĂM
  // ===============================

  function handleYearChange(e) {

    const year = e.target.value;

    setSelectedYear(year);


    // Tìm tháng đầu tiên có báo cáo
    const firstReport =
      reports.find(
        (item) =>
          String(item.Nam).trim() === year &&
          item.FilePDF
      );


    if (firstReport) {

      setSelectedMonth(
        String(firstReport.Thang)
          .trim()
          .padStart(2, "0")
      );

    } else {

      setSelectedMonth("01");

    }

  }



  // ===============================
  // LOADING
  // ===============================

  if (loading) {

    return (

      <div className="report-page">

        <div className="empty-report">

          <FileText size={64} />

          <h2>
            Đang tải dữ liệu...
          </h2>

          <p>
            Đang kết nối với hệ thống báo cáo.
          </p>

        </div>

      </div>

    );

  }



  // ===============================
  // ERROR
  // ===============================

  if (error) {

    return (

      <div className="report-page">

        <div className="empty-report">

          <Eye size={64} />

          <h2>
            Không thể tải dữ liệu
          </h2>

          <p>
            {error}
          </p>

        </div>

      </div>

    );

  }



  // ===============================
  // GIAO DIỆN
  // ===============================

  return (

    <div className="report-page">


      {/* =========================
          HEADER
      ========================== */}

      <div className="report-banner">

        <div className="banner-icon">

          <FileText size={34} />

        </div>


        <div>

          <h1>
            Báo cáo Dược lâm sàng ngoại trú
          </h1>


          <p>
            Hệ thống lưu trữ và tra cứu báo cáo
            giám sát kê đơn, hoạt động Dược lâm
            sàng theo từng tháng.
          </p>

        </div>

      </div>



      {/* =========================
          SELECT NĂM
      ========================== */}

      <div className="report-toolbar">

        <div className="select-group">

          <label>

            <CalendarDays size={18} />

            Chọn năm

          </label>


          <div className="select-wrapper">

            <select
              value={selectedYear}
              onChange={handleYearChange}
            >

              {years.map((year) => (

                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>

              ))}

            </select>


            <ChevronDown size={18} />

          </div>

        </div>

      </div>



      {/* =========================
          CONTENT
      ========================== */}

      <div className="report-layout">


        {/* =========================
            DANH SÁCH THÁNG
        ========================== */}

        <aside className="month-panel">


          <div className="month-title">

            <CalendarDays size={20} />

            <span>
              Danh sách tháng
            </span>

          </div>



          <div className="month-list">

            {months.map((month) => {


              const exist =
                reports.find((item) => {

                  const year =
                    String(item.Nam || "")
                      .trim();

                  const itemMonth =
                    String(item.Thang || "")
                      .trim()
                      .padStart(2, "0");

                  return (
                    year === selectedYear &&
                    itemMonth === month &&
                    item.FilePDF
                  );

                });



              return (

                <button
                  key={month}

                  className={
                    selectedMonth === month
                      ? "month-item active"
                      : "month-item"
                  }

                  onClick={() =>
                    setSelectedMonth(month)
                  }
                >

                  <div>

                    <strong>
                      Tháng {month}
                    </strong>


                    <span>

                      {exist
                        ? "Đã có báo cáo"
                        : "Chưa cập nhật"}

                    </span>

                  </div>


                  {exist && (

                    <FileText size={18} />

                  )}

                </button>

              );

            })}

          </div>

        </aside>



        {/* =========================
            PDF VIEWER
        ========================== */}

        <section className="report-viewer">


          {currentReport ? (

            <>

              {/* HEADER PDF */}

              <div className="viewer-header">


                <div>

                  <div className="viewer-label">

                    <FileText size={18} />

                    BÁO CÁO

                  </div>


                  <h2>

                    {currentReport.TieuDe ||
                      `Báo cáo Dược lâm sàng ngoại trú tháng ${selectedMonth} năm ${selectedYear}`}

                  </h2>

                </div>



                <a
                  href={convertDriveUrl(
                    currentReport.FilePDF
                  )}

                  target="_blank"

                  rel="noopener noreferrer"

                  className="download-btn"
                >

                  <Download size={20} />

                  Xem / Tải PDF

                </a>

              </div>



              {/* PDF */}

              <div className="pdf-container">

                <iframe
                  src={convertDriveUrl(
                    currentReport.FilePDF
                  )}

                  title={
                    currentReport.TieuDe ||
                    "Báo cáo Dược lâm sàng ngoại trú"
                  }

                  width="100%"

                  height="100%"

                  style={{
                    border: "none",
                  }}
                />

              </div>

            </>

          ) : (

            <div className="empty-report">

              <Eye size={64} />


              <h2>
                Chưa có báo cáo
              </h2>


              <p>
                Tháng này chưa được cập nhật
                báo cáo Dược lâm sàng ngoại trú.
              </p>

            </div>

          )}

        </section>

      </div>

    </div>

  );

}