import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faUsers,
  faClock,
  faBookOpen,
  faCheckCircle,
  faVideo,
  faFileAlt,
  faEdit,
  faEye,
  faTrashAlt,
  faChevronDown,
  faChevronUp,
  faPlayCircle,
  faTrophy,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

// =========================================================================
// 1. MOCK DATA (Chuẩn nghiệp vụ mới)
// =========================================================================
const courseDetail = {
  id: 123,
  title: "Master Python from basics to advanced",
  category: "Category",
  instructor: "Nguyễn Văn A",
  students: 30,
  duration: "8h 30m",
  lessonCount: 24,
  price: "$ 10",
  thumbnail:
    "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  avatar: "https://i.pravatar.cc/150?img=11",
};

// Danh sách bài giảng phẳng. (Quiz được tích hợp như một thuộc tính đính kèm của bài học)
const lessonsList = [
  {
    id: 1,
    order: 1,
    title: "What is Python?",
    description:
      "Tìm hiểu về ngôn ngữ Python, lịch sử phát triển và các ứng dụng thực tế.",
    duration: "10:30",
    docs: 2,
    hasQuiz: true, // Bài này CÓ bài trắc nghiệm đính kèm
    quizStats: { questions: 10, avgScore: "8.5/10", passRate: "92%" }, // Thống kê dành cho GV
    videoStats: { views: 132, completion: "84%", avgTime: "08:15" },
    studentQuestions: [
      {
        id: 101,
        avatar: "HN",
        name: "Hoàng Nguyễn",
        time: "2 ngày trước",
        text: "Thầy cho em hỏi Python khác gì C++ ở điểm cốt lõi ạ?",
      },
    ],
  },
  {
    id: 2,
    order: 2,
    title: "Setting up your environment (VS Code)",
    description:
      "Hướng dẫn chi tiết từng bước cài đặt môi trường lập trình Python trên Windows và MacOS.",
    duration: "15:20",
    docs: 1,
    hasQuiz: false, // Bài này KHÔNG CÓ trắc nghiệm
    videoStats: { views: 125, completion: "78%", avgTime: "12:00" },
    studentQuestions: [
      {
        id: 103,
        avatar: "HL",
        name: "Hương Lan",
        time: "3 ngày trước",
        text: "Máy em báo lỗi 'python is not recognized', sửa sao ạ?",
      },
    ],
  },
  {
    id: 3,
    order: 3,
    title: "Variables and Data Types",
    description:
      "Khám phá cách khai báo biến và các kiểu dữ liệu cơ bản (int, float, string) trong Python.",
    duration: "22:15",
    docs: 3,
    hasQuiz: true, // Có Quiz
    quizStats: { questions: 15, avgScore: "6.2/10", passRate: "55%" }, // Tỉ lệ pass thấp -> GV cần lưu ý
    videoStats: { views: 110, completion: "60%", avgTime: "18:30" },
    studentQuestions: [],
  },
];

// =========================================================================
// 2. COMPONENT BÀI GIẢNG (Lesson Accordion)
// =========================================================================
const LessonAccordion = ({ lesson }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`bg-white border transition-all duration-300 rounded-2xl mb-4 overflow-hidden shadow-sm hover:shadow-md
      ${isOpen ? "border-blue-400 ring-4 ring-blue-50" : "border-slate-200"}
    `}
    >
      {/* --- HEADER BÀI GIẢNG --- */}
      <div
        className="flex items-start gap-4 p-5 cursor-pointer bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Số thứ tự */}
        <div
          className={`flex-shrink-0 w-12 h-12 flex items-center justify-center font-bold rounded-xl text-lg transition-colors
          ${isOpen ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 text-slate-500"}
        `}
        >
          {lesson.order}
        </div>

        {/* Thông tin chính */}
        <div className="flex-1 min-w-0">
          <h4 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-blue-600 transition-colors">
            {lesson.title}
          </h4>
          <p className="text-slate-500 text-sm leading-relaxed mt-1 line-clamp-1">
            {lesson.description}
          </p>

          {/* Badges hiển thị thuộc tính của bài học */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-bold">
            {/* Tag Video (Mặc định luôn có) */}
            <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100">
              <FontAwesomeIcon icon={faVideo} /> Video
            </span>

            <span className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
              <FontAwesomeIcon icon={faClock} /> {lesson.duration}
            </span>

            {lesson.docs > 0 && (
              <span className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                <FontAwesomeIcon icon={faFileAlt} /> {lesson.docs} Tài liệu
              </span>
            )}

            {/* Tag Quiz: Nếu bài có Quiz, gắn cúp vàng vào */}
            {lesson.hasQuiz && (
              <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md border border-amber-200">
                <FontAwesomeIcon icon={faTrophy} /> Bài tập (Quiz)
              </span>
            )}
          </div>
        </div>

        {/* Nút Play và Đóng/Mở */}
        <div className="flex items-center gap-2 mt-1">
          <button className="text-blue-600 bg-blue-50 p-2.5 rounded-full hover:bg-blue-600 hover:text-white transition-colors shadow-sm">
            <FontAwesomeIcon icon={faPlayCircle} className="text-xl" />
          </button>
          <button className="text-slate-400 p-2.5 rounded-full hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <FontAwesomeIcon
              icon={isOpen ? faChevronUp : faChevronDown}
              className="text-lg"
            />
          </button>
        </div>
      </div>

      {/* --- NỘI DUNG MỞ RỘNG (DÀNH RIÊNG CHO GIẢNG VIÊN) --- */}
      {isOpen && (
        <div className="border-t border-slate-200 bg-[#f8fafc] animate-fade-slide-up flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* Cột 1: Thống kê Video */}
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
                    <FontAwesomeIcon icon={faCheckCircle} /> Tỉ lệ xem hết
                  </span>
                  <span className="font-black text-green-600">
                    {lesson.videoStats.completion}
                  </span>
                </div>
              </div>
            </div>

            {/* Cột 2: Quản lý Quiz (Chỉ hiện nếu có) */}
            <div className="p-6">
              <h5 className="font-extrabold text-slate-800 mb-4 text-xs uppercase tracking-wider text-center">
                Đánh giá Quiz
              </h5>
              {lesson.hasQuiz ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                    <span className="text-slate-500 text-sm font-semibold">
                      Tỉ lệ Pass
                    </span>
                    <span
                      className={`font-black ${parseInt(lesson.quizStats.passRate) < 60 ? "text-red-600" : "text-blue-600"}`}
                    >
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
                  <button className="w-full mt-2 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs rounded-lg transition-colors border border-amber-200">
                    <FontAwesomeIcon icon={faEdit} className="mr-1" /> Sửa bộ
                    câu hỏi ({lesson.quizStats.questions})
                  </button>
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
                  <button className="mt-3 text-xs font-bold text-blue-600 hover:underline">
                    + Tạo Quiz mới
                  </button>
                </div>
              )}
            </div>

            {/* Cột 3: Hỏi đáp (Q&A) nhanh */}
            <div className="p-6">
              <h5 className="font-extrabold text-slate-800 mb-4 text-xs uppercase tracking-wider flex justify-between items-center">
                <span>Hỏi đáp (Q&A)</span>
                {lesson.studentQuestions.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                    {lesson.studentQuestions.length} mới
                  </span>
                )}
              </h5>

              {lesson.studentQuestions.length > 0 ? (
                <div className="space-y-3">
                  {lesson.studentQuestions.slice(0, 1).map((q) => (
                    <div
                      key={q.id}
                      className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm"
                    >
                      <p className="font-bold text-slate-800 text-[13px] mb-1">
                        {q.name}
                      </p>
                      <p className="text-slate-600 text-xs line-clamp-2 italic">
                        "{q.text}"
                      </p>
                    </div>
                  ))}
                  <button className="w-full text-center py-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-600 text-xs hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm">
                    Xem tất cả ({lesson.studentQuestions.length})
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center italic mt-6">
                  Chưa có câu hỏi nào.
                </p>
              )}
            </div>
          </div>

          {/* Toolbar Hành động Cuối */}
          <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-4 bg-slate-100 border-t border-slate-200">
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-bold rounded-lg border border-slate-300 hover:bg-slate-200 transition-colors text-sm shadow-sm">
              <FontAwesomeIcon icon={faEdit} /> Chỉnh sửa bài học
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-bold rounded-lg border border-slate-300 hover:bg-slate-200 transition-colors text-sm shadow-sm">
              <FontAwesomeIcon icon={faEye} /> Xem thử
            </button>
            <button className="px-3.5 py-2 bg-white text-red-600 rounded-lg border border-slate-300 hover:bg-red-600 hover:text-white transition-colors shadow-sm">
              <FontAwesomeIcon icon={faTrashAlt} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 3. MAIN PAGE (GIẢNG VIÊN XEM CHI TIẾT KHÓA HỌC)
// =========================================================================
const InstructorCourseViewPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Curriculum");

  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 w-full animate-fade-slide-up p-4 sm:p-6 lg:p-8">
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
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2 text-white/80">
                  <FontAwesomeIcon icon={faBookOpen} className="text-lg" />
                </div>
                <p className="font-bold text-sm">
                  {courseDetail.lessonCount} Bài giảng
                </p>
              </div>
            </div>
          </div>

          {/* Right Floating Card */}
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
                {courseDetail.price}
              </p>
              <button className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-900/30 active:scale-95 text-sm flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faEdit} /> Chỉnh sửa Khóa học
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- BODY CONTENT --- */}
      <div className="flex flex-col lg:flex-row gap-8 items-start relative z-0 mt-4">
        {/* Cột trái (Nội dung chính) */}
        <div className="w-full lg:flex-1">
          <div className="flex items-center gap-2 mb-6">
            {["Curriculum", "Q&A", "Settings"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 text-sm font-bold rounded-full transition-all
                  ${activeTab === tab ? "bg-blue-600 text-white shadow-md" : "bg-slate-200/60 text-slate-600 hover:bg-slate-200"}
                `}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Curriculum" && (
            <div className="animate-fade-slide-up">
              <div className="mb-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
                    Chương trình giảng dạy
                  </h2>
                  <p className="text-slate-500 text-sm font-medium">
                    {lessonsList.length} Bài giảng • Tổng thời lượng 8h 30m
                  </p>
                </div>
                <button className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">
                  <FontAwesomeIcon icon={faPlus} /> Thêm Bài học
                </button>
              </div>

              {/* Danh sách bài giảng phẳng (Đã tích hợp Quiz vào trong) */}
              <div className="space-y-4">
                {lessonsList.map((lesson) => (
                  <LessonAccordion key={lesson.id} lesson={lesson} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cột phải (Thông tin GV - Giữ nguyên layout phẳng) */}
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

export default InstructorCourseViewPage;
