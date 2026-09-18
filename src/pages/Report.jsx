
import { useState } from "react";
import "./Report.css";

import {
  FileText,
  ChevronDown,
  CalendarDays,
  Download,
  Eye,
} from "lucide-react";

export default function Report() {

  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("08");

  const reports = {
    "2026": {
      "08": {
        title: "Báo cáo Dược lâm sàng ngoại trú tháng 08 năm 2026",
        file: "/reports/Bao_cao_DLSNgT_thang_8_2026.pdf",
      },
      "09": null,
      "10": null,
      "11": null,
      "12": null,
    },

    "2027": {
      "01": null,
      "02": null,
      "03": null,
    },
  };

  const months = [
    "01","02","03","04","05","06",
    "07","08","09","10","11","12"
  ];

  const currentReport =
    reports[selectedYear]?.[selectedMonth];

  return (
    <div className="report-page">

      {/* HEADER */}

      <div className="report-banner">

        <div className="banner-icon">
          <FileText size={34}/>
        </div>

        <div>

          <h1>Báo cáo Dược lâm sàng ngoại trú</h1>

          <p>
            Hệ thống lưu trữ và tra cứu báo cáo giám sát kê đơn,
            hoạt động Dược lâm sàng theo từng tháng.
          </p>

        </div>

      </div>


      {/* SELECT */}

      <div className="report-toolbar">

        <div className="select-group">

          <label>
            <CalendarDays size={18}/>
            Chọn năm
          </label>

          <div className="select-wrapper">

            <select
              value={selectedYear}
              onChange={(e)=>{
                setSelectedYear(e.target.value);
                setSelectedMonth("");
              }}
            >

              {Object.keys(reports).map(year=>(
                <option key={year}>
                  {year}
                </option>
              ))}

            </select>

            <ChevronDown size={18}/>

          </div>

        </div>

      </div>


      <div className="report-layout">

        {/* MONTH LIST */}

        <aside className="month-panel">

          <div className="month-title">

            <CalendarDays size={20}/>

            <span>Danh sách tháng</span>

          </div>

          <div className="month-list">

            {months.map(month=>{

              const exist =
                reports[selectedYear]?.[month];

              return (

                <button
                  key={month}
                  className={
                    selectedMonth === month
                      ? "month-item active"
                      : "month-item"
                  }
                  onClick={()=>setSelectedMonth(month)}
                >

                  <div>

                    <strong>Tháng {month}</strong>

                    <span>
                      {exist
                        ? "Đã có báo cáo"
                        : "Chưa cập nhật"}
                    </span>

                  </div>

                  {exist && (
                    <FileText size={18}/>
                  )}

                </button>

              )

            })}

          </div>

        </aside>


        {/* PDF */}

        <section className="report-viewer">

          {currentReport ? (

            <>

              <div className="viewer-header">

                <div>

                  <div className="viewer-label">
                    <FileText size={18}/>
                    BÁO CÁO
                  </div>

                  <h2>
                    {currentReport.title}
                  </h2>

                </div>

                <a
                  href={currentReport.file}
                  download
                  className="download-btn"
                >

                  <Download size={20}/>

                  Tải PDF

                </a>

              </div>


              <div className="pdf-container">

                <iframe
                  src={currentReport.file}
                  title={currentReport.title}
                />

              </div>

            </>

          ) : (

            <div className="empty-report">

              <Eye size={64}/>

              <h2>
                Chưa có báo cáo
              </h2>

              <p>
                Tháng này chưa được cập nhật báo cáo
                Dược lâm sàng ngoại trú.
              </p>

            </div>

          )}

        </section>

      </div>

    </div>
  );
}