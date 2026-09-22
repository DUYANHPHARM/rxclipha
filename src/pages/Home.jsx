import "./Home.css";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import {
  Search,
  BookOpen,
  ArrowLeftRight,
  Pill,
  Syringe,
  ClipboardList,
  ChevronRight,
} from "lucide-react";

/* =====================================================
   GOOGLE SHEETS API
===================================================== */

const API_URL =
  "https://script.google.com/macros/s/AKfycbzX_ibLbT_-rz6f5z6i_MV5am4B_lEWwR6HwdpqVj3QYNljZC9SJ00Uvx2-y4pmLpnWDg/exec";

/* =====================================================
   CÔNG CỤ
===================================================== */

const tools = [
  {
    title: "Tra cứu thuốc",
    description:
      "Liều dùng, chỉ định, chống chỉ định, ADR, tương tác...",
    icon: Search,
    color: "blue",
    path: "/drug-lookup",
  },
  {
    title: "Mã ICD-10",
    description:
      "Tra cứu mã bệnh và tên bệnh theo phân loại ICD-10.",
    icon: BookOpen,
    color: "green",
    path: "/icd10",
  },
  {
    title: "Tương tác thuốc",
    description:
      "Kiểm tra tương tác giữa nhiều thuốc theo Quyết định 5948 và các tương tác có ý nghĩa.",
    icon: ArrowLeftRight,
    color: "orange",
    path: "/interaction",
  },
  {
    title: "Báo cáo Dược lâm sàng ngoại trú",
    description:
      "Tổng kết hoạt động giám sát Dược lâm sàng ngoại trú theo tháng",
    icon: ClipboardList,
    color: "purple",
    path: "/report",
  },
  {
    title: "Thay thế thuốc",
    description:
      "Lựa chọn thuốc thay thế theo phác đồ điều trị phù hợp.",
    icon: Pill,
    color: "red",
    path: "/drug-substitution",
  },
  {
    title: "Dị ứng thuốc",
    description:
      "Tra cứu thông tin dị ứng thuốc và hướng xử trí.",
    icon: Syringe,
    color: "yellow",
    path: "/allergy",
  },
];

/* =====================================================
   LOAD NEWS TỪ GOOGLE SHEETS
===================================================== */

function loadNews() {
  return new Promise((resolve, reject) => {
    /*
      QUAN TRỌNG:
      Google Apps Script News đang trả về:

      rxcliphaNewsCallback([...]);

      nên Home phải dùng đúng callback này.
    */
    const callbackName = "rxcliphaNewsCallback";

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
            "Dữ liệu tin mới không hợp lệ."
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
          "Không thể tải dữ liệu tin mới từ Google Sheets."
        )
      );
    };

    /*
      type=news
      + timestamp để tránh cache
    */

    script.src =
      `${API_URL}?type=news&_=${Date.now()}`;

    script.async = true;

    document.body.appendChild(script);
  });
}

/* =====================================================
   FORMAT NGÀY
===================================================== */

function formatDate(value) {
  if (!value) return "";

  const text = String(value).trim();

  if (!text) return "";

  const date = new Date(text);

  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Ho_Chi_Minh",
    });
  }

  if (
    /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(text)
  ) {
    return text;
  }

  return text;
}

/* =====================================================
   CHUYỂN NGÀY SANG TIMESTAMP
===================================================== */

function getDateValue(value) {
  if (!value) return 0;

  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    return date.getTime();
  }

  /*
    Trường hợp Google Sheets trả về dạng:
    dd/mm/yyyy
  */

  const text = String(value).trim();

  const match = text.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  );

  if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]) - 1;
    const year = Number(match[3]);

    return new Date(
      year,
      month,
      day
    ).getTime();
  }

  return 0;
}

/* =====================================================
   XÁC ĐỊNH MÀU TIN
===================================================== */

function getNewsType(group) {
  const value = String(group || "").trim();

  if (
    value ===
    "Thuốc hết số lượng, gián đoạn cung ứng"
  ) {
    return "danger";
  }

  if (
    value === "Thuốc chậm sử dụng"
  ) {
    return "warning";
  }

  if (
    value === "Thuốc mới"
  ) {
    return "success";
  }

  if (
    value === "ADR/Thu hồi thuốc"
  ) {
    return "danger";
  }

  if (
    value === "Lưu ý khi dùng thuốc"
  ) {
    return "info";
  }

  /*
    Thông báo mới từ khoa Dược
  */

  return "purple";
}

/* =====================================================
   HOME
===================================================== */

