import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlayCircle,
  faCheckCircle,
  faSearch,
  faCertificate,
  faStar,
  faFolderOpen,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

// =========================================================================
// MOCK DATA
// =========================================================================
const myCoursesData = [
  {
    id: 1,
    categoryId: "backend",
    title: "Lập trình Python cơ bản đến nâng cao cho người mới bắt đầu",
    instructor: "Nguyễn Văn A",
    thumbnail:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?w=800&q=80",
    progress: 45,
    totalLessons: 120,
    completedLessons: 54,
    lastAccessed: "2 giờ trước",
    status: "in-progress",
  },
  {
    id: 2,
    categoryId: "uiux",
    title: "UI/UX Design Thực chiến với Figma 2026",
    instructor: "Trần Thị B.",
    thumbnail:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    progress: 85,
    totalLessons: 64,
    completedLessons: 54,
    lastAccessed: "Hôm qua",
    status: "in-progress",
  },
  {
    id: 3,
    categoryId: "da",
    title: "Data Analysis: Phân tích dữ liệu với Pandas & NumPy",
    instructor: "Phạm D.",
    thumbnail:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    progress: 100,
    totalLessons: 45,
    completedLessons: 45,
    lastAccessed: "Tuần trước",
    status: "completed",
    certificateId: "CER-2026-8899",
  },
  {
    id: 4,
    categoryId: "backend",
    title: "Kiến trúc Hệ thống Microservices căn bản",
    instructor: "Lê Văn C.",
    thumbnail:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
    progress: 5,
    totalLessons: 80,
    completedLessons: 4,
    lastAccessed: "1 tháng trước",
    status: "in-progress",
  },
];

const LearnerMyCoursesPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredCourses = myCoursesData.filter((course) => {
    const matchesTab = activeTab === "all" || course.status === activeTab;
    const matchesCategory =
      selectedCategory === "all" || course.categoryId === selectedCategory;
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesTab && matchesCategory && matchesSearch;
  });

  const clearFilters = () => {
    setSelectedCategory("all");
    setSearchTerm("");
    setActiveTab("all");
  };

  return (
    <main className="animate-fade-slide-up w-full pb-12 bg-slate-50 min-h-screen">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* TIÊU ĐỀ TRANG */}
        <div className="mb-8 border-b border-slate-200/80 pb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Khóa học của tôi
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Tiếp tục hành trình học tập và theo dõi tiến độ của bạn.
          </p>
        </div>

        {/* LAYOUT FULL WIDTH */}
        <div className="flex-1 w-full min-w-0">
          {/* Header: Tabs & Search */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
            <div className="flex p-1 bg-white border border-slate-200/60 rounded-xl shadow-sm w-full md:w-fit overflow-x-auto scrollbar-hide">
              {[
                { id: "all", label: "Tất cả" },
                { id: "in-progress", label: "Đang học" },
                { id: "completed", label: "Hoàn thành" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full xl:w-80 shrink-0">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-3.5 text-slate-400"
              />
              <input
                type="text"
                placeholder="Tìm khóa học của bạn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* LƯỚI KHÓA HỌC - ĐÃ CHỈNH LẠI GRID CHUẨN MÀN HÌNH RỘNG */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
                >
                  {/* Ảnh Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-slate-200">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-14 h-14 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-blue-600 transform scale-50 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                        <FontAwesomeIcon
                          icon={faPlayCircle}
                          className="text-3xl ml-1"
                        />
                      </div>
                    </div>
                    {course.status === "completed" && (
                      <span className="absolute top-3 left-3 px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-black tracking-widest uppercase rounded-lg shadow-sm flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faCheckCircle} /> Đã xong
                      </span>
                    )}
                  </div>

                  {/* Nội dung Card */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-extrabold text-[17px] text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                      {course.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mb-6">
                      Giảng viên:{" "}
                      <span className="text-slate-700">
                        {course.instructor}
                      </span>
                    </p>

                    <div className="mt-auto">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-black text-slate-800">
                          {course.progress}%{" "}
                          <span className="font-medium text-slate-500 text-xs ml-1">
                            hoàn thành
                          </span>
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                          {course.completedLessons}/{course.totalLessons} bài
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${course.status === "completed" ? "bg-emerald-500" : "bg-blue-600"}`}
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                    {course.status === "completed" ? (
                      <div className="flex gap-3">
                        <button className="flex-1 py-2.5 bg-emerald-50 text-emerald-700 font-bold text-sm rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-200 flex items-center justify-center gap-2">
                          <FontAwesomeIcon icon={faCertificate} /> Xem chứng chỉ
                        </button>
                        <button
                          className="px-4 py-2.5 bg-white text-amber-500 font-bold text-sm rounded-xl hover:bg-amber-50 transition-colors border border-slate-200 shadow-sm"
                          title="Đánh giá khóa học"
                        >
                          <FontAwesomeIcon icon={faStar} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faClock} /> Học lần cuối:{" "}
                          {course.lastAccessed}
                        </span>
                        <button className="px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20 active:scale-95">
                          Tiếp tục học
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-16 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-slate-100 flex items-center justify-center text-5xl text-slate-300 mb-6">
                <FontAwesomeIcon icon={faFolderOpen} />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800 mb-2">
                Không tìm thấy khóa học nào
              </h2>
              <p className="text-slate-500 font-medium max-w-md mb-8">
                {searchTerm || selectedCategory !== "all" || activeTab !== "all"
                  ? "Thử xóa bộ lọc hoặc thay đổi từ khóa tìm kiếm xem sao nhé."
                  : "Bạn chưa đăng ký khóa học nào. Khám phá các khóa học thú vị trên EduSync ngay!"}
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition duration-300 shadow-sm active:scale-95"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default LearnerMyCoursesPage;
