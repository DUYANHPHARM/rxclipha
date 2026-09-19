import { Routes, Route, NavLink } from "react-router-dom";
import { useState } from "react";
import "./App.css";

import Home from "./pages/Home";
import Interaction from "./pages/Interaction";
import Report from "./pages/Report";

import {
  House,
  Search,
  BookOpen,
  ArrowLeftRight,
  Pill,
  Syringe,
  BookHeart,
  ShieldUser,
  MessageCircle,
  X,
  Send,
  Bot,
  ClipboardList,

} from "lucide-react";

function App() {
  const [openChat, setOpenChat] = useState(false);

  return (
    <div className="app">

      {/* ================= Sidebar ================= */}

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

         <NavLink
  to="/drug-lookup"
  className={({ isActive }) =>
    isActive ? "active" : ""
  }
>
  <Search size={20} />
  Tra cứu thuốc
</NavLink>

          <NavLink
  to="/icd10"
  className={({ isActive }) =>
    isActive ? "active" : ""
  }
>
  <BookOpen size={20} />
  ICD-10
</NavLink>

         <NavLink
  to="/report"
  className={({ isActive }) =>
    isActive ? "active" : ""
  }
>
  <ClipboardList size={20} />
  Báo cáo Dược lâm sàng
</NavLink>

          <NavLink
  to="/interaction"
  className={({ isActive }) =>
    isActive ? "active" : ""
  }
>
  <ArrowLeftRight size={20} />
  Tương tác thuốc
</NavLink>

          <NavLink
  to="/drug-substitution"
  className={({ isActive }) =>
    isActive ? "active" : ""
  }
>
  <Pill size={20} />
  Thay thế thuốc
</NavLink>

          <NavLink
  to="/allergy"
  className={({ isActive }) =>
    isActive ? "active" : ""
  }
>
  <Syringe size={20} />
  Dị ứng thuốc
</NavLink>

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

      {/* ================= Content ================= */}

      <main className="content">

        <header>

  <div className="header-info">

    <div className="user">

      <ShieldUser size={20} />

      Phát triển bởi DS. Nguyễn Duy Anh

    </div>


    <div className="hospital">

      <ShieldUser size={20} />

      BỆNH VIỆN ĐA KHOA BÌNH THẠNH

    </div>

  </div>

</header>

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

        </Routes>

      </main>
            {/* ================= AI Chat ================= */}

      {openChat && (

        <div className="chat-box">

          <div className="chat-header">

            <div>

              <Bot size={22} />

              <div>

                <strong>eRx Trợ lý Dược lâm sàng</strong>

                <small>
                  Tra cứu thông tin thuốc
                </small>

              </div>

            </div>

            <X
              size={20}
              style={{ cursor: "pointer" }}
              onClick={() => setOpenChat(false)}
            />

          </div>

          <div className="chat-content">

            <p>👋 Xin chào bác sĩ.</p>

            <p>Tôi có thể hỗ trợ:</p>

            <ul>

              <li>💊 Tra cứu thuốc</li>

              <li>⚠️ Kiểm tra tương tác thuốc</li>

              <li>🩺 Chỉnh liều suy thận</li>

              <li>📖 Hướng dẫn điều trị</li>

              <li>📋 Tra cứu ICD-10</li>

            </ul>

          </div>

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

      {/* ================= Floatin g Button ================= */}

      <button
        className="chat-button"
        onClick={() => setOpenChat(!openChat)}
      >

        <MessageCircle size={28} />

      </button>

    </div>
  );
}

export default App;