function Home() {
  const [latestNews, setLatestNews] =
    useState([]);

  const [newsLoading, setNewsLoading] =
    useState(true);

  const [newsError, setNewsError] =
    useState("");

  const hasLoaded =
    useRef(false);

  /* ===================================================
     TẢI TIN MỚI
  =================================================== */

  useEffect(() => {
    if (hasLoaded.current) {
      return;
    }

    hasLoaded.current = true;

    async function fetchNews() {
      try {
        setNewsLoading(true);
        setNewsError("");

        const data =
          await loadNews();

        /*
          Chỉ lấy các tin:

          TrangThai = Đang hiển thị
        */

        const activeNews =
          data.filter((item) => {
            const status =
              String(
                item.TrangThai || ""
              ).trim();

            return (
              status === "Đang hiển thị"
            );
          });

        /*
          Sắp xếp tin mới nhất lên đầu
        */

        activeNews.sort((a, b) => {
          return (
            getDateValue(b.Ngay) -
            getDateValue(a.Ngay)
          );
        });

        /*
          CHỈ LẤY 2 TIN MỚI NHẤT
        */

        setLatestNews(
          activeNews.slice(0, 2)
        );
      } catch (error) {
        console.error(
          "Lỗi tải tin mới:",
          error
        );

        setNewsError(
          error.message ||
            "Không thể tải tin mới."
        );
      } finally {
        setNewsLoading(false);
      }
    }

    fetchNews();
  }, []);

  return (
    <>
      {/* =================================================
          BANNER
      ================================================= */}

      <section className="banner">
        <h1>
          RxCliPha
        </h1>

        <h3>
          Thông tin thuốc & Dược lâm sàng ngoại trú
        </h3>

        <p>
          Công cụ hỗ trợ Bác sĩ, Điều dưỡng và Dược sĩ
          lâm sàng trong sử dụng thuốc dựa trên bằng chứng
        </p>
      </section>

      {/* =================================================
          BẢN TIN
      ================================================= */}

      <section className="news-banner">
        <div className="news-title">
          <h2>
            📢 Tin mới
          </h2>

          <Link
            to="/news"
            className="news-view-all"
          >
            Xem tất cả
          </Link>
        </div>

        {/* =================================================
            ĐANG TẢI
        ================================================= */}

        {newsLoading && (
          <div className="news-list">
            <div className="news-item">
              <div className="news-status purple"></div>

              <div className="news-content">
                <h4>
                  Đang tải tin mới...
                </h4>

                <p>
                  Đang kết nối với cơ sở dữ liệu tin mới.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            LỖI
        ================================================= */}

        {!newsLoading &&
          newsError && (
            <div className="news-list">
              <div className="news-item">
                <div className="news-status danger"></div>

                <div className="news-content">
                  <h4>
                    Không thể tải tin mới
                  </h4>

                  <p>
                    {newsError}
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* =================================================
            KHÔNG CÓ TIN
        ================================================= */}

        {!newsLoading &&
          !newsError &&
          latestNews.length === 0 && (
            <div className="news-list">
              <div className="news-item">
                <div className="news-status purple"></div>

                <div className="news-content">
                  <h4>
                    Chưa có tin mới
                  </h4>

                  <p>
                    Hiện chưa có thông tin mới được cập nhật.
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* =================================================
            DANH SÁCH 2 TIN MỚI NHẤT
        ================================================= */}

        {!newsLoading &&
          !newsError &&
          latestNews.length > 0 && (
            <div className="news-list">
              {latestNews.map(
                (item, index) => {
                  const newsType =
                    getNewsType(
                      item.Nhom
                    );

                  return (
                    <Link
                      key={`${item.TieuDe}-${item.Ngay}-${index}`}
                      to={`/news?title=${encodeURIComponent(
                        item.TieuDe
                      )}`}
                      className="news-item"
                    >
                      {/* DẤU MÀU */}

                      <div
                        className={`news-status ${newsType}`}
                      ></div>

                      {/* NỘI DUNG */}

                      <div className="news-content">
                        <h4>
                          {item.TieuDe}
                        </h4>

                        <p>
                          {item.TomTat}
                        </p>
                      </div>

                      {/* NGÀY */}

                      <small>
                        {formatDate(
                          item.Ngay
                        )}
                      </small>
                    </Link>
                  );
                }
              )}
            </div>
          )}
      </section>

      {/* =================================================
          CÔNG CỤ NỔI BẬT
      ================================================= */}

      <h2 className="title">
        Công cụ nổi bật
      </h2>

      <div className="cards">
        {tools.map((tool) => {
          const Icon =
            tool.icon;

          return (
            <Link
              key={tool.title}
              to={tool.path}
              className="card"
            >
              <div
                className={`card-icon card-${tool.color}`}
              >
                <Icon
                  size={34}
                />
              </div>

              <h3>
                {tool.title}
              </h3>

              <p>
                {tool.description}
              </p>

              <span>
                Truy cập ngay

                <ChevronRight
                  size={18}
                />
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

export default Home;