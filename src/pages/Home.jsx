import "./Home.css";
import { Link } from "react-router-dom";
import { news } from "../data/news";

import {
  Search,
  BookOpen,
  ArrowLeftRight,
  Pill,
  Syringe,
  ClipboardList,
  ChevronRight,
} from "lucide-react";

const tools = [
  {
    title: "Tra cứu thuốc",
    description: "Liều dùng, chỉ định, chống chỉ định, ADR, tương tác...",
    icon: Search,
    color: "blue",
    path: "/drug-lookup",
  },
  {
    title: "Mã ICD-10",
    description: "Tra cứu mã bệnh và tên bệnh theo phân loại ICD-10.",
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
    description: "Lựa chọn thuốc thay thế theo phác đồ điều trị phù hợp.",
    icon: Pill,
    color: "red",
    path: "/drug-substitution",
  },
  {
    title: "Dị ứng thuốc",
    description: "Tra cứu thông tin dị ứng thuốc và hướng xử trí.",
    icon: Syringe,
    color: "yellow",
    path: "/allergy",
  },
];

function Home() {
  return (
    <>
      {/* Banner */}

      <section className="banner">
        <h1>RxCliPha</h1>

        <h3>Thông tin thuốc & Dược lâm sàng ngoại trú</h3>

        <p>
          Công cụ hỗ trợ Bác sĩ, Điều dưỡng và Dược sĩ lâm sàng trong sử dụng
          thuốc dựa trên bằng chứng
        </p>
      </section>

      {/* Bản tin */}

      <section className="news-banner">
        <div className="news-title">
          <h2>📢 Tin mới</h2>

          <span>Xem tất cả</span>
        </div>

        <div className="news-list">
          {news.map((item) => (
            <div className="news-item" key={item.id}>
              <div className={`news-status ${item.type}`}></div>

              <div className="news-content">
                <h4>{item.title}</h4>

                <p>{item.content}</p>
              </div>

              <small>{item.date}</small>
            </div>
          ))}
        </div>
      </section>

      {/* Công cụ */}

      <h2 className="title">Công cụ nổi bật</h2>

      <div className="cards">
        {tools.map((tool) => {
          const Icon = tool.icon;

          return (
            <Link
              key={tool.title}
              to={tool.path}
              className="card"
            >
              <div className={`card-icon card-${tool.color}`}>
                <Icon size={34} />
              </div>

              <h3>{tool.title}</h3>

              <p>{tool.description}</p>

              <span>
                Truy cập ngay
                <ChevronRight size={18} />
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

export default Home;