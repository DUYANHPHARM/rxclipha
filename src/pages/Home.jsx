import "./Home.css";
import { Link } from "react-router-dom";

import {
  Search,
  BookOpen,
  ArrowLeftRight,
  Pill,
  Syringe,
  ClipboardList,
  ChevronRight,
  Bell,
  CalendarDays,
  PackageX,
  Clock3,
  PackagePlus,
  TriangleAlert,
  Info,
} from "lucide-react";

import { useEffect, useState } from "react";

const NEWS_API_URL =
  "https://script.google.com/macros/s/AKfycbzX_ibLbT_-rz6f5z6i_MV5am4B_lEWwR6HwdpqVj3QYNljZC9SJ00Uvx2-y4pmLpnWDg/exec";

/* =========================================================
   CÔNG CỤ
========================================================= */

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
      "Tổng kết hoạt động giám sát Dược lâm sàng ngoại trú theo tháng.",
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

/* =========================================================
   ICON THEO NHÓM TIN
========================================================= */

function getNewsIcon(group) {
  const value = String(group || "").trim();

  if (value === "Thuốc hết số lượng, gián đoạn cung ứng") {
    return PackageX;
  }

  if (value === "Thuốc chậm sử dụng") {
    return Clock3;
  }

  if (value === "Thuốc mới") {
    return PackagePlus;
  }

  if (value === "ADR/Thu hồi thuốc") {
    return TriangleAlert;
  }

  if (value === "Lưu ý khi dùng thuốc") {
    return Info;
  }

  if (value === "Thông báo mới từ khoa Dược") {
    return Bell;
  }

  if (value === "Thông báo khoa Dược") {
    return Bell;
  }

  return Bell;
}

/* =========================================================
   CHUYỂN NGÀY
========================================================= */

function formatDate(value) {
  if (!value) return "";

  const text = String(value).trim();

  if (!text) return "";

  const match = text.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(text)) {
    const parts = text.split("/");

    return `${parts[0].padStart(2, "0")}/${parts[1].padStart(
      2,
      "0"
    )}/${parts[2]}`;
  }

  return text;
}

/* =========================================================
   CHUYỂN NGÀY ĐỂ SẮP XẾP
========================================================= */

function getDateValue(value) {
  if (!value) return 0;

  const text = String(value).trim();

  const isoMatch = text.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (isoMatch) {
    return new Date(
      Number(isoMatch[1]),
      Number(isoMatch[2]) - 1,
      Number(isoMatch[3])
    ).getTime();
  }

  const vnMatch = text.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})/
  );

  if (vnMatch) {
    return new Date(
      Number(vnMatch[3]),
      Number(vnMatch[2]) - 1,
      Number(vnMatch[1])
    ).getTime();
  }

  return 0;
}

/* =========================================================
   LOAD NEWS
========================================================= */

function loadNews() {
  return new Promise((resolve, reject) => {
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

      try {
        delete window[callbackName];
      } catch {
        window[callbackName] = undefined;
      }
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
          "Không thể tải tin mới từ Google Sheets."
        )
      );
    };

    /* =====================================================
       QUAN TRỌNG:
       Gửi callback lên Google Apps Script
    ===================================================== */

    script.src =
      `${NEWS_API_URL}?type=news&callback=${encodeURIComponent(
        callbackName
      )}&_=${Date.now()}`;

    script.async = true;

    document.body.appendChild(script);
  });
}

/* =========================================================
   HOME
========================================================= */

