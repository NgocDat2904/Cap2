import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlayCircle,
  faCheckCircle,
  faSearch,
  faFolderOpen,
  faClock,
  faSpinner,
  faExclamationCircle,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";
import { getMyCoursesAPI, getCourseDetailAPI } from "../../services/learnerCourseAPI";

// =========================================================================
// HELPER: Format ngày giờ lastAccessed
// =========================================================================
const formatLastAccessed = (isoStr) => {
  if (!isoStr) return "Chưa bắt đầu";
  try {
    const d = new Date(isoStr);
    if (isNaN(d)) return "Chưa bắt đầu";
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMs / 3600000);
    const diffD = Math.floor(diffMs / 86400000);
    if (diffMin < 1) return "Vừa xong";
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffH < 24) return `${diffH} giờ trước`;
    if (diffD === 1) return "Hôm qua";
    if (diffD < 7) return `${diffD} ngày trước`;
    if (diffD < 30) return `${Math.floor(diffD / 7)} tuần trước`;
    return `${Math.floor(diffD / 30)} tháng trước`;
  } catch {
    return "Chưa bắt đầu";
  }
};

// =========================================================================
// HELPER: Fallback thumbnail
// =========================================================================
const DEFAULT_THUMB = "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80";

// =========================================================================
// MAIN COMPONENT
// =========================================================================
const LearnerMyCoursesPage = () => {
  const navigate = useNavigate();

  // --- State dữ liệu ---
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- State bộ lọc (client-side) ---
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // =========================================================================
  // FETCH DATA
  // =========================================================================
  const fetchMyCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyCoursesAPI();
      console.log("API My Courses Response:", data); // Log để kiểm tra data structure
      setAllCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách khóa học.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  // =========================================================================
  // HANDLE CONTINUE LEARNING - Navigate thẳng vào video lesson
  // =========================================================================
  const handleContinueLearning = async (courseId) => {
    try {
      // Fetch course detail để lấy lesson đầu tiên
      const courseDetail = await getCourseDetailAPI(courseId);
      const firstLesson = courseDetail?.lessons?.[0];

      if (firstLesson?.id) {
        // Navigate thẳng vào video
        navigate(`/courses/${courseId}/lessons/${firstLesson.id}`);
      } else {
        // Fallback nếu không có lesson
        console.warn("No lessons found for this course");
        navigate(`/courses/${courseId}`);
      }
    } catch (err) {
      console.error("Failed to load course detail:", err);
      // Fallback về course detail page
      navigate(`/courses/${courseId}`);
    }
  };

  // =========================================================================
  // LỌC CLIENT-SIDE
  // =========================================================================
  const filteredCourses = allCourses.filter((course) => {
    const matchesTab =
      activeTab === "all" || course.status === activeTab;
    const matchesSearch = (course.title || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setActiveTab("all");
  };

  // =========================================================================
  // STATS tính từ dữ liệu thật
  // =========================================================================
  const totalCourses = allCourses.length;
  const completedCount = allCourses.filter((c) => c.status === "completed").length;
  const inProgressCount = allCourses.filter((c) => c.status === "in_progress").length;

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <main className="animate-fade-slide-up w-full pb-12 bg-slate-50 min-h-screen">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">

        {/* TIÊU ĐỀ TRANG */}
        <div className="mb-6 border-b border-slate-200/80 pb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Khóa học của tôi
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Tiếp tục hành trình học tập và theo dõi tiến độ của bạn.
          </p>
        </div>

        {/* STATS SUMMARY */}
        {!loading && !error && totalCourses > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Tổng số khóa", value: totalCourses, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
              { label: "Đang học", value: inProgressCount, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
              { label: "Hoàn thành", value: completedCount, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl border p-4 flex items-center gap-3 ${s.bg}`}>
                <div>
                  <p className="text-xs font-bold text-slate-500">{s.label}</p>
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 w-full min-w-0">
          {/* TABS & SEARCH */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
            <div className="flex p-1 bg-white border border-slate-200/60 rounded-xl shadow-sm w-full md:w-fit overflow-x-auto scrollbar-hide">
              {[
                { id: "all", label: "Tất cả" },
                { id: "in_progress", label: "Đang học" },
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
                placeholder="Tìm kiếm khóa học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <FontAwesomeIcon
                icon={faSpinner}
                className="text-4xl text-blue-500 animate-spin"
              />
              <p className="text-slate-500 font-semibold">Đang tải khóa học...</p>
            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && (
            <div className="bg-white rounded-3xl border border-red-200 shadow-sm p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-red-50 border-4 border-red-100 flex items-center justify-center text-4xl text-red-400 mb-5">
                <FontAwesomeIcon icon={faExclamationCircle} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-2">
                Không thể tải dữ liệu
              </h2>
              <p className="text-slate-500 font-medium max-w-sm mb-6">{error}</p>
              <button
                onClick={fetchMyCourses}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition duration-300 shadow-sm active:scale-95"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* COURSE GRID */}
          {!loading && !error && filteredCourses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => handleContinueLearning(course.id)}
                  className="bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
                >
                  {/* Thumbnail - FIXED: Dùng đúng field từ API */}
                  <div className="relative aspect-video overflow-hidden bg-slate-200">
                    <img
                      src={course.thumbnail || course.image || DEFAULT_THUMB}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = DEFAULT_THUMB; }}
                    />
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-14 h-14 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-blue-600 transform scale-50 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                        <FontAwesomeIcon icon={faPlayCircle} className="text-3xl ml-1" />
                      </div>
                    </div>
                    {course.status === "completed" && (
                      <span className="absolute top-3 left-3 px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-black tracking-widest uppercase rounded-lg shadow-sm flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faCheckCircle} /> Hoàn thành
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-extrabold text-[17px] text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                      {course.title || "Chưa có tiêu đề"}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mb-6">
                      Giảng viên:{" "}
                      <span className="text-slate-700">
                        {course.instructor || "EduSync"}
                      </span>
                    </p>

                    {/* Progress - FIXED: Map đúng data từ API */}
                    <div className="mt-auto">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-black text-slate-800">
                          {course.progress_percent ?? 0}%{" "}
                          <span className="font-medium text-slate-500 text-xs ml-1">
                            hoàn thành
                          </span>
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                          {course.completed_lessons ?? 0}/{course.total_lessons ?? 0} bài
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            course.status === "completed"
                              ? "bg-emerald-500"
                              : "bg-blue-600"
                          }`}
                          style={{ width: `${course.progress_percent ?? 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions - FIXED: UI khi completed */}
                  <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                    {course.status === "completed" ? (
                      // Yêu cầu 4: Thay đổi UI khi 100%
                      <div className="flex items-center justify-center py-1">
                        <span className="text-emerald-600 font-bold text-sm flex items-center gap-2">
                          <FontAwesomeIcon icon={faCheckCircle} /> Đã hoàn thành
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faClock} />
                          {formatLastAccessed(course.last_accessed)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContinueLearning(course.id);
                          }}
                          className="px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20 active:scale-95"
                        >
                          Tiếp tục học
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && filteredCourses.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-16 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-slate-100 flex items-center justify-center text-5xl text-slate-300 mb-6">
                <FontAwesomeIcon icon={searchTerm || activeTab !== "all" ? faSearch : faFolderOpen} />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800 mb-2">
                {searchTerm || activeTab !== "all"
                  ? "Không tìm thấy khóa học"
                  : "Bạn chưa đăng ký khóa học nào"}
              </h2>
              <p className="text-slate-500 font-medium max-w-md mb-8">
                {searchTerm || activeTab !== "all"
                  ? "Thử xóa bộ lọc hoặc thay đổi từ khóa tìm kiếm."
                  : "Khám phá các khóa học thú vị trên EduSync và bắt đầu hành trình học tập ngay hôm nay!"}
              </p>
              {searchTerm || activeTab !== "all" ? (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition duration-300 shadow-sm active:scale-95"
                >
                  Xóa bộ lọc
                </button>
              ) : (
                <button
                  onClick={() => navigate("/courses")}
                  className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition duration-300 shadow-sm active:scale-95 flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faGraduationCap} />
                  Khám phá khóa học
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default LearnerMyCoursesPage;