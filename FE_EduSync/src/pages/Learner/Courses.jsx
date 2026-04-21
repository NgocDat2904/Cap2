import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import {
  faFilter,
  faUsers,
  faPlayCircle,
  faCheckCircle,
  faSpinner,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import {
  getPublicCoursesAPI,
  searchPublicCoursesAPI,
} from "../../services/learnerCourseAPI";

const LearnerCoursesPage = () => {
  // State quản lý bộ lọc trên Mobile
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // State lưu trữ lựa chọn bộ lọc
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;

  // =========================================================================
  // MOCK DATA: Dữ liệu giả lập
  // =========================================================================
  const categories = [
    { id: "all", name: "All" },
    { id: "frontend", name: "Frontend Web Development" },
    { id: "backend", name: "Backend Web Development" },
    { id: "mobile", name: "Mobile Programming" },
    { id: "ai", name: "AI & Machine Learning" },
    { id: "data_analysis", name: "Data Analysis" },
    { id: "data_engineer", name: "Data Engineering" },
    { id: "uiux", name: "UI/UX Design" },
    { id: "ba", name: "Business Analysis " },
  ];

  const priceRanges = [
    { id: "all", name: "Tất cả giá" },
    { id: "free", name: "Miễn phí" },
    { id: "under_1m", name: "Dưới 1.000.000đ" },
    { id: "1m_to_2m", name: "1.000.000đ - 2.000.000đ" },
    { id: "over_2m", name: "Trên 2.000.000đ" },
  ];

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const useSearch = Boolean(searchKeyword.trim() || selectedCategory !== "all");
        const payload = {
          keyword: searchKeyword.trim(),
          category: selectedCategory === "all" ? "" : selectedCategory,
          page,
          limit,
        };
        const data = useSearch
          ? await searchPublicCoursesAPI(payload)
          : await getPublicCoursesAPI({ page, limit });
        if (!cancelled) {
          setCourses(Array.isArray(data.items) ? data.items : []);
          setTotal(Number(data.total || 0));
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "Không tải được khóa học");
          setCourses([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [searchKeyword, selectedCategory, page]);

  const filteredCourses = useMemo(() => {
    if (selectedPrice === "all") return courses;
    return courses.filter((c) => {
      const p = Number(c.price || 0);
      if (selectedPrice === "free") return p === 0;
      if (selectedPrice === "under_1m") return p > 0 && p < 1000000;
      if (selectedPrice === "1m_to_2m") return p >= 1000000 && p <= 2000000;
      if (selectedPrice === "over_2m") return p > 2000000;
      return true;
    });
  }, [courses, selectedPrice]);

  // Hàm format tiền tệ VNĐ
  const formatCurrency = (amount) => {
    if (amount === 0) return "Miễn phí";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="animate-fade-slide-up w-full">
      {/* Nút bật tắt Filter trên Mobile */}
      <div className="lg:hidden mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Tất cả khóa học</h1>
        <button
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold shadow-sm hover:bg-slate-50 transition-all"
        >
          <FontAwesomeIcon icon={faFilter} />
          {isMobileFilterOpen ? "Đóng bộ lọc" : "Lọc kết quả"}
        </button>
      </div>

      {/* Grid chia Layout: Sidebar (Bên trái) + Khóa học (Bên phải) */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* ================================================================= */}
        {/* SIDEBAR FILTER (BỘ LỌC) */}
        {/* ================================================================= */}
        <aside
          className={`lg:w-1/4 xl:w-1/5 shrink-0 ${isMobileFilterOpen ? "block" : "hidden lg:block"}`}
        >
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faFilter}
                  className="text-blue-600 text-sm"
                />
                Bộ lọc
              </h2>
              <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                Xóa lọc
              </button>
            </div>

            {/* Lọc theo Danh mục */}
            <div className="mb-8">
              <h3 className="font-bold text-slate-800 mb-4 uppercase text-sm tracking-wider">
                Danh mục
              </h3>
              <div className="space-y-3">
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="category"
                        value={cat.id}
                        checked={selectedCategory === cat.id}
                        onChange={() => setSelectedCategory(cat.id)}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all"></div>
                      <div className="absolute w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-all"></div>
                    </div>
                    <span
                      className={`text-sm font-medium transition-colors ${selectedCategory === cat.id ? "text-blue-700 font-bold" : "text-slate-600 group-hover:text-blue-600"}`}
                    >
                      {cat.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Lọc theo Mức giá */}
            <div>
              <h3 className="font-bold text-slate-800 mb-4 uppercase text-sm tracking-wider">
                Mức giá
              </h3>
              <div className="space-y-3">
                {priceRanges.map((price) => (
                  <label
                    key={price.id}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="price"
                        value={price.id}
                        checked={selectedPrice === price.id}
                        onChange={() => setSelectedPrice(price.id)}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all"></div>
                      <div className="absolute w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-all"></div>
                    </div>
                    <span
                      className={`text-sm font-medium transition-colors ${selectedPrice === price.id ? "text-blue-700 font-bold" : "text-slate-600 group-hover:text-blue-600"}`}
                    >
                      {price.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ================================================================= */}
        {/* MAIN CONTENT (DANH SÁCH KHÓA HỌC) */}
        {/* ================================================================= */}
        <div className="flex-1">
          {/* Header Khu vực khóa học (Chỉ hiện trên PC) */}
          <div className="hidden lg:flex justify-between items-end mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800">
                {total.toLocaleString()} kết quả khóa học
              </h1>
              <p className="text-slate-500 text-sm mt-1 font-medium">
                Khám phá các kỹ năng mới cùng chuyên gia
              </p>
            </div>
            <div className="relative w-[360px]">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="absolute left-3 top-3 text-slate-400 text-sm"
              />
              <input
                value={searchKeyword}
                onChange={(e) => {
                  setPage(1);
                  setSearchKeyword(e.target.value);
                }}
                placeholder="Tìm kiếm khóa học..."
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Lưới khóa học (Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {loading && (
              <div className="col-span-full text-center text-slate-500 py-12">
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Đang tải khóa học...
              </div>
            )}
            {!loading && error && (
              <div className="col-span-full text-center text-red-600 py-12">{error}</div>
            )}
            {!loading &&
              !error &&
              filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
              >
                {/* Ảnh bìa & Badge */}
                <div className="relative aspect-video overflow-hidden bg-slate-200">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center">
                      <span className="text-slate-600 font-semibold">Không có ảnh</span>
                    </div>
                  )}
                  {/* Lớp overlay đen mờ hiện ra khi hover */}
                  <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-blue-600 transform scale-50 group-hover:scale-100 transition-transform duration-300">
                      <FontAwesomeIcon
                        icon={faPlayCircle}
                        className="text-2xl"
                      />
                    </div>
                  </div>

                  {/* Badge Bestseller */}
                  {/* {course.isBestseller && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-amber-400 text-amber-950 text-xs font-black tracking-wider uppercase rounded-md shadow-sm">
                      Bán chạy
                    </span>
                  )} */}
                  {/* Số lượng video */}
                  <span className="absolute bottom-3 right-3 px-2 py-1 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold rounded flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faPlayCircle} /> {course.videoCount}{" "}
                    video
                  </span>
                </div>

                {/* Nội dung Card */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Tác giả */}
                  <div className="flex items-center gap-2 mb-3">
                    <img
                      src="https://i.pravatar.cc/150?img=11"
                      alt="Avatar"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs font-bold text-slate-500">
                      {course.instructor}
                    </span>
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-blue-500 text-[10px]"
                      title="Đã xác minh"
                    />
                  </div>

                  {/* Tiêu đề */}
                  <h3 className="font-bold text-[17px] text-slate-800 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                    {course.title}
                  </h3>

                  {/* Thống kê (Rating & Students) */}
                  <div className="flex items-center gap-4 text-sm mt-auto pt-4">
                    {/* <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <FontAwesomeIcon icon={faStar} />
                      <span className="text-slate-700">{course.rating}</span>
                    </div> */}
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs">
                      <FontAwesomeIcon icon={faUsers} />
                      {course.students.toLocaleString()} học viên
                    </div>
                  </div>

                  {/* Giá tiền */}
                  <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
                    <div className="flex flex-col">
                      {/* {course.originalPrice && (
                        <span className="text-xs text-slate-400 font-medium line-through mb-0.5">
                          {formatCurrency(course.originalPrice)}
                        </span>
                      )} */}
                      <span
                        className={`font-black text-xl ${course.price === 0 ? "text-green-600" : "text-slate-900"}`}
                      >
                        {formatCurrency(course.price)}
                      </span>
                    </div>

                    {/* Fake button Xem khóa học để trang trí */}
                    <Link
                      to={`/courses/${course.id}`}
                      className="text-sm font-bold text-blue-900 bg-blue-50 hover:bg-blue-900 hover:text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Phân trang (Pagination) */}
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-10 h-10 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                &lt;
              </button>
              <button className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30">
                {page}
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * limit >= total}
                className="w-10 h-10 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerCoursesPage;
