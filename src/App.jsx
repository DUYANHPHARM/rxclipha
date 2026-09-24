import {
  Routes,
  Route,
  NavLink,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import "./App.css";

import Home from "./pages/Home";
import Interaction from "./pages/Interaction";
import Report from "./pages/Report";
import News from "./pages/News";

import {
  House,
  Search,
  BookOpen,
  ArrowLeftRight,
  Pill,
  Syringe,
  BookHeart,
  MessageCircle,
  X,
  Send,
  Bot,
  ClipboardList,
  Newspaper,
  UserRound,
  Hospital,
  HeartPulse,
  Menu,
} from "lucide-react";


/* =====================================================
   MENU
===================================================== */

const menuItems = [
  {
    path: "/",
    label: "Trang chủ",
    icon: House,
    end: true,
  },
  {
    path: "/news",
    label: "Tin mới",
    icon: Newspaper,
  },
  {
    path: "/drug-lookup",
    label: "Tra cứu thuốc",
    icon: Search,
  },
  {
    path: "/icd10",
    label: "ICD-10",
    icon: BookOpen,
  },
  {
    path: "/report",
    label: "Báo cáo Dược",
    icon: ClipboardList,
  },
  {
    path: "/interaction",
    label: "Tương tác thuốc",
    icon: ArrowLeftRight,
  },
  {
    path: "/drug-substitution",
    label: "Thay thế thuốc",
    icon: Pill,
  },
  {
    path: "/allergy",
    label: "Dị ứng thuốc",
    icon: Syringe,
  },
  {
    path: "/guidelines",
    label: "Hướng dẫn điều trị",
    icon: BookHeart,
  },
];


/* =====================================================
   MENU LINK
===================================================== */

function MenuLink({
  item,
  onClick,
}) {

  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        isActive
          ? "active"
          : ""
      }
    >

      <Icon size={20} />

      <span>
        {item.label}
      </span>

    </NavLink>
  );
}


/* =====================================================
   APP
===================================================== */

