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

// Mock dữ liệu Khóa học của tôi
const myCoursesData = [
  {
    id: 1,
    title: "Lập trình Python cơ bản đến nâng cao cho người mới bắt đầu",
    instructor: "Nguyễn Văn A",
    thumbnail:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?w=800&q=80",
    progress: 45, // % hoàn thành
    totalLessons: 120,
    completedLessons: 54,
    lastAccessed: "2 giờ trước",
    status: "in-progress", // đang học
  },
  {
    id: 2,
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
    title: "Data Analysis: Phân tích dữ liệu với Pandas & NumPy",
    instructor: "Phạm D.",
    thumbnail:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    progress: 100,
    totalLessons: 45,
    completedLessons: 45,
    lastAccessed: "Tuần trước",
    status: "completed", // đã hoàn thành
    certificateId: "CER-2026-8899",
  },
  {
    id: 4,
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
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'in-progress', 'completed'
  const [searchTerm, setSearchTerm] = useState("");

  // Lọc dữ liệu theo Tab và Từ khóa tìm kiếm
  const filteredCourses = myCoursesData.filter((course) => {
    const matchesTab = activeTab === "all" || course.status === activeTab;
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <main className="animate-fade-slide-up w-full pb-12">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* TIÊU ĐỀ TRANG */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Khóa học của tôi
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Tiếp tục hành trình học tập và theo dõi tiến độ của bạn.
          </p>
        </div>

        {/* BỘ LỌC VÀ TÌM KIẾM (TABS & SEARCH) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === "all"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab("in-progress")}
              className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === "in-progress"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Đang học
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === "completed"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Hoàn thành
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80 shrink-0">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-4 top-3 text-slate-400"
            />
            <input
              type="text"
              placeholder="Tìm khóa học của bạn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* LƯỚI KHÓA HỌC */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
              >
                {/* Hình ảnh (Thumbnail) */}
                <div className="relative aspect-video overflow-hidden bg-slate-200">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Lớp phủ đen khi hover */}
                  <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-blue-600 transform scale-50 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                      <FontAwesomeIcon
                        icon={faPlayCircle}
                        className="text-3xl"
                      />
                    </div>
                  </div>

                  {/* Tag trạng thái */}
                  {course.status === "completed" && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-black tracking-wider uppercase rounded-md shadow-sm flex items-center gap-1">
                      <FontAwesomeIcon icon={faCheckCircle} /> Đã xong
                    </span>
                  )}
                </div>

                {/* Nội dung Card */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Tên khóa học */}
                  <h3 className="font-bold text-[16px] text-slate-800 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors mb-2">
                    {course.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mb-4">
                    Giảng viên: {course.instructor}
                  </p>

                  {/* Thanh tiến độ */}
                  <div className="mt-auto">
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-xs font-bold text-slate-700">
                        {course.progress}% hoàn thành
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {course.completedLessons}/{course.totalLessons} bài
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${course.status === "completed" ? "bg-emerald-500" : "bg-blue-600"}`}
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Phần Action (Tiếp tục học / Nhận chứng chỉ) */}
                <div className="px-5 pb-5 pt-3 border-t border-slate-50 bg-slate-50/50">
                  {course.status === "completed" ? (
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200 flex items-center justify-center gap-2">
                        <FontAwesomeIcon icon={faCertificate} /> Xem chứng chỉ
                      </button>
                      <button
                        className="px-3 py-2 bg-white text-amber-500 font-bold text-xs rounded-lg hover:bg-amber-50 transition-colors border border-slate-200 shadow-sm"
                        title="Đánh giá khóa học"
                      >
                        <FontAwesomeIcon icon={faStar} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                        <FontAwesomeIcon icon={faClock} /> Học lần cuối:{" "}
                        {course.lastAccessed}
                      </span>
                      <button className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition-colors shadow-sm active:scale-95">
                        Tiếp tục học
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* TRẠNG THÁI TRỐNG (EMPTY STATE) */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center mt-4">
            <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-slate-100 flex items-center justify-center text-5xl text-slate-300 mb-6">
              <FontAwesomeIcon icon={faFolderOpen} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">
              Không tìm thấy khóa học nào
            </h2>
            <p className="text-slate-500 font-medium max-w-md mb-8">
              {searchTerm
                ? "Thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc khác xem sao nhé."
                : "Bạn chưa đăng ký khóa học nào. Khám phá các khóa học thú vị trên EduSync ngay!"}
            </p>
            <Link
              to="/courses"
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition duration-300 shadow-sm active:scale-95"
            >
              Khám phá khóa học
            </Link>
          </div>
        )}
      </div>
    </main>
  );
};

export default LearnerMyCoursesPage;
