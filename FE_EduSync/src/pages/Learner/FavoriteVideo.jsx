import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlayCircle,
  faHeart,
  faSearch,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";

// Mock dữ liệu cho video yêu thích
const favoriteVideos = [
  {
    id: 1,
    title:
      "Chương 2: Lập trình Python cơ bản - Bài giảng 15: Biến và kiểu dữ liệu",
    courseTitle: "Master Python from basics to advanced",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?w=300&q=80",
    duration: "12:30",
    instructorName: "Nguyễn Văn A",
    rating: 4.8,
  },
  {
    id: 2,
    title: "Chương 4: Xử lý dữ liệu nâng cao - Bài giảng 24: Pandas cơ bản",
    courseTitle: "Python for Data Analysis",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&q=80",
    duration: "24:15",
    instructorName: "Trần Thị B.",
    rating: 4.9,
  },
  {
    id: 3,
    title:
      "Chương 3: UI/UX Design Thực chiến với Figma - Bài giảng 32: Auto Layout",
    courseTitle: "Figma UI/UX Masterclass",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&q=80",
    duration: "32:00",
    instructorName: "Lê Văn C.",
    rating: 4.7,
  },
];

const LearnerFavoritesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [sortBy, setSortBy] = useState("recentlyAdded");

  // Xử lý bỏ yêu thích (tạm thời mockup)
  const handleUnfavorite = (videoId) => {
    alert(`Đã bỏ yêu thích video có ID: ${videoId}`);
  };

  return (
    // Dùng thẻ <main> với hiệu ứng fade-up thay vì bọc LearnerLayout
    <main className="animate-fade-slide-up w-full pb-12">
      <div className="p-2 sm:p-6 lg:p-8">
        {/* TIÊU ĐỀ TRANG */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">
            Video yêu thích của tôi
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Xem lại những bài giảng video bạn đã lưu.
          </p>
        </div>

        {/* THANH CÔNG CỤ: TÌM KIẾM, LỌC, SẮP XẾP */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative flex-1 w-full">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-4 top-3 text-slate-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm video yêu thích..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-900 transition-colors"
            />
          </div>

          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
            <div className="relative w-full sm:w-64 shrink-0">
              <FontAwesomeIcon
                icon={faFilter}
                className="absolute left-4 top-3 text-slate-400"
              />
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-900 transition-colors appearance-none cursor-pointer"
              >
                <option value="all">Tất cả khóa học</option>
                <option value="python">Python for Data Analysis</option>
                <option value="figma">Figma UI/UX Masterclass</option>
              </select>
            </div>
            <div className="relative w-full sm:w-48 shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-900 transition-colors appearance-none cursor-pointer"
              >
                <option value="recentlyAdded">Mới thêm</option>
                <option value="nameAZ">Tên A-Z</option>
                <option value="durationShortLong">Thời lượng</option>
              </select>
            </div>
          </div>
        </div>

        {/* DANH SÁCH VIDEO YÊU THÍCH (LƯỚI THẺ) */}
        {favoriteVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteVideos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
              >
                {/* Hình thu nhỏ video (Thumbnail) */}
                <div className="relative aspect-video overflow-hidden bg-slate-200">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-blue-900 transform scale-50 group-hover:scale-100 transition-transform duration-300">
                      <FontAwesomeIcon
                        icon={faPlayCircle}
                        className="text-2xl"
                      />
                    </div>
                  </div>
                  <span className="absolute bottom-3 right-3 px-2 py-1 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold rounded flex items-center gap-1.5">
                    {video.duration}
                  </span>
                </div>

                {/* Chi tiết Video */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-[17px] text-slate-800 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                    {video.title}
                  </h3>
                  <p className="text-sm font-semibold text-slate-500 line-clamp-1 mb-2">
                    Khóa học: {video.courseTitle}
                  </p>
                  <p className="text-xs font-medium text-slate-400 mt-auto pt-2">
                    Giảng viên: {video.instructorName} • {video.rating} ★
                  </p>
                </div>

                {/* Hành động nhanh */}
                <div className="mt-4 p-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <button
                    onClick={() => handleUnfavorite(video.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
                    title="Bỏ yêu thích"
                  >
                    <FontAwesomeIcon icon={faHeart} className="text-sm" /> Bỏ
                    yêu thích
                  </button>
                  <div className="flex gap-2">
                    <button className="text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg transition-colors">
                      Xem ngay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* TRẠNG THÁI TRỐNG (EMPTY STATE) */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-slate-200 flex items-center justify-center text-6xl text-slate-200 mb-8">
              <FontAwesomeIcon icon={faHeart} />
            </div>
            <h2 className="text-3xl font-extrabold text-blue-900 mb-2">
              Bạn chưa có video yêu thích nào
            </h2>
            <p className="text-slate-500 font-medium max-w-lg mb-8">
              Hãy khám phá các khóa học và lưu lại những bài giảng hay!
            </p>
            <Link
              to="/courses"
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition duration-300"
            >
              Khám phá khóa học
            </Link>
          </div>
        )}

        {/* PHÂN TRANG (PAGINATION) */}
        {favoriteVideos.length > 0 && (
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between text-sm gap-4">
            <p className="text-slate-500 font-medium">
              Hiển thị{" "}
              <span className="font-bold text-slate-700">
                {favoriteVideos.length}
              </span>{" "}
              trên tổng số <span className="font-bold text-slate-700">12</span>{" "}
              video
            </p>
            <div className="flex gap-1">
              <button className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-400 cursor-not-allowed">
                Trước
              </button>
              <button className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-blue-700 font-bold bg-blue-50 transition-colors">
                1
              </button>
              <button className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 font-bold hover:bg-slate-100 transition-colors">
                2
              </button>
              <button className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 font-bold hover:bg-slate-100 transition-colors">
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default LearnerFavoritesPage;
