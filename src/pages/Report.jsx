import { useEffect, useState } from "react";
import "./Report.css";

import {
  FileText,
  ChevronDown,
  CalendarDays,
  Download,
  Eye,
  LockKeyhole,
} from "lucide-react";

// =====================================================
// GOOGLE APPS SCRIPT API
// =====================================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbzX_ibLbT_-rz6f5z6i_MV5am4B_lEWwR6HwdpqVj3QYNljZC9SJ00Uvx2-y4pmLpnWDg/exec";



// =====================================================
// MẬT KHẨU MODULE BÁO CÁO
// =====================================================

const REPORT_PASSWORD =
  "dlsngtru2026";


// =====================================================
// CHUYỂN LINK GOOGLE DRIVE
// =====================================================

function convertDriveUrl(url) {

  if (!url) {
    return "";
  }

  const value =
    String(url).trim();


  // Nếu đã là link preview

  if (
    value.includes("/preview")
  ) {

    return value;

  }


  // Link dạng:
  // https://drive.google.com/file/d/FILE_ID/view

  const match =
    value.match(
      /\/file\/d\/([^/]+)/
    );


  if (match) {

    return (
      `https://drive.google.com/file/d/${match[1]}/preview`
    );

  }


  // Nếu không phải Google Drive

  return value;

}


// =====================================================
// LẤY DỮ LIỆU REPORTS TỪ GOOGLE APPS SCRIPT
// =====================================================

function loadReports() {

  return new Promise(
    (resolve, reject) => {

      const callbackName =
        "rxcliphaReportsCallback";


      const script =
        document.createElement(
          "script"
        );


      // =================================================
      // URL CÓ TYPE + CALLBACK
      // =================================================

      const url =
        API_URL +
        "?type=reports&callback=" +
        callbackName;


      // =================================================
      // TIMEOUT
      // =================================================

      const timeout =
        setTimeout(() => {

          cleanup();

          reject(
            new Error(
              "Không thể kết nối đến Google Sheets."
            )
          );

        }, 15000);


      // =================================================
      // CLEANUP
      // =================================================

      function cleanup() {

        clearTimeout(timeout);


        if (
          script.parentNode
        ) {

          script.parentNode.removeChild(
            script
          );

        }


        delete window[
          callbackName
        ];

      }


      // =================================================
      // CALLBACK
      // =================================================

      window[callbackName] =
        (data) => {

          cleanup();


          if (
            !Array.isArray(data)
          ) {

            reject(
              new Error(
                "Dữ liệu báo cáo từ Google Sheets không hợp lệ."
              )
            );

            return;

          }


          resolve(data);

        };


      // =================================================
      // SCRIPT ERROR
      // =================================================

      script.onerror = () => {

        cleanup();

        reject(
          new Error(
            "Không thể tải dữ liệu báo cáo từ Google Sheets."
          )
        );

      };


      // =================================================
      // GỌI GOOGLE APPS SCRIPT
      // =================================================

      script.src = url;


      document.body.appendChild(
        script
      );

    }
  );

}


// =====================================================
// DANH SÁCH THÁNG
// =====================================================

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


// =====================================================
// COMPONENT
// =====================================================