function App() {

  const [openChat, setOpenChat] =
    useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const location =
    useLocation();


  /* ===================================================
     TỰ ĐỘNG ĐÓNG MENU KHI CHUYỂN TRANG
  =================================================== */

  useEffect(() => {

    setMobileMenuOpen(false);

  }, [location.pathname]);


  /* ===================================================
     KHÓA SCROLL BODY KHI MENU MOBILE MỞ
  =================================================== */

  useEffect(() => {

    if (mobileMenuOpen) {

      document.body.style.overflow =
        "hidden";

    } else {

      document.body.style.overflow =
        "";

    }

    return () => {

      document.body.style.overflow =
        "";

    };

  }, [mobileMenuOpen]);


  return (

    <div className="app">


      {/* =====================================================
          DESKTOP SIDEBAR
          GIỮ NGUYÊN
      ===================================================== */}

      <aside className="sidebar">

        <div className="logo">

          <div className="logo-icon">
            <strong>eRx</strong>
          </div>

          <div>

            <h2>
              RxCliPha
            </h2>

            <p>
              Rx Dược lâm sàng
            </p>

          </div>

        </div>


        <nav>

          {menuItems.map(
            (item) => (

              <MenuLink
                key={item.path}
                item={item}
              />

            )
          )}

        </nav>

      </aside>


      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {mobileMenuOpen && (

        <div
          className="mobile-overlay"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        />

      )}


      {/* =====================================================
          MOBILE SIDEBAR
      ===================================================== */}

      <aside
        className={
          mobileMenuOpen
            ? "mobile-sidebar mobile-sidebar-open"
            : "mobile-sidebar"
        }
      >

        {/* ================= HEADER ================= */}

        <div className="mobile-sidebar-header">

          <div className="mobile-logo">

            <div className="mobile-logo-icon">
              <strong>eRx</strong>
            </div>

            <div>

              <strong>
                RxCliPha
              </strong>

              <span>
                Rx Dược lâm sàng
              </span>

            </div>

          </div>


          <button
            className="mobile-close-button"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            aria-label="Đóng menu"
          >

            <X size={22} />

          </button>

        </div>


        {/* ================= MENU ================= */}

        <nav className="mobile-nav">

          {menuItems.map(
            (item) => (

              <MenuLink
                key={item.path}
                item={item}
                onClick={() =>
                  setMobileMenuOpen(false)
                }
              />

            )
          )}

        </nav>


        {/* ================= FOOTER ================= */}

        <div className="mobile-sidebar-footer">

          <div className="mobile-footer-icon">
            <HeartPulse size={18} />
          </div>

          <div>

            <strong>
              RxCliPha
            </strong>

            <span>
              Dược lâm sàng ngoại trú
            </span>

          </div>

        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="content">


        {/* =================================================
            MOBILE TOP BAR
        ================================================= */}

        <div className="mobile-topbar">

          <div className="mobile-topbar-left">

            <div className="mobile-top-logo">
              <strong>eRx</strong>
            </div>

            <div className="mobile-top-text">

              <strong>
                RxCliPha
              </strong>

              <span>
                Rx Dược lâm sàng
              </span>

            </div>

          </div>


          <button
            className="mobile-menu-button"
            onClick={() =>
              setMobileMenuOpen(true)
            }
            aria-label="Mở menu"
          >

            <Menu size={25} />

          </button>

        </div>


        {/* =================================================
            DESKTOP HEADER
            GIỮ NGUYÊN
        ================================================= */}

        <header>

          <div className="header-info">


            {/* =============================================
                NGƯỜI PHÁT TRIỂN
            ============================================= */}

            <div className="header-card">

              <div className="header-icon">

                <UserRound
                  size={25}
                />

              </div>

              <div className="header-text">

                <span>
                  Phát triển bởi
                </span>

                <strong>
                  DS. Nguyễn Duy Anh
                </strong>

              </div>

            </div>


            {/* =============================================
                ĐƯỜNG PHÂN CÁCH
            ============================================= */}

            <div className="header-divider"></div>


            {/* =============================================
                ĐƠN VỊ
            ============================================= */}

            <div className="header-card">

              <div className="header-icon">

                <Hospital
                  size={25}
                />

              </div>

              <div className="header-text">

                <strong>
                  Khoa Dược
                </strong>

                <span>
                  Bệnh viện Đa Khoa Bình Thạnh
                </span>

              </div>

            </div>


            {/* =============================================
                ĐƯỜNG PHÂN CÁCH
            ============================================= */}

            <div className="header-divider"></div>


            {/* =============================================
                MÔ TẢ RXCLIPHA
            ============================================= */}

            <div className="header-card platform-card">

              <div className="header-icon">

                <HeartPulse
                  size={30}
                />

              </div>

              <div className="header-text">

                <strong>
                  Nền tảng thông tin thuốc
                </strong>

                <span>
                  & Dược lâm sàng ngoại trú
                </span>

              </div>

            </div>

          </div>

        </header>


        {/* =================================================
            ROUTES
        ================================================= */}

        <Routes>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/interaction"
            element={<Interaction />}
          />

          <Route
            path="/report"
            element={<Report />}
          />

          <Route
            path="/news"
            element={<News />}
          />

        </Routes>

      </main>


      {/* =====================================================
          AI CHAT
      ===================================================== */}

      {openChat && (

        <div className="chat-box">


          {/* ================= CHAT HEADER ================= */}

          <div className="chat-header">

            <div>

              <Bot size={22} />

              <div>

                <strong>
                  eRx Trợ lý Dược lâm sàng
                </strong>

                <small>
                  Tra cứu thông tin thuốc
                </small>

              </div>

            </div>


            <button
              className="chat-close-button"
              onClick={() =>
                setOpenChat(false)
              }
              aria-label="Đóng chat"
            >

              <X size={20} />

            </button>

          </div>


          {/* ================= CHAT CONTENT ================= */}

          <div className="chat-content">

            <p>
              👋 Xin chào bác sĩ.
            </p>

            <p>
              Tôi có thể hỗ trợ:
            </p>

            <ul>

              <li>
                💊 Tra cứu thuốc
              </li>

              <li>
                ⚠️ Kiểm tra tương tác thuốc
              </li>

              <li>
                🩺 Chỉnh liều suy thận
              </li>

              <li>
                📖 Hướng dẫn điều trị
              </li>

              <li>
                📋 Tra cứu ICD-10
              </li>

            </ul>

          </div>


          {/* ================= CHAT INPUT ================= */}

          <div className="chat-input">

            <input
              type="text"
              placeholder="Nhập câu hỏi..."
            />

            <button>

              <Send size={18} />

            </button>

          </div>

        </div>

      )}


      {/* =====================================================
          FLOATING CHAT BUTTON
      ===================================================== */}

      <button
        className="chat-button"
        onClick={() =>
          setOpenChat(!openChat)
        }
        aria-label="Mở trợ lý Dược lâm sàng"
      >

        <MessageCircle
          size={28}
        />

      </button>

    </div>

  );
}

export default App;