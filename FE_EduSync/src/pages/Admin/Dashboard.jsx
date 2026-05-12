import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faUsersCog,
  faBook,
  faMoneyBillWave,
  faListCheck,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

const AdminDashboard = () => {
  // Dữ liệu các thẻ tính năng đã được Việt hóa
  const cards = [
    {
      title: "Quản lý người dùng",
      description: "Quản trị thông tin học viên, giảng viên và trạng thái tài khoản hệ thống.",
      icon: faUsersCog,
      path: "/admin/users",
      accent: "from-blue-600 to-indigo-600",
    },
    {
      title: "Quản lý khóa học",
      description: "Theo dõi danh sách khóa học, điều chỉnh giá bán và kiểm soát nội dung.",
      icon: faBook,
      path: "/admin/courses",
      accent: "from-emerald-600 to-teal-600",
    },
    {
      title: "Phê duyệt nội dung",
      description: "Xem xét các yêu cầu xuất bản khóa học mới và cập nhật bài học.",
      icon: faListCheck,
      path: "/admin/approvals",
      accent: "from-amber-600 to-orange-600",
    },
    {
      title: "Báo cáo doanh thu",
      description: "Thống kê chi tiết tài chính, dòng tiền và các chỉ số tăng trưởng.",
      icon: faMoneyBillWave,
      path: "/admin/revenue",
      accent: "from-violet-600 to-purple-600",
    },
  ];

  return (
    <div className="animate-fade-slide-up max-w-6xl mx-auto space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-blue-600 mb-2">
            <FontAwesomeIcon icon={faChartPie} className="text-2xl" />
            <span className="text-xs font-black uppercase tracking-widest">
              Tổng quan hệ thống
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Bảng điều khiển Admin
          </h1>
          <p className="text-slate-600 font-medium mt-2 max-w-xl">
            Truy cập nhanh vào các khu vực quản trị trọng yếu của hệ thống EduSync.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cards.map((card) => (
          <Link
            key={card.path}
            to={card.path}
            className="group bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-slate-900/5 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* Thanh màu điểm nhấn phía trên */}
            <div
              className={`h-2 bg-gradient-to-r ${card.accent} shrink-0`}
              aria-hidden="true"
            />
            <div className="p-6 sm:p-8 flex-1 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.accent} text-white flex items-center justify-center text-xl shadow-lg`}
                >
                  <FontAwesomeIcon icon={card.icon} />
                </div>
                <span className="text-slate-400 group-hover:text-blue-600 transition-colors">
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className="text-lg group-hover:translate-x-1 transition-transform"
                  />
                </span>
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 group-hover:text-blue-900 transition-colors">
                  {card.title}
                </h2>
                <p className="text-slate-600 text-sm font-medium mt-2 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;