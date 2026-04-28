import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faUsers,
  faClock,
  faCheckCircle,
  faVideo,
  faEdit,
  faEye,
  faTrashAlt,
  faChevronDown,
  faChevronUp,
  faTrophy,
  faPlus,
  faSearch,
  faFilter,
  faReply,
  faToggleOn,
  faToggleOff,
  faExclamationTriangle,
  faWandMagicSparkles,
  faTimes,
  faSave,
  faPaperPlane,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { getInstructorCourseDetailAPI } from "../../services/instructorAPI";


// =========================================================================
// 1. MOCK DATA FOR Q&A (Tạm giữ, sau sẽ fetch từ API)
// =========================================================================
const qnaList = [
  {
    id: 1,
    student: "Hoàng Nguyễn",
    avatar: "HN",
    time: "2 giờ trước",
    lesson: "What is Python?",
    text: "Thầy cho em hỏi Python có dùng để lập trình Web được không ạ?",
    status: "unanswered",
  },
  {
    id: 2,
    student: "Hương Lan",
    avatar: "HL",
    time: "1 ngày trước",
    lesson: "Setting up your environment",
    text: "Em cài VS Code bị lỗi màn hình xanh, khắc phục sao ạ?",
    status: "answered",
    reply: "Em thử chạy bằng quyền Administrator xem sao nhé.",
  },
  {
    id: 3,
    student: "Trần Minh",
    avatar: "TM",
    time: "3 ngày trước",
    lesson: "Variables and Data Types",
    text: "Kiểu Dictionary trong Python giống Object trong JS đúng không thầy?",
    status: "unanswered",
  },
];

// =========================================================================
// 2. COMPONENT BÀI GIẢNG (Lesson Accordion)
// =========================================================================
const LessonAccordion = ({ lesson }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`bg-white border transition-all duration-300 rounded-2xl mb-4 overflow-hidden shadow-sm hover:shadow-md ${isOpen ? "border-blue-400 ring-4 ring-blue-50" : "border-slate-200"}`}
    >
      <div
        className="flex items-start gap-4 p-5 cursor-pointer bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          className={`flex-shrink-0 w-12 h-12 flex items-center justify-center font-bold rounded-xl text-lg transition-colors ${isOpen ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 text-slate-500"}`}
        >
          {lesson.order}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-blue-600 transition-colors">
            {lesson.title}
          </h4>
          <p className="text-slate-500 text-sm leading-relaxed mt-1 line-clamp-1">
            {lesson.description}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-bold">
            <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100">
              <FontAwesomeIcon icon={faVideo} /> Video
            </span>
            <span className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
              <FontAwesomeIcon icon={faClock} /> {lesson.duration}
            </span>
            {lesson.quizStatus !== "none" && (
              <span
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${lesson.quizStatus === "draft" ? "bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse" : "bg-amber-50 text-amber-700 border-amber-200"}`}
              >
                <FontAwesomeIcon
                  icon={
                    lesson.quizStatus === "draft"
                      ? faWandMagicSparkles
                      : faTrophy
                  }
                />
                {lesson.quizStatus === "draft"
                  ? "AI Quiz (Đang xuất bản)"
                  : "Bài tập (Quiz)"}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button className="text-slate-400 p-2.5 rounded-full hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <FontAwesomeIcon
              icon={isOpen ? faChevronUp : faChevronDown}
              className="text-lg"
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 bg-[#f8fafc] animate-fade-slide-up flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* Hiệu suất Video */}
            <div className="p-6">
              <h5 className="font-extrabold text-slate-800 mb-4 text-xs uppercase tracking-wider text-center">
                Hiệu suất Video
              </h5>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <span className="text-slate-500 text-sm font-semibold flex items-center gap-2">
                    <FontAwesomeIcon icon={faEye} /> Lượt xem
                  </span>
                  <span className="font-black text-slate-900">
                    {lesson.videoStats.views}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <span className="text-slate-500 text-sm font-semibold flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheckCircle} /> Hoàn thành
                  </span>
                  <span className="font-black text-green-600">
                    {lesson.videoStats.completion}
                  </span>
                </div>
              </div>
            </div>

            {/* Đánh giá Quiz */}
            <div className="p-6">
              <h5 className="font-extrabold text-slate-800 mb-4 text-xs uppercase tracking-wider text-center">
                Đánh giá Quiz
              </h5>
              {lesson.quizStatus === "draft" ? (
                <div className="flex flex-col items-center justify-center h-full bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-3 shadow-inner">
                    <FontAwesomeIcon
                      icon={faWandMagicSparkles}
                      className="text-xl"
                    />
                  </div>
                  <p className="text-sm font-bold text-indigo-900 mb-1">
                    AI đã tạo {lesson.quizStats.questions} câu hỏi
                  </p>
                  <p className="text-xs text-indigo-600/80">
                    Sẽ được xuất bản tự động.
                  </p>
                </div>
              ) : lesson.quizStatus === "published" ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                    <span className="text-slate-500 text-sm font-semibold">
                      Tỉ lệ Pass
                    </span>
                    <span className="font-black text-blue-600">
                      {lesson.quizStats.passRate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                    <span className="text-slate-500 text-sm font-semibold">
                      Điểm TB
                    </span>
                    <span className="font-black text-slate-900">
                      {lesson.quizStats.avgScore}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-50">
                  <FontAwesomeIcon
                    icon={faTrophy}
                    className="text-3xl text-slate-300 mb-2"
                  />
                  <p className="text-xs font-bold text-slate-400">
                    Không có bài tập
                  </p>
                </div>
              )}
            </div>

            {/* Q&A */}
            <div className="p-6">
              <h5 className="font-extrabold text-slate-800 mb-4 text-xs uppercase tracking-wider flex justify-between items-center">
                <span>Hỏi đáp (Q&A)</span>
              </h5>
              <p className="text-xs text-slate-400 text-center italic mt-6">
                Chưa có câu hỏi nào.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 3. MAIN PAGE
// =========================================================================
const InstructorCourseDetailPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  const [activeTab, setActiveTab] = useState("Curriculum");
  const [courseDetail, setCourseDetail] = useState(null);
  const [lessonsList, setLessonsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPublished, setIsPublished] = useState(false);

  // Fetch course detail
  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
          setIsLoading(false);
          return;
        }
        
        const data = await getInstructorCourseDetailAPI(courseId, token);
        
        // Map API response to component state
        setCourseDetail(data.courseDetail);
        setLessonsList(Array.isArray(data.lessonsList) ? data.lessonsList : []);
        setIsPublished(data.courseDetail.status === "Published");
        setIsLoading(false);
      } catch (err) {
        setError(err.message || "Lỗi tải chi tiết khóa học");
        setCourseDetail(null);
        setLessonsList([]);
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetail();
    }
  }, [courseId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-400">
        <FontAwesomeIcon
          icon={faSpinner}
          className="text-4xl animate-spin text-blue-500 mb-4"
        />
        <p className="font-bold">Đang tải thông tin khóa học...</p>
      </div>
    );
  }

  // Error state
  if (error || !courseDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 bg-slate-50 text-slate-600">
        <p className="font-bold text-red-600 mb-4">{error || "Không có dữ liệu"}</p>
        <button
          type="button"
          onClick={() => navigate("/instructor/courses")}
          className="px-4 py-2 bg-slate-200 rounded-xl font-bold hover:bg-slate-300"
        >
          Về danh sách khóa học
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 w-full animate-fade-slide-up p-4 sm:p-6 lg:p-8 relative">
      <section className="bg-gradient-to-r from-[#308dff] via-[#5178af] to-[#5176b0] rounded-3xl p-8 sm:p-10 lg:p-12 relative shadow-lg overflow-visible mb-8">
        <div className="flex flex-col lg:flex-row justify-between gap-10">
          <div className="w-full lg:w-2/3 text-white">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6 text-sm font-bold uppercase tracking-wider"
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Quay lại
            </button>
            <div className="mb-4">
              <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wider uppercase border border-white/20 shadow-sm">
                {courseDetail.category}
              </span>
              <span
                className={`ml-3 inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border shadow-sm
                ${isPublished ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-200" : "bg-amber-500/20 border-amber-400/50 text-amber-200"}
              `}
              >
                {isPublished ? "Đang xuất bản" : "Chờ duyệt"}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-2 tracking-tight">
              Quản trị khóa học
            </h1>
            <p className="text-white/90 text-lg mb-10 font-medium">
              {courseDetail.title}
            </p>
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2 text-white/80">
                  <FontAwesomeIcon icon={faUsers} className="text-lg" />
                </div>
                <p className="font-bold text-sm">
                  {courseDetail.students} Học viên
                </p>
              </div>
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2 text-white/80">
                  <FontAwesomeIcon icon={faClock} className="text-lg" />
                </div>
                <p className="font-bold text-sm">{courseDetail.duration}</p>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-[320px] bg-white rounded-2xl p-4 shadow-xl border border-slate-100 flex flex-col shrink-0 lg:-mb-24 relative z-10">
            <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 bg-slate-200">
              <img
                src={courseDetail.thumbnail}
                alt="Course cover"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="px-2 pb-2">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                Giá bán
              </p>
              <p className="text-2xl font-black text-emerald-600 mb-5">
                ${Number(courseDetail.price).toFixed(2)}
              </p>
              <Link
                to={`/instructor/courses/${courseDetail.id}/edit`}
                className="w-full py-3.5 bg-[#1e3a8a] hover:bg-[#172e6e] text-white font-bold rounded-xl transition-all shadow-md shadow-blue-900/30 active:scale-95 text-sm flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faEdit} /> Chỉnh sửa Khóa học
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-8 items-start relative z-0 mt-4">
        {/* ===================== CỘT TRÁI (MAIN CONTENT) ===================== */}
        <div className="w-full lg:flex-1">
          {/* Menu Tabs */}
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
            {["Curriculum", "Q&A", "Settings"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 text-sm font-bold rounded-full transition-all
                  ${activeTab === tab ? "bg-[#1e3a8a] text-white shadow-md" : "bg-transparent text-slate-500 hover:bg-slate-200/50"}
                `}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB 1: CURRICULUM */}
          {activeTab === "Curriculum" && (
            <div className="animate-fade-slide-up">
              <div className="mb-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
                    Chương trình giảng dạy
                  </h2>
                  <p className="text-slate-500 text-sm font-medium">
                    {lessonsList.length} Bài giảng • Tổng thời lượng {courseDetail.duration}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {lessonsList.map((lesson) => (
                  <LessonAccordion
                    key={lesson.id}
                    lesson={lesson}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Q&A */}
          {activeTab === "Q&A" && (
            <div className="animate-fade-slide-up bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      Hỏi đáp Khóa học (Q&A)
                    </h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">
                      Bạn có 2 câu hỏi chưa trả lời cần xử lý.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <input
                        type="text"
                        placeholder="Tìm kiếm câu hỏi..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute left-3.5 top-2.5 text-slate-400 text-sm"
                      />
                    </div>
                    <button className="p-2 border border-slate-300 rounded-lg text-slate-500 hover:bg-slate-100 bg-white shadow-sm">
                      <FontAwesomeIcon icon={faFilter} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {qnaList.map((q) => (
                  <div
                    key={q.id}
                    className={`p-6 transition-colors ${q.status === "unanswered" ? "bg-blue-50/30" : "hover:bg-slate-50"}`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-sm text-white ${q.status === "unanswered" ? "bg-blue-600" : "bg-slate-400"}`}
                      >
                        {q.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">
                              {q.student}
                            </h4>
                            <p className="text-slate-500 text-xs mt-0.5">
                              Bài giảng:{" "}
                              <span className="text-blue-600 font-medium hover:underline cursor-pointer">
                                {q.lesson}
                              </span>{" "}
                              • {q.time}
                            </p>
                          </div>
                          {q.status === "unanswered" && (
                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                              Chưa trả lời
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700 text-sm mt-3">{q.text}</p>
                        <div className="mt-4">
                          {q.status === "answered" ? (
                            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 mt-2 relative">
                              <div className="absolute -top-3 left-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-slate-200"></div>
                              <p className="text-xs font-bold text-slate-500 mb-1">
                                Bạn đã trả lời:
                              </p>
                              <p className="text-sm text-slate-700">
                                {q.reply}
                              </p>
                            </div>
                          ) : (
                            <div className="flex gap-2 mt-4">
                              <input
                                type="text"
                                placeholder="Viết câu trả lời..."
                                className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />
                              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg transition-colors shadow-sm flex items-center gap-2">
                                <FontAwesomeIcon icon={faReply} /> Trả lời
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SETTINGS */}
          {activeTab === "Settings" && (
            <div className="animate-fade-slide-up space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-800 text-lg">
                    Trạng thái Khóa học
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Quản lý hiển thị khóa học của bạn trên EduSync.
                  </p>
                </div>
                <div className="p-6 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800">
                        Hiển thị công khai (Published)
                      </h4>
                      <p className="text-slate-500 text-sm mt-1 max-w-lg">
                        Nếu tắt đi, khóa học sẽ chuyển về dạng Bản nháp (Draft).
                      </p>
                    </div>
                    <button
                      onClick={() => setIsPublished(!isPublished)}
                      className={`text-4xl transition-colors ${isPublished ? "text-blue-600" : "text-slate-300"}`}
                    >
                      <FontAwesomeIcon
                        icon={isPublished ? faToggleOn : faToggleOff}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-800 text-lg">
                    Cài đặt Giá khóa học
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    EduSync thu phí nền tảng 20% cho mỗi lượt bán thành công.
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Giá niêm yết (USD)
                    </label>
                    <div className="relative max-w-xs">
                      <span className="absolute left-4 top-2.5 text-slate-500 font-bold">
                        $
                      </span>
                      <input
                        type="number"
                        defaultValue="10"
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <button className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm text-sm">
                    Lưu thay đổi
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-red-100 bg-red-50/50 flex items-center gap-3">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="text-red-500 text-xl"
                  />
                  <h3 className="font-extrabold text-red-700 text-lg">
                    Khu vực nguy hiểm (Danger Zone)
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-800">
                        Xóa khóa học vĩnh viễn
                      </h4>
                      <p className="text-slate-500 text-sm mt-1 max-w-lg">
                        Thao tác này không thể hoàn tác.
                      </p>
                    </div>
                    <button className="px-6 py-2.5 bg-white border-2 border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-600 transition-colors shadow-sm text-sm shrink-0">
                      Xóa Khóa Học
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===================== CỘT PHẢI (MINI INFO) ===================== */}
        <div className="w-full lg:w-[320px] shrink-0 lg:mt-[4.5rem]">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm sticky top-6">
            <h4 className="font-extrabold text-slate-800 mb-5 uppercase tracking-wider text-sm">
              Hồ sơ Giảng viên
            </h4>
            <div className="flex items-center gap-4 mb-6">
              <img
                src={courseDetail.avatar}
                alt="Avatar"
                className="w-12 h-12 rounded-full border border-slate-200 object-cover shadow-sm"
              />
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  {courseDetail.instructor}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  Giảng viên cấp cao
                </p>
              </div>
            </div>
            <div className="space-y-3 border-t border-slate-100 pt-5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-semibold">
                  Khóa học đã tạo
                </span>
                <span className="font-bold text-slate-800">5</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-semibold">
                  Tổng học viên
                </span>
                <span className="font-bold text-slate-800">1,250</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorCourseDetailPage;
