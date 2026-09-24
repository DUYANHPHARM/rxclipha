import { Routes, Route, NavLink } from "react-router-dom";
import { useState } from "react";
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
} from "lucide-react";

function App() {
  const [openChat, setOpenChat] = useState(false);

  return (
    <div className="app">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">

        <div className="logo">

          <div className="logo-icon">
            <strong>eRx</strong>
          </div>

          <div>
            <h2>RxCliPha</h2>
            <p>Rx Dược lâm sàng</p>
          </div>

        </div>


        <nav>

          {/* Trang chủ */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <House size={20} />
            Trang chủ
          </NavLink>


          {/* Tin mới */}
          <NavLink
            to="/news"
            className={({ isActive }) =>
              isActive
                ? "menu-item active"
                : "menu-item"
            }
          >
            <Newspaper size={21} />
            <span>Tin mới</span>
          </NavLink>


          {/* Tra cứu thuốc */}
          <NavLink
            to="/drug-lookup"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <Search size={20} />
            Tra cứu thuốc
          </NavLink>


          {/* ICD-10 */}
          <NavLink
            to="/icd10"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <BookOpen size={20} />
            ICD-10
          </NavLink>


          {/* Báo cáo */}
          <NavLink
            to="/report"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <ClipboardList size={20} />
            Báo cáo Dược lâm sàng
          </NavLink>


          {/* Tương tác thuốc */}
          <NavLink
            to="/interaction"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <ArrowLeftRight size={20} />
            Tương tác thuốc
          </NavLink>


          {/* Thay thế thuốc */}
          <NavLink
            to="/drug-substitution"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <Pill size={20} />
            Thay thế thuốc
          </NavLink>


          {/* Dị ứng thuốc */}
          <NavLink
            to="/allergy"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <Syringe size={20} />
            Dị ứng thuốc
          </NavLink>


          {/* Hướng dẫn điều trị */}
          <NavLink
            to="/guidelines"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <BookHeart size={20} />
            Hướng dẫn điều trị
          </NavLink>

        </nav>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="content">


        {/* =================================================
            HEADER
        ================================================= */}

        <header>

          <div className="header-info">


            {/* =============================================
                NGƯỜI PHÁT TRIỂN
            ============================================= */}

            <div className="header-card">

              <div className="header-icon">
                <UserRound size={25} />
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
                <Hospital size={25} />
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
    <HeartPulse size={30} />
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

          {/* Trang chủ */}
          <Route
            path="/"
            element={<Home />}
          />


          {/* Tương tác thuốc */}
          <Route
            path="/interaction"
            element={<Interaction />}
          />


          {/* Báo cáo */}
          <Route
            path="/report"
            element={<Report />}
          />


          {/* Tin mới */}
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


            <X
              size={20}
              style={{
                cursor: "pointer",
              }}
              onClick={() =>
                setOpenChat(false)
              }
            />

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
      >

        <MessageCircle size={28} />

      </button>

    </div>
  );
}

export default App;