export default function Report() {

  // ===================================================
  // TRẠNG THÁI ĐĂNG NHẬP
  // ===================================================

  const [
    authenticated,
    setAuthenticated,
  ] = useState(false);


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    passwordError,
    setPasswordError,
  ] = useState("");


  // ===================================================
  // DỮ LIỆU BÁO CÁO
  // ===================================================

  const [
    reports,
    setReports,
  ] = useState([]);


  const [
    selectedYear,
    setSelectedYear,
  ] = useState("");


  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  // ===================================================
  // ĐĂNG NHẬP
  // ===================================================

  function handleLogin() {

    const input =
      password.trim();


    if (
      input ===
      REPORT_PASSWORD
    ) {

      setPasswordError("");

      setAuthenticated(
        true
      );

      setPassword("");

    } else {

      setPasswordError(
        "Mật khẩu không chính xác. Vui lòng thử lại."
      );

    }

  }


  // ===================================================
  // TẢI REPORT SAU KHI ĐĂNG NHẬP
  // ===================================================

  useEffect(() => {

    // Chưa đăng nhập
    // Không gọi Google Sheets

    if (
      !authenticated
    ) {

      return;

    }


    let cancelled =
      false;


    async function fetchReports() {

      try {

        setLoading(true);

        setError("");


        const data =
          await loadReports();


        if (
          cancelled
        ) {

          return;

        }


        if (
          !Array.isArray(data)
        ) {

          throw new Error(
            "Dữ liệu Google Sheets không hợp lệ."
          );

        }


        setReports(data);


        // =============================================
        // LẤY DANH SÁCH NĂM
        // =============================================

        const years = [

          ...new Set(

            data
              .map(
                (item) =>
                  String(
                    item.Nam || ""
                  ).trim()
              )
              .filter(Boolean)

          ),

        ].sort();


        // =============================================
        // CHỌN NĂM ĐẦU TIÊN
        // =============================================

        if (
          years.length > 0
        ) {

          const firstYear =
            years[0];


          setSelectedYear(
            firstYear
          );


          // ===========================================
          // TÌM THÁNG ĐẦU TIÊN CÓ FILE
          // ===========================================

          const firstReport =
            data.find(
              (item) => {

                const year =
                  String(
                    item.Nam || ""
                  ).trim();


                return (
                  year ===
                    firstYear &&
                  item.FilePDF
                );

              }
            );


          if (
            firstReport
          ) {

            setSelectedMonth(

              String(
                firstReport.Thang ||
                  ""
              )
                .trim()
                .padStart(
                  2,
                  "0"
                )

            );

          } else {

            setSelectedMonth(
              "01"
            );

          }

        } else {

          setSelectedYear("");
          setSelectedMonth("");

        }


      } catch (err) {

        if (
          cancelled
        ) {

          return;

        }


        console.error(
          "Lỗi tải báo cáo:",
          err
        );


        setError(
          err?.message ||
            "Không thể tải dữ liệu báo cáo từ Google Sheets."
        );


      } finally {

        if (
          !cancelled
        ) {

          setLoading(false);

        }

      }

    }


    fetchReports();


    return () => {

      cancelled =
        true;

    };

  }, [
    authenticated,
  ]);


  // ===================================================
  // DANH SÁCH NĂM
  // ===================================================

  const years = [

    ...new Set(

      reports
        .map(
          (item) =>
            String(
              item.Nam || ""
            ).trim()
        )
        .filter(Boolean)

    ),

  ].sort();


  // ===================================================
  // BÁO CÁO HIỆN TẠI
  // ===================================================

  const currentReport =
    reports.find(
      (item) => {

        const year =
          String(
            item.Nam || ""
          ).trim();


        const month =
          String(
            item.Thang || ""
          )
            .trim()
            .padStart(
              2,
              "0"
            );


        return (

          year ===
            selectedYear &&

          month ===
            selectedMonth &&

          item.FilePDF

        );

      }
    );


  // ===================================================
  // ĐỔI NĂM
  // ===================================================

  function handleYearChange(
    e
  ) {

    const year =
      e.target.value;


    setSelectedYear(
      year
    );


    // Tìm báo cáo đầu tiên
    // của năm được chọn

    const firstReport =
      reports.find(
        (item) => {

          const itemYear =
            String(
              item.Nam || ""
            ).trim();


          return (
            itemYear ===
              year &&
            item.FilePDF
          );

        }
      );


    if (
      firstReport
    ) {

      setSelectedMonth(

        String(
          firstReport.Thang ||
            ""
        )
          .trim()
          .padStart(
            2,
            "0"
          )

      );

    } else {

      setSelectedMonth(
        "01"
      );

    }

  }


  // ===================================================
  // MÀN HÌNH ĐĂNG NHẬP
  // ===================================================

  if (
    !authenticated
  ) {

    return (

      <div className="report-login-page">

        <div className="report-login-card">


          {/* =========================================
              ICON
          ========================================= */}

          <div className="report-login-icon">

            <LockKeyhole
              size={38}
            />

          </div>


          {/* =========================================
              TIÊU ĐỀ
          ========================================= */}

          <h1>
            Khu vực nội bộ
          </h1>


          <p className="report-login-description">

            Báo cáo Dược lâm sàng ngoại trú

          </p>


          <p className="report-login-note">

            Vui lòng nhập mật khẩu để truy cập
            module báo cáo.

          </p>


          {/* =========================================
              MẬT KHẨU
          ========================================= */}

          <div className="report-password-group">

            <label>
              Mật khẩu
            </label>


            <input

              type="password"

              value={
                password
              }

              placeholder="Nhập mật khẩu"

              autoFocus

              onChange={(e) => {

                setPassword(
                  e.target.value
                );

                setPasswordError(
                  ""
                );

              }}

              onKeyDown={(e) => {

                if (
                  e.key ===
                  "Enter"
                ) {

                  handleLogin();

                }

              }}

            />

          </div>


          {/* =========================================
              LỖI
          ========================================= */}

          {passwordError && (

            <div className="report-password-error">

              {passwordError}

            </div>

          )}


          {/* =========================================
              NÚT ĐĂNG NHẬP
          ========================================= */}

          <button

            type="button"

            className="report-login-button"

            onClick={
              handleLogin
            }

          >

            <LockKeyhole
              size={18}
            />

            Đăng nhập

          </button>


        </div>

      </div>

    );

  }


  // ===================================================
  // ĐANG TẢI
  // ===================================================

  if (
    loading
  ) {

    return (

      <div className="report-page">

        <div className="empty-report">

          <FileText
            size={64}
          />


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


  // ===================================================
  // LỖI
  // ===================================================

  if (
    error
  ) {

    return (

      <div className="report-page">

        <div className="empty-report">

          <Eye
            size={64}
          />


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


  // ===================================================
  // GIAO DIỆN BÁO CÁO
  // ===================================================

  return (

    <div className="report-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="report-banner">

        <div className="banner-icon">

          <FileText
            size={34}
          />

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


      {/* =================================================
          CHỌN NĂM
      ================================================= */}

      <div className="report-toolbar">

        <div className="select-group">

          <label>

            <CalendarDays
              size={18}
            />

            Chọn năm

          </label>


          <div className="select-wrapper">

            <select

              value={
                selectedYear
              }

              onChange={
                handleYearChange
              }

            >

              {years.map(
                (year) => (

                  <option
                    key={year}
                    value={year}
                  >

                    {year}

                  </option>

                )
              )}

            </select>


            <ChevronDown
              size={18}
            />

          </div>

        </div>

      </div>


      {/* =================================================
          NỘI DUNG
      ================================================= */}

      <div className="report-layout">


        {/* =================================================
            DANH SÁCH THÁNG
        ================================================= */}

        <aside className="month-panel">


          <div className="month-title">

            <CalendarDays
              size={20}
            />

            <span>
              Danh sách tháng
            </span>

          </div>


          <div className="month-list">

            {months.map(
              (month) => {


                // =======================================
                // KIỂM TRA THÁNG CÓ BÁO CÁO
                // =======================================

                const exist =
                  reports.find(
                    (item) => {

                      const year =
                        String(
                          item.Nam || ""
                        )
                          .trim();


                      const itemMonth =
                        String(
                          item.Thang || ""
                        )
                          .trim()
                          .padStart(
                            2,
                            "0"
                          );


                      return (

                        year ===
                          selectedYear &&

                        itemMonth ===
                          month &&

                        item.FilePDF

                      );

                    }
                  );


                return (

                  <button

                    key={
                      month
                    }

                    type="button"

                    className={

                      selectedMonth ===
                        month

                        ? "month-item active"

                        : "month-item"

                    }

                    onClick={() =>
                      setSelectedMonth(
                        month
                      )
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

                      <FileText
                        size={18}
                      />

                    )}

                  </button>

                );

              }
            )}

          </div>

        </aside>


        {/* =================================================
            PDF VIEWER
        ================================================= */}

        <section className="report-viewer">


          {currentReport ? (

            <>


              {/* =========================================
                  HEADER PDF
              ========================================= */}

              <div className="viewer-header">


                <div>

                  <div className="viewer-label">

                    <FileText
                      size={18}
                    />

                    BÁO CÁO

                  </div>


                  <h2>

                    {currentReport.TieuDe ||

                      `Báo cáo Dược lâm sàng ngoại trú tháng ${selectedMonth} năm ${selectedYear}`}

                  </h2>

                </div>


                {/* =======================================
                    NÚT XEM / TẢI PDF
                ======================================= */}

                <a

                  href={convertDriveUrl(
                    currentReport.FilePDF
                  )}

                  target="_blank"

                  rel="noopener noreferrer"

                  className="download-btn"

                >

                  <Download
                    size={20}
                  />

                  Xem / Tải PDF

                </a>

              </div>


              {/* =========================================
                  PDF
              ========================================= */}

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

              <Eye
                size={64}
              />


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