function Home() {
  const [news, setNews] = useState([]);

  const [newsLoading, setNewsLoading] =
    useState(true);

  const [newsError, setNewsError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchNews() {
      try {
        setNewsLoading(true);
        setNewsError("");

        const data = await loadNews();

        if (!mounted) return;

        /* Chỉ lấy tin đang hiển thị */

        const activeNews = data.filter((item) => {
          const status = String(
            item.TrangThai || ""
          ).trim();

          return status === "Đang hiển thị";
        });

        /* Sắp xếp tin mới nhất trước */

        const sortedNews = [...activeNews].sort(
          (a, b) =>
            getDateValue(b.Ngay) -
            getDateValue(a.Ngay)
        );

        /* CHỈ LẤY 2 TIN MỚI NHẤT */

        setNews(sortedNews.slice(0, 2));
      } catch (error) {
        console.error(
          "Lỗi tải tin mới:",
          error
        );

        if (!mounted) return;

        setNewsError(
          error.message ||
            "Không thể tải tin mới."
        );
      } finally {
        if (mounted) {
          setNewsLoading(false);
        }
      }
    }

    fetchNews();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="home">

      {/* =================================================
          BANNER
      ================================================= */}

      <section className="banner">
        <h1>RxCliPha</h1>

        <h3>
          Thông tin thuốc & Dược lâm sàng ngoại trú
        </h3>

        <p>
          Công cụ hỗ trợ Bác sĩ, Điều dưỡng và Dược sĩ
          lâm sàng trong sử dụng thuốc dựa trên bằng chứng
        </p>
      </section>


      {/* =================================================
          TIN MỚI
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


        <div className="news-list">

          {/* =================================================
              ĐANG TẢI
          ================================================= */}

          {newsLoading && (
            <div className="home-news-loading">

              <Bell
                className="home-news-loading-icon"
                size={58}
              />

              <h3>
                Đang tải thông tin
              </h3>

              <p>
                Đang kết nối với cơ sở dữ liệu tin mới.
              </p>

            </div>
          )}


          {/* =================================================
              LỖI
          ================================================= */}

          {!newsLoading && newsError && (
            <div className="home-news-loading">

              <Bell
                className="home-news-loading-icon error"
                size={58}
              />

              <h3>
                Không thể tải tin mới
              </h3>

              <p>
                {newsError}
              </p>

            </div>
          )}


          {/* =================================================
              KHÔNG CÓ TIN
          ================================================= */}

          {!newsLoading &&
            !newsError &&
            news.length === 0 && (
              <div className="home-news-loading">

                <Bell
                  className="home-news-loading-icon"
                  size={58}
                />

                <h3>
                  Chưa có tin mới
                </h3>

                <p>
                  Hiện chưa có thông tin mới từ khoa Dược.
                </p>

              </div>
            )}


          {/* =================================================
              DANH SÁCH 2 TIN MỚI NHẤT
          ================================================= */}

          {!newsLoading &&
            !newsError &&
            news.map((item) => {

              const Icon = getNewsIcon(
                item.Nhom
              );

              return (
                <Link
                  to="/news"
                  className="news-item"
                  key={
                    item.id ||
                    `${item.Ngay}-${item.TieuDe}`
                  }
                >

                  {/* ICON */}

                  <div className="news-item-icon">
                    <Icon size={23} />
                  </div>


                  {/* NỘI DUNG */}

                  <div className="news-item-main">

                    <div className="news-item-meta">

                      <span className="news-category">
                        {item.Nhom ||
                          "Thông báo khoa Dược"}
                      </span>

                      <span className="news-date">

                        <CalendarDays
                          size={14}
                        />

                        {formatDate(
                          item.Ngay
                        )}

                      </span>

                    </div>


                    <h3>
                      {item.TieuDe}
                    </h3>


                    <p>
                      {item.TomTat ||
                        item.NoiDung ||
                        "Xem thông tin chi tiết tại trang Tin mới."}
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
            })}

        </div>

      </section>


      {/* =================================================
          CÔNG CỤ NỔI BẬT
      ================================================= */}

      <h2 className="title">
        Công cụ nổi bật
      </h2>


      <div className="cards">

        {tools.map((tool) => {

          const Icon = tool.icon;

          return (
            <Link
              key={tool.title}
              to={tool.path}
              className="card"
            >

              <div
                className={`card-icon card-${tool.color}`}
              >
                <Icon size={34} />
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

    </div>
  );
}

export default Home;