import "./News.css";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import {
  PackageX,
  Clock3,
  PackagePlus,
  TriangleAlert,
  Bell,
  Info,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  AlertTriangle,
  FileText,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";

/* =====================================================
   GOOGLE SHEETS API
===================================================== */

const API_URL =
  "https://script.google.com/macros/s/AKfycbzX_ibLbT_-rz6f5z6i_MV5am4B_lEWwR6HwdpqVj3QYNljZC9SJ00Uvx2-y4pmLpnWDg/exec";

/* =====================================================
   NHÓM TIN
===================================================== */

const newsGroups = [
  {
    name: "Thông báo mới từ khoa Dược",
    icon: Bell,
  },
  {
    name: "Thuốc hết số lượng, gián đoạn cung ứng",
    icon: PackageX,
  },
  {
    name: "Thuốc chậm sử dụng",
    icon: Clock3,
  },
  {
    name: "Thuốc mới",
    icon: PackagePlus,
  },
  {
    name: "ADR/Thu hồi thuốc",
    icon: TriangleAlert,
  },
  {
    name: "Lưu ý khi dùng thuốc",
    icon: Info,
  },
];

/* =====================================================
   LOAD NEWS TỪ GOOGLE SHEETS
===================================================== */

function loadNews() {
  return new Promise((resolve, reject) => {
    const callbackName =
      "rxcliphaNewsCallback";

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
          "Không thể tải dữ liệu tin mới từ Google Sheets."
        )
      );
    };

    /*
     * QUAN TRỌNG:
     * Phải truyền callback lên Apps Script.
     */

    script.src =
      `${API_URL}?type=news&callback=${encodeURIComponent(
        callbackName
      )}&_=${Date.now()}`;

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
    /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(
      text
    )
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

  return 0;
}

/* =====================================================
   XỬ LÝ LINK GOOGLE DRIVE
===================================================== */

function convertDriveUrl(
  url,
  type = "preview"
) {
  if (!url) return "";

  const value = String(url).trim();

  if (!value) return "";

  /* =================================================
     GOOGLE DRIVE:
     /file/d/FILE_ID/view
  ================================================= */

  const fileMatch = value.match(
    /drive\.google\.com\/file\/d\/([^/]+)/
  );

  if (fileMatch) {
    const fileId = fileMatch[1];

    if (type === "image") {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
    }

    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  /* =================================================
     GOOGLE DRIVE:
     /open?id=FILE_ID
  ================================================= */

  const openMatch = value.match(
    /drive\.google\.com\/open\?id=([^&]+)/
  );

  if (openMatch) {
    const fileId = openMatch[1];

    if (type === "image") {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
    }

    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  /* =================================================
     GOOGLE DRIVE:
     /uc?id=FILE_ID
  ================================================= */

  const ucMatch = value.match(
    /drive\.google\.com\/uc\?.*id=([^&]+)/
  );

  if (ucMatch) {
    const fileId = ucMatch[1];

    if (type === "image") {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
    }

    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  /* =================================================
     GOOGLE DRIVE:
     thumbnail?id=FILE_ID
  ================================================= */

  const thumbnailMatch = value.match(
    /drive\.google\.com\/thumbnail\?id=([^&]+)/
  );

  if (thumbnailMatch) {
    const fileId = thumbnailMatch[1];

    if (type === "image") {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
    }

    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  /* =================================================
     CHỈ NHẬP FILE ID
  ================================================= */

  if (
    /^[a-zA-Z0-9_-]{20,}$/.test(value)
  ) {
    if (type === "image") {
      return `https://drive.google.com/thumbnail?id=${value}&sz=w1600`;
    }

    return `https://drive.google.com/file/d/${value}/preview`;
  }

  /* =================================================
     URL THÔNG THƯỜNG
  ================================================= */

  return value;
}

/* =====================================================
   NEWS COMPONENT
===================================================== */

export default function News() {
  /*
   * Lấy title từ URL.
   *
   * Ví dụ:
   *
   * /news?title=Thông%20báo%20thuốc%20mới
   */

  const [searchParams] =
    useSearchParams();

  const targetTitle =
    searchParams.get("title") || "";

  const [selectedGroup, setSelectedGroup] =
    useState("Tất cả");

  /*
   * Lưu tiêu đề tin đang mở
   * thay vì index.
   */

  const [openNews, setOpenNews] =
    useState(null);

  const [news, setNews] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  const hasLoaded =
    useRef(false);

  /*
   * Tránh useEffect mở tin nhiều lần
   */

  const hasOpenedTarget =
    useRef(false);

  /* ===================================================
     TẢI DỮ LIỆU
  =================================================== */

  useEffect(() => {
    if (hasLoaded.current) {
      return;
    }

    hasLoaded.current = true;

    async function fetchNews() {
      try {
        setLoading(true);
        setLoadError("");

        const data =
          await loadNews();

        /*
         * Chỉ hiển thị tin:
         *
         * TrangThai = Đang hiển thị
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
         * Tin mới nhất lên đầu
         */

        activeNews.sort((a, b) => {
          return (
            getDateValue(b.Ngay) -
            getDateValue(a.Ngay)
          );
        });

        setNews(activeNews);
      } catch (error) {
        console.error(
          "Lỗi tải tin mới:",
          error
        );

        setLoadError(
          error.message ||
            "Không thể tải dữ liệu tin mới."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, []);

  /* ===================================================
     TỰ ĐỘNG MỞ TIN TỪ TRANG CHỦ
  =================================================== */

  useEffect(() => {
    if (
      !targetTitle ||
      news.length === 0 ||
      hasOpenedTarget.current
    ) {
      return;
    }

    /*
     * Tìm tin theo tiêu đề
     */

    const targetNews =
      news.find(
        (item) =>
          String(
            item.TieuDe || ""
          ).trim() ===
          String(
            targetTitle
          ).trim()
      );

    /*
     * Không tìm thấy
     */

    if (!targetNews) {
      return;
    }

    /*
     * Xác định nhóm của tin
     */

    const targetGroup =
      String(
        targetNews.Nhom || ""
      ).trim();

    /*
     * Nếu hiện tại chưa ở đúng nhóm
     * thì chuyển sang nhóm đó trước.
     */

    if (
      selectedGroup !== targetGroup
    ) {
      setSelectedGroup(
        targetGroup
      );

      return;
    }

    /*
     * Mở đúng tin
     */

    setOpenNews(
      targetNews.TieuDe
    );

    hasOpenedTarget.current =
      true;
  }, [
    news,
    selectedGroup,
    targetTitle,
  ]);

  /* ===================================================
     LỌC THEO NHÓM
  =================================================== */

  const filteredNews =
    selectedGroup === "Tất cả"
      ? news
      : news.filter(
          (item) =>
            String(
              item.Nhom || ""
            ).trim() ===
            selectedGroup
        );

  /* ===================================================
     MỞ / ĐÓNG TIN
  =================================================== */

  const toggleNews = (
    title
  ) => {
    setOpenNews(
      openNews === title
        ? null
        : title
    );
  };

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div className="news-page">

      {/* =============================================
          HEADER
      ============================================= */}

      <div className="news-page-header">

        <div>

          <h1>
            TIN MỚI
          </h1>

          <p>
            Cập nhật thông tin thuốc
            và thông báo từ khoa Dược
          </p>

        </div>

      </div>

      {/* =============================================
          DANH MỤC
      ============================================= */}

      <div className="news-filter-card">

        <div className="news-filter-title">

          <span>
            Danh mục thông tin
          </span>

        </div>

        <div className="news-filter-list">

          {/* =====================================
              TẤT CẢ
          ===================================== */}

          <button
            className={
              selectedGroup === "Tất cả"
                ? "news-filter active"
                : "news-filter"
            }
            onClick={() => {
              setSelectedGroup(
                "Tất cả"
              );

              setOpenNews(null);
            }}
          >
            Tất cả
          </button>

          {/* =====================================
              CÁC NHÓM
          ===================================== */}

          {newsGroups.map(
            (group) => {
              const Icon =
                group.icon;

              return (
                <button
                  key={group.name}
                  className={
                    selectedGroup ===
                    group.name
                      ? "news-filter active"
                      : "news-filter"
                  }
                  onClick={() => {
                    setSelectedGroup(
                      group.name
                    );

                    setOpenNews(
                      null
                    );
                  }}
                >
                  <Icon
                    size={17}
                  />

                  {group.name}
                </button>
              );
            }
          )}

        </div>

      </div>

      {/* =============================================
          DANH SÁCH TIN
      ============================================= */}

      <div className="news-list-card">

        <div className="news-list-header">

          <div>

            <h2>
              {selectedGroup ===
              "Tất cả"
                ? "Tất cả tin mới"
                : selectedGroup}
            </h2>

            <p>
              {loading
                ? "Đang tải..."
                : `${filteredNews.length} thông tin`}
            </p>

          </div>

        </div>

        {/* =========================================
            LOADING
        ========================================= */}

        {loading && (
          <div className="news-empty">

            <Bell
              size={40}
            />

            <h3>
              Đang tải thông tin
            </h3>

            <p>
              Đang kết nối với
              cơ sở dữ liệu tin mới.
            </p>

          </div>
        )}

        {/* =========================================
            ERROR
        ========================================= */}

        {!loading &&
          loadError && (
            <div className="news-empty">

              <AlertTriangle
                size={40}
              />

              <h3>
                Không thể tải dữ liệu
              </h3>

              <p>
                {loadError}
              </p>

            </div>
          )}

        {/* =========================================
            KHÔNG CÓ TIN
        ========================================= */}

        {!loading &&
          !loadError &&
          filteredNews.length === 0 && (
            <div className="news-empty">

              <Bell
                size={40}
              />

              <h3>
                Chưa có thông tin
              </h3>

              <p>
                Hiện chưa có tin mới
                trong danh mục này.
              </p>

            </div>
          )}

        {/* =========================================
            LIST
        ========================================= */}

        {!loading &&
          !loadError &&
          filteredNews.length > 0 && (

            <div className="news-list">

              {filteredNews.map(
                (item, index) => {

                  /* =================================
                     TÌM ICON
                  ================================= */

                  const group =
                    newsGroups.find(
                      (group) =>
                        group.name ===
                        String(
                          item.Nhom || ""
                        ).trim()
                    );

                  const Icon =
                    group?.icon ||
                    Bell;

                  /*
                   * Tin đang mở
                   */

                  const isOpen =
                    openNews ===
                    item.TieuDe;

                  /* =================================
                     LINK HÌNH ẢNH
                  ================================= */

                  const imageUrl =
                    item.HinhAnh
                      ? convertDriveUrl(
                          item.HinhAnh,
                          "image"
                        )
                      : "";

                  /* =================================
                     LINK PDF
                  ================================= */

                  const pdfUrl =
                    item.FilePDF
                      ? convertDriveUrl(
                          item.FilePDF,
                          "preview"
                        )
                      : "";

                  return (
                    <div
                      className={
                        isOpen
                          ? "news-item open"
                          : "news-item"
                      }
                      key={`${item.TieuDe}-${item.Ngay}-${index}`}
                    >

                      {/* =================================
                          HEADER TIN
                      ================================= */}

                      <button
                        className="news-item-header"
                        onClick={() =>
                          toggleNews(
                            item.TieuDe
                          )
                        }
                      >

                        {/* ICON */}

                        <div className="news-item-icon">

                          <Icon
                            size={21}
                          />

                        </div>

                        {/* NỘI DUNG CHÍNH */}

                        <div className="news-item-main">

                          <div className="news-item-meta">

                            <span className="news-category">

                              {item.Nhom}

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
                            {item.TomTat}
                          </p>

                        </div>

                        {/* MŨI TÊN */}

                        <div className="news-toggle">

                          {isOpen ? (

                            <ChevronUp
                              size={21}
                            />

                          ) : (

                            <ChevronDown
                              size={21}
                            />

                          )}

                        </div>

                      </button>

                      {/* =================================
                          CHI TIẾT
                      ================================= */}

                      {isOpen && (

                        <div className="news-detail">

                          <div className="news-detail-content">

                            {/* =================================
                                NỘI DUNG TEXT
                            ================================= */}

                            <h4>
                              Nội dung thông tin
                            </h4>

                            <p>
                              {item.NoiDung ||
                                "Chưa có nội dung chi tiết."}
                            </p>

                            {/* =================================
                                HÌNH ẢNH
                            ================================= */}

                            {imageUrl && (

                              <div className="news-attachment">

                                <div className="news-attachment-title">

                                  <ImageIcon
                                    size={18}
                                  />

                                  <span>
                                    Hình ảnh đính kèm
                                  </span>

                                </div>

                                <div className="news-image-wrapper">

                                  <img
                                    src={imageUrl}
                                    alt={
                                      item.TieuDe ||
                                      "Hình ảnh thông tin"
                                    }
                                    className="news-image"
                                    onError={(
                                      event
                                    ) => {

                                      event.currentTarget.style.display =
                                        "none";

                                      const parent =
                                        event.currentTarget
                                          .parentElement;

                                      if (
                                        parent
                                      ) {

                                        parent.innerHTML = `
                                          <div style="
                                            padding: 30px;
                                            text-align: center;
                                            color: #94a3b8;
                                            font-size: 14px;
                                            line-height: 1.6;
                                          ">
                                            Không thể hiển thị hình ảnh.
                                            <br />
                                            Vui lòng kiểm tra quyền chia sẻ của file Google Drive.
                                          </div>
                                        `;

                                      }

                                    }}
                                  />

                                </div>

                              </div>

                            )}

                            {/* =================================
                                PDF
                            ================================= */}

                            {pdfUrl && (

                              <div className="news-attachment">

                                <div className="news-attachment-title">

                                  <FileText
                                    size={18}
                                  />

                                  <span>
                                    Tài liệu PDF
                                  </span>

                                </div>

                                <div className="news-pdf-wrapper">

                                  <iframe
                                    src={pdfUrl}
                                    title={
                                      item.TieuDe ||
                                      "Tài liệu PDF"
                                    }
                                    className="news-pdf"
                                  />

                                </div>

                                <a
                                  href={pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="news-pdf-link"
                                >

                                  <ExternalLink
                                    size={16}
                                  />

                                  Mở PDF trong cửa sổ mới

                                </a>

                              </div>

                            )}

                            {/* =================================
                                KHÔNG CÓ FILE
                            ================================= */}

                            {!imageUrl &&
                              !pdfUrl && (

                                <div className="news-detail-note">

                                  Tin này hiện chỉ có
                                  nội dung văn bản.

                                </div>

                              )}

                          </div>

                        </div>

                      )}

                    </div>
                  );
                }
              )}

            </div>
          )}

      </div>

    </div>
  );
}