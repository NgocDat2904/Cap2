import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faUsers,
  faClock,
  faBookOpen,
  faCheckCircle,
  faVideo,
  faFileAlt,
  faQuestionCircle,
  faEdit,
  faEye,
  faTrashAlt,
  faChevronDown,
  faChevronUp,
  faPlayCircle,
  faCommentDots,
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
} from "@fortawesome/free-solid-svg-icons";

// =========================================================================
// 1. MOCK DATA
// =========================================================================
const courseDetail = {
  id: 123,
  title: "Master Python from basics to advanced",
  category: "Lập trình Python",
  instructor: "Nguyễn Văn A",
  students: 30,
  duration: "8h 30m",
  lessonCount: 24,
  price: "$ 10",
  thumbnail:
    "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  avatar: "https://i.pravatar.cc/150?img=11",
};

const lessonsList = [
  {
    id: 1,
    order: 1,
    title: "What is Python?",
    description: "Tìm hiểu về ngôn ngữ Python...",
    duration: "10:30",
    docs: 2,
    quizStatus: "published", // Đã duyệt
    quizStats: { questions: 10, avgScore: "8.5/10", passRate: "92%" },
    videoStats: { views: 132, completion: "84%", avgTime: "08:15" },
    studentQuestions: [],
  },
  {
    id: 2,
    order: 2,
    title: "Setting up your environment (VS Code)",
    description: "Cài đặt môi trường...",
    duration: "15:20",
    docs: 1,
    quizStatus: "none", // Không có
    videoStats: { views: 125, completion: "78%", avgTime: "12:00" },
    studentQuestions: [],
  },
  {
    id: 3,
    order: 3,
    title: "Variables and Data Types",
    description: "Khám phá cách khai báo biến...",
    duration: "22:15",
    docs: 3,
    quizStatus: "draft", // AI VỪA GEN XONG, ĐANG CHỜ DUYỆT (Bản nháp)
    quizStats: { questions: 2, avgScore: "-", passRate: "-" },
    videoStats: { views: 110, completion: "60%", avgTime: "18:30" },
    studentQuestions: [],
  },
];

const initialAiQuestions = [
  {
    id: "q1",
    text: "Trong Python, biến được khai báo như thế nào?",
    options: [
      { id: "o1", text: "var x = 10", isCorrect: false },
      { id: "o2", text: "int x = 10", isCorrect: false },
      { id: "o3", text: "x = 10", isCorrect: true },
      { id: "o4", text: "declare x = 10", isCorrect: false },
    ],
  },
  {
    id: "q2",
    text: "Hàm nào dùng để in dữ liệu ra màn hình?",
    options: [
      { id: "o1", text: "echo()", isCorrect: false },
      { id: "o2", text: "print()", isCorrect: true },
      { id: "o3", text: "console.log()", isCorrect: false },
      { id: "o4", text: "System.out.println()", isCorrect: false },
    ],
  },
];

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
// 2. QUIZ REVIEW DRAWER (Khay trượt Kiểm duyệt AI Quiz)
// =========================================================================
const QuizReviewDrawer = ({ isOpen, onClose, lesson }) => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (isOpen) setQuestions(initialAiQuestions);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSetCorrectOption = (qId, optId) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === qId) {
          return {
            ...q,
            options: q.options.map((opt) => ({
              ...opt,
              isCorrect: opt.id === optId,
            })),
          };
        }
        return q;
      }),
    );
  };

  const handleAddQuestion = () => {
    const newId = `q_new_${Date.now()}`;
    const newQuestion = {
      id: newId,
      text: "",
      options: [
        { id: `o1_${Date.now()}`, text: "", isCorrect: true },
        { id: `o2_${Date.now()}`, text: "", isCorrect: false },
        { id: `o3_${Date.now()}`, text: "", isCorrect: false },
        { id: `o4_${Date.now()}`, text: "", isCorrect: false },
      ],
    };
    setQuestions([...questions, newQuestion]);
    setTimeout(() => {
      const drawerContent = document.getElementById("quiz-drawer-content");
      if (drawerContent) drawerContent.scrollTop = drawerContent.scrollHeight;
    }, 100);
  };

  const handleDeleteQuestion = (qId) =>
    setQuestions(questions.filter((q) => q.id !== qId));

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-3xl bg-slate-50 h-full flex flex-col shadow-2xl animate-fade-slide-up sm:animate-none">
        <div className="px-6 py-5 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1.5">
                <FontAwesomeIcon icon={faWandMagicSparkles} /> AI Generated
              </span>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Bản nháp
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Kiểm duyệt Quiz: {lesson?.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        <div
          id="quiz-drawer-content"
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth"
        >
          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl flex gap-4">
            <FontAwesomeIcon
              icon={faWandMagicSparkles}
              className="text-indigo-600 text-xl mt-0.5"
            />
            <div>
              <p className="text-sm font-bold text-indigo-900">
                Hệ thống AI đã tạo {questions.length} câu hỏi
              </p>
              <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                Vui lòng kiểm tra lại nội dung và các đáp án đúng trước khi xuất
                bản.
              </p>
            </div>
          </div>

          {questions.map((q, index) => (
            <div
              key={q.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative group"
            >
              <button
                onClick={() => handleDeleteQuestion(q.id)}
                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FontAwesomeIcon icon={faTrashAlt} />
              </button>
              <div className="mb-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  Câu hỏi {index + 1}
                </label>
                <textarea
                  defaultValue={q.text}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                  rows="2"
                />
              </div>
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => handleSetCorrectOption(q.id, opt.id)}
                    className={`flex items-center gap-3 p-2 rounded-lg border transition-colors cursor-pointer ${opt.isCorrect ? "bg-emerald-50 border-emerald-200 ring-1 ring-emerald-100" : "bg-white border-slate-200 hover:border-blue-300"}`}
                  >
                    <div className="flex items-center justify-center pl-1">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${opt.isCorrect ? "border-blue-600" : "border-slate-300"}`}
                      >
                        {opt.isCorrect && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <input
                      type="text"
                      defaultValue={opt.text}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-transparent border-transparent focus:border-slate-300 rounded text-sm text-slate-700 py-1 px-2 focus:outline-none"
                    />
                    {opt.isCorrect && (
                      <span className="text-[10px] font-bold text-emerald-600 uppercase pr-2">
                        Đáp án đúng
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={handleAddQuestion}
            className="w-full py-4 border-2 border-dashed border-slate-300 text-slate-500 rounded-2xl font-bold text-sm hover:border-indigo-400 hover:text-indigo-600 transition-colors hover:bg-indigo-50/50 flex justify-center items-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} /> Thêm câu hỏi thủ công
          </button>
        </div>

        <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-between items-center shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors text-sm"
          >
            Hủy bỏ
          </button>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm flex items-center gap-2">
              <FontAwesomeIcon icon={faSave} /> Lưu nháp
            </button>
            <button className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/30 text-sm flex items-center gap-2">
              <FontAwesomeIcon icon={faPaperPlane} /> Xuất bản Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 3. COMPONENT BÀI GIẢNG (Lesson Accordion)
// =========================================================================
const LessonAccordion = ({ lesson, onOpenReview }) => {
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
                  ? "AI Quiz (Cần duyệt)"
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
                  <p className="text-xs text-indigo-600/80 mb-4">
                    Vui lòng duyệt nội dung trước khi xuất bản.
                  </p>
                  <button
                    onClick={() => onOpenReview(lesson)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors shadow-md shadow-indigo-600/30"
                  >
                    Kiểm duyệt & Xuất bản
                  </button>
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
                  <button
                    onClick={() => onOpenReview(lesson)}
                    className="w-full mt-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors border border-slate-200"
                  >
                    <FontAwesomeIcon icon={faEdit} className="mr-1" /> Sửa câu
                    hỏi
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
// 4. MAIN PAGE
// =========================================================================
const InstructorCourseDetailPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Curriculum");
  const [isPublished, setIsPublished] = useState(true);

  // State quản lý Modal/Drawer
  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
  const [reviewingLesson, setReviewingLesson] = useState(null);

  const handleOpenReviewDrawer = (lesson) => {
    setReviewingLesson(lesson);
    setIsReviewDrawerOpen(true);
  };

  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 w-full animate-fade-slide-up p-4 sm:p-6 lg:p-8 relative">
      {/* Khay trượt Kiểm duyệt (Nằm đè lên trên cùng) */}
      <QuizReviewDrawer
        isOpen={isReviewDrawerOpen}
        onClose={() => setIsReviewDrawerOpen(false)}
        lesson={reviewingLesson}
      />

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
                {isPublished ? "Đang xuất bản" : "Bản nháp (Draft)"}
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
                {courseDetail.price}
              </p>
              <button className="w-full py-3.5 bg-[#1e3a8a] hover:bg-[#172e6e] text-white font-bold rounded-xl transition-all shadow-md shadow-blue-900/30 active:scale-95 text-sm flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faEdit} /> Chỉnh sửa Khóa học
              </button>
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
                    {lessonsList.length} Bài giảng • Tổng thời lượng 8h 30m
                  </p>
                </div>
                <button className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">
                  <FontAwesomeIcon icon={faPlus} /> Thêm Bài học
                </button>
              </div>
              <div className="space-y-4">
                {lessonsList.map((lesson) => (
                  <LessonAccordion
                    key={lesson.id}
                    lesson={lesson}
                    onOpenReview={handleOpenReviewDrawer}